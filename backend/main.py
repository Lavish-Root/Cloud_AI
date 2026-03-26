from fastapi import FastAPI, Response, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api.security import router as security_router
from app.api.governance import router as governance_router
from app.api.reporting import router as reporting_router
from app.api.baseline import router as baseline_router
from app.api.auth import router as auth_router

app = FastAPI(title="CloudGuard AI API")

# Middleware to prevent caching
@app.middleware("http")
async def add_no_cache_header(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(security_router)
app.include_router(governance_router)
app.include_router(reporting_router)
app.include_router(baseline_router)
app.include_router(auth_router)

@app.get("/")
async def root():
    return {"message": "CloudGuard AI Backend is running."}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

import threading
import time
import random
import uuid
from datetime import datetime
from app.api.governance import approval_queue
from app.api.reporting import report_data
from app.services.cloud_environment import cloud_env

def background_simulator():
    """Simulates real-time security incidents and governance requests."""
    actions = ["Revoke Public S3 Access", "Patch Firewall Rule", "Rotate IAM Key", "Encrypt RDS Instance"]
    while True:
        time.sleep(15) 
        
        # 1. Simulate Security Drift / Hijack Attempts
        # 10% chance of a hijack attempt per cycle
        if random.random() < 0.1:
            cloud_env.update_indicators(unauth_attempts=random.randint(6, 12))
        else:
            # Baseline activity
            cloud_env.update_indicators(unauth_attempts=0)

        # 2. Add to Governance & Reports
        if len(approval_queue) < 10:
            new_id = str(uuid.uuid4())
            action = random.choice(actions)
            severity = random.choice(["MEDIUM", "HIGH", "CRITICAL"])
            
            approval_queue.append({
                "id": new_id,
                "action": action,
                "resource": f"arn:cloud:res:{random.randint(1000, 9999)}",
                "requested_by": "CloudGuard AI",
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "status": "PENDING",
                "severity": severity
            })

            report_data.append({
                "Resource": f"res-{random.randint(100, 999)}",
                "Provider": random.choice(["AWS", "Azure", "GCP"]),
                "Violation": action,
                "Status": "Open"
            })

# Start the simulator thread
threading.Thread(target=background_simulator, daemon=True).start()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
