import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.config.settings import settings

async def clear_all_tables():
    """Clear all data from all tables and reset primary key sequences."""
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    # Order matters due to foreign key constraints
    # Delete from child tables first, then parent tables
    tables_to_clear = [
        "prompts",
        "chains", 
        "chat_sessions",
        "feedbacks",
        "otps",
        "users"  # Users last since other tables reference it
    ]
    
    async with engine.begin() as conn:
        for table in tables_to_clear:
            try:
                print(f"Truncating table: {table}...")
                # TRUNCATE with RESTART IDENTITY resets the auto-increment counter
                # CASCADE handles foreign key dependencies
                await conn.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE;"))
                print(f"✓ Truncated {table} (ID reset to 1)")
            except Exception as e:
                print(f"✗ Error truncating {table}: {e}")
    
    await engine.dispose()
    print("\n✓ All tables cleared and primary keys reset!")

if __name__ == "__main__":
    print("=" * 50)
    print("CLEARING ALL DATA & RESETTING PRIMARY KEYS")
    print("=" * 50)
    asyncio.run(clear_all_tables())
