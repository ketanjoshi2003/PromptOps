
import asyncio
from sqlalchemy import text, inspect
from sqlalchemy.ext.asyncio import create_async_engine
from app.config.settings import settings
from app.db.models import Base

async def fix_schema():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        # Create tables that don't exist (like OTP)
        await conn.run_sync(Base.metadata.create_all)
        
        # Check and add columns manually for existing tables
        # We'll try to add them; if they exist, it might error, so we catch it.
        # But 'IF NOT EXISTS' is cleaner if supported.
        # Let's try to just run the ALTER commands wrapped in try/except for safety.
        
        try:
            print("Attempting to add google_id column...")
            await conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR UNIQUE;"))
            print("Added google_id column.")
        except Exception as e:
            print(f"Skipping google_id (probably exists): {e}")

        try:
            print("Attempting to add is_verified column...")
            await conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;"))
            print("Added is_verified column.")
        except Exception as e:
            print(f"Skipping is_verified (probably exists): {e}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(fix_schema())
