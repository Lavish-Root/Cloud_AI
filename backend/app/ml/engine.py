import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

class SecurityML:
    def __init__(self, model_path="security_model.pkl"):
        self.model_path = model_path
        self.model = None
        
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
        else:
            self._train_initial_model()

    def _train_initial_model(self):
        """Trains an initial classifier on synthetic security anomaly data."""
        # Features: [resource_change_freq, unauthorized_access_attempts, public_resource_count, sensitive_permission_count]
        data = {
            'change_freq': [1, 2, 8, 12, 1, 15, 2, 20, 1, 5],
            'unauth_attempts': [0, 1, 5, 8, 0, 10, 1, 12, 0, 3],
            'public_resources': [0, 1, 10, 15, 0, 20, 2, 25, 0, 8],
            'is_threat': [0, 0, 1, 1, 0, 1, 0, 1, 0, 1]
        }
        df = pd.DataFrame(data)
        X = df.drop('is_threat', axis=1)
        y = df['is_threat']
        
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X, y)
        joblib.dump(self.model, self.model_path)
        print("Initial ML Security Model Trained.")

    def predict_risk(self, data):
        """Predicts risk probability for given security indicators."""
        if not self.model:
            return 0.5 # Default middle risk if model isn't ready
        
        # Expecting data as [change_freq, unauth_attempts, public_resources]
        input_data = np.array([data]).reshape(1, -1)
        prob = self.model.predict_proba(input_data)[0][1] # Probability of threat
        return float(prob)

# Singleton instance
ml_engine = SecurityML()
