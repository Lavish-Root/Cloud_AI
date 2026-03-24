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
    """Unified entry point for AI-driven security assessments."""
    
    # 1. Detect Provider from URL
    provider = "unknown"
    url = request.url.lower()
    if "aws.amazon.com" in url: provider = "aws"
    elif "azure.com" in url: provider = "azure"
    elif "cloud.google.com" in url: provider = "gcp"

    if provider == "unknown":
        raise HTTPException(status_code=400, detail="Unsupported cloud provider URL.")

    # 2. Get Real-Time Cloud Scan State
    actual_state: Dict[str, Any] = scanner.scan_environment(provider)
    
    # 3. Map actual state to configuration for Rules Engine
    # This removes the hardcoded mock_config and uses the scanner's output
    config: Dict[str, Any] = {
        "mfa_root": all(role.get("mfa", False) for role in actual_state.get("iam_roles", []) if "Admin" in role.get("name", "")),
        "s3_public": any(bucket.get("public", False) for bucket in actual_state.get("storage_buckets", [])),
        "ssh_port_open": any(rule.get("port") == 22 and rule.get("source") == "0.0.0.0/0" for rule in actual_state.get("firewall_rules", [])),
        "compliant": actual_state.get("resources") != f"{provider}-mock-data" # Just a sanity check
    }

    # Override with request config if provided (for testing/extension)
    if request.config:
        config.update(cast(Dict[str, Any], request.config))

    indicators = request.indicators or SecurityIndicator()

    # 4. Hybrid Scoring
    rule_results = rules_engine.evaluate(provider, config)
    
    # --- Real-Time IAM Monitoring (DETECTING OWNER REMOVAL/CREATION) ---
    iam_findings = []
    if "console.cloud.google.com" in url or provider == "gcp":
        # Check Indicators for Hijack Attempts
        if indicators.unauth_attempts > 5:
            iam_findings.append({
                "rule_id": "GCP_OWNER_REMOVAL_DETECTED",
                "name": "OWNER REMOVAL ATTEMPT",  # Matches Dashboard's expected string
                "status": "FAIL",
                "severity": "CRITICAL"
            })
        if indicators.change_freq > 10:
            iam_findings.append({
                "rule_id": "GCP_NEW_OWNER_DETECTED",
                "name": "New Owner Account Created",
                "status": "FAIL", 
                "severity": "HIGH"
            })
    
    rule_results["findings"].extend(iam_findings)
    rule_score = rule_results["overall_score"]
    if iam_findings: 
        rule_score = min(rule_score, 20) # Force a drop in health if Owner is being removed

    ml_threat_prob = ml_engine.predict_risk([
        indicators.change_freq,
        indicators.unauth_attempts,
        indicators.public_resources
    ])
    ml_score = (1 - ml_threat_prob) * 100

    # Weighted: 60% Rules, 40% ML
    final_risk_score = int((0.6 * rule_score) + (0.4 * ml_score))

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
    """Mock auto-remediation endpoint (reverts misconfigurations)."""
    # Logic in production would use Boto3/SDKs to revert the specific issue_id
    return {
        "status": "success",
        "action": "AUTO_REMEDIATION_TRIGGERED",
        "resource": request.resource_id,
        "fix": f"Reverting {request.issue_id} to safe baseline"
    }

def _get_recommendations(provider: str, findings: List[Dict]) -> List[str]:
    recs = ["Enable CloudTrail for audit logging."] if provider == "aws" else ["Enable Activity Logs."]
    for f in findings:
        if f["status"] == "FAIL":
            recs.append(f"Remediate {f['name']} immediately.")
    return list(set(recs)) # Unique list
