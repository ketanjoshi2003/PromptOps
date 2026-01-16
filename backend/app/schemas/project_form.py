from pydantic import BaseModel
from typing import List, Optional

class PromptRequest(BaseModel):
    user_intent: str
    target_tool: str = "generic"
    project_title: Optional[str] = "Untitled Project"
    frontend_stack: Optional[List[str]] = []
    backend_stack: Optional[List[str]] = []
    database: Optional[str] = "None"
    # Future-proofing schema
    project_type: Optional[str] = "general"
    complexity: Optional[str] = "medium"
    ai_control: Optional[str] = "Strict"
    enhance_prompt: bool = True

class PromptUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
