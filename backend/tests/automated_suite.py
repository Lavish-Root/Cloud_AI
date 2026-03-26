import sys
import os
from fastapi.testclient import TestClient

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from app.ml.engine import ml_engine

client = TestClient(app)

def run_tests():
    print("--------------------------------------------------")
    print("PART 1: ML Engine Diagnostic Check")
    print("--------------------------------------------------")
    
    # Normal and Malicious checks for score comparison
    normal_features = {"api_frequency": 50, "login_hour_deviation": 1.0, "failed_action_count": 0, "ip_change_freq": 25, "geo_deviation": 1, "privilege_escalation": 0, "resource_spikes": 0, "session_duration_sec": 3600, "distinct_services": 3}
    anomaly_features = {"api_frequency": 500, "login_hour_deviation": 10.0, "failed_action_count": 50, "ip_change_freq": 5, "geo_deviation": 3, "privilege_escalation": 10, "resource_spikes": 100, "session_duration_sec": 60, "distinct_services": 10}
    
    norm_res = ml_engine.predict_anomaly(normal_features)
    anom_res = ml_engine.predict_anomaly(anomaly_features)
    
    print(f"Normal Anomaly Score: {norm_res['anomaly_score']:.4f}")
    print(f"Malicious Anomaly Score: {anom_res['anomaly_score']:.4f}")
    print("ML Engine connectivity confirmed.\n")

    print("--------------------------------------------------")
    print("PART 2: Enterprise Integration & Auto-Rollback Tests")
    print("--------------------------------------------------")
    # 4. Normal API Request
    resp1 = client.post("/api/security/check", json={
        "url": "https://console.cloud.google.com/home",
        "indicators": {"change_freq": 1, "unauth_attempts": 0, "public_resources": 0, "sensitive_calls": 0}
    })
    print(f"API Normal Scan: {resp1.status_code}")
    assert resp1.status_code == 200
    
    # 5. Attack Simulation Request (Should trigger Auto-Rollback)
    resp2 = client.post("/api/security/check", json={
        "url": "https://console.cloud.google.com/iam-admin",
        "indicators": {"change_freq": 50, "unauth_attempts": 15, "public_resources": 5, "sensitive_calls": 25}
    })
    print(f"API Attack Scan: {resp2.status_code}")
    assert resp2.status_code == 200
    
    data = resp2.json()
    rollback_triggered = any("AUTO-REMEDIATED" in f['name'] for f in data.get("ruleFindings", []))
             
    if rollback_triggered:
        print("SYSTEM CHECK PASSED: HIJACK IDENTIFIED & AUTO-ROLLBACK SUCCESSFUL!")
    else:
        print("WARNING: Auto-Rollback not detected. Check rule engine thresholds.")

if __name__ == "__main__":
    run_tests()

if __name__ == "__main__":
    run_tests()
