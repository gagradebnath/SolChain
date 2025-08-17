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

class SimpleForecastModel(nn.Module):
    """Simple neural network for demand forecasting"""
    
    def __init__(self, input_size=10, hidden_size=64):
        super(SimpleForecastModel, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size // 2, 1)
        )
    
    def forward(self, x):
        return self.network(x).squeeze(-1)

class DemandForecaster:
    """Simple demand forecasting class"""
    
    def __init__(self, model_path="models_store"):
        self.model_path = model_path
        self.model = None
        self.scaler = None
        self.feature_columns = [
            'temperature', 'humidity', 'solarIrradiance', 'windSpeed', 
            'hour', 'dayOfWeek', 'month', 'isWeekend', 'hasSmartMeter', 'hasSolar'
        ]
        
        # Create model directory if it doesn't exist
        os.makedirs(model_path, exist_ok=True)
        
        # Try to load existing model
        self._load_model()
    
    def _load_model(self):
        """Load saved model and scaler"""
        try:
            model_file = os.path.join(self.model_path, "demand_forecast.pt")
            scaler_file = os.path.join(self.model_path, "demand_forecast_scaler.pkl")
            
            if os.path.exists(model_file) and os.path.exists(scaler_file):
                # Initialize model with correct input size
                self.model = SimpleForecastModel(input_size=len(self.feature_columns))
                self.model.load_state_dict(torch.load(model_file, map_location='cpu'))
                self.model.eval()
                
                self.scaler = joblib.load(scaler_file)
                logger.info("✓ Demand forecasting model loaded successfully")
            else:
                logger.info("No saved model found, will train new model")
        except Exception as e:
            logger.warning(f"Failed to load model: {e}")
            self.model = None
            self.scaler = None
    
    def _prepare_features(self, df):
        """Prepare features for training/prediction"""
        # Convert boolean columns to int
        df_copy = df.copy()
        
        # Handle isWeekend
        if 'isWeekend' in df_copy.columns:
            df_copy['isWeekend'] = df_copy['isWeekend'].astype(int)
        else:
            df_copy['isWeekend'] = (df_copy['dayOfWeek'] >= 5).astype(int)
        
        # Handle boolean columns
        for col in ['hasSmartMeter', 'hasSolar']:
            if col in df_copy.columns:
                df_copy[col] = df_copy[col].astype(int)
        
        # Select only available features
        available_features = [col for col in self.feature_columns if col in df_copy.columns]
        return df_copy[available_features].fillna(0)
    
    def fit(self, df):
        """Train the demand forecasting model"""
        logger.info("Training demand forecasting model...")
        
        try:
            # Prepare features and target
            X = self._prepare_features(df)
            y = df['consumption'].values
            
            logger.info(f"Training with {len(X)} samples and {len(X.columns)} features")
            logger.info(f"Features: {list(X.columns)}")
            
            # Scale features
            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(X)
            
            # Create model
            self.model = SimpleForecastModel(input_size=X_scaled.shape[1])
            
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
                             os.path.join(self.model_path, "demand_forecast.pt"))
                else:
                    patience_counter += 1
                
                if epoch % 20 == 0:
                    logger.info(f"Epoch {epoch}: Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}")
                
                if patience_counter >= patience:
                    logger.info(f"Early stopping at epoch {epoch}")
                    break
            
            # Save scaler
            joblib.dump(self.scaler, os.path.join(self.model_path, "demand_forecast_scaler.pkl"))
            
            # Set model to eval mode
            self.model.eval()
            
            # Calculate final metrics
            with torch.no_grad():
                val_pred_np = self.model(X_val).numpy()
                val_actual_np = y_val.numpy()
                
                mae = mean_absolute_error(val_actual_np, val_pred_np)
                mse = mean_squared_error(val_actual_np, val_pred_np)
                r2 = r2_score(val_actual_np, val_pred_np)
                
                logger.info(f"✓ Model trained successfully")
                logger.info(f"  MAE: {mae:.4f}")
                logger.info(f"  MSE: {mse:.4f}")
                logger.info(f"  R²: {r2:.4f}")
            
            return True
            
        except Exception as e:
            logger.error(f"Training failed: {e}")
            return False
    
    def predict(self, df):
        """Make predictions"""
        if self.model is None or self.scaler is None:
            logger.error("Model not trained or loaded")
            return []
        
        try:
            X = self._prepare_features(df)
            X_scaled = self.scaler.transform(X)
            X_tensor = torch.FloatTensor(X_scaled)
            
            self.model.eval()
            with torch.no_grad():
                predictions = self.model(X_tensor).numpy()
            
            return predictions.tolist()
            
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            return []
    
    def get_metrics(self, df):
        """Get model performance metrics"""
        if self.model is None:
            return {}
        
        try:
            predictions = self.predict(df)
            actual = df['consumption'].values
            
            if len(predictions) == 0:
                return {}
            
            mae = mean_absolute_error(actual, predictions)
            mse = mean_squared_error(actual, predictions)
            rmse = np.sqrt(mse)
            r2 = r2_score(actual, predictions)
            mape = np.mean(np.abs((actual - predictions) / actual)) * 100
            
            return {
                "mae": float(mae),
                "mse": float(mse),
                "rmse": float(rmse),
                "r2": float(r2),
                "mape": float(mape)
            }
            
        except Exception as e:
            logger.error(f"Metrics calculation failed: {e}")
            return {}

# For backwards compatibility
def load_model():
    """Load demand forecasting model"""
    return DemandForecaster()

"""

AUTHOR: Team GreyDevs

"""