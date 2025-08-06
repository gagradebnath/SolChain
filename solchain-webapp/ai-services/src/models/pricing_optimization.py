from sklearn.linear_model import LinearRegression
import numpy as np

class PricingOptimizer:
    def __init__(self, historical_data):
        self.historical_data = historical_data
        self.model = LinearRegression()

    def train_model(self):
        X = self.historical_data[['demand', 'supply', 'time_of_day']]
        y = self.historical_data['price']
        self.model.fit(X, y)

    def predict_price(self, demand, supply, time_of_day):
        input_data = np.array([[demand, supply, time_of_day]])
        predicted_price = self.model.predict(input_data)
        return predicted_price[0]