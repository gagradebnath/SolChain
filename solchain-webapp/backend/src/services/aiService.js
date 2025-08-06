const { demandForecasting, pricingOptimization, anomalyDetection } = require('../ai-services/src/models');

const aiService = {
    async forecastDemand(data) {
        try {
            const forecast = await demandForecasting.predict(data);
            return forecast;
        } catch (error) {
            throw new Error('Error in demand forecasting: ' + error.message);
        }
    },

    async optimizePricing(data) {
        try {
            const optimizedPrice = await pricingOptimization.calculate(data);
            return optimizedPrice;
        } catch (error) {
            throw new Error('Error in pricing optimization: ' + error.message);
        }
    },

    async detectAnomalies(data) {
        try {
            const anomalies = await anomalyDetection.detect(data);
            return anomalies;
        } catch (error) {
            throw new Error('Error in anomaly detection: ' + error.message);
        }
    }
};

module.exports = aiService;