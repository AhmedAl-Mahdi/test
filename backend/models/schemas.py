"""
Pydantic models for API request/response schemas
"""
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


# Authentication models
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None
    access_token: Optional[str] = None


# Symptom analysis models
class SymptomAnalysisRequest(BaseModel):
    symptoms: str


class ConditionAnalysis(BaseModel):
    condition: str
    probability_score: int
    explanation: str
    suggested_next_steps: str


class SymptomAnalysisResponse(BaseModel):
    success: bool
    error: Optional[str] = None
    disclaimer: Optional[str] = None
    analysis: Optional[List[ConditionAnalysis]] = None
    overall_assessment: Optional[str] = None


class SymptomHistoryItem(BaseModel):
    id: str
    symptoms_input: str
    analysis_result: str
    created_at: str


# Chat models
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    conversation_id: Optional[str] = None
    error: Optional[str] = None


# Imaging models
class ImagingAnalysisResponse(BaseModel):
    success: bool
    finding: Optional[str] = None
    confidence: Optional[float] = None
    error: Optional[str] = None


# Notification models
class Notification(BaseModel):
    id: str
    title: str
    message: str
    type: str  # 'info', 'warning', 'success', 'alert'
    read: bool
    created_at: str


class NotificationResponse(BaseModel):
    success: bool
    notifications: List[Notification] = []
    unread_count: int = 0
