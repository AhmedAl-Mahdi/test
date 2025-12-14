"""
Medication Manager Service
Handles medication tracking, scheduling, and reminders
"""
import os
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from services.supabase_service import get_supabase_client


def get_user_medications(user_id: str) -> List[Dict[str, Any]]:
    """
    Retrieves all medications for a specific user.
    """
    try:
        supabase = get_supabase_client()
        response = supabase.table('medications').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
        
        if response.data:
            return response.data
        return []
    except Exception as e:
        print(f"Error fetching medications: {e}")
        return []


def add_medication(
    user_id: str,
    name: str,
    dosage: str,
    schedule: str,
    reminder_minutes_before: int = 15,
    notes: str = "",
    inventory_count: int = 0,
    inventory_threshold: int = 5
) -> Optional[Dict[str, Any]]:
    """
    Adds a new medication for a user.
    
    Args:
        user_id: The user's ID
        name: Medicine name
        dosage: Dosage amount (e.g., "500mg", "2 tablets")
        schedule: Schedule string (e.g., "daily at 08:00", "every 8 hours")
        reminder_minutes_before: How many minutes before dose to send reminder
        notes: Additional notes about the medication
        inventory_count: Current inventory count
        inventory_threshold: Threshold for low inventory warning
    
    Returns:
        The created medication record or None if failed
    """
    try:
        supabase = get_supabase_client()
        
        # Use string user_id directly - Supabase will handle the conversion
        medication_data = {
            "user_id": user_id,
            "name": name,
            "dosage": dosage,
            "schedule": schedule,
            "reminder_minutes_before": reminder_minutes_before if reminder_minutes_before else 15,
            "notes": notes if notes else "",
            "inventory_count": inventory_count if inventory_count else 0,
            "inventory_threshold": inventory_threshold if inventory_threshold else 5,
            "is_active": True,
            "created_at": datetime.utcnow().isoformat()
        }
        
        print(f"[medication_manager] Adding medication for user {user_id}")
        print(f"[medication_manager] Data: {json.dumps(medication_data, default=str)}")
        
        response = supabase.table('medications').insert(medication_data).execute()
        
        print(f"[medication_manager] Response data: {response.data}")
        
        if response.data and len(response.data) > 0:
            print(f"[medication_manager] Successfully added medication: {response.data[0]}")
            return response.data[0]
        
        print(f"[medication_manager] No data returned from insert")
        return None
    except Exception as e:
        print(f"[medication_manager] Error adding medication: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise e


def update_medication(
    medication_id: str,
    user_id: str,
    updates: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """
    Updates an existing medication.
    
    Args:
        medication_id: The medication's ID
        user_id: The user's ID (for security check)
        updates: Dictionary of fields to update
    
    Returns:
        The updated medication record or None if failed
    """
    try:
        supabase = get_supabase_client()
        
        # Only allow updating specific fields
        allowed_fields = ['name', 'dosage', 'schedule', 'reminder_minutes_before', 'notes', 'is_active', 'inventory_count', 'inventory_threshold']
        safe_updates = {k: v for k, v in updates.items() if k in allowed_fields}
        
        response = supabase.table('medications').update(safe_updates).eq('id', medication_id).eq('user_id', user_id).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error updating medication: {e}")
        return None


def delete_medication(medication_id: str, user_id: str) -> bool:
    """
    Deletes a medication (soft delete by setting is_active to False).
    
    Args:
        medication_id: The medication's ID
        user_id: The user's ID (for security check)
    
    Returns:
        True if successful, False otherwise
    """
    try:
        supabase = get_supabase_client()
        response = supabase.table('medications').update({'is_active': False}).eq('id', medication_id).eq('user_id', user_id).execute()
        
        return response.data is not None and len(response.data) > 0
    except Exception as e:
        print(f"Error deleting medication: {e}")
        return False


def log_medication_taken(medication_id: str, user_id: str, taken_at: Optional[datetime] = None, decrement_inventory: bool = True) -> Optional[Dict[str, Any]]:
    """
    Logs that a medication dose was taken and optionally decrements inventory.
    
    Args:
        medication_id: The medication's ID
        user_id: The user's ID
        taken_at: When the dose was taken (defaults to now)
        decrement_inventory: Whether to decrement the inventory count
    
    Returns:
        The log entry or None if failed
    """
    try:
        supabase = get_supabase_client()
        
        log_data = {
            "medication_id": medication_id,
            "user_id": user_id,
            "taken_at": (taken_at or datetime.utcnow()).isoformat()
        }
        
        response = supabase.table('medication_logs').insert(log_data).execute()
        
        # Decrement inventory if enabled
        if decrement_inventory:
            try:
                med_response = supabase.table('medications').select('inventory_count').eq('id', medication_id).eq('user_id', user_id).single().execute()
                if med_response.data and med_response.data.get('inventory_count', 0) > 0:
                    new_count = med_response.data['inventory_count'] - 1
                    supabase.table('medications').update({'inventory_count': new_count}).eq('id', medication_id).execute()
            except Exception as inv_err:
                print(f"Error updating inventory: {inv_err}")
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error logging medication: {e}")
        return None


def get_medication_logs(medication_id: str, user_id: str, days: int = 7) -> List[Dict[str, Any]]:
    """
    Gets medication logs for the past N days.
    
    Args:
        medication_id: The medication's ID
        user_id: The user's ID
        days: Number of days to look back
    
    Returns:
        List of log entries
    """
    try:
        supabase = get_supabase_client()
        since_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        response = supabase.table('medication_logs').select('*').eq('medication_id', medication_id).eq('user_id', user_id).gte('taken_at', since_date).order('taken_at', desc=True).execute()
        
        if response.data:
            return response.data
        return []
    except Exception as e:
        print(f"Error fetching medication logs: {e}")
        return []


def get_due_reminders(user_id: str) -> List[Dict[str, Any]]:
    """
    Gets medications that are due for a reminder.
    This checks all active medications and returns those that need reminders.
    
    Args:
        user_id: The user's ID
    
    Returns:
        List of medications that need reminders
    """
    try:
        medications = get_user_medications(user_id)
        active_medications = [m for m in medications if m.get('is_active', True)]
        
        reminders = []
        now = datetime.utcnow()
        
        for med in active_medications:
            schedule = med.get('schedule', '')
            reminder_minutes = med.get('reminder_minutes_before', 15)
            
            # Parse schedule and check if reminder is due
            next_dose_time = parse_schedule(schedule, now)
            
            if next_dose_time:
                reminder_time = next_dose_time - timedelta(minutes=reminder_minutes)
                
                # If reminder time is within the next hour, include it
                if reminder_time <= now + timedelta(hours=1) and reminder_time >= now - timedelta(minutes=5):
                    reminders.append({
                        'medication': med,
                        'next_dose_time': next_dose_time.isoformat(),
                        'reminder_time': reminder_time.isoformat(),
                        'message': f"Reminder: Take {med['name']} ({med['dosage']}) in {reminder_minutes} minutes"
                    })
        
        return reminders
    except Exception as e:
        print(f"Error getting due reminders: {e}")
        return []


def parse_schedule(schedule: str, reference_time: datetime) -> Optional[datetime]:
    """
    Parses a schedule string and returns the next dose time.
    
    Supports formats:
    - "daily at HH:MM" (e.g., "daily at 08:00")
    - "every X hours" (e.g., "every 8 hours")
    - "twice daily at HH:MM and HH:MM"
    - "morning", "afternoon", "evening", "night"
    
    Args:
        schedule: Schedule string
        reference_time: Reference datetime for calculations
    
    Returns:
        Next dose datetime or None if parse fails
    """
    schedule_lower = schedule.lower().strip()
    
    try:
        # Daily at specific time
        if 'daily at' in schedule_lower:
            time_str = schedule_lower.replace('daily at', '').strip()
            hour, minute = map(int, time_str.split(':'))
            next_dose = reference_time.replace(hour=hour, minute=minute, second=0, microsecond=0)
            if next_dose <= reference_time:
                next_dose += timedelta(days=1)
            return next_dose
        
        # Every X hours
        if 'every' in schedule_lower and 'hour' in schedule_lower:
            import re
            match = re.search(r'every\s+(\d+)\s+hour', schedule_lower)
            if match:
                hours = int(match.group(1))
                # Assume doses start at midnight
                start_of_day = reference_time.replace(hour=0, minute=0, second=0, microsecond=0)
                hours_passed = (reference_time - start_of_day).total_seconds() / 3600
                next_interval = ((hours_passed // hours) + 1) * hours
                next_dose = start_of_day + timedelta(hours=next_interval)
                return next_dose
        
        # Common time-of-day patterns
        time_patterns = {
            'morning': 8,
            'afternoon': 14,
            'evening': 18,
            'night': 21,
            'bedtime': 22
        }
        
        for pattern, hour in time_patterns.items():
            if pattern in schedule_lower:
                next_dose = reference_time.replace(hour=hour, minute=0, second=0, microsecond=0)
                if next_dose <= reference_time:
                    next_dose += timedelta(days=1)
                return next_dose
        
        # Default: assume daily at 9 AM
        next_dose = reference_time.replace(hour=9, minute=0, second=0, microsecond=0)
        if next_dose <= reference_time:
            next_dose += timedelta(days=1)
        return next_dose
        
    except Exception as e:
        print(f"Error parsing schedule '{schedule}': {e}")
        return None


def get_reminder_settings(user_id: str) -> Dict[str, Any]:
    """
    Gets user's reminder settings.
    
    Args:
        user_id: The user's ID
    
    Returns:
        Reminder settings dictionary
    """
    try:
        supabase = get_supabase_client()
        response = supabase.table('user_settings').select('*').eq('user_id', user_id).single().execute()
        
        if response.data:
            return response.data.get('reminder_settings', {
                'default_reminder_minutes': 15,
                'notifications_enabled': True,
                'email_reminders': False
            })
        
        # Return defaults if no settings found
        return {
            'default_reminder_minutes': 15,
            'notifications_enabled': True,
            'email_reminders': False
        }
    except Exception as e:
        print(f"Error fetching reminder settings: {e}")
        return {
            'default_reminder_minutes': 15,
            'notifications_enabled': True,
            'email_reminders': False
        }


def update_reminder_settings(user_id: str, settings: Dict[str, Any]) -> bool:
    """
    Updates user's reminder settings.
    
    Args:
        user_id: The user's ID
        settings: New settings dictionary
    
    Returns:
        True if successful, False otherwise
    """
    try:
        supabase = get_supabase_client()
        
        # Try to update existing settings or insert new ones
        response = supabase.table('user_settings').upsert({
            'user_id': user_id,
            'reminder_settings': settings
        }).execute()
        
        return response.data is not None
    except Exception as e:
        print(f"Error updating reminder settings: {e}")
        return False


def get_low_inventory_alerts(user_id: str) -> List[Dict[str, Any]]:
    """
    Gets medications with inventory below threshold.
    
    Args:
        user_id: The user's ID
    
    Returns:
        List of medications with low inventory
    """
    try:
        medications = get_user_medications(user_id)
        low_inventory = []
        
        for med in medications:
            if not med.get('is_active', True):
                continue
                
            inventory = med.get('inventory_count', 0)
            threshold = med.get('inventory_threshold', 5)
            
            if inventory <= threshold:
                low_inventory.append({
                    'medication': med,
                    'inventory_count': inventory,
                    'threshold': threshold,
                    'message': f"Low inventory: {med['name']} has only {inventory} doses left"
                })
        
        return low_inventory
    except Exception as e:
        print(f"Error getting low inventory alerts: {e}")
        return []


def update_inventory(medication_id: str, user_id: str, new_count: int) -> Optional[Dict[str, Any]]:
    """
    Updates the inventory count for a medication.
    
    Args:
        medication_id: The medication's ID
        user_id: The user's ID
        new_count: The new inventory count
    
    Returns:
        The updated medication or None if failed
    """
    try:
        supabase = get_supabase_client()
        
        response = supabase.table('medications').update({
            'inventory_count': max(0, new_count)
        }).eq('id', medication_id).eq('user_id', user_id).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error updating inventory: {e}")
        return None
