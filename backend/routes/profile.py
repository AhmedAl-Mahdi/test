"""
User profile routes for managing user information
"""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from services.supabase_service import get_supabase_client

router = APIRouter()


class UserProfile(BaseModel):
    display_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None


class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None


def get_user_id_from_token(authorization: str) -> str:
    """Extract user ID from authorization token using Supabase."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        supabase = get_supabase_client()
        result = supabase.auth.get_user(token)
        
        if result.user:
            return result.user.id
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


@router.get("/")
async def get_profile(authorization: Optional[str] = Header(None)):
    """Get the current user's profile"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        supabase = get_supabase_client()
        response = supabase.table('user_profiles').select('*').eq('user_id', user_id).single().execute()
        
        if response.data:
            return {
                "success": True,
                "profile": response.data
            }
        else:
            # Return empty profile if none exists
            return {
                "success": True,
                "profile": {
                    "user_id": user_id,
                    "display_name": "",
                    "email": "",
                    "age": None,
                    "gender": "",
                    "height_cm": None,
                    "weight_kg": None,
                    "blood_type": "",
                    "allergies": "",
                    "medical_conditions": ""
                }
            }
    except Exception as e:
        # Return empty profile if table doesn't exist or other error
        return {
            "success": True,
            "profile": {
                "user_id": user_id,
                "display_name": "",
                "email": "",
                "age": None,
                "gender": "",
                "height_cm": None,
                "weight_kg": None,
                "blood_type": "",
                "allergies": "",
                "medical_conditions": ""
            }
        }


@router.put("/")
async def update_profile(
    profile: ProfileUpdate,
    authorization: Optional[str] = Header(None)
):
    """Update the current user's profile"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        supabase = get_supabase_client()
        
        # Prepare update data
        update_data = {k: v for k, v in profile.dict().items() if v is not None}
        update_data['user_id'] = user_id
        
        # Upsert the profile
        response = supabase.table('user_profiles').upsert(update_data).execute()
        
        if response.data:
            return {
                "success": True,
                "profile": response.data[0],
                "message": "Profile updated successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to update profile")
            
    except Exception as e:
        print(f"Error updating profile: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")


@router.get("/health-tips")
async def get_personalized_health_tips(authorization: Optional[str] = Header(None)):
    """Get personalized health tips based on user profile"""
    user_id = get_user_id_from_token(authorization)
    
    # Default health tips
    default_tips = [
        {
            "id": 1,
            "title": "Stay Hydrated",
            "description": "Drink at least 8 glasses of water daily. Proper hydration helps maintain energy levels and supports all body functions.",
            "icon": "💧",
            "category": "general"
        },
        {
            "id": 2,
            "title": "Get Quality Sleep",
            "description": "Aim for 7-9 hours of sleep each night. Quality sleep is essential for physical recovery and mental clarity.",
            "icon": "😴",
            "category": "sleep"
        },
        {
            "id": 3,
            "title": "Move Your Body",
            "description": "30 minutes of moderate exercise daily can reduce the risk of chronic diseases and improve mental health.",
            "icon": "🏃",
            "category": "exercise"
        },
        {
            "id": 4,
            "title": "Eat Balanced Meals",
            "description": "Include fruits, vegetables, whole grains, and lean proteins in your diet for optimal nutrition.",
            "icon": "🥗",
            "category": "nutrition"
        },
        {
            "id": 5,
            "title": "Practice Mindfulness",
            "description": "Take 10 minutes daily for meditation or deep breathing to reduce stress and improve focus.",
            "icon": "🧘",
            "category": "mental"
        },
        {
            "id": 6,
            "title": "Limit Screen Time",
            "description": "Take breaks every 20 minutes when using screens. Look at something 20 feet away for 20 seconds.",
            "icon": "👁️",
            "category": "eyes"
        },
        {
            "id": 7,
            "title": "Wash Hands Regularly",
            "description": "Proper hand hygiene is one of the most effective ways to prevent illness and spread of germs.",
            "icon": "🧼",
            "category": "hygiene"
        },
        {
            "id": 8,
            "title": "Take Medication on Time",
            "description": "Set reminders to take your medications as prescribed. Consistency is key for effectiveness.",
            "icon": "💊",
            "category": "medication"
        }
    ]
    
    try:
        supabase = get_supabase_client()
        response = supabase.table('user_profiles').select('*').eq('user_id', user_id).single().execute()
        
        personalized_tips = default_tips.copy()
        
        if response.data:
            profile = response.data
            
            # Add personalized tips based on profile
            if profile.get('weight_kg') and profile.get('height_cm'):
                height_m = profile['height_cm'] / 100
                bmi = profile['weight_kg'] / (height_m * height_m)
                
                if bmi > 25:
                    personalized_tips.append({
                        "id": 9,
                        "title": "Healthy Weight Journey",
                        "description": "Small, sustainable changes to diet and exercise can help you reach a healthier weight over time.",
                        "icon": "⚖️",
                        "category": "weight"
                    })
                elif bmi < 18.5:
                    personalized_tips.append({
                        "id": 10,
                        "title": "Nutrition Focus",
                        "description": "Ensure you're getting enough calories and nutrients. Consider consulting a nutritionist.",
                        "icon": "🍎",
                        "category": "nutrition"
                    })
            
            if profile.get('age') and profile['age'] > 40:
                personalized_tips.append({
                    "id": 11,
                    "title": "Regular Checkups",
                    "description": "Schedule annual health screenings appropriate for your age group.",
                    "icon": "🏥",
                    "category": "preventive"
                })
        
        return {
            "success": True,
            "tips": personalized_tips
        }
        
    except Exception as e:
        return {
            "success": True,
            "tips": default_tips
        }
