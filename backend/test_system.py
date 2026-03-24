import sys
import os
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app
from app.ml.engine import ml_engine

client = TestClient(app)

def run_tests():
    print("--------------------------------------------------")
    print("🧪 PART 1: Direct ML Engine Unit Tests")
    print("--------------------------------------------------")
    
    # 1. Normal behavior
    normal_features = {
        "api_frequency": 5, 
        "login_hour_deviation": 1.0, 
        "failed_action_count": 0,
        "ip_change_freq": 1, 
        "geo_deviation": 1, 
        "privilege_escalation": 0,
        "resource_spikes": 0, 
        "session_duration_sec": 3600, 
        "distinct_services": 2
    }
    norm_res = ml_engine.predict_anomaly(normal_features)
    print(f"Normal Payload Prediction: {norm_res}")
    assert norm_res["anomaly_label"] == 1, "Normal behavior should be labeled 1"
    
    # 2. Anomaly behavior
    anomaly_features = {
        "api_frequency": 500, 
        "login_hour_deviation": 10.0, 
        "failed_action_count": 50,
        "ip_change_freq": 5, 
        "geo_deviation": 3, 
        "privilege_escalation": 10,
        "resource_spikes": 100, 
        "session_duration_sec": 60, 
        "distinct_services": 10
    }
    anom_res = ml_engine.predict_anomaly(anomaly_features)
    print(f"Malicious Payload Prediction: {anom_res}")
    assert anom_res["anomaly_label"] == -1, "Malicious behavior should be labeled -1"
    
    # 3. Legacy compatibility (Float mapping)
    risk_norm = ml_engine.predict_risk([1, 0, 1, 0])
    risk_anom = ml_engine.predict_risk([50, 20, 10, 30])
    print(f"\nExtrapolated Risk (Normal vs Malicious): {risk_norm:.2f} vs {risk_anom:.2f}")
    assert risk_anom > risk_norm, "Malicious extrapolated risk must securely out-score normal risk."
    print("✅ ML Engine tests strictly passed.\n")


    print("--------------------------------------------------")
    print("🚀 PART 2: FastAPI Endpoint Integration Tests")
    print("--------------------------------------------------")
    # 4. Normal API Request
    resp1 = client.post("/api/security/check", json={
        "url": "https://console.cloud.google.com/home",
        "indicators": {
            "change_freq": 1,
            "unauth_attempts": 0,
            "public_resources": 0,
            "sensitive_calls": 0
        }
    })
    print(f"API Normal Scan Status Code: {resp1.status_code}")
    assert resp1.status_code == 200, "API mapping failed."
    
    # 5. Attack Simulation Request
    resp2 = client.post("/api/security/check", json={
        "url": "https://console.cloud.google.com/iam-admin",
        "indicators": {
            "change_freq": 50,
            "unauth_attempts": 15,
            "public_resources": 5,
            "sensitive_calls": 25
        }
    })
    print(f"API Malicious Payload Status Code: {resp2.status_code}")
    assert resp2.status_code == 200, "API mapping failed."
    
    data = resp2.json()
    print("\nExtracting Generated Findings for Attack Scenario:")
    rollback_triggered = False
    for f in data.get("ruleFindings", []):
         print(f" -> {f['name']} [Severity: {f['severity']}, Status: {f['status']}]")
         if "AUTO-REMEDIATED" in f['name']:
             rollback_triggered = True
             
    if rollback_triggered:
        print("✅ FULL SYSTEM CHECK PASSED: HIJACK IDENTIFIED & AUTO-ROLLBACK INITIATED!")
    else:
        print("❌ WARNING: Auto-Rollback footprint not localized in final pipeline.")

if __name__ == "__main__":
    run_tests()
