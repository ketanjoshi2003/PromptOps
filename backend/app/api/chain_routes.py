from fastapi import APIRouter, HTTPException, Body, Depends
from typing import Dict, Any, List
from pydantic import BaseModel
from app.services.chain_service import chain_service
from app.utils.security import get_current_user
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
async def execute_chain(request: ChainRequest, current_user: User = Depends(get_current_user)):
    try:
        # Convert pydantic models to dict for service
        chain_data = request.model_dump()
        results = chain_service.execute_chain(chain_data)
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
