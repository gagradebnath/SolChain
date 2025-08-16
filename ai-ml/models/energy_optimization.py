import os
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import logging

logger = logging.getLogger(__name__)

class SimpleOptimizationModel(nn.Module):
    """Simple neural network for energy optimization"""
    
    def __init__(self, input_size=10, hidden_size=64):
        super(SimpleOptimizationModel, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Linear(hidden_size // 2, 1),
            nn.Sigmoid()  # Output between 0 and 1 (efficiency score)
        )
    
    def forward(self, x):
        return self.network(x).squeeze(-1)

class EnergyOptimizer:
    """Simple energy optimization class"""
    
    def __init__(self, model_path="models_store"):
        self.model_path = model_path
        self.model = None
        self.scaler = None
        self.feature_columns = [
            'consumption', 'production', 'netEnergy', 'temperature', 
            'humidity', 'solarIrradiance', 'windSpeed', 'hour', 
            'dayOfWeek', 'isWeekend'
        ]
        
        # Create model directory if it doesn't exist
        os.makedirs(model_path, exist_ok=True)
        
        # Try to load existing model
        self._load_model()
    
    def _load_model(self):
        """Load saved model and scaler"""
        try:
            model_file = os.path.join(self.model_path, "optimization_model.pt")
            scaler_file = os.path.join(self.model_path, "optimization_model_scaler.pkl")
            
            if os.path.exists(model_file) and os.path.exists(scaler_file):
                # Initialize model with correct input size
                self.model = SimpleOptimizationModel(input_size=len(self.feature_columns))
                self.model.load_state_dict(torch.load(model_file, map_location='cpu'))
                self.model.eval()
                
                self.scaler = joblib.load(scaler_file)
                logger.info("✓ Energy optimization model loaded successfully")
            else:
                logger.info("No saved optimization model found, will train new model")
        except Exception as e:
            logger.warning(f"Failed to load optimization model: {e}")
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
        
        # Calculate net energy if not present
        if 'netEnergy' not in df_copy.columns:
            df_copy['netEnergy'] = df_copy.get('production', 0) - df_copy.get('consumption', 0)
        
        # Select only available features
        available_features = [col for col in self.feature_columns if col in df_copy.columns]
        return df_copy[available_features].fillna(0)
    
    def _calculate_efficiency_target(self, df):
        """Calculate target efficiency based on energy patterns"""
        # Simple efficiency calculation based on multiple factors
        consumption = df['consumption'].values
        production = df.get('production', pd.Series([0] * len(df))).values
        net_energy = df.get('netEnergy', pd.Series(production - consumption)).values
        
        # Base efficiency: how well we balance supply and demand
        base_efficiency = 1.0 / (1.0 + np.abs(net_energy) / (consumption + 0.1))
        
        # Solar utilization efficiency
        if 'solarIrradiance' in df.columns:
            solar_potential = df['solarIrradiance'].values / 1000.0  # Normalize
            solar_utilization = production / (solar_potential * 10 + 0.1)  # Rough solar efficiency
            solar_efficiency = np.clip(solar_utilization, 0, 1)
        else:
            solar_efficiency = np.full(len(df), 0.8)  # Default value
        
        # Time-based efficiency (peak vs off-peak)
        if 'hour' in df.columns:
            # Efficiency is higher during off-peak hours
            peak_hours = ((df['hour'] >= 17) & (df['hour'] <= 21)).astype(int).values
            time_efficiency = 1.0 - 0.2 * peak_hours  # Lower efficiency during peak
        else:
            time_efficiency = np.full(len(df), 0.8)
        
        # Combined efficiency score
        overall_efficiency = (base_efficiency + solar_efficiency + time_efficiency) / 3.0
        return np.clip(overall_efficiency, 0, 1)
    
    def fit(self, df):
        """Train the energy optimization model"""
        logger.info("Training energy optimization model...")
        
        try:
            # Prepare features
            X = self._prepare_features(df)
            
            # Calculate target efficiency
            y = self._calculate_efficiency_target(df)
            
            logger.info(f"Training with {len(X)} samples and {len(X.columns)} features")
            logger.info(f"Features: {list(X.columns)}")
            logger.info(f"Target efficiency range: {y.min():.3f} - {y.max():.3f}")
            
            # Scale features
            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(X)
            
            # Create model
            self.model = SimpleOptimizationModel(input_size=X_scaled.shape[1])
            
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
                             os.path.join(self.model_path, "optimization_model.pt"))
                else:
                    patience_counter += 1
                
                if epoch % 20 == 0:
                    logger.info(f"Epoch {epoch}: Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}")
                
                if patience_counter >= patience:
                    logger.info(f"Early stopping at epoch {epoch}")
                    break
            
            # Save scaler
            joblib.dump(self.scaler, os.path.join(self.model_path, "optimization_model_scaler.pkl"))
            
            # Set model to eval mode
            self.model.eval()
            
            # Calculate final metrics
            with torch.no_grad():
                val_pred_np = self.model(X_val).numpy()
                val_actual_np = y_val.numpy()
                
                mae = mean_absolute_error(val_actual_np, val_pred_np)
                mse = mean_squared_error(val_actual_np, val_pred_np)
                
                logger.info(f"✓ Optimization model trained successfully")
                logger.info(f"  MAE: {mae:.4f}")
                logger.info(f"  MSE: {mse:.4f}")
                logger.info(f"  Average efficiency: {np.mean(val_pred_np):.4f}")
            
            return True
            
        except Exception as e:
            logger.error(f"Training failed: {e}")
            return False
    
    def predict(self, df):
        """Predict efficiency scores"""
        if self.model is None or self.scaler is None:
            logger.error("Model not trained or loaded")
            return []
        
        try:
            X = self._prepare_features(df)
            X_scaled = self.scaler.transform(X)
            X_tensor = torch.FloatTensor(X_scaled)
            
            self.model.eval()
            with torch.no_grad():
                efficiency_scores = self.model(X_tensor).numpy()
            
            return efficiency_scores.tolist()
            
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            return []
    
    def optimize(self, df):
        """Get optimization recommendations"""
        if self.model is None:
            return {}
        
        try:
            efficiency_scores = self.predict(df)
            
            if len(efficiency_scores) == 0:
                return {}
            
            avg_efficiency = np.mean(efficiency_scores)
            min_efficiency = np.min(efficiency_scores)
            max_efficiency = np.max(efficiency_scores)
            
            # Simple recommendations based on efficiency
            recommendations = []
            
            if avg_efficiency < 0.7:
                recommendations.append("Consider load balancing to improve overall efficiency")
            
            if min_efficiency < 0.5:
                recommendations.append("Some periods show very low efficiency - check for energy waste")
            
            if 'netEnergy' in df.columns:
                excess_energy = df[df['netEnergy'] > 2]['netEnergy'].sum()
                if excess_energy > 0:
                    recommendations.append(f"Excess energy detected: {excess_energy:.2f} kWh could be stored or sold")
            
            return {
                "average_efficiency": float(avg_efficiency),
                "min_efficiency": float(min_efficiency),
                "max_efficiency": float(max_efficiency),
                "efficiency_improvement_potential": float(1.0 - avg_efficiency),
                "recommendations": recommendations
            }
            
        except Exception as e:
            logger.error(f"Optimization failed: {e}")
            return {}
    
    def get_metrics(self, df):
        """Get model performance metrics"""
        if self.model is None:
            return {}
        
        try:
            predictions = self.predict(df)
            
            if len(predictions) == 0:
                return {}
            
            avg_efficiency = np.mean(predictions)
            efficiency_std = np.std(predictions)
            
            return {
                "avg_predicted_efficiency": float(avg_efficiency),
                "efficiency_std": float(efficiency_std),
                "efficiency_range": float(np.max(predictions) - np.min(predictions)),
                "num_predictions": len(predictions)
            }
            
        except Exception as e:
            logger.error(f"Metrics calculation failed: {e}")
            return {}

# For backwards compatibility
def load_model():
    """Load energy optimization model"""
    return EnergyOptimizer()

"""

AUTHOR: Team GreyDevs

"""