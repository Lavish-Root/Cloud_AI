from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.services.cloud_scanner import scanner
from app.services.baseline_engine import baseline_engine

router = APIRouter(prefix="/api/baseline")

class BaselineRequest(BaseModel):
    provider: str

@router.post("/snapshot")
async def take_security_snapshot(request: BaselineRequest):
    """Scan current cloud and save as 'Safe' baseline."""
    current_state = scanner.scan_environment(request.provider)
    baseline_engine.create_baseline(request.provider, current_state)
    return {"status": "baseline_created", "provider": request.provider}

@router.get("/status")
async def check_drift_status(provider: str):
    """Detect configuration drift in real-time."""
    current_state = scanner.scan_environment(provider)
    drifts = baseline_engine.detect_drift(provider, current_state)
    return {
        "provider": provider,
        "drift_detected": len(drifts) > 0,
        "drifts": drifts
    }

@router.post("/reset")
async def reset_baseline(request: BaselineRequest):
    """Reset environmental baseline to allow new snapshots."""
    baseline_engine.baseline_data.pop(request.provider, None)
    return {"status": "baseline_cleared", "provider": request.provider}
