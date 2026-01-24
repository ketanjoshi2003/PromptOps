from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ChainBase(BaseModel):
    title: str
    description: Optional[str] = None
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

class ChainCreate(ChainBase):
    pass

class ChainUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    nodes: Optional[List[Dict[str, Any]]] = None
    edges: Optional[List[Dict[str, Any]]] = None

class ChainResponse(ChainBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
