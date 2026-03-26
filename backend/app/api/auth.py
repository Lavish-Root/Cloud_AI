from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import bcrypt
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth")

# In-memory passcode storage (simulating a DB)
# Default 'password123' hashed with bcrypt
_default_hash = bcrypt.hashpw("password123".encode(), bcrypt.gensalt()).decode()
users = {
    "admin": _default_hash
}

class PasswordSetupRequest(BaseModel):
    username: str
    password: str

class VerifyRequest(BaseModel):
    passcode: str

@router.post("/setup")
async def setup_password(request: PasswordSetupRequest):
    # Salted bcrypt hash
    hashed = bcrypt.hashpw(request.password.encode(), bcrypt.gensalt()).decode()
    users[request.username] = hashed
    return {"status": "success", "msg": "Master passcode securely established."}

@router.post("/verify")
async def verify_password(request: VerifyRequest):
    # Verify against all stored hashes
    for stored_hash in users.values():
        if bcrypt.checkpw(request.passcode.encode(), stored_hash.encode()):
            return {"status": "success"}
            
    raise HTTPException(status_code=401, detail="Invalid master passcode.")

@router.get("/has-password")
async def check_password_exists():
    return {"exists": len(users) > 1} # admin is default
