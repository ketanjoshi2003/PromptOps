import asyncio
from app.db.database import engine, Base
from app.db.models import User, Prompt

async def reset_database():
    print("Dropping all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    print("Creating all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("Database reset complete.")

if __name__ == "__main__":
    asyncio.run(reset_database())
