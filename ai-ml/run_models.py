"""
Manual runner to train and test SolChain AI/ML models without starting the API.

Usage (PowerShell):
  cd F:/SolChain/ai-ml
  python run_models.py --train
  python run_models.py --forecast --device dev-1 --horizon 24
  python run_models.py --price --hour 14 --demand 60 --supply 50
  python run_models.py --anomaly --records "[{\"deviceId\":\"d1\",\"consumption\":1.2,\"production\":0.3}]"
"""

import argparse
import json
import os
import pandas as pd

from models.demand_forecasting import DemandForecaster
from models.dynamic_pricing import DynamicPricer
from models.anomaly_detection import AnomalyDetector
from models.energy_optimization import EnergyOptimizer


HERE = os.path.dirname(__file__)

# Updated data paths - use the specialized datasets we created
DATA_PATHS = {
    "forecasting": os.path.join(HERE, "data", "forecasting", "iot_simulation_data.csv"),
    "pricing": os.path.join(HERE, "data", "pricing", "iot_simulation_data.csv"),
    "anomaly": os.path.join(HERE, "data", "anomaly", "iot_simulation_data.csv"),
    "optimization": os.path.join(HERE, "data", "optimization", "iot_simulation_data.csv")
}

# Fallback paths
FALLBACK_PATHS = [
    os.path.join(HERE, "data", "training", "iot_simulation_data.csv"),
    os.path.join(HERE, "..", "iot-simulator", "data", "training", "iot_simulation_data.csv"),
    os.path.join(HERE, "iot-simulator", "data", "training", "iot_simulation_data.csv")
]

MODEL_DIR = os.path.join(HERE, "models_store")
os.makedirs(MODEL_DIR, exist_ok=True)


def load_df(model_type: str = "forecasting") -> pd.DataFrame:
    """Load training data for the specified model type"""
    # Try specialized dataset first
    if model_type in DATA_PATHS and os.path.exists(DATA_PATHS[model_type]):
        data_path = DATA_PATHS[model_type]
        print(f"[Data] Loading {model_type} dataset from: {data_path}")
    else:
        # Try fallback paths
        data_path = None
        for fallback_path in FALLBACK_PATHS:
            if os.path.exists(fallback_path):
                data_path = fallback_path
                print(f"[Data] Using fallback dataset: {data_path}")
                break
        
        if not data_path:
            available_paths = "\n".join([f"  - {path}" for path in DATA_PATHS.values() + FALLBACK_PATHS])
            raise FileNotFoundError(f"No training data found. Tried:\n{available_paths}")
    
    df = pd.read_csv(data_path)
    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    
    print(f"[Data] Loaded {len(df)} records with columns: {list(df.columns)}")
    return df


def main():
    parser = argparse.ArgumentParser(description="Run SolChain models manually")
    parser.add_argument("--train", action="store_true", help="Train all models")

    parser.add_argument("--forecast", action="store_true", help="Run forecasting")
    parser.add_argument("--device", type=str, default=None, help="Device ID for forecasting")
    parser.add_argument("--horizon", type=int, default=24, help="Horizon hours")
    parser.add_argument("--weather", type=str, default=None, help="JSON string of weather overrides")

    parser.add_argument("--price", action="store_true", help="Run pricing")
    parser.add_argument("--hour", type=int, default=None)
    parser.add_argument("--demand", type=float, default=None)
    parser.add_argument("--supply", type=float, default=None)
    parser.add_argument("--congestion", type=float, default=0.0)
    parser.add_argument("--temperature", type=float, default=None)
    parser.add_argument("--solar", type=float, default=None)

    parser.add_argument("--anomaly", action="store_true", help="Run anomaly detection")
    parser.add_argument("--records", type=str, default=None, help="JSON array of records")
    
    parser.add_argument("--optimize", action="store_true", help="Run energy optimization")
    parser.add_argument("--grid-state", type=str, default=None, help="JSON string of grid state")

    args = parser.parse_args()

    # Load datasets for different models
    forecast_df = load_df("forecasting")
    pricing_df = load_df("pricing") if os.path.exists(DATA_PATHS.get("pricing", "")) else forecast_df
    anomaly_df = load_df("anomaly") if os.path.exists(DATA_PATHS.get("anomaly", "")) else forecast_df
    optimization_df = load_df("optimization") if os.path.exists(DATA_PATHS.get("optimization", "")) else forecast_df

    # Initialize models with correct paths (PyTorch models use .pt extension)
    fc = DemandForecaster(model_path=MODEL_DIR)
    pr = DynamicPricer(model_path=MODEL_DIR)
    an = AnomalyDetector(model_path=MODEL_DIR)
    opt = EnergyOptimizer(model_path=MODEL_DIR)

    if args.train:
        print("[Run] Training all models...")
        
        try:
            print("[Run] Training demand forecasting model...")
            fc.fit(forecast_df)
            print("[Run] ✓ Demand forecasting model trained successfully")
        except Exception as e:
            print(f"[Run] ✗ Demand forecasting training failed: {e}")
        
        try:
            print("[Run] Training dynamic pricing model...")
            pr.fit(pricing_df)
            print("[Run] ✓ Dynamic pricing model trained successfully")
        except Exception as e:
            print(f"[Run] ✗ Dynamic pricing training failed: {e}")
        
        try:
            print("[Run] Training anomaly detection model...")
            an.fit(anomaly_df)
            print("[Run] ✓ Anomaly detection model trained successfully")
        except Exception as e:
            print(f"[Run] ✗ Anomaly detection training failed: {e}")
        
        try:
            print("[Run] Initializing energy optimization model...")
            # Energy optimization model doesn't have a fit method, just initialize
            print("[Run] ✓ Energy optimization model initialized successfully")
        except Exception as e:
            print(f"[Run] ✗ Energy optimization initialization failed: {e}")
        
        print("[Run] Training complete.")

    if args.forecast:
        weather = json.loads(args.weather) if args.weather else None
        out = fc.predict(forecast_df)
        print(json.dumps(out, indent=2, default=str))

    if args.price:
        market_state = {
            "hour": args.hour,
            "demand_kw": args.demand,
            "supply_kw": args.supply,
            "congestion_level": args.congestion,
            "temperature": args.temperature,
            "solarIrradiance": args.solar,
        }
        out = pr.predict(pricing_df)
        print(json.dumps(out, indent=2, default=str))

    if args.anomaly:
        if not args.records:
            raise SystemExit("--records JSON array is required for --anomaly")
        records = json.loads(args.records)
        out = an.predict(anomaly_df)
        print(json.dumps({"detections": out}, indent=2, default=str))
    
    if args.optimize:
        grid_state = json.loads(args.grid_state) if args.grid_state else {
            "current_demand": 100.0,
            "current_supply": 80.0,
            "grid_capacity": 1000.0,
            "storage_level": 0.5
        }
        out = opt.optimize(optimization_df)
        print(json.dumps(out, indent=2, default=str))


if __name__ == "__main__":
    main()
