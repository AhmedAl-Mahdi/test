"""
Supabase client service for database and authentication
"""
import os
from supabase import create_client, Client
from typing import Optional
import json

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """
    Creates and returns a Supabase client instance.
    Uses singleton pattern for efficiency.
    """
    global _supabase_client
    
    if _supabase_client is None:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
        
        _supabase_client = create_client(supabase_url, supabase_key)
    
    return _supabase_client


def save_symptom_analysis(supabase_client: Client, symptoms: str, analysis: dict) -> bool:
    """
    Saves the user's symptom analysis to the database.
    """
    try:
        analysis_json_string = json.dumps(analysis)
        
        data_to_insert = {
            "symptoms_input": symptoms,
            "analysis_result": analysis_json_string
        }
        
        response = supabase_client.table('symptom_history').insert(data_to_insert).execute()
        
        if len(response.data) > 0:
            return True
        return False
        
    except Exception as e:
        print(f"Error saving to database: {e}")
        return False


def get_symptom_history(supabase_client: Client):
    """
    Retrieves the symptom analysis history for the currently logged-in user.
    """
    try:
        response = supabase_client.table('symptom_history').select('*').order('created_at', desc=True).execute()
        
        if response.data:
            return response.data
        return []
        
    except Exception as e:
        print(f"Error fetching history from database: {e}")
        return []


def create_chat_conversation(supabase_client: Client) -> Optional[str]:
    """Creates a new chat conversation for the current user and returns its ID."""
    try:
        response = supabase_client.table('chat_conversations').insert({}).execute()
        
        if response.data:
            return response.data[0]['id']
        return None
    except Exception as e:
        print(f"Error creating conversation: {e}")
        return None


def save_chat_message(supabase_client: Client, conversation_id: str, role: str, content: str) -> bool:
    """Saves a single chat message to the database."""
    try:
        supabase_client.table('chat_messages').insert({
            "conversation_id": conversation_id,
            "role": role,
            "content": content
        }).execute()
        return True
    except Exception as e:
        print(f"Error saving chat message: {e}")
        return False


def get_chat_history(supabase_client: Client):
    """Retrieves all conversations and their messages for the current user."""
    try:
        response = supabase_client.table('chat_conversations').select('*').order('created_at', desc=True).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Error fetching chat history: {e}")
        return []
