"""
Gemini AI client service for symptom analysis and mental health chatbot
"""
import os
import google.generativeai as genai
import json
from typing import Generator


def validate_json_schema(data: dict) -> bool:
    """
    Validates if the received JSON matches our expected schema.
    """
    if "disclaimer" not in data or "analysis" not in data or "overall_assessment" not in data:
        return False
    
    if not isinstance(data["analysis"], list):
        return False
        
    for item in data["analysis"]:
        if "condition" not in item or "probability_score" not in item or "explanation" not in item or "suggested_next_steps" not in item:
            return False
            
    return True


def get_symptom_analysis(symptoms_description: str) -> dict:
    """
    Analyzes user symptoms using the Gemini API with a robust, structured prompt.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"error": "Gemini API key not configured"}
    
    try:
        genai.configure(api_key=api_key)
    except Exception as e:
        return {"error": f"Error configuring the Gemini API: {str(e)}"}

    system_prompt = """
    You are an AI-powered clinical decision support model. Your role is to assist users by providing a preliminary analysis of their symptoms.

    **IMPORTANT RULES:**
    1.  **DO NOT PROVIDE A DIAGNOSIS.** You are not a doctor.
    2.  **ALWAYS INCLUDE A STRONG DISCLAIMER.**
    3.  **OUTPUT MUST BE A VALID JSON OBJECT.** No other text or explanation should be outside of the JSON structure.
    4.  **IF THE USER INPUT DOES NOT DESCRIBE MEDICAL SYMPTOMS**, you must respond with a specific JSON error object: {"error": "The input provided does not seem to describe medical symptoms. Please describe your symptoms to get an analysis."} Do not try to answer the question.
    5.  **SUGGESTED NEXT STEPS MUST BE SAFE AND RESPONSIBLE.**

    **JSON OUTPUT SCHEMA:**
    {
      "disclaimer": "This is an AI-generated analysis...",
      "analysis": [
        {
          "condition": "Name of the potential condition",
          "probability_score": <integer>,
          "explanation": "...",
          "suggested_next_steps": "Immediate Care / Consult a Doctor / Self-Care"
        }
      ],
      "overall_assessment": "..."
    }

    ---
    **EXAMPLE:**

    **User Input:** "I have a high fever, a pounding headache, and my body aches all over. I also feel very tired."

    **Expected JSON Output:**
    {
      "disclaimer": "This is an AI-generated analysis and not a medical diagnosis. Please consult a qualified healthcare professional for any health concerns.",
      "analysis": [
        {
          "condition": "Influenza (Flu)",
          "probability_score": 85,
          "explanation": "The combination of high fever, headache, body aches, and fatigue are classic and strong indicators of influenza.",
          "suggested_next_steps": "Consult a Doctor"
        },
        {
          "condition": "Common Cold",
          "probability_score": 30,
          "explanation": "While possible, the high fever and severe body aches make a common cold less likely than the flu.",
          "suggested_next_steps": "Self-Care"
        }
      ],
      "overall_assessment": "The symptoms strongly suggest a viral infection like the flu. Medical consultation is recommended for proper diagnosis and management."
    }
    ---

    Now, analyze the following user-provided symptoms and generate a response strictly following the rules and JSON schema.
    """

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=system_prompt
    )
    
    try:
        response = model.generate_content(symptoms_description)
        cleaned_response = response.text.strip().replace('```json', '').replace('```', '').strip()
        
        data = json.loads(cleaned_response)

        if "error" in data:
            return data

        if not validate_json_schema(data):
            raise ValueError("JSON output does not match the required schema.")

        return data
        
    except (json.JSONDecodeError, ValueError) as e:
        print(f"JSON validation/parsing error: {e}")
        return {"error": "The model returned an invalid response format. Please try rephrasing your symptoms."}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"error": "An unexpected error occurred while analyzing your symptoms. Please try again later."}


def get_mindwell_response(chat_history: list) -> str:
    """
    Gets a response from the Gemini model for the MindWell chatbot.
    
    Args:
        chat_history: A list of message dictionaries with 'role' and 'content'.
    
    Returns:
        The AI response as a string.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "Error: Gemini API key not configured"
    
    try:
        genai.configure(api_key=api_key)
    except Exception as e:
        return f"Error configuring the Gemini API: {str(e)}"

    mindwell_system_prompt = """
    You are MindWell, an AI mental health support companion. Your purpose is to provide a safe, empathetic, and supportive space for users to express their thoughts and feelings.

    **Core Principles:**
    1.  **Empathy and Validation:** Always start by acknowledging and validating the user's feelings. Use phrases like "It sounds like you're going through a lot," "Thank you for sharing that with me," or "That sounds incredibly difficult."
    2.  **Active Listening:** Ask open-ended follow-up questions to encourage the user to explore their feelings further. Examples: "How did that make you feel?", "Can you tell me more about what that was like?", "What was on your mind at that moment?".
    3.  **No Diagnoses or Medical Advice:** You are NOT a therapist or a doctor. You MUST NOT diagnose conditions, recommend treatments, or provide medical advice. If a user asks for a diagnosis, gently deflect and guide them to a professional. Say things like, "As an AI, I can't provide a diagnosis, but it sounds like these feelings are really impacting you. A mental health professional would be the best person to help you understand them."
    4.  **Crisis Intervention (CRITICAL):** If the user expresses thoughts of self-harm, suicide, or harming others, you MUST immediately provide a crisis hotline number and a clear, direct message of support. Respond with: "It sounds like you are in a lot of pain, and I'm very concerned for your safety. Please know that help is available. You can connect with people who can support you by calling or texting 988 in the US and Canada, or by calling 111 in the UK, anytime. Please reach out to them." Do not continue the regular conversation after this point.
    5.  **Maintain a Supportive Persona:** Your tone should always be calm, gentle, non-judgmental, and supportive. Keep responses concise and easy to understand.
    """

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=mindwell_system_prompt
    )

    gemini_history = []
    for msg in chat_history[:-1]:  # All messages except the last one
        role = "model" if msg["role"] == "assistant" else msg["role"]
        gemini_history.append({'role': role, 'parts': [msg['content']]})

    chat = model.start_chat(history=gemini_history)
    
    latest_prompt = chat_history[-1]['content']

    try:
        response = chat.send_message(latest_prompt)
        return response.text
    except Exception as e:
        print(f"Error getting MindWell response: {e}")
        return "I apologize, but I'm having trouble responding right now. Please try again."


def get_mindwell_response_stream(chat_history: list) -> Generator[str, None, None]:
    """
    Gets a streaming response from the Gemini model for the MindWell chatbot.
    
    Args:
        chat_history: A list of message dictionaries with 'role' and 'content'.
    
    Yields:
        Chunks of the AI response as strings.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        yield "Error: Gemini API key not configured"
        return
    
    try:
        genai.configure(api_key=api_key)
    except Exception as e:
        yield f"Error configuring the Gemini API: {str(e)}"
        return

    mindwell_system_prompt = """
    You are MindWell, an AI mental health support companion. Your purpose is to provide a safe, empathetic, and supportive space for users to express their thoughts and feelings.

    **Core Principles:**
    1.  **Empathy and Validation:** Always start by acknowledging and validating the user's feelings.
    2.  **Active Listening:** Ask open-ended follow-up questions to encourage the user to explore their feelings further.
    3.  **No Diagnoses or Medical Advice:** You are NOT a therapist or a doctor. You MUST NOT diagnose conditions.
    4.  **Crisis Intervention (CRITICAL):** If the user expresses thoughts of self-harm, suicide, or harming others, provide crisis hotline numbers immediately.
    5.  **Maintain a Supportive Persona:** Your tone should always be calm, gentle, non-judgmental, and supportive.
    """

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=mindwell_system_prompt
    )

    gemini_history = []
    for msg in chat_history[:-1]:
        role = "model" if msg["role"] == "assistant" else msg["role"]
        gemini_history.append({'role': role, 'parts': [msg['content']]})

    chat = model.start_chat(history=gemini_history)
    latest_prompt = chat_history[-1]['content']

    try:
        response = chat.send_message(latest_prompt, stream=True)
        for chunk in response:
            if hasattr(chunk, 'text') and chunk.text:
                yield chunk.text
    except Exception as e:
        print(f"Error getting MindWell streaming response: {e}")
        yield "I apologize, but I'm having trouble responding right now. Please try again."
