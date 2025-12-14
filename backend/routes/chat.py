"""
Chat routes for MindWell mental health chatbot
"""
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse
from typing import Optional
from models.schemas import ChatRequest, ChatResponse
from services.supabase_service import (
    get_supabase_client, 
    create_chat_conversation, 
    save_chat_message
)
from services.gemini_service import get_mindwell_response, get_mindwell_response_stream

router = APIRouter()


@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    authorization: Optional[str] = Header(None)
):
    """Send a message to the MindWell chatbot and get a response"""
    if not request.messages or len(request.messages) == 0:
        return ChatResponse(
            success=False,
            error="No messages provided"
        )
    
    # Get response from Gemini
    messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
    response = get_mindwell_response(messages)
    
    conversation_id = request.conversation_id
    
    # Save to database if user is authenticated
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            supabase = get_supabase_client()
            supabase.postgrest.auth(token)
            
            # Create conversation if needed
            if not conversation_id:
                conversation_id = create_chat_conversation(supabase)
            
            if conversation_id:
                # Save the user's message
                user_message = request.messages[-1]
                save_chat_message(supabase, conversation_id, user_message.role, user_message.content)
                # Save the AI response
                save_chat_message(supabase, conversation_id, "assistant", response)
        except Exception as e:
            print(f"Error saving chat: {e}")
    
    return ChatResponse(
        success=True,
        message=response,
        conversation_id=conversation_id
    )


@router.post("/stream")
async def stream_message(
    request: ChatRequest,
    authorization: Optional[str] = Header(None)
):
    """Stream a response from the MindWell chatbot"""
    if not request.messages or len(request.messages) == 0:
        raise HTTPException(status_code=400, detail="No messages provided")
    
    messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
    
    def generate():
        full_response = ""
        for chunk in get_mindwell_response_stream(messages):
            full_response += chunk
            yield f"data: {chunk}\n\n"
        
        yield f"data: [DONE]\n\n"
        
        # Save to database after streaming completes
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            try:
                supabase = get_supabase_client()
                supabase.postgrest.auth(token)
                
                conversation_id = request.conversation_id
                if not conversation_id:
                    conversation_id = create_chat_conversation(supabase)
                
                if conversation_id:
                    user_message = request.messages[-1]
                    save_chat_message(supabase, conversation_id, user_message.role, user_message.content)
                    save_chat_message(supabase, conversation_id, "assistant", full_response)
            except Exception as e:
                print(f"Error saving streamed chat: {e}")
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )


@router.get("/history")
async def get_chat_history(authorization: Optional[str] = Header(None)):
    """Get the chat history for the current user"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    
    try:
        supabase = get_supabase_client()
        supabase.postgrest.auth(token)
        
        # Get all conversations
        conversations = supabase.table('chat_conversations').select('*').order('created_at', desc=True).execute()
        
        return {
            "success": True,
            "conversations": conversations.data if conversations.data else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
