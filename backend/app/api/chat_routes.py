from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.llm_service import llm_service

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@router.post("/message")
async def chat_endpoint(request: ChatRequest):
    try:
        # Convert Pydantic models to dicts
        msgs = [{"role": m.role, "content": m.content} for m in request.messages]
        response = llm_service.chat(msgs)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
