import os
from dotenv import load_dotenv

from pathlib import Path

# Explicitly load .env from the backend root directory (grandparent of this file)
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

class Settings:
    PROJECT_NAME: str = "PromptOps"
    VERSION: str = "1.0.0"
    database_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost:5432/promptops")
    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)
    
    DATABASE_URL: str = database_url
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
    GOOGLE_API_KEY: str | None = os.getenv("GOOGLE_API_KEY")
    GROQ_API_KEY: str | None = os.getenv("GROQ_API_KEY")
    LLM_PROVIDER: str | None = os.getenv("LLM_PROVIDER") # 'openai', 'gemini', 'groq', or None (auto)

settings = Settings()
