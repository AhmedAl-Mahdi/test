"""
Notifications routes for alerts and reminders
"""
from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List
from datetime import datetime
from models.schemas import NotificationResponse, Notification
from services.supabase_service import get_supabase_client

router = APIRouter()


# Sample notifications for demonstration
# In production, these would come from the database
SAMPLE_NOTIFICATIONS = [
    {
        "id": "1",
        "title": "Welcome to Care-AI!",
        "message": "Start by using the Symptom Checker to analyze your symptoms.",
        "type": "info",
        "read": False,
        "created_at": "2024-01-01T10:00:00Z"
    },
    {
        "id": "2",
        "title": "Health Tip",
        "message": "Remember to stay hydrated and get enough sleep for optimal health.",
        "type": "info",
        "read": False,
        "created_at": "2024-01-01T09:00:00Z"
    }
]


@router.get("/", response_model=NotificationResponse)
async def get_notifications(authorization: Optional[str] = Header(None)):
    """Get all notifications for the current user"""
    # For demo purposes, return sample notifications
    # In production, fetch from Supabase
    notifications = [Notification(**n) for n in SAMPLE_NOTIFICATIONS]
    unread_count = sum(1 for n in notifications if not n.read)
    
    return NotificationResponse(
        success=True,
        notifications=notifications,
        unread_count=unread_count
    )


@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    authorization: Optional[str] = Header(None)
):
    """Mark a notification as read"""
    # In production, update the notification in Supabase
    return {
        "success": True,
        "message": f"Notification {notification_id} marked as read"
    }


@router.post("/read-all")
async def mark_all_as_read(authorization: Optional[str] = Header(None)):
    """Mark all notifications as read"""
    return {
        "success": True,
        "message": "All notifications marked as read"
    }


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    authorization: Optional[str] = Header(None)
):
    """Delete a notification"""
    return {
        "success": True,
        "message": f"Notification {notification_id} deleted"
    }


# Supabase Realtime subscription endpoint info
@router.get("/subscribe-info")
async def get_subscribe_info():
    """Get information about subscribing to real-time notifications"""
    return {
        "info": "Use Supabase Realtime to subscribe to notifications",
        "channel": "notifications",
        "events": ["INSERT", "UPDATE", "DELETE"],
        "table": "notifications",
        "note": "Configure Supabase Realtime in your frontend using @supabase/supabase-js"
    }
