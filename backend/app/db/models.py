from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    user_intent = Column(Text)
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # ForeignKey to User
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationship
    owner = relationship("User", back_populates="prompts")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    plan = Column(String, default="free") # 'free' or 'dev'
    generation_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship with Cascade Delete
    prompts = relationship("Prompt", back_populates="owner", cascade="all, delete")
