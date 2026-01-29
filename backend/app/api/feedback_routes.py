from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models import Feedback, User
from app.schemas.feedback import FeedbackCreate
from app.utils.security import get_current_user_optional

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_feedback(
    feedback: FeedbackCreate,
    current_user: User = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    try:
        user_id = current_user.id if current_user else None
        
        new_feedback = Feedback(
            user_id=user_id,
            message=feedback.message,
            rating=feedback.rating
        )
        
        db.add(new_feedback)
        await db.commit()
        
        return {"message": "Feedback received successfully"}
    except Exception as e:
        print(f"Error saving feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to save feedback")
