from pydantic import BaseModel
from typing import Optional

class FeedbackCreate(BaseModel):
    message: str
    rating: Optional[int] = None
