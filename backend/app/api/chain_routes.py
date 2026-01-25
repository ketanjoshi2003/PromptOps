from fastapi import APIRouter, HTTPException, Body, Depends, status
from typing import Dict, Any, List
from pydantic import BaseModel
from app.services.chain_service import chain_service
from app.db.database import get_db
from app.utils.security import get_current_user
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from app.db.models import User, Chain
from app.schemas.chain import ChainCreate, ChainResponse, ChainUpdate
import json

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
        results = await chain_service.execute_chain(chain_data)

        # Decrement credits
        current_user.credits -= 1
        await db.commit()

        return {"status": "success", "results": results}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# CRUD Operations for Chains

@router.post("/", response_model=ChainResponse)
async def create_chain(chain: ChainCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_chain = Chain(
        title=chain.title,
        description=chain.description,
        nodes=json.dumps(chain.nodes), # Store as JSON string
        edges=json.dumps(chain.edges), # Store as JSON string
        user_id=current_user.id
    )
    db.add(new_chain)
    await db.commit()
    await db.refresh(new_chain)
    
    # Manually parse JSON back for response? Or let Pydantic handle if we adjust schema?
    # Pydantic schema expects Dict for nodes/edges but DB has String.
    # We need to manually convert if we want strict response matching or update schema.
    # Let's simple return the object, FastAPI will try to validate.
    # Wait, if DB has string and Pydantic wants List[Dict], validation will fail.
    # We should parse it back.
    
    return ChainResponse(
        id=new_chain.id,
        user_id=new_chain.user_id,
        title=new_chain.title,
        description=new_chain.description,
        nodes=json.loads(new_chain.nodes),
        edges=json.loads(new_chain.edges),
        created_at=new_chain.created_at,
        updated_at=new_chain.updated_at
    )

@router.get("/", response_model=List[ChainResponse])
async def get_chains(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Chain).where(Chain.user_id == current_user.id).offset(skip).limit(limit))
    chains = result.scalars().all()
    
    return [
        ChainResponse(
            id=c.id,
            user_id=c.user_id,
            title=c.title,
            description=c.description,
            nodes=json.loads(c.nodes),
            edges=json.loads(c.edges),
            created_at=c.created_at,
            updated_at=c.updated_at
        ) for c in chains
    ]

@router.get("/{chain_id}", response_model=ChainResponse)
async def get_chain(chain_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Chain).where(Chain.id == chain_id, Chain.user_id == current_user.id))
    chain = result.scalar_one_or_none()
    if not chain:
        raise HTTPException(status_code=404, detail="Chain not found")
        
    return ChainResponse(
        id=chain.id,
        user_id=chain.user_id,
        title=chain.title,
        description=chain.description,
        nodes=json.loads(chain.nodes),
        edges=json.loads(chain.edges),
        created_at=chain.created_at,
        updated_at=chain.updated_at
    )

@router.put("/{chain_id}", response_model=ChainResponse)
async def update_chain(chain_id: int, update: ChainUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Chain).where(Chain.id == chain_id, Chain.user_id == current_user.id))
    chain = result.scalar_one_or_none()
    
    if not chain:
        raise HTTPException(status_code=404, detail="Chain not found")
        
    if update.title is not None:
        chain.title = update.title
    if update.description is not None:
        chain.description = update.description
    if update.nodes is not None:
        chain.nodes = json.dumps(update.nodes)
    if update.edges is not None:
        chain.edges = json.dumps(update.edges)
        
    await db.commit()
    await db.refresh(chain)
    
    return ChainResponse(
        id=chain.id,
        user_id=chain.user_id,
        title=chain.title,
        description=chain.description,
        nodes=json.loads(chain.nodes),
        edges=json.loads(chain.edges),
        created_at=chain.created_at,
        updated_at=chain.updated_at
    )

@router.delete("/{chain_id}")
async def delete_chain(chain_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Chain).where(Chain.id == chain_id, Chain.user_id == current_user.id))
    chain = result.scalar_one_or_none()
    if not chain:
        raise HTTPException(status_code=404, detail="Chain not found")
    
    await db.delete(chain)
    await db.commit()
    return {"status": "success", "message": "Chain deleted"}
