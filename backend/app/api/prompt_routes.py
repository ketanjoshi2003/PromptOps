from fastapi import APIRouter, Depends, Body, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from typing import List
from app.schemas.project_form import PromptRequest, PromptUpdate
from app.services.prompt_service import create_prompt
from app.db.database import get_db, engine, Base
from app.db.models import Prompt

from app.utils.security import get_current_user
from app.db.models import Prompt, User

router = APIRouter()

@router.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@router.post("/generate")
async def generate_prompt(
    request: PromptRequest, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print(f"Received request: {request.user_intent}")
    print(f"DEBUG: enhance_prompt flag received as: {request.enhance_prompt} (Type: {type(request.enhance_prompt)})")
    try:
        # USAGE LIMIT CHECK
        if current_user.credits <= 0:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient credits. Please upgrade your plan."
            )

        # Prepare data for PromptService
        input_data = {
            "goal": request.user_intent,
            "project_title": request.project_title,
            "frontend_stack": request.frontend_stack,
            "backend_stack": request.backend_stack,
            "database": request.database,
            "ai_target": request.target_tool, # Pass through the tool selection
            "project_type": request.project_type,
            "complexity": request.complexity,
            "ai_control": request.ai_control,
            "enhance_prompt": request.enhance_prompt
        }

        
        generated_content = create_prompt(input_data)
        
        # DEBUG LOG
        print(f"Generated Content Type: {type(generated_content)}")
        print(f"Generated Content Preview: '{str(generated_content)[:100] if generated_content else 'EMPTY STRING'}'")

        if not generated_content:
             print("WARNING: Generated content is empty!")

        # Save to DB
        new_prompt = Prompt(
            title=request.project_title or "Untitled Project",
            user_intent=request.user_intent,
            content=generated_content,
            user_id=current_user.id
        )
        db.add(new_prompt)
        
        # Decrement credits
        current_user.credits -= 1
        db.add(current_user)
        
        await db.commit()
        await db.refresh(new_prompt)

        return {
            "generated_instruction": generated_content,
            "status": "success",
            "id": new_prompt.id,
            "credits_remaining": current_user.credits
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "generated_instruction": f"Error generating prompt: {str(e)}",
            "status": "error"
        }

@router.put("/projects/{project_id}")
async def update_project(project_id: int, request: PromptUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        result = await db.execute(select(Prompt).where(Prompt.id == project_id, Prompt.user_id == current_user.id))
        prompt = result.scalar_one_or_none()
        
        if not prompt:
            return {"status": "error", "message": "Project not found"}
            
        if request.title is not None:
            prompt.title = request.title
        if request.content is not None:
            prompt.content = request.content
            
        await db.commit()
        await db.refresh(prompt)
        return {"status": "success", "id": project_id, "title": prompt.title, "content": prompt.content}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/projects")
async def get_projects(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Prompt)
        .where(Prompt.user_id == current_user.id)
        .order_by(Prompt.id.desc())
    )
    prompts = result.scalars().all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "content": p.content,
            "created_at": p.created_at
        }
        for p in prompts
    ]

@router.delete("/projects/{project_id}")
async def delete_project(project_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        # Check if exists and owned by user
        result = await db.execute(select(Prompt).where(Prompt.id == project_id, Prompt.user_id == current_user.id))
        prompt = result.scalar_one_or_none()
        
        if not prompt:
            return {"status": "error", "message": "Project not found"}
            
        await db.delete(prompt)
        await db.commit()
        return {"status": "success", "id": project_id}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.delete("/projects")
async def delete_projects(project_ids: List[int] = Body(...), db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        # Bulk delete only user's prompts
        await db.execute(
            delete(Prompt).where(
                Prompt.id.in_(project_ids), 
                Prompt.user_id == current_user.id
            )
        )
        await db.commit()
        return {"status": "success", "ids": project_ids}
    except Exception as e:
        return {"status": "error", "message": str(e)}
