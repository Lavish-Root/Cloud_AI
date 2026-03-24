from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import hashlib

router = APIRouter(prefix="/api/auth")

# In-memory password storage for demo
users = {
    "admin": hashlib.sha256("password123".encode()).hexdigest()
}

class PasswordSetupRequest(BaseModel):
    username: str
    password: str

class VerifyRequest(BaseModel):
    password: str

@router.post("/setup")
async def setup_password(request: PasswordSetupRequest):
    users[request.username] = hashlib.sha256(request.password.encode()).hexdigest()
    return {"status": "success", "msg": "Master password set."}

@router.post("/verify")
async def verify_password(request: VerifyRequest):
    hashed = hashlib.sha256(request.password.encode()).hexdigest()
    if hashed in users.values():
        return {"status": "success"}
    raise HTTPException(status_code=401, detail="Invalid master password.")

@router.get("/has-password")
async def check_password_exists():
    return {"exists": len(users) > 1} # admin is default
