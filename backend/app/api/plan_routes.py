from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models import User
from app.utils.security import get_current_user

router = APIRouter()

class UpgradeRequest(BaseModel):
    plan: str

@router.post("/upgrade")
async def upgrade_plan(
    request: UpgradeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Only 'dev' plan is supported for now
    if request.plan != "dev":
        raise HTTPException(status_code=400, detail="Unsupported plan type")
    # Define credit allocation for dev plan
    credit_amount = 50  # 50 generations per upgrade
    # Update user credits and plan
    current_user.credits += credit_amount
    current_user.plan = request.plan
    await db.commit()
    return {"plan": current_user.plan, "credits": current_user.credits}
