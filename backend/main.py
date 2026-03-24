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
    allow_origins=["*"],  # Extension and Dashboard origins
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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
