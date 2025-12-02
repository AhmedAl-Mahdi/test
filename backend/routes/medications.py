"""
Medication routes for managing medications and reminders
"""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from services.medication_manager import (
    get_user_medications,
    add_medication,
    update_medication,
    delete_medication,
    log_medication_taken,
    get_medication_logs,
    get_due_reminders,
    get_reminder_settings,
    update_reminder_settings,
    get_low_inventory_alerts,
    update_inventory
)

router = APIRouter()


# Pydantic models for request/response
class MedicationCreate(BaseModel):
    name: str
    dosage: str
    schedule: str
    reminder_minutes_before: Optional[int] = 15
    notes: Optional[str] = ""
    inventory_count: Optional[int] = 0
    inventory_threshold: Optional[int] = 5


class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    schedule: Optional[str] = None
    reminder_minutes_before: Optional[int] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None
    inventory_count: Optional[int] = None
    inventory_threshold: Optional[int] = None


class InventoryUpdate(BaseModel):
    count: int


class MedicationLogCreate(BaseModel):
    taken_at: Optional[str] = None


class ReminderSettingsUpdate(BaseModel):
    default_reminder_minutes: Optional[int] = None
    notifications_enabled: Optional[bool] = None
    email_reminders: Optional[bool] = None


def get_user_id_from_token(authorization: str) -> str:
    """
    Extract user ID from authorization token using Supabase.
    """
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
async def list_medications(authorization: Optional[str] = Header(None)):
    """Get all medications for the current user"""
    user_id = get_user_id_from_token(authorization)
    
    medications = get_user_medications(user_id)
    
    return {
        "success": True,
        "medications": medications
    }


@router.post("/")
async def create_medication(
    medication: MedicationCreate,
    authorization: Optional[str] = Header(None)
):
    """Add a new medication"""
    user_id = get_user_id_from_token(authorization)
    
    result = add_medication(
        user_id=user_id,
        name=medication.name,
        dosage=medication.dosage,
        schedule=medication.schedule,
        reminder_minutes_before=medication.reminder_minutes_before,
        notes=medication.notes,
        inventory_count=medication.inventory_count,
        inventory_threshold=medication.inventory_threshold
    )
    
    if result:
        return {
            "success": True,
            "medication": result,
            "message": f"Medication '{medication.name}' added successfully"
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to add medication")


@router.put("/{medication_id}")
async def update_medication_route(
    medication_id: str,
    updates: MedicationUpdate,
    authorization: Optional[str] = Header(None)
):
    """Update an existing medication"""
    user_id = get_user_id_from_token(authorization)
    
    # Convert Pydantic model to dict, excluding None values
    update_dict = {k: v for k, v in updates.dict().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    result = update_medication(medication_id, user_id, update_dict)
    
    if result:
        return {
            "success": True,
            "medication": result,
            "message": "Medication updated successfully"
        }
    else:
        raise HTTPException(status_code=404, detail="Medication not found or update failed")


@router.delete("/{medication_id}")
async def delete_medication_route(
    medication_id: str,
    authorization: Optional[str] = Header(None)
):
    """Delete a medication"""
    user_id = get_user_id_from_token(authorization)
    
    success = delete_medication(medication_id, user_id)
    
    if success:
        return {
            "success": True,
            "message": "Medication deleted successfully"
        }
    else:
        raise HTTPException(status_code=404, detail="Medication not found or delete failed")


@router.post("/{medication_id}/log")
async def log_dose_taken(
    medication_id: str,
    log_data: MedicationLogCreate,
    authorization: Optional[str] = Header(None)
):
    """Log that a medication dose was taken"""
    user_id = get_user_id_from_token(authorization)
    
    taken_at = None
    if log_data.taken_at:
        try:
            taken_at = datetime.fromisoformat(log_data.taken_at.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid datetime format")
    
    result = log_medication_taken(medication_id, user_id, taken_at)
    
    if result:
        return {
            "success": True,
            "log": result,
            "message": "Dose logged successfully"
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to log dose")


@router.get("/{medication_id}/logs")
async def get_logs(
    medication_id: str,
    days: int = 7,
    authorization: Optional[str] = Header(None)
):
    """Get medication logs for the past N days"""
    user_id = get_user_id_from_token(authorization)
    
    logs = get_medication_logs(medication_id, user_id, days)
    
    return {
        "success": True,
        "logs": logs
    }


@router.get("/reminders/due")
async def get_due_reminders_route(authorization: Optional[str] = Header(None)):
    """Get medications that are due for a reminder"""
    user_id = get_user_id_from_token(authorization)
    
    reminders = get_due_reminders(user_id)
    
    return {
        "success": True,
        "reminders": reminders,
        "count": len(reminders)
    }


@router.get("/settings/reminders")
async def get_settings(authorization: Optional[str] = Header(None)):
    """Get user's reminder settings"""
    user_id = get_user_id_from_token(authorization)
    
    settings = get_reminder_settings(user_id)
    
    return {
        "success": True,
        "settings": settings
    }


@router.put("/settings/reminders")
async def update_settings(
    settings: ReminderSettingsUpdate,
    authorization: Optional[str] = Header(None)
):
    """Update user's reminder settings"""
    user_id = get_user_id_from_token(authorization)
    
    # Get current settings and merge with updates
    current_settings = get_reminder_settings(user_id)
    
    update_dict = {k: v for k, v in settings.dict().items() if v is not None}
    merged_settings = {**current_settings, **update_dict}
    
    success = update_reminder_settings(user_id, merged_settings)
    
    if success:
        return {
            "success": True,
            "settings": merged_settings,
            "message": "Settings updated successfully"
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to update settings")


@router.get("/inventory/low")
async def get_low_inventory_route(authorization: Optional[str] = Header(None)):
    """Get medications with low inventory"""
    user_id = get_user_id_from_token(authorization)
    
    alerts = get_low_inventory_alerts(user_id)
    
    return {
        "success": True,
        "alerts": alerts,
        "count": len(alerts)
    }


@router.put("/{medication_id}/inventory")
async def update_inventory_route(
    medication_id: str,
    inventory_data: InventoryUpdate,
    authorization: Optional[str] = Header(None)
):
    """Update inventory count for a medication"""
    user_id = get_user_id_from_token(authorization)
    
    result = update_inventory(medication_id, user_id, inventory_data.count)
    
    if result:
        return {
            "success": True,
            "medication": result,
            "message": f"Inventory updated to {inventory_data.count}"
        }
    else:
        raise HTTPException(status_code=404, detail="Medication not found or update failed")
