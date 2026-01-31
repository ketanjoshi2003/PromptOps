from pydantic import BaseModel
from typing import List, Optional

class PromptRequest(BaseModel):
    user_intent: str
    target_tool: str = "generic"
    project_title: Optional[str] = "Untitled Project"
    frontend_stack: Optional[List[str]] = []
    frontend_styling: Optional[List[str]] = []
    mobile_stack: Optional[List[str]] = []
    backend_stack: Optional[List[str]] = []
    database: Optional[str] = "None"
    auth: Optional[List[str]] = []
    api: Optional[List[str]] = []
    dev_ops: Optional[List[str]] = []
    # Future-proofing schema
    project_type: Optional[str] = "general"

    ai_control: Optional[str] = "Controlled"
    enhance_prompt: bool = True
    model: Optional[str] = None

class PromptUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
