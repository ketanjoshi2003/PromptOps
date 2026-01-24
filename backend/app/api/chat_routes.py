from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Optional
from app.services.llm_service import llm_service
from app.db.database import get_db
from app.utils.security import get_current_user
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models import User, ChatSession
from app.schemas.chat import ChatSessionCreate, ChatSessionResponse, ChatSessionUpdate
import json

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

# CRUD Operations for Chat Sessions

@router.post("/sessions", response_model=ChatSessionResponse)
async def create_chat_session(session: ChatSessionCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Convert messages list to JSON string
    messages_json = json.dumps([m.model_dump() for m in session.messages])
    
    new_session = ChatSession(
        title=session.title,
        messages=messages_json,
        user_id=current_user.id
    )
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    
    return ChatSessionResponse(
        id=new_session.id,
        user_id=new_session.user_id,
        title=new_session.title,
        messages=json.loads(new_session.messages),
        created_at=new_session.created_at,
        updated_at=new_session.updated_at
    )

@router.get("/sessions", response_model=List[ChatSessionResponse])
async def get_chat_sessions(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ChatSession).where(ChatSession.user_id == current_user.id).order_by(ChatSession.updated_at.desc()).offset(skip).limit(limit))
    sessions = result.scalars().all()
    
    return [
        ChatSessionResponse(
            id=s.id,
            user_id=s.user_id,
            title=s.title,
            messages=json.loads(s.messages),
            created_at=s.created_at,
            updated_at=s.updated_at
        ) for s in sessions
    ]

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
async def get_chat_session(session_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == current_user.id))
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    return ChatSessionResponse(
        id=session.id,
        user_id=session.user_id,
        title=session.title,
        messages=json.loads(session.messages),
        created_at=session.created_at,
        updated_at=session.updated_at
    )

@router.put("/sessions/{session_id}", response_model=ChatSessionResponse)
async def update_chat_session(session_id: int, update: ChatSessionUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == current_user.id))
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if update.title is not None:
        session.title = update.title
    if update.messages is not None:
        session.messages = json.dumps([m.model_dump() for m in update.messages])
        
    await db.commit()
    await db.refresh(session)
    
    return ChatSessionResponse(
        id=session.id,
        user_id=session.user_id,
        title=session.title,
        messages=json.loads(session.messages),
        created_at=session.created_at,
        updated_at=session.updated_at
    )

@router.delete("/sessions/{session_id}")
async def delete_chat_session(session_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == current_user.id))
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    await db.delete(session)
    await db.commit()
    return {"status": "success", "message": "Session deleted"}
