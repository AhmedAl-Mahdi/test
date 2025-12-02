"""
Authentication routes for user signup, login, and logout
"""
from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from models.schemas import SignUpRequest, LoginRequest, AuthResponse
from services.supabase_service import get_supabase_client

router = APIRouter()


@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignUpRequest):
    """Register a new user account"""
    try:
        supabase = get_supabase_client()
        result = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })
        
        if result.user:
            return AuthResponse(
                success=True,
                message="Account created successfully! Please check your email to verify.",
                user={"email": result.user.email, "id": result.user.id}
            )
        else:
            return AuthResponse(
                success=False,
                message="Failed to create account. Please try again."
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """Log in an existing user"""
    try:
        supabase = get_supabase_client()
        result = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if result.user and result.session:
            return AuthResponse(
                success=True,
                message="Login successful!",
                user={"email": result.user.email, "id": result.user.id},
                access_token=result.session.access_token
            )
        else:
            return AuthResponse(
                success=False,
                message="Invalid credentials"
            )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/logout", response_model=AuthResponse)
async def logout(authorization: Optional[str] = Header(None)):
    """Log out the current user"""
    try:
        supabase = get_supabase_client()
        supabase.auth.sign_out()
        return AuthResponse(
            success=True,
            message="Logged out successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me")
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Get the currently authenticated user"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    
    try:
        supabase = get_supabase_client()
        result = supabase.auth.get_user(token)
        
        if result.user:
            return {
                "success": True,
                "user": {
                    "id": result.user.id,
                    "email": result.user.email
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
