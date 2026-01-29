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
    credits = Column(Integer, default=5)
    google_id = Column(String, unique=True, nullable=True)
    is_verified = Column(Boolean, default=False)
    has_used_free_trial = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship with Cascade Delete
    prompts = relationship("Prompt", back_populates="owner", cascade="all, delete")
    chains = relationship("Chain", back_populates="owner", cascade="all, delete")
    chat_sessions = relationship("ChatSession", back_populates="owner", cascade="all, delete")

class Chain(Base):
    __tablename__ = "chains"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    nodes = Column(Text) # JSON string
    edges = Column(Text) # JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # User Relationship
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="chains")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    messages = Column(Text) # JSON string of list of objects
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # User Relationship
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="chat_sessions")

class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    otp_code = Column(String)
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    message = Column(Text)
    rating = Column(Integer, nullable=True) # 1-5
    created_at = Column(DateTime(timezone=True), server_default=func.now())

