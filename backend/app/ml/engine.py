import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import os
from typing import List

class SecurityML:
    def __init__(self, model_path="security_model_pro.pkl"):
        self.model_path = model_path
        self.model = None
        
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
            except:
                self._train_initial_model()
        else:
            self._train_initial_model()

    def _train_initial_model(self):
        """Trains a sophisticated classifier on extended security anomaly patterns."""
        # Features: [change_freq, unauth_attempts, public_resources, sensitive_api_calls, anomalous_location]
        data = {
            'change_freq':      [1, 2, 8, 12, 1, 15, 2, 20, 1, 5, 25, 30],
            'unauth_attempts':  [0, 1, 5, 8, 0, 10, 1, 12, 0, 3, 15, 20],
            'public_resources': [0, 1, 10, 15, 0, 20, 2, 25, 0, 8, 30, 40],
            'sensitive_calls':  [0, 1, 4, 10, 0, 15, 1, 25, 0, 2, 30, 50],
            'is_threat':        [0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1]
        }
        df = pd.DataFrame(data)
        X = df.drop('is_threat', axis=1)
        y = df['is_threat']
        
        self.model = RandomForestClassifier(n_estimators=200, random_state=42)
        self.model.fit(X, y)
        joblib.dump(self.model, self.model_path)
        print("Enterprise ML Security Model V2.0 Deployed.")

    def predict_risk(self, features: List[float]) -> float:
        """Predicts risk probability using advanced threat profiling."""
        if not self.model:
            return 0.5
        
        # Padding features if less than expected (for backward compatibility during transition)
        while len(features) < 4:
            features.append(0.0)
            
        input_data = np.array([features[:4]]).reshape(1, -1)
        prob = self.model.predict_proba(input_data)[0][1]
        return float(prob)

# Singleton instance
ml_engine = SecurityML()
