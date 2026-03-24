from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/governance")

class ApprovalRequest(BaseModel):
    id: str
    action: str
    resource: str
    requested_by: str
    timestamp: str
    status: str # "PENDING", "APPROVED", "REJECTED"
    severity: str

# In-memory storage for demo: Start empty to avoid "cached" data on reload
approval_queue: List[Dict] = []

@router.get("/approvals", response_model=List[ApprovalRequest])
async def get_pending_approvals():
    return approval_queue

@router.post("/approvals/{req_id}/action")
async def update_approval_status(req_id: str, action: str):
    """Approve or reject a security remediation action."""
    for item in approval_queue:
        if item["id"] == req_id:
            item["status"] = "APPROVED" if action == "approve" else "REJECTED"
            return {"message": f"Action {action} successfully.", "id": req_id}
    raise HTTPException(status_code=404, detail="Request not found.")

@router.get("/compliance-checks")
async def get_compliance_stats():
    return {
        "aws": {"cis_score": 88, "failed_checks": 3},
        "azure": {"cis_score": 74, "failed_checks": 12},
        "gcp": {"cis_score": 92, "failed_checks": 1}
    }
