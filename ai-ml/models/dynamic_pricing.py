import os
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import logging

logger = logging.getLogger(__name__)

class SimplePricingModel(nn.Module):
    """Simple neural network for dynamic pricing"""
    
    def __init__(self, input_size=12, hidden_size=64):
        super(SimplePricingModel, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.BatchNorm1d(hidden_size),
            nn.Dropout(0.2),
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.BatchNorm1d(hidden_size // 2),
            nn.Dropout(0.2),
            nn.Linear(hidden_size // 2, 1),
            nn.Sigmoid()  # Output between 0 and 1
        )
    
    def forward(self, x):
        return self.network(x).squeeze(-1)

class DynamicPricer:
    """Simple dynamic pricing class"""
    
    def __init__(self, model_path="models_store"):
        self.model_path = model_path
        self.model = None
        self.scaler = None
        self.feature_columns = [
            'consumption', 'production', 'netEnergy', 'temperature', 
            'humidity', 'solarIrradiance', 'windSpeed', 'hour', 
            'dayOfWeek', 'month', 'isWeekend', 'hasSmartMeter'
        ]
        self.base_price = 4.7   # Base price per kWh in BDT (Bangladeshi Taka)
        self.min_price = 4.7    # Minimum price per kWh in BDT
        self.max_price = 15.0   # Maximum price per kWh in BDT
        
        # Create model directory if it doesn't exist
        os.makedirs(model_path, exist_ok=True)
        
        # Try to load existing model
        self._load_model()
    
    def _load_model(self):
        """Load saved model and scaler"""
        try:
            model_file = os.path.join(self.model_path, "pricing_model.pt")
            scaler_file = os.path.join(self.model_path, "pricing_model_scaler.pkl")
            
            if os.path.exists(model_file) and os.path.exists(scaler_file):
                # Initialize model with correct input size
                self.model = SimplePricingModel(input_size=len(self.feature_columns))
                self.model.load_state_dict(torch.load(model_file, map_location='cpu'))
                self.model.eval()
                
                self.scaler = joblib.load(scaler_file)
                logger.info("✓ Dynamic pricing model loaded successfully")
            else:
                logger.info("No saved pricing model found, will train new model")
        except Exception as e:
            logger.warning(f"Failed to load pricing model: {e}")
            self.model = None
            self.scaler = None
    
    def _prepare_features(self, df):
        """Prepare features for training/prediction"""
        df_copy = df.copy()
        
        # Handle boolean columns
        if 'isWeekend' in df_copy.columns:
            df_copy['isWeekend'] = df_copy['isWeekend'].astype(int)
        else:
            df_copy['isWeekend'] = (df_copy['dayOfWeek'] >= 5).astype(int)
        
        if 'hasSmartMeter' in df_copy.columns:
            df_copy['hasSmartMeter'] = df_copy['hasSmartMeter'].astype(int)
        
        # Calculate net energy if not present
        if 'netEnergy' not in df_copy.columns:
            df_copy['netEnergy'] = df_copy.get('production', 0) - df_copy.get('consumption', 0)
        
        # Select only available features
        available_features = [col for col in self.feature_columns if col in df_copy.columns]
        return df_copy[available_features].fillna(0)
    
    def _calculate_target_price(self, df):
        """Calculate target price based on supply/demand dynamics in BDT"""
        # Get basic values
        net_energy = df['netEnergy'].values
        consumption = df['consumption'].values
        production = df.get('production', pd.Series([0] * len(df), index=df.index))
        if isinstance(production, pd.Series):
            production = production.values
        
        # Calculate demand intensity (higher consumption = higher demand)
        # Normalize consumption to create demand factor
        consumption_normalized = np.clip(consumption / 50.0, 0.1, 3.0)  # 50 kWh as reference
        demand_factor = 1.0 + 0.8 * (consumption_normalized - 1.0)  # More aggressive demand response
        
        # Supply/demand balance factor
        supply_demand_ratio = (production + 0.1) / (consumption + 0.1)
        supply_factor = np.where(
            supply_demand_ratio > 1.2,  # Excess supply
            0.7,  # 30% discount when supply exceeds demand significantly
            np.where(
                supply_demand_ratio < 0.5,  # High demand, low supply
                1.8,  # 80% premium when demand far exceeds supply
                1.0 + 0.6 * (1.0 - supply_demand_ratio)  # Gradual increase as demand exceeds supply
            )
        )
        
        # Time-of-use pricing (more aggressive peak pricing)
        hour = df['hour'].values
        # Peak hours: 6-10 AM (morning), 5-10 PM (evening)
        morning_peak = (hour >= 6) & (hour <= 10)
        evening_peak = (hour >= 17) & (hour <= 22)
        peak_hours = morning_peak | evening_peak
        
        # Off-peak hours: 11 PM - 5 AM (very low demand)
        off_peak = (hour >= 23) | (hour <= 5)
        
        hour_factor = np.where(
            peak_hours, 1.6,  # 60% increase during peak hours
            np.where(off_peak, 0.7, 1.0)  # 30% discount during off-peak
        )
        
        # Weekend pricing (moderate discount)
        weekend_factor = 1.0
        if 'isWeekend' in df.columns:
            weekend_factor = np.where(df['isWeekend'].astype(int) == 1, 0.85, 1.0)  # 15% weekend discount
        
        # Weather-based pricing
        temperature_factor = 1.0
        solar_factor = 1.0
        
        if 'temperature' in df.columns:
            temp = df['temperature'].values
            # Higher prices during extreme temperatures (high AC/heating demand)
            temp_normalized = np.abs(temp - 26) / 20.0  # 26°C as comfortable temperature
            temperature_factor = 1.0 + 0.4 * np.clip(temp_normalized, 0, 1)
        
        if 'solarIrradiance' in df.columns:
            solar_irr = df['solarIrradiance'].values
            # Lower prices when solar generation is high
            solar_normalized = np.clip(solar_irr / 800.0, 0, 1)  # 800 W/m² as peak solar
            solar_factor = 1.0 - 0.3 * solar_normalized  # Up to 30% reduction at peak solar
        
        # Calculate final price with all factors
        target_price = (self.base_price * 
                       demand_factor * 
                       supply_factor * 
                       hour_factor * 
                       weekend_factor * 
                       temperature_factor * 
                       solar_factor)
        
        # Ensure prices stay within realistic BDT range (4.7-15.0 BDT per kWh)
        target_price = np.clip(target_price, self.min_price, self.max_price)
        
        # Normalize to 0-1 range for sigmoid output
        normalized_price = (target_price - self.min_price) / (self.max_price - self.min_price)
        return np.clip(normalized_price, 0, 1)
    
    def fit(self, df):
        """Train the dynamic pricing model"""
        logger.info("Training dynamic pricing model...")
        
        try:
            # Prepare features
            X = self._prepare_features(df)
            
            # Calculate target prices
            y = self._calculate_target_price(df)
            
            logger.info(f"Training with {len(X)} samples and {len(X.columns)} features")
            logger.info(f"Features: {list(X.columns)}")
            
            # Scale features
            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(X)
            
            # Create model
            self.model = SimplePricingModel(input_size=X_scaled.shape[1])
            
            # Prepare data for PyTorch
            X_tensor = torch.FloatTensor(X_scaled)
            y_tensor = torch.FloatTensor(y)
            
            # Split data
            split_idx = int(0.8 * len(X_tensor))
            X_train, X_val = X_tensor[:split_idx], X_tensor[split_idx:]
            y_train, y_val = y_tensor[:split_idx], y_tensor[split_idx:]
            
            # Training setup
            criterion = nn.MSELoss()
            optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)
            
            # Training loop
            self.model.train()
            best_val_loss = float('inf')
            patience = 10
            patience_counter = 0
            
            for epoch in range(100):
                # Training
                optimizer.zero_grad()
                train_pred = self.model(X_train)
                train_loss = criterion(train_pred, y_train)
                train_loss.backward()
                optimizer.step()
                
                # Validation
                self.model.eval()
                with torch.no_grad():
                    val_pred = self.model(X_val)
                    val_loss = criterion(val_pred, y_val)
                
                self.model.train()
                
                # Early stopping
                if val_loss < best_val_loss:
                    best_val_loss = val_loss
                    patience_counter = 0
                    # Save best model
                    torch.save(self.model.state_dict(), 
                             os.path.join(self.model_path, "pricing_model.pt"))
                else:
                    patience_counter += 1
                
                if epoch % 20 == 0:
                    logger.info(f"Epoch {epoch}: Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}")
                
                if patience_counter >= patience:
                    logger.info(f"Early stopping at epoch {epoch}")
                    break
            
            # Save scaler
            joblib.dump(self.scaler, os.path.join(self.model_path, "pricing_model_scaler.pkl"))
            
            # Set model to eval mode
            self.model.eval()
            
            # Calculate final metrics
            with torch.no_grad():
                val_pred_np = self.model(X_val).numpy()
                val_actual_np = y_val.numpy()
                
                mae = mean_absolute_error(val_actual_np, val_pred_np)
                mse = mean_squared_error(val_actual_np, val_pred_np)
                r2 = r2_score(val_actual_np, val_pred_np)
                
                logger.info(f"✓ Pricing model trained successfully")
                logger.info(f"  MAE: {mae:.4f}")
                logger.info(f"  MSE: {mse:.4f}")
                logger.info(f"  R²: {r2:.4f}")
            
            return True
            
        except Exception as e:
            logger.error(f"Training failed: {e}")
            return False
    
    def predict(self, df):
        """Make price predictions"""
        if self.model is None or self.scaler is None:
            logger.error("Model not trained or loaded")
            return []
        
        try:
            X = self._prepare_features(df)
            X_scaled = self.scaler.transform(X)
            X_tensor = torch.FloatTensor(X_scaled)
            
            self.model.eval()
            with torch.no_grad():
                normalized_prices = self.model(X_tensor).numpy()
            
            # Convert back to actual prices
            actual_prices = self.min_price + normalized_prices * (self.max_price - self.min_price)
            
            return actual_prices.tolist()
            
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            return []
    
    def get_metrics(self, df):
        """Get model performance metrics"""
        if self.model is None:
            return {}
        
        try:
            predictions = self.predict(df)
            
            if len(predictions) == 0:
                return {}
            
            # Calculate some pricing-specific metrics
            avg_price = np.mean(predictions)
            price_std = np.std(predictions)
            min_price = np.min(predictions)
            max_price = np.max(predictions)
            
            return {
                "avg_price": float(avg_price),
                "price_std": float(price_std),
                "min_price": float(min_price),
                "max_price": float(max_price),
                "price_range": float(max_price - min_price)
            }
            
        except Exception as e:
            logger.error(f"Metrics calculation failed: {e}")
            return {}

# For backwards compatibility
def load_model():
    """Load dynamic pricing model"""
    return DynamicPricer()

"""

AUTHOR: Team GreyDevs

"""