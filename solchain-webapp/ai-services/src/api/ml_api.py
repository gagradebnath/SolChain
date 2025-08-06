from flask import Flask, request, jsonify
from flask_cors import CORS
from src.models.demand_forecasting import DemandForecasting
from src.models.pricing_optimization import PricingOptimization
from src.models.anomaly_detection import AnomalyDetection

app = Flask(__name__)
CORS(app)

@app.route('/api/demand_forecast', methods=['POST'])
def demand_forecast():
    data = request.json
    forecast_model = DemandForecasting()
    forecast = forecast_model.predict(data['input_data'])
    return jsonify({'forecast': forecast})

@app.route('/api/pricing_optimization', methods=['POST'])
def pricing_optimization():
    data = request.json
    pricing_model = PricingOptimization()
    optimized_price = pricing_model.optimize(data['input_data'])
    return jsonify({'optimized_price': optimized_price})

@app.route('/api/anomaly_detection', methods=['POST'])
def anomaly_detection():
    data = request.json
    anomaly_model = AnomalyDetection()
    anomalies = anomaly_model.detect(data['input_data'])
    return jsonify({'anomalies': anomalies})

if __name__ == '__main__':
    app.run(debug=True)