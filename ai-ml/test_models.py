"""
Simple Training Script for SolChain AI/ML Models
===============================================

Test and train all simplified models with the available data
"""

import os
import sys
import pandas as pd
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add current directory to path
_APP_DIR = Path(__file__).resolve().parent
if str(_APP_DIR) not in sys.path:
    sys.path.insert(0, str(_APP_DIR))

# Import simplified models
try:
    from models.demand_forecasting import DemandForecaster
    from models.dynamic_pricing import DynamicPricer
    from models.anomaly_detection import AnomalyDetector
    from models.energy_optimization import EnergyOptimizer
    logger.info("✓ All simplified models imported successfully")
except Exception as e:
    logger.error(f"Failed to import models: {e}")
    sys.exit(1)

# Data paths
BASE_DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

DATA_PATHS = {
    "forecasting": os.path.join(BASE_DATA_DIR, "forecasting", "iot_simulation_data.csv"),
    "pricing": os.path.join(BASE_DATA_DIR, "pricing", "iot_simulation_data.csv"),
    "anomaly": os.path.join(BASE_DATA_DIR, "anomaly", "iot_simulation_data.csv"),
    "optimization": os.path.join(BASE_DATA_DIR, "optimization", "iot_simulation_data.csv")
}

def load_and_prepare_data(data_type: str, sample_size: int = 50000) -> pd.DataFrame:
    """Load and prepare data for training"""
    try:
        data_path = DATA_PATHS[data_type]
        if not os.path.exists(data_path):
            logger.error(f"Data file not found: {data_path}")
            return None
        
        # Load data
        df = pd.read_csv(data_path)
        logger.info(f"Loaded {len(df)} records for {data_type}")
        
        # Take a sample for faster training
        if len(df) > sample_size:
            df = df.sample(n=sample_size, random_state=42)
            logger.info(f"Sampled {sample_size} records for training")
        
        # Clean data
        df = df.fillna(0)
        
        # Convert boolean columns to proper format
        if 'isWeekend' in df.columns:
            df['isWeekend'] = df['isWeekend'].astype(bool)
        if 'hasSmartMeter' in df.columns:
            df['hasSmartMeter'] = df['hasSmartMeter'].astype(bool)
        if 'hasSolar' in df.columns:
            df['hasSolar'] = df['hasSolar'].astype(bool)
        
        return df
        
    except Exception as e:
        logger.error(f"Failed to load {data_type} data: {e}")
        return None

def test_demand_forecasting():
    """Test demand forecasting model"""
    logger.info("\n" + "="*50)
    logger.info("TESTING DEMAND FORECASTING MODEL")
    logger.info("="*50)
    
    try:
        # Load data
        df = load_and_prepare_data("forecasting")
        if df is None:
            return False
        
        # Initialize and train model
        forecaster = DemandForecaster()
        
        logger.info("Training demand forecasting model...")
        success = forecaster.fit(df)
        
        if success:
            # Test predictions
            logger.info("Testing predictions...")
            sample_data = df.head(10)
            predictions = forecaster.predict(sample_data)
            
            if predictions:
                logger.info(f"✓ Got {len(predictions)} predictions")
                logger.info(f"Sample predictions: {predictions[:5]}")
                
                # Get metrics
                metrics = forecaster.get_metrics(df.tail(500))
                logger.info(f"Metrics: {metrics}")
                
                return True
            else:
                logger.error("No predictions returned")
                return False
        else:
            logger.error("Training failed")
            return False
            
    except Exception as e:
        logger.error(f"Demand forecasting test failed: {e}")
        return False

def test_dynamic_pricing():
    """Test dynamic pricing model"""
    logger.info("\n" + "="*50)
    logger.info("TESTING DYNAMIC PRICING MODEL")
    logger.info("="*50)
    
    try:
        # Load data
        df = load_and_prepare_data("pricing")
        if df is None:
            return False
        
        # Initialize and train model
        pricer = DynamicPricer()
        
        logger.info("Training dynamic pricing model...")
        success = pricer.fit(df)
        
        if success:
            # Test predictions
            logger.info("Testing predictions...")
            sample_data = df.head(10)
            predictions = pricer.predict(sample_data)
            
            if predictions:
                logger.info(f"✓ Got {len(predictions)} price predictions")
                logger.info(f"Sample prices: {predictions[:5]}")
                
                # Get metrics
                metrics = pricer.get_metrics(df.tail(500))
                logger.info(f"Metrics: {metrics}")
                
                return True
            else:
                logger.error("No predictions returned")
                return False
        else:
            logger.error("Training failed")
            return False
            
    except Exception as e:
        logger.error(f"Dynamic pricing test failed: {e}")
        return False

def test_anomaly_detection():
    """Test anomaly detection model"""
    logger.info("\n" + "="*50)
    logger.info("TESTING ANOMALY DETECTION MODEL")
    logger.info("="*50)
    
    try:
        # Load data
        df = load_and_prepare_data("anomaly")
        if df is None:
            return False
        
        # Initialize and train model
        detector = AnomalyDetector()
        
        logger.info("Training anomaly detection model...")
        success = detector.fit(df)
        
        if success:
            # Test predictions
            logger.info("Testing predictions...")
            sample_data = df.head(10)
            predictions = detector.predict(sample_data)
            scores = detector.get_anomaly_scores(sample_data)
            
            if predictions:
                logger.info(f"✓ Got {len(predictions)} anomaly predictions")
                logger.info(f"Sample anomalies: {predictions[:5]}")
                logger.info(f"Sample scores: {scores[:5]}")
                
                # Get metrics
                metrics = detector.get_metrics(df.tail(500))
                logger.info(f"Metrics: {metrics}")
                
                return True
            else:
                logger.error("No predictions returned")
                return False
        else:
            logger.error("Training failed")
            return False
            
    except Exception as e:
        logger.error(f"Anomaly detection test failed: {e}")
        return False

def test_energy_optimization():
    """Test energy optimization model"""
    logger.info("\n" + "="*50)
    logger.info("TESTING ENERGY OPTIMIZATION MODEL")
    logger.info("="*50)
    
    try:
        # Load data
        df = load_and_prepare_data("optimization")
        if df is None:
            return False
        
        # Initialize and train model
        optimizer = EnergyOptimizer()
        
        logger.info("Training energy optimization model...")
        success = optimizer.fit(df)
        
        if success:
            # Test predictions
            logger.info("Testing predictions...")
            sample_data = df.head(10)
            predictions = optimizer.predict(sample_data)
            optimization_results = optimizer.optimize(sample_data)
            
            if predictions:
                logger.info(f"✓ Got {len(predictions)} efficiency predictions")
                logger.info(f"Sample efficiencies: {predictions[:5]}")
                logger.info(f"Optimization results: {optimization_results}")
                
                # Get metrics
                metrics = optimizer.get_metrics(df.tail(500))
                logger.info(f"Metrics: {metrics}")
                
                return True
            else:
                logger.error("No predictions returned")
                return False
        else:
            logger.error("Training failed")
            return False
            
    except Exception as e:
        logger.error(f"Energy optimization test failed: {e}")
        return False

def main():
    """Main testing function"""
    logger.info("🚀 Starting SolChain AI/ML Models Test")
    logger.info("="*60)
    
    # Check data availability
    logger.info("Checking data availability...")
    for data_type, path in DATA_PATHS.items():
        if os.path.exists(path):
            size_mb = os.path.getsize(path) / (1024*1024)
            logger.info(f"✓ {data_type}: {path} ({size_mb:.1f} MB)")
        else:
            logger.error(f"✗ {data_type}: {path} (NOT FOUND)")
    
    # Test all models
    results = {}
    
    # Test demand forecasting
    results["forecasting"] = test_demand_forecasting()
    
    # Test dynamic pricing
    results["pricing"] = test_dynamic_pricing()
    
    # Test anomaly detection
    results["anomaly"] = test_anomaly_detection()
    
    # Test energy optimization
    results["optimization"] = test_energy_optimization()
    
    # Summary
    logger.info("\n" + "="*60)
    logger.info("TEST RESULTS SUMMARY")
    logger.info("="*60)
    
    success_count = 0
    for model_type, success in results.items():
        status = "✓ PASS" if success else "✗ FAIL"
        logger.info(f"{model_type.upper():20}: {status}")
        if success:
            success_count += 1
    
    logger.info(f"\nOVERALL: {success_count}/{len(results)} models working")
    
    if success_count == len(results):
        logger.info("🎉 ALL MODELS ARE WORKING! 🎉")
        logger.info("You can now run: python app.py")
    else:
        logger.info("❌ Some models failed. Check the logs above.")
    
    return success_count == len(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
