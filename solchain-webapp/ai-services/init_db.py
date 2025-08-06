import sqlite3
import os
from datetime import datetime

def create_ai_database():
    """Create SQLite database for AI services"""
    
    # Create database directory if it doesn't exist
    db_dir = os.path.join(os.path.dirname(__file__), 'database')
    os.makedirs(db_dir, exist_ok=True)
    
    # Database path
    db_path = os.path.join(db_dir, 'solchain_ai.db')
    
    try:
        # Connect to SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔄 Creating AI services database tables...")
        
        # Energy predictions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS energy_predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                prediction_type VARCHAR(50) NOT NULL,
                predicted_value REAL NOT NULL,
                confidence_score REAL,
                prediction_horizon INTEGER,
                model_version VARCHAR(20),
                input_features TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                valid_until TIMESTAMP
            )
        ''')
        
        # Anomaly detections table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS anomaly_detections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                meter_id VARCHAR(100) NOT NULL,
                user_id INTEGER NOT NULL,
                anomaly_type VARCHAR(50) NOT NULL,
                severity VARCHAR(20) DEFAULT 'medium',
                anomaly_score REAL NOT NULL,
                detected_value REAL,
                expected_value REAL,
                deviation REAL,
                description TEXT,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP
            )
        ''')
        
        # Model performance metrics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS model_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model_name VARCHAR(100) NOT NULL,
                model_version VARCHAR(20) NOT NULL,
                metric_type VARCHAR(50) NOT NULL,
                metric_value REAL NOT NULL,
                evaluation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                dataset_size INTEGER,
                notes TEXT
            )
        ''')
        
        # Energy pricing optimization table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pricing_recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                energy_type VARCHAR(50),
                current_price REAL,
                recommended_price REAL,
                price_change_percent REAL,
                market_conditions TEXT,
                demand_forecast REAL,
                supply_forecast REAL,
                reasoning TEXT,
                valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                valid_until TIMESTAMP,
                applied BOOLEAN DEFAULT FALSE
            )
        ''')
        
        # Weather data cache table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS weather_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                location VARCHAR(100) NOT NULL,
                latitude REAL,
                longitude REAL,
                temperature REAL,
                humidity REAL,
                solar_irradiance REAL,
                wind_speed REAL,
                cloud_cover REAL,
                weather_condition VARCHAR(50),
                data_source VARCHAR(50),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(location, timestamp)
            )
        ''')
        
        # Create indexes for better performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_predictions_user_type ON energy_predictions(user_id, prediction_type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_anomalies_meter ON anomaly_detections(meter_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_anomalies_user ON anomaly_detections(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_metrics_model ON model_metrics(model_name, model_version)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_pricing_user ON pricing_recommendations(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_weather_location ON weather_cache(location)')
        
        # Commit changes
        conn.commit()
        
        print("✅ AI services database created successfully!")
        print(f"📍 Database location: {db_path}")
        
        # Insert sample data if requested
        if '--seed' in os.sys.argv:
            seed_ai_database(cursor, conn)
        
    except Exception as e:
        print(f"❌ Error creating AI database: {e}")
        return False
    finally:
        if conn:
            conn.close()
    
    return True

def seed_ai_database(cursor, conn):
    """Insert sample data for testing"""
    print("🌱 Seeding AI database with sample data...")
    
    try:
        # Sample energy predictions
        sample_predictions = [
            (1, 'demand_forecast', 12.5, 0.85, 24, 'v1.0.0', '{"hour": 14, "day": "monday", "season": "summer"}'),
            (1, 'supply_forecast', 15.2, 0.92, 24, 'v1.0.0', '{"weather": "sunny", "panels": 20, "efficiency": 0.18}'),
            (2, 'demand_forecast', 8.3, 0.78, 24, 'v1.0.0', '{"hour": 14, "day": "monday", "season": "summer"}')
        ]
        
        cursor.executemany('''
            INSERT INTO energy_predictions 
            (user_id, prediction_type, predicted_value, confidence_score, prediction_horizon, model_version, input_features)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', sample_predictions)
        
        # Sample anomaly detections
        sample_anomalies = [
            ('METER_001', 1, 'consumption_spike', 'high', 0.95, 25.5, 12.3, 13.2),
            ('METER_002', 2, 'production_drop', 'medium', 0.73, 5.2, 18.7, -13.5)
        ]
        
        cursor.executemany('''
            INSERT INTO anomaly_detections 
            (meter_id, user_id, anomaly_type, severity, anomaly_score, detected_value, expected_value, deviation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', sample_anomalies)
        
        conn.commit()
        print("✅ Sample data inserted successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")

if __name__ == "__main__":
    create_ai_database()
