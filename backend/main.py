"""
Care-AI Backend - FastAPI Application
Main entry point for the backend API server
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.auth import router as auth_router
from routes.symptoms import router as symptoms_router
from routes.chat import router as chat_router
from routes.imaging import router as imaging_router
from routes.notifications import router as notifications_router
from routes.medications import router as medications_router
from routes.profile import router as profile_router
from routes.screening import router as screening_router

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Care-AI API",
    description="Backend API for Care-AI - An Integrated Health Co-Pilot",
    version="1.0.0"
)

# Configure CORS for frontend access
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in origins if origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(symptoms_router, prefix="/api/symptoms", tags=["Symptom Checker"])
app.include_router(chat_router, prefix="/api/chat", tags=["MindWell Chatbot"])
app.include_router(imaging_router, prefix="/api/imaging", tags=["Diagnostic Imaging"])
app.include_router(notifications_router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(medications_router, prefix="/api/medications", tags=["Medication Manager"])
app.include_router(profile_router, prefix="/api/profile", tags=["User Profile"])
app.include_router(screening_router, prefix="/api/screening", tags=["Health Screening"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Care-AI API is running"}


@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "services": {
            "api": "running",
            "supabase": "configured" if os.getenv("SUPABASE_URL") else "not configured",
            "gemini": "configured" if os.getenv("GEMINI_API_KEY") else "not configured"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
