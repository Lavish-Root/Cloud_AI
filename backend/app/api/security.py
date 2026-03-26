from fastapi import APIRouter, HTTPException
import random
from pydantic import BaseModel, Field
from typing import Dict, Optional, List, Any, cast
from app.rules.checker import rules_engine
from app.ml.engine import ml_engine
from app.services.cloud_scanner import scanner
from app.db.database import save_scan, get_recent_scans

router = APIRouter(prefix="/api/security")

# --- Schemas ---

class SecurityIndicator(BaseModel):
    change_freq: int = Field(default=2, description="Frequency of resource modifications")
    unauth_attempts: int = Field(default=0, description="Logged unauthorized access attempts")
    public_resources: int = Field(default=0, description="Count of publicly accessible resources")
    sensitive_calls: int = Field(default=2, description="Suspicious API calls detected")

class SecurityCheckRequest(BaseModel):
    url: str
    config: Optional[Dict] = None
    indicators: Optional[SecurityIndicator] = None

class Finding(BaseModel):
    rule_id: str
    name: str
    status: str
    severity: str

class MLInference(BaseModel):
    threat_probability: float
    anomaly_level: str

class SecurityCheckResponse(BaseModel):
    status: str
    provider: str
    riskScore: int
    ruleFindings: List[Finding]
    mlInference: MLInference
    recommendations: List[str]

class RemediationRequest(BaseModel):
    provider: str
    resource_id: str
    issue_id: str

# --- API Endpoints ---

@router.post("/check", response_model=SecurityCheckResponse)
async def perform_security_assessment(request: SecurityCheckRequest):
    """Enterprise-grade security assessment utilizing hybrid Rule + ML analysis."""
    
    # 1. Detect Provider from URL
    provider = "unknown"
    url = request.url.lower()
    if "aws.amazon.com" in url: provider = "aws"
    elif "azure.com" in url: provider = "azure"
    elif "console.cloud.google.com" in url: provider = "gcp"

    if provider == "unknown":
        raise HTTPException(status_code=400, detail="Unsupported cloud provider URL.")

    # 2. Real-Time Security Scan (Connection-Dependent)
    actual_state: Dict[str, Any] = scanner.scan_environment(provider, browser_url=url)
    
    if actual_state.get("status") == "DISCONNECTED":
        return {
            "status": "DISCONNECTED",
            "provider": provider,
            "riskScore": 0,
            "ruleFindings": [],
            "mlInference": {"threat_probability": 0, "anomaly_level": "N/A"},
            "recommendations": [f"Please open the {provider.upper()} console to sync data."]
        }
    
    # 3. Hybrid Threat Intelligence
    rule_results = rules_engine.evaluate(provider, actual_state)
    
    indicators = request.indicators or SecurityIndicator()
    
    # Sync indicators to the persistent cloud environment
    from app.services.cloud_environment import cloud_env
    cloud_env.update_indicators(indicators.unauth_attempts)
    
    ml_features = [
        indicators.change_freq,
        indicators.unauth_attempts,
        indicators.public_resources,
        getattr(indicators, 'sensitive_calls', 2)
    ]
    
    ml_threat_prob = ml_engine.predict_risk(ml_features)
    ml_score = (1 - ml_threat_prob) * 100

    # 4. Contextual Alerting (Hijack Detection)
    if provider == "gcp" and cloud_env.unauth_attempts > 5:
        rule_results["findings"].insert(0, {
            "rule_id": "GCP_OWNER_REMOVAL_DETECTED",
            "name": "CRITICAL HIJACK ATTEMPT",
            "status": "FAIL",
            "severity": "CRITICAL"
        })
        rule_results["overall_score"] = min(rule_results["overall_score"], 15)

    final_risk_score = int((0.7 * rule_results["overall_score"]) + (0.3 * ml_score))

    # --- ENTERPRISE PERSISTENCE ---
    ml_inference = {
        "threat_probability": ml_threat_prob,
        "anomaly_level": "LOW" if ml_threat_prob < 0.3 else ("HIGH" if ml_threat_prob > 0.7 else "MEDIUM")
    }
    
    # --- AUTO ROLLBACK ---
    from app.services.cloud_environment import cloud_env
    from app.db.database import save_audit_log
    
    for finding in rule_results["findings"]:
        if finding["status"] == "FAIL" and finding["severity"] == "CRITICAL":
            # Auto-remediate critical issues immediately
            cloud_env.apply_remediation(provider, "auto-detect", finding["rule_id"])
            save_audit_log("AUTO_REMEDIATION", "auto-detect", f"Auto-reverting {finding['rule_id']} to secure baseline")
            finding["name"] += " (AUTO-REMEDIATED)"
            # finding is technically resolved now, but passing it back with a note for the UI.

    save_scan(provider, final_risk_score, rule_results["findings"], ml_inference)

    return {
        "status": "success",
        "provider": provider,
        "riskScore": final_risk_score,
        "ruleFindings": rule_results["findings"],
        "mlInference": ml_inference,
        "recommendations": _get_recommendations(provider, rule_results["findings"])
    }

@router.post("/remediate/intercept")
async def intercept_hijack():
    """Manually clear the active hijack threat via Secure & Intercept action."""
    from app.services.cloud_environment import cloud_env
    cloud_env.resolve_attack()
    return {"status": "success", "message": "Attack vector neutralized. Baseline restored."}

@router.get("/history")
async def get_security_history():
    """Returns the last 50 security scans for trend analysis."""
    return get_recent_scans(limit=50)

@router.get("/batch-check")
async def perform_batch_check(url: str = ""):
    """Enterprise-grade multi-cloud assessment for a global unified dashboard."""
    providers = ["aws", "azure", "gcp"]
    batch_results = []
    
    from app.services.cloud_environment import cloud_env
    
    for provider in providers:
        actual_state = scanner.scan_environment(provider, browser_url=url)
        
        if actual_state.get("status") == "DISCONNECTED":
            batch_results.append({
                "provider": provider,
                "status": "DISCONNECTED",
                "riskScore": 0,
                "findingsCount": 0,
                "mlInference": {"threat_probability": 0, "anomaly_level": "N/A"}
            })
            continue

        rule_results = rules_engine.evaluate(provider, actual_state)
        
        # ML Inference (Mocking consistent indicators for each)
        ml_features = [random.randint(1,5), cloud_env.unauth_attempts if provider == "gcp" else 0, 1, 2]
        ml_threat_prob = ml_engine.predict_risk(ml_features)
        ml_score = (1 - ml_threat_prob) * 100
        
        final_score = int((0.7 * rule_results["overall_score"]) + (0.3 * ml_score))
        
        batch_results.append({
            "provider": provider,
            "riskScore": final_score,
            "findingsCount": len([f for f in rule_results["findings"] if f["status"] == "FAIL"]),
            "mlInference": {
                "threat_probability": ml_threat_prob,
                "anomaly_level": "LOW" if ml_threat_prob < 0.3 else ("HIGH" if ml_threat_prob > 0.7 else "MEDIUM")
            }
        })
        
    return {"status": "success", "data": batch_results}

@router.post("/remediate")
async def trigger_auto_remediation(request: RemediationRequest):
    """Enterprise remediation engine that modifies the persistent Cloud Environment."""
    from app.db.database import save_audit_log
    from app.services.cloud_environment import cloud_env
    
    # Apply the fix to the persistent state
    cloud_env.apply_remediation(request.provider, request.resource_id, request.issue_id)
    
    # Log the action for audit compliance
    save_audit_log("REMEDIATION", request.resource_id, f"Auto-reverting {request.issue_id}")
    
    return {
        "status": "success",
        "action": "AUTO_REMEDIATION_TRIGGERED",
        "resource": request.resource_id,
        "issue": request.issue_id,
        "fix": f"Auto-reverting {request.issue_id} to secure baseline state."
    }

def _get_recommendations(provider: str, findings: List[Dict]) -> List[str]:
    recs = ["Enable Advanced GuardDuty protection."] if provider == "aws" else ["Enable Microsoft Defender for Cloud."]
    for f in findings:
        if f["status"] == "FAIL":
            if f.get("severity") == "CRITICAL":
                recs.append(f"IMMEDIATE ACTION: Fix {f['name']} via Remediation Center.")
            else:
                recs.append(f"Remediate {f['name']} immediately.")
    return list(set(recs))
