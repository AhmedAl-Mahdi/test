"""
Symptom checker routes for analyzing symptoms and viewing history
"""
from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List
from models.schemas import SymptomAnalysisRequest, SymptomAnalysisResponse, SymptomHistoryItem
from services.supabase_service import get_supabase_client, save_symptom_analysis, get_symptom_history
from services.gemini_service import get_symptom_analysis

router = APIRouter()


def validate_symptoms_input(symptoms: str) -> tuple[bool, str]:
    """Validate the symptoms input"""
    if len(symptoms.split()) < 3:
        return False, "Please provide a more detailed description (at least 3 words)."
    
    symptom_keywords = [
        'pain', 'ache', 'fever', 'headache', 'cough', 'sore', 'throat', 
        'nausea', 'dizzy', 'fatigue', 'tired', 'rash', 'itchy', 'swelling', 
        'breathing', 'stomach', 'cramp', 'chills', 'vomit', 'diarrhea', 
        'runny', 'nose', 'weak', 'numbness', 'burn', 'bleeding'
    ]
    
    if not any(keyword in symptoms.lower() for keyword in symptom_keywords):
        return False, "Your description does not seem to contain common medical symptoms."
    
    return True, ""


@router.post("/analyze", response_model=SymptomAnalysisResponse)
async def analyze_symptoms(
    request: SymptomAnalysisRequest,
    authorization: Optional[str] = Header(None)
):
    """Analyze symptoms using AI and return potential conditions"""
    # Validate input
    is_valid, error_message = validate_symptoms_input(request.symptoms)
    if not is_valid:
        return SymptomAnalysisResponse(
            success=False,
            error=error_message
        )
    
    # Get analysis from Gemini
    analysis_result = get_symptom_analysis(request.symptoms)
    
    if "error" in analysis_result:
        return SymptomAnalysisResponse(
            success=False,
            error=analysis_result["error"]
        )
    
    # Save to database if user is authenticated
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            supabase = get_supabase_client()
            # Set the auth token for RLS
            supabase.postgrest.auth(token)
            save_symptom_analysis(supabase, request.symptoms, analysis_result)
        except Exception as e:
            print(f"Error saving analysis: {e}")
    
    return SymptomAnalysisResponse(
        success=True,
        disclaimer=analysis_result.get("disclaimer"),
        analysis=analysis_result.get("analysis"),
        overall_assessment=analysis_result.get("overall_assessment")
    )


@router.get("/history")
async def get_history(authorization: Optional[str] = Header(None)):
    """Get the symptom analysis history for the current user"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    
    try:
        supabase = get_supabase_client()
        # Set the auth token for RLS
        supabase.postgrest.auth(token)
        history = get_symptom_history(supabase)
        
        return {
            "success": True,
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
