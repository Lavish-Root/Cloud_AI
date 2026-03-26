import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import joblib
import json
import os
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "iforest_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "iforest_scaler.pkl")

# --- STEP 1 & 2: LOG NORMALIZATION & EVENT MAPPING ---
class CloudLogNormalizer:
    """Normalizes provider-specific logs into a unified, cloud-agnostic format."""
    
    EVENT_MAP = {
        "aws": {
            "ConsoleLogin": "login_activity",
            "RunInstances": "resource_creation",
            "TerminateInstances": "resource_deletion",
            "PutBucketPolicy": "privilege_change",
            "DeleteBucket": "resource_deletion",
            "CreateUser": "configuration_change",
            "AttachGroupPolicy": "privilege_change"
        },
        "gcp": {
            "google.login": "login_activity",
            "v1.compute.instances.insert": "resource_creation",
            "v1.compute.instances.delete": "resource_deletion",
            "SetIamPolicy": "privilege_change",
            "storage.buckets.delete": "resource_deletion"
        },
        "azure": {
            "Sign-in activity": "login_activity",
            "Microsoft.Compute/virtualMachines/write": "resource_creation",
            "Microsoft.Compute/virtualMachines/delete": "resource_deletion",
            "Microsoft.Authorization/roleAssignments/write": "privilege_change"
        }
    }
    
    @staticmethod
    def normalize(log: dict, provider: str) -> dict:
        """Converts a raw log to the Unified Schema."""
        mapped_event = CloudLogNormalizer.EVENT_MAP.get(provider.lower(), {}).get(log.get("eventName", ""), "unknown_activity")
        
        return {
            "user_id": str(log.get("userIdentity", "unknown")),
            "timestamp": pd.to_datetime(log.get("eventTime", datetime.now().isoformat())),
            "event_type": mapped_event,
            "resource_type": log.get("resourceType", "unknown"),
            "ip_address": log.get("sourceIPAddress", "0.0.0.0"),
            "location": log.get("awsRegion", log.get("location", "unknown")),
            "status": "success" if not log.get("errorCode") else "failure"
        }

# --- STEP 3 & 4: PREPROCESSING & FEATURE ENGINEERING ---
class FeatureEngineer:
    """Extracts behavioral, cloud-agnostic features from structured Unified Logs layout."""
    
    def __init__(self):
        self.user_profiles = {}
    
    def extract_features(self, logs_df: pd.DataFrame) -> pd.DataFrame:
        if logs_df.empty: return pd.DataFrame()
        
        # Sort by user and time
        logs_df = logs_df.sort_values(by=['user_id', 'timestamp'])
        
        features = []
        for user_id, user_logs in logs_df.groupby("user_id"):
            # Time window stats (assume all logs happen in a given window for this extraction)
            api_frequency = len(user_logs)
            failed_count = len(user_logs[user_logs["status"] == "failure"])
            
            # Login time deviation (typical business hours 8-18)
            user_logs['hour'] = user_logs['timestamp'].dt.hour
            login_hours = user_logs[user_logs['event_type'] == 'login_activity']['hour']
            # Deviation from business hours (absolute diff from noon, normalized)
            if not login_hours.empty:
                login_hour_deviation = np.mean(np.abs(login_hours - 12)) 
            else:
                login_hour_deviation = 0
            
            # Geo/IP deviation
            unique_ips = user_logs['ip_address'].nunique()
            unique_locations = user_logs['location'].nunique()
            geo_deviation = unique_locations  # simplify flag: >1 is anomalous
            
            # Privilege escalation indicator
            privilege_escalation = len(user_logs[user_logs['event_type'] == 'privilege_change'])
            
            # Resource spikes
            resource_creation = len(user_logs[user_logs['event_type'] == 'resource_creation'])
            resource_deletion = len(user_logs[user_logs['event_type'] == 'resource_deletion'])
            resource_spikes = resource_creation + resource_deletion
            
            # Session duration & services
            if len(user_logs) > 1:
                session_duration = (user_logs['timestamp'].max() - user_logs['timestamp'].min()).total_seconds()
            else:
                session_duration = 0
                
            distinct_services = user_logs['resource_type'].nunique()

            features.append({
                "user_id": user_id,
                "api_frequency": api_frequency,
                "login_hour_deviation": login_hour_deviation,
                "failed_action_count": failed_count,
                "ip_change_freq": unique_ips,
                "geo_deviation": geo_deviation,
                "privilege_escalation": privilege_escalation,
                "resource_spikes": resource_spikes,
                "session_duration_sec": session_duration,
                "distinct_services": distinct_services
            })
            
        return pd.DataFrame(features)

# --- STEP 9: DATA GENERATOR & TESTING ---
def generate_synthetic_logs(n_normal=1000, n_anomalies=50) -> pd.DataFrame:
    """Generates synthetic unified logs for training and testing."""
    logs = []
    
    # Normal user profiles
    users = [f"user_{i}" for i in range(20)]
    now = datetime.now()
    
    # Generate Normal Traffic
    for _ in range(n_normal):
        user = random.choice(users)
        time_offset = random.randint(0, 10000)
        hour = random.randint(8, 18) # Normal hours
        event_time = (now - timedelta(days=random.randint(0,10))).replace(hour=hour, minute=random.randint(0,59))
        
        logs.append({
            "user_id": user,
            "timestamp": event_time,
            "event_type": random.choice(["login_activity", "resource_creation", "configuration_change"]),
            "resource_type": random.choice(["compute", "storage", "network"]),
            "ip_address": f"192.168.1.{random.randint(1, 100)}",
            "location": "us-east-1",
            "status": random.choice(["success"]*9 + ["failure"]) # Mostly success
        })
        
    # Generate Anomalous Traffic
    for _ in range(n_anomalies):
        attacker = f"attacker_{random.randint(1,5)}"
        event_time = (now - timedelta(days=random.randint(0,2))).replace(hour=random.choice([2, 3, 4])) # Midnight logins
        
        logs.append({
            "user_id": attacker,
            "timestamp": event_time,
            "event_type": "privilege_change", # Suspicious event
            "resource_type": "iam",
            "ip_address": f"104.28.{random.randint(1, 200)}.{random.randint(1, 200)}", # Unusual IP range
            "location": "ap-southeast-1", # Geo deviation
            "status": random.choice(["success", "failure"]) # High failure rate
        })
        
        # Spike of deletions
        for i in range(10):
            logs.append({
                "user_id": attacker,
                "timestamp": event_time + timedelta(seconds=i),
                "event_type": "resource_deletion",
                "resource_type": "compute",
                "ip_address": f"104.28.{random.randint(1, 200)}.{random.randint(1, 200)}",
                "location": "ap-southeast-1",
                "status": "success"
            })
            
    return pd.DataFrame(logs)

# --- STEP 5: ML MODEL TRAINING ---
def train_model():
    print("Generating Synthetic Behavior Data...")
    raw_logs_df = generate_synthetic_logs(n_normal=5000, n_anomalies=100)
    
    print("Extracting Cloud-Agnostic Features...")
    engineer = FeatureEngineer()
    features_df = engineer.extract_features(raw_logs_df)
    
    # Prepare X
    feature_cols = [
        "api_frequency", "login_hour_deviation", "failed_action_count",
        "ip_change_freq", "geo_deviation", "privilege_escalation",
        "resource_spikes", "session_duration_sec", "distinct_services"
    ]
    X = features_df[feature_cols]
    
    print("Scaling Features...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    print("Training Isolation Forest Anomaly Detector...")
    model = IsolationForest(contamination='auto', random_state=42)
    model.fit(X_scaled)
    
    print("Saving Models (joblib)...")
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    print("Model Training Complete & Saved!")

if __name__ == "__main__":
    train_model()
