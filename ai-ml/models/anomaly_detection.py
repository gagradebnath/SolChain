import os
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score
import joblib
import logging

logger = logging.getLogger(__name__)

class SimpleAnomalyModel(nn.Module):
    """Enhanced autoencoder for anomaly detection"""
    
    def __init__(self, input_size=10, hidden_size=32):
        super(SimpleAnomalyModel, self).__init__()
        
        # Encoder with more layers for better pattern learning
        self.encoder = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_size // 2, hidden_size // 4),
            nn.ReLU(),
            nn.Linear(hidden_size // 4, hidden_size // 8)  # Bottleneck
        )
        
        # Decoder with symmetric structure
        self.decoder = nn.Sequential(
            nn.Linear(hidden_size // 8, hidden_size // 4),
            nn.ReLU(),
            nn.Linear(hidden_size // 4, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_size // 2, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_size, input_size)
        )
    
    def forward(self, x):
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded

class AnomalyDetector:
    """Simple anomaly detection class"""
    
    def __init__(self, model_path="models_store"):
        self.model_path = model_path
        self.model = None
        self.scaler = None
        self.threshold = None
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
            model_file = os.path.join(self.model_path, "anomaly_model.pt")
            scaler_file = os.path.join(self.model_path, "anomaly_model_scaler.pkl")
            threshold_file = os.path.join(self.model_path, "anomaly_threshold.pkl")
            
            if os.path.exists(model_file) and os.path.exists(scaler_file):
                # Initialize model with correct input size
                self.model = SimpleAnomalyModel(input_size=len(self.feature_columns))
                self.model.load_state_dict(torch.load(model_file, map_location='cpu'))
                self.model.eval()
                
                self.scaler = joblib.load(scaler_file)
                
                if os.path.exists(threshold_file):
                    self.threshold = joblib.load(threshold_file)
                else:
                    self.threshold = 0.5  # Default threshold
                
                logger.info("✓ Anomaly detection model loaded successfully")
            else:
                logger.info("No saved anomaly model found, will train new model")
        except Exception as e:
            logger.warning(f"Failed to load anomaly model: {e}")
            self.model = None
            self.scaler = None
            self.threshold = None
    
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
        
        # Use only the basic feature set for stability
        available_features = [col for col in self.feature_columns if col in df_copy.columns]
        return df_copy[available_features].fillna(0)
    
    def _calculate_reconstruction_error(self, X_tensor):
        """Calculate reconstruction error for anomaly detection"""
        self.model.eval()
        with torch.no_grad():
            reconstructed = self.model(X_tensor)
            error = torch.mean((X_tensor - reconstructed) ** 2, dim=1)
        return error.numpy()
    
    def fit(self, df):
        """Train the anomaly detection model"""
        logger.info("Training anomaly detection model...")
        
        try:
            # Prepare features
            X = self._prepare_features(df)
            
            logger.info(f"Training with {len(X)} samples and {len(X.columns)} features")
            logger.info(f"Features: {list(X.columns)}")
            
            # Use only normal data for training (anomaly = 0 or False or NaN)
            if 'anomaly' in df.columns:
                # Handle different anomaly column formats
                anomaly_col = df['anomaly']
                if anomaly_col.dtype == 'object':
                    # Handle string values like 'consumption_anomaly' or NaN
                    normal_mask = (anomaly_col == '') | (anomaly_col.isna()) | (anomaly_col == 'normal')
                else:
                    # Handle numeric or boolean values
                    normal_mask = (anomaly_col == 0) | (anomaly_col == False) | (anomaly_col.isna())
                
                X_normal = X[normal_mask]
                logger.info(f"Using {len(X_normal)} normal samples for training (out of {len(X)} total)")
                
                # If no normal samples found, use all data (unsupervised approach)
                if len(X_normal) == 0:
                    logger.warning("No normal samples found, using all data for unsupervised training")
                    X_normal = X
            else:
                X_normal = X
                logger.info(f"No anomaly column found, using all {len(X)} samples for training")
            
            # Scale features
            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(X_normal)
            
            # Create model
            self.model = SimpleAnomalyModel(input_size=X_scaled.shape[1])
            
            # Prepare data for PyTorch
            X_tensor = torch.FloatTensor(X_scaled)
            
            # Split data
            split_idx = int(0.8 * len(X_tensor))
            X_train, X_val = X_tensor[:split_idx], X_tensor[split_idx:]
            
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
                train_reconstructed = self.model(X_train)
                train_loss = criterion(train_reconstructed, X_train)
                train_loss.backward()
                optimizer.step()
                
                # Validation
                self.model.eval()
                with torch.no_grad():
                    val_reconstructed = self.model(X_val)
                    val_loss = criterion(val_reconstructed, X_val)
                
                self.model.train()
                
                # Early stopping
                if val_loss < best_val_loss:
                    best_val_loss = val_loss
                    patience_counter = 0
                    # Save best model
                    torch.save(self.model.state_dict(), 
                             os.path.join(self.model_path, "anomaly_model.pt"))
                else:
                    patience_counter += 1
                
                if epoch % 20 == 0:
                    logger.info(f"Epoch {epoch}: Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}")
                
                if patience_counter >= patience:
                    logger.info(f"Early stopping at epoch {epoch}")
                    break
            
            # Calculate threshold based on normal data reconstruction errors only
            X_normal_scaled = self.scaler.transform(X_normal)
            X_normal_tensor = torch.FloatTensor(X_normal_scaled)
            normal_errors = self._calculate_reconstruction_error(X_normal_tensor)
            
            # Set threshold as 95th percentile of NORMAL reconstruction errors (less sensitive)
            self.threshold = np.percentile(normal_errors, 95)
            
            # Also calculate statistics for all data for logging
            X_all_scaled = self.scaler.transform(X)
            X_all_tensor = torch.FloatTensor(X_all_scaled)
            all_errors = self._calculate_reconstruction_error(X_all_tensor)
            
            # Save scaler and threshold
            joblib.dump(self.scaler, os.path.join(self.model_path, "anomaly_model_scaler.pkl"))
            joblib.dump(self.threshold, os.path.join(self.model_path, "anomaly_threshold.pkl"))
            
            # Set model to eval mode
            self.model.eval()
            
            logger.info(f"✓ Anomaly detection model trained successfully")
            logger.info(f"  Threshold: {self.threshold:.4f}")
            logger.info(f"  Mean normal reconstruction error: {np.mean(normal_errors):.4f}")
            logger.info(f"  Mean all reconstruction error: {np.mean(all_errors):.4f}")
            
            return True
            
        except Exception as e:
            logger.error(f"Training failed: {e}")
            return False
    
    def predict(self, df):
        """Predict anomalies"""
        if self.model is None or self.scaler is None or self.threshold is None:
            logger.error("Model not trained or loaded")
            return []
        
        try:
            X = self._prepare_features(df)
            X_scaled = self.scaler.transform(X)
            X_tensor = torch.FloatTensor(X_scaled)
            
            # Calculate reconstruction errors
            errors = self._calculate_reconstruction_error(X_tensor)
            
            # Classify as anomaly if error > threshold
            anomalies = (errors > self.threshold).astype(int)
            
            return anomalies.tolist()
            
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            return []
    
    def get_anomaly_scores(self, df):
        """Get anomaly scores (reconstruction errors)"""
        if self.model is None or self.scaler is None:
            logger.error("Model not trained or loaded")
            return []
        
        try:
            X = self._prepare_features(df)
            X_scaled = self.scaler.transform(X)
            X_tensor = torch.FloatTensor(X_scaled)
            
            errors = self._calculate_reconstruction_error(X_tensor)
            return errors.tolist()
            
        except Exception as e:
            logger.error(f"Score calculation failed: {e}")
            return []
    
    def get_metrics(self, df):
        """Get model performance metrics"""
        if self.model is None or 'anomaly' not in df.columns:
            return {}
        
        try:
            predictions = self.predict(df)
            
            # Clean anomaly column - handle different formats
            anomaly_col = df['anomaly']
            if anomaly_col.dtype == 'object':
                # Handle string values like 'consumption_anomaly'
                actual = (anomaly_col != '').astype(int).values
            else:
                actual = anomaly_col.astype(int).values
            
            if len(predictions) == 0:
                return {}
            
            precision = precision_score(actual, predictions, zero_division=0)
            recall = recall_score(actual, predictions, zero_division=0)
            f1 = f1_score(actual, predictions, zero_division=0)
            
            # Calculate AUC using anomaly scores
            scores = self.get_anomaly_scores(df)
            if len(scores) > 0:
                try:
                    auc = roc_auc_score(actual, scores)
                except:
                    auc = 0.0
            else:
                auc = 0.0
            
            return {
                "precision": float(precision),
                "recall": float(recall),
                "f1_score": float(f1),
                "auc": float(auc),
                "threshold": float(self.threshold)
            }
            
        except Exception as e:
            logger.error(f"Metrics calculation failed: {e}")
            return {}

# For backwards compatibility
def load_model():
    """Load anomaly detection model"""
    return AnomalyDetector()


"""

AUTHOR: Team GreyDevs

"""