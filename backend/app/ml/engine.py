import pandas as pd
import numpy as np
import joblib
import os
from typing import List, Dict, Any

from app.ml.training_pipeline import train_model, FeatureEngineer

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "iforest_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "iforest_scaler.pkl")

class SecurityML:
    def __init__(self):
        self.model = None
        self.scaler = None
        self._load_models()

    def _load_models(self):
        if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
            print("Anomaly Detection Models missing. Triggering training pipeline...")
            train_model()
            
        try:
            self.model = joblib.load(MODEL_PATH)
            self.scaler = joblib.load(SCALER_PATH)
            print("Cloud-Agnostic Isolation Forest Model Loaded Successfully.")
        except Exception as e:
            print(f"Error loading models: {e}")

    def predict_anomaly(self, input_features: Dict[str, float]) -> Dict[str, Any]:
        """
        New interface for Anomaly Detection based on Multi-Cloud behavior.
        Accepts a dictionary of features and returns anomaly label and score.
        -1 -> Anomaly
         1 -> Normal
        """
        if not self.model or not self.scaler:
            self._load_models()
            
        feature_cols = [
            "api_frequency", "login_hour_deviation", "failed_action_count",
            "ip_change_freq", "geo_deviation", "privilege_escalation",
            "resource_spikes", "session_duration_sec", "distinct_services"
        ]
        
        # Ensure all features exist
        df = pd.DataFrame([input_features])
        for col in feature_cols:
            if col not in df.columns:
                df[col] = 0.0
                
        X = df[feature_cols]
        X_scaled = self.scaler.transform(X)
        
        label = int(self.model.predict(X_scaled)[0])
        score = float(self.model.decision_function(X_scaled)[0])
        
        return {
            "anomaly_label": label,
            "anomaly_score": score,
            "is_anomaly": True if label == -1 else False
        }

    def predict_risk(self, features: List[float]) -> float:
        """
        Backward compatibility for existing backend APIs.
        Maps the 4 legacy features to the new pipeline, or simply bridges the risk probability.
        """
        # Legacy features: [change_freq, unauth_attempts, public_resources, sensitive_calls]
        if len(features) < 4:
            features = features + [0.0] * (4 - len(features))
            
        # Map to Cloud-Agnostic Schema heuristically 
        mapped_features = {
            "api_frequency": features[0] * 5, 
            "login_hour_deviation": features[1] * 2, # Unauth attempts mapped to time deviation
            "failed_action_count": features[1],
            "ip_change_freq": 1 if features[1] == 0 else 3,
            "geo_deviation": 1,
            "privilege_escalation": features[3],
            "resource_spikes": features[0],
            "session_duration_sec": 3600,
            "distinct_services": features[2]
        }
        
        result = self.predict_anomaly(mapped_features)
        
        # Invert decision function scale for threat probability (where higher = higher threat)
        baseline_score = result["anomaly_score"]
        threat_prob = max(0.0, min(1.0, 0.5 - baseline_score))
        
        if result["is_anomaly"]:
            threat_prob = max(threat_prob, 0.75)
            
        return float(threat_prob)

# Singleton instance
ml_engine = SecurityML()
