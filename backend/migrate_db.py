import asyncio
import os
import sys

# Add parent dir to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import engine
from sqlalchemy import text

async def migrate():
    async with engine.begin() as conn:
        print("Migrating users table...")
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS has_used_free_trial BOOLEAN DEFAULT FALSE;"))
            print("Migration successful: Added has_used_free_trial column.")
        except Exception as e:
            print(f"Migration failed (might already exist or other error): {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
