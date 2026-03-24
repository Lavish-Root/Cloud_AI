from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Optional, List, Any, cast
from app.rules.checker import rules_engine
from app.ml.engine import ml_engine
from app.services.cloud_scanner import scanner

router = APIRouter(prefix="/api/security")

# --- Schemas ---

class SecurityIndicator(BaseModel):
    change_freq: int = Field(default=2, description="Frequency of resource modifications")
    unauth_attempts: int = Field(default=0, description="Logged unauthorized access attempts")
    public_resources: int = Field(default=0, description="Count of publicly accessible resources")

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

    # 2. Real-Time Security Scan
    # The scanner now returns a detailed resource map matching the upgraded RulesEngine
    actual_state: Dict[str, Any] = scanner.scan_environment(provider)
    
    # 3. Hybrid Threat Intelligence
    # Pass the full state to the rules engine
    rule_results = rules_engine.evaluate(provider, actual_state)
    
    # ML features: [change_freq, unauth_attempts, public_resources, sensitive_calls]
    indicators = request.indicators or SecurityIndicator()
    ml_features = [
        indicators.change_freq,
        indicators.unauth_attempts,
        indicators.public_resources,
        getattr(indicators, 'sensitive_calls', 2) # Support for future schema extension
    ]
    
    ml_threat_prob = ml_engine.predict_risk(ml_features)
    ml_score = (1 - ml_threat_prob) * 100

    # 4. Contextual Alerting (Hijack Detection)
    # If the user is on a sensitive page (like GCP IAM) and indicators show high freq
    if provider == "gcp" and indicators.unauth_attempts > 5:
        rule_results["findings"].insert(0, {
            "rule_id": "GCP_OWNER_REMOVAL_DETECTED",
            "name": "CRITICAL HIJACK ATTEMPT",
            "status": "FAIL",
            "severity": "CRITICAL"
        })
        rule_results["overall_score"] = min(rule_results["overall_score"], 15)

    # Weighted: 70% Rules, 30% ML
    final_risk_score = int((0.7 * rule_results["overall_score"]) + (0.3 * ml_score))

    return {
        "status": "success",
        "provider": provider,
        "riskScore": final_risk_score,
        "ruleFindings": rule_results["findings"],
        "mlInference": {
            "threat_probability": ml_threat_prob,
            "anomaly_level": "LOW" if ml_threat_prob < 0.3 else ("HIGH" if ml_threat_prob > 0.7 else "MEDIUM")
        },
        "recommendations": _get_recommendations(provider, rule_results["findings"])
    }

@router.post("/remediate")
async def trigger_auto_remediation(request: RemediationRequest):
    """Enterprise remediation engine (Simulated)."""
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
            if f["severity"] == "CRITICAL":
                recs.append(f"IMMEDIATE ACTION: Fix {f['name']} via Remediation Center.")
            else:
                recs.append(f"Apply recommended fix for {f['name']}.")
    return list(set(recs))
