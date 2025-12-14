"""
Symptom screening routes for questionnaire-based health screening
"""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.supabase_service import get_supabase_client
from services.gemini_service import get_symptom_analysis

router = APIRouter()


class ScreeningAnswer(BaseModel):
    question_id: str
    answer: str


class ScreeningSubmission(BaseModel):
    screening_type: str
    answers: List[ScreeningAnswer]


# Predefined screening questionnaires
SCREENING_QUESTIONNAIRES = {
    "general_health": {
        "title": "General Health Screening",
        "description": "Answer these questions to get personalized health tips and recommendations.",
        "questions": [
            {
                "id": "q1",
                "text": "How would you rate your overall energy level?",
                "type": "single",
                "options": ["Very Low", "Low", "Moderate", "High", "Very High"]
            },
            {
                "id": "q2",
                "text": "How many hours of sleep do you typically get per night?",
                "type": "single",
                "options": ["Less than 5", "5-6 hours", "7-8 hours", "More than 8"]
            },
            {
                "id": "q3",
                "text": "How often do you exercise per week?",
                "type": "single",
                "options": ["Never", "1-2 times", "3-4 times", "5+ times"]
            },
            {
                "id": "q4",
                "text": "How would you describe your stress level?",
                "type": "single",
                "options": ["Very Low", "Low", "Moderate", "High", "Very High"]
            },
            {
                "id": "q5",
                "text": "How many glasses of water do you drink daily?",
                "type": "single",
                "options": ["Less than 4", "4-6 glasses", "7-8 glasses", "More than 8"]
            }
        ]
    },
    "mental_wellness": {
        "title": "Mental Wellness Check",
        "description": "This screening helps assess your current mental wellbeing.",
        "questions": [
            {
                "id": "mw1",
                "text": "Over the past 2 weeks, how often have you felt down, depressed, or hopeless?",
                "type": "single",
                "options": ["Not at all", "Several days", "More than half the days", "Nearly every day"]
            },
            {
                "id": "mw2",
                "text": "How often have you had trouble falling or staying asleep?",
                "type": "single",
                "options": ["Not at all", "Several days", "More than half the days", "Nearly every day"]
            },
            {
                "id": "mw3",
                "text": "How often have you felt little interest or pleasure in doing things?",
                "type": "single",
                "options": ["Not at all", "Several days", "More than half the days", "Nearly every day"]
            },
            {
                "id": "mw4",
                "text": "How often have you felt nervous, anxious, or on edge?",
                "type": "single",
                "options": ["Not at all", "Several days", "More than half the days", "Nearly every day"]
            },
            {
                "id": "mw5",
                "text": "How often have you been able to relax?",
                "type": "single",
                "options": ["Always", "Often", "Sometimes", "Rarely", "Never"]
            }
        ]
    },
    "lifestyle": {
        "title": "Lifestyle Assessment",
        "description": "Evaluate your daily habits and get personalized improvement tips.",
        "questions": [
            {
                "id": "ls1",
                "text": "How often do you eat fruits and vegetables?",
                "type": "single",
                "options": ["Rarely", "1-2 times a week", "3-4 times a week", "Daily", "Multiple times daily"]
            },
            {
                "id": "ls2",
                "text": "How often do you consume sugary drinks or snacks?",
                "type": "single",
                "options": ["Multiple times daily", "Daily", "Few times a week", "Rarely", "Never"]
            },
            {
                "id": "ls3",
                "text": "How often do you take breaks during work/study?",
                "type": "single",
                "options": ["Never", "Rarely", "Sometimes", "Often", "Every hour"]
            },
            {
                "id": "ls4",
                "text": "How much screen time (excluding work) do you have daily?",
                "type": "single",
                "options": ["Less than 1 hour", "1-2 hours", "3-4 hours", "5-6 hours", "More than 6 hours"]
            },
            {
                "id": "ls5",
                "text": "How often do you socialize with friends or family?",
                "type": "single",
                "options": ["Daily", "Several times a week", "Weekly", "Monthly", "Rarely"]
            }
        ]
    }
}


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


def analyze_screening_results(screening_type: str, answers: List[Dict]) -> Dict[str, Any]:
    """Analyze screening answers and provide tips and advice."""
    
    result = {
        "summary": "",
        "score": 0,
        "max_score": 0,
        "category": "",
        "tips": [],
        "recommendations": []
    }
    
    if screening_type == "general_health":
        result["max_score"] = 20
        score = 0
        tips = []
        
        for answer in answers:
            if answer["question_id"] == "q1":
                energy_map = {"Very Low": 0, "Low": 1, "Moderate": 2, "High": 3, "Very High": 4}
                score += energy_map.get(answer["answer"], 2)
                if answer["answer"] in ["Very Low", "Low"]:
                    tips.append("Consider checking your iron levels and vitamin D. Low energy can often be improved with better nutrition and sleep.")
                    
            elif answer["question_id"] == "q2":
                sleep_map = {"Less than 5": 0, "5-6 hours": 1, "7-8 hours": 4, "More than 8": 3}
                score += sleep_map.get(answer["answer"], 2)
                if answer["answer"] in ["Less than 5", "5-6 hours"]:
                    tips.append("Try to improve your sleep hygiene. Aim for 7-8 hours and maintain a consistent sleep schedule.")
                    
            elif answer["question_id"] == "q3":
                exercise_map = {"Never": 0, "1-2 times": 2, "3-4 times": 4, "5+ times": 4}
                score += exercise_map.get(answer["answer"], 2)
                if answer["answer"] in ["Never", "1-2 times"]:
                    tips.append("Start with small exercise goals. Even a 15-minute daily walk can significantly improve your health.")
                    
            elif answer["question_id"] == "q4":
                stress_map = {"Very Low": 4, "Low": 3, "Moderate": 2, "High": 1, "Very High": 0}
                score += stress_map.get(answer["answer"], 2)
                if answer["answer"] in ["High", "Very High"]:
                    tips.append("Consider stress-management techniques like deep breathing, meditation, or speaking with a counselor.")
                    
            elif answer["question_id"] == "q5":
                water_map = {"Less than 4": 0, "4-6 glasses": 2, "7-8 glasses": 4, "More than 8": 4}
                score += water_map.get(answer["answer"], 2)
                if answer["answer"] == "Less than 4":
                    tips.append("Increase your water intake gradually. Keep a water bottle nearby as a reminder.")
        
        result["score"] = score
        result["tips"] = tips
        
        if score >= 16:
            result["category"] = "Excellent"
            result["summary"] = "Your general health habits are excellent! Keep up the great work."
        elif score >= 12:
            result["category"] = "Good"
            result["summary"] = "You have good health habits with some room for improvement."
        elif score >= 8:
            result["category"] = "Fair"
            result["summary"] = "Consider making some lifestyle changes to improve your overall health."
        else:
            result["category"] = "Needs Improvement"
            result["summary"] = "There are several areas where you could significantly improve your health habits."
            
    elif screening_type == "mental_wellness":
        result["max_score"] = 20
        score = 0
        tips = []
        
        score_map = {
            "Not at all": 4, 
            "Several days": 3, 
            "More than half the days": 1, 
            "Nearly every day": 0,
            "Always": 4, "Often": 3, "Sometimes": 2, "Rarely": 1, "Never": 0
        }
        
        concerning_answers = 0
        for answer in answers:
            ans_score = score_map.get(answer["answer"], 2)
            score += ans_score
            if ans_score <= 1:
                concerning_answers += 1
        
        result["score"] = score
        
        if concerning_answers >= 3:
            tips.append("It might be helpful to speak with a mental health professional about what you're experiencing.")
            tips.append("Remember that seeking help is a sign of strength, not weakness.")
        elif concerning_answers >= 1:
            tips.append("Practice self-care activities that bring you joy and relaxation.")
            tips.append("Stay connected with supportive friends and family members.")
        
        tips.append("Try incorporating mindfulness or meditation into your daily routine.")
        tips.append("Regular physical activity can significantly improve mental wellbeing.")
        
        result["tips"] = tips
        
        if score >= 16:
            result["category"] = "Good"
            result["summary"] = "Your mental wellness appears to be in a good place. Continue your healthy practices!"
        elif score >= 10:
            result["category"] = "Moderate"
            result["summary"] = "You may be experiencing some challenges. Consider the tips below."
        else:
            result["category"] = "Seek Support"
            result["summary"] = "Based on your responses, speaking with a mental health professional may be beneficial."
            result["recommendations"].append({
                "type": "urgent",
                "message": "If you're in crisis, please contact a mental health helpline or emergency services."
            })
            
    elif screening_type == "lifestyle":
        result["max_score"] = 20
        score = 0
        tips = []
        
        for answer in answers:
            if answer["question_id"] == "ls1":
                food_map = {"Rarely": 0, "1-2 times a week": 1, "3-4 times a week": 2, "Daily": 3, "Multiple times daily": 4}
                score += food_map.get(answer["answer"], 2)
                if answer["answer"] in ["Rarely", "1-2 times a week"]:
                    tips.append("Try adding one serving of fruits or vegetables to each meal.")
                    
            elif answer["question_id"] == "ls2":
                sugar_map = {"Multiple times daily": 0, "Daily": 1, "Few times a week": 2, "Rarely": 3, "Never": 4}
                score += sugar_map.get(answer["answer"], 2)
                if answer["answer"] in ["Multiple times daily", "Daily"]:
                    tips.append("Gradually reduce sugary drinks by switching to water or unsweetened alternatives.")
                    
            elif answer["question_id"] == "ls3":
                break_map = {"Never": 0, "Rarely": 1, "Sometimes": 2, "Often": 3, "Every hour": 4}
                score += break_map.get(answer["answer"], 2)
                if answer["answer"] in ["Never", "Rarely"]:
                    tips.append("Set a timer to remind yourself to take short breaks every 30-60 minutes.")
                    
            elif answer["question_id"] == "ls4":
                screen_map = {"Less than 1 hour": 4, "1-2 hours": 3, "3-4 hours": 2, "5-6 hours": 1, "More than 6 hours": 0}
                score += screen_map.get(answer["answer"], 2)
                if answer["answer"] in ["5-6 hours", "More than 6 hours"]:
                    tips.append("Consider setting daily screen time limits and finding offline hobbies.")
                    
            elif answer["question_id"] == "ls5":
                social_map = {"Daily": 4, "Several times a week": 4, "Weekly": 3, "Monthly": 1, "Rarely": 0}
                score += social_map.get(answer["answer"], 2)
                if answer["answer"] in ["Monthly", "Rarely"]:
                    tips.append("Social connections are important for wellbeing. Try scheduling regular time with friends or family.")
        
        result["score"] = score
        result["tips"] = tips
        
        if score >= 16:
            result["category"] = "Healthy Lifestyle"
            result["summary"] = "You have excellent lifestyle habits! Keep maintaining this balance."
        elif score >= 12:
            result["category"] = "Mostly Healthy"
            result["summary"] = "You have generally good habits with some areas for improvement."
        elif score >= 8:
            result["category"] = "Room for Improvement"
            result["summary"] = "Consider making some changes to improve your daily habits."
        else:
            result["category"] = "Needs Attention"
            result["summary"] = "There are several lifestyle changes that could significantly benefit your health."
    
    return result


@router.get("/questionnaires")
async def get_available_questionnaires(authorization: Optional[str] = Header(None)):
    """Get list of available screening questionnaires"""
    get_user_id_from_token(authorization)
    
    questionnaires = []
    for key, value in SCREENING_QUESTIONNAIRES.items():
        questionnaires.append({
            "id": key,
            "title": value["title"],
            "description": value["description"],
            "question_count": len(value["questions"])
        })
    
    return {
        "success": True,
        "questionnaires": questionnaires
    }


@router.get("/questionnaires/{screening_type}")
async def get_questionnaire(
    screening_type: str,
    authorization: Optional[str] = Header(None)
):
    """Get a specific screening questionnaire"""
    get_user_id_from_token(authorization)
    
    if screening_type not in SCREENING_QUESTIONNAIRES:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    
    return {
        "success": True,
        "questionnaire": SCREENING_QUESTIONNAIRES[screening_type]
    }


@router.post("/submit")
async def submit_screening(
    submission: ScreeningSubmission,
    authorization: Optional[str] = Header(None)
):
    """Submit screening answers and get results with tips"""
    user_id = get_user_id_from_token(authorization)
    
    if submission.screening_type not in SCREENING_QUESTIONNAIRES:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    
    # Convert answers to list of dicts
    answers_list = [{"question_id": a.question_id, "answer": a.answer} for a in submission.answers]
    
    # Analyze results
    results = analyze_screening_results(submission.screening_type, answers_list)
    
    # Save to database (optional)
    try:
        supabase = get_supabase_client()
        supabase.table('screening_results').insert({
            "user_id": user_id,
            "screening_type": submission.screening_type,
            "answers": answers_list,
            "results": results
        }).execute()
    except Exception as e:
        print(f"Error saving screening results: {e}")
    
    return {
        "success": True,
        "results": results
    }


@router.get("/history")
async def get_screening_history(authorization: Optional[str] = Header(None)):
    """Get user's screening history"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        supabase = get_supabase_client()
        response = supabase.table('screening_results').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(10).execute()
        
        return {
            "success": True,
            "history": response.data if response.data else []
        }
    except Exception as e:
        return {
            "success": True,
            "history": []
        }
