from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import pandas as pd

class DemandForecasting:
    def __init__(self, data):
        self.data = data
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)

    def preprocess_data(self):
        # Assuming 'date' is a column in the dataset
        self.data['date'] = pd.to_datetime(self.data['date'])
        self.data['month'] = self.data['date'].dt.month
        self.data['day'] = self.data['date'].dt.day
        self.data['weekday'] = self.data['date'].dt.weekday
        self.data.drop('date', axis=1, inplace=True)

    def train(self):
        self.preprocess_data()
        X = self.data.drop('demand', axis=1)  # 'demand' is the target variable
        y = self.data['demand']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        self.model.fit(X_train, y_train)
        predictions = self.model.predict(X_test)
        mae = mean_absolute_error(y_test, predictions)
        return mae

    def predict(self, input_data):
        return self.model.predict(input_data)