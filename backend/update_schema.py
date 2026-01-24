
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.db.models import Base
from app.config.settings import settings

async def init_models():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        # Create OTP table
        await conn.run_sync(Base.metadata.create_all)
        
        # Add columns to users table is tricky with pure SQLAlchemy create_all (it skips existing tables)
        # We will use raw SQL for the specific columns if they don't exist.
        # However, checking if column exists is DB specific (Postgres).
        
        # Add google_id
        try:
            await conn.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR UNIQUE;")
            await conn.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;")
        except Exception as e:
            print(f"Column addition might have failed or exists: {e}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_models())
