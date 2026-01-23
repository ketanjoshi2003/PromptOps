from fastapi import APIRouter, HTTPException, Body, Depends
from typing import Dict, Any, List
from pydantic import BaseModel
from app.services.chain_service import chain_service
from app.db.database import get_db
from app.utils.security import get_current_user
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import User

router = APIRouter()

class NodeData(BaseModel):
    label: str
    prompt: str

class Node(BaseModel):
    id: str
    data: NodeData

class Edge(BaseModel):
    source: str
    target: str

class ChainRequest(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
    mode: str = "template" # "template" or "enhanced"

@router.post("/execute")
async def execute_chain(
    request: ChainRequest, 
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Credit check
        if current_user.credits <= 0:
            raise HTTPException(status_code=403, detail="Insufficient credits. Please upgrade your plan.")

        # Convert pydantic models to dict for service
        chain_data = request.model_dump()
        results = chain_service.execute_chain(chain_data)

        # Decrement credits
        current_user.credits -= 1
        await db.commit()

        return {"status": "success", "results": results}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
