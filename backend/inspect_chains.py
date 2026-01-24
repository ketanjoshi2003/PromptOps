
import asyncio
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config.settings import settings
from app.db.models import Chain, User

async def inspect_chains():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Find the user by a likely email if we know it, or just list all chains
        # We can assume the user doing the testing is the one we care about.
        result = await session.execute(select(Chain))
        chains = result.scalars().all()
        
        print(f"Found {len(chains)} chains.")
        for chain in chains:
            print(f"Chain ID: {chain.id}, User ID: {chain.user_id}, Updated: {chain.updated_at}")
            print(f"Nodes: {chain.nodes}")
            print("-" * 20)

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(inspect_chains())
