from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.services.llm_service import llm_service
from app.db.database import get_db
from app.utils.security import get_current_user
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import User

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@router.post("/message")
async def chat_endpoint(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        # Ensure user has credits
        if current_user.credits <= 0:
            raise HTTPException(
                status_code=403,
                detail="Insufficient credits. Please upgrade your plan.",
            )
        # Convert Pydantic models to dicts
        msgs = [{"role": m.role, "content": m.content} for m in request.messages]
        response = llm_service.chat(msgs)
        # Decrement credit count
        current_user.credits -= 1
        await db.commit()
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
