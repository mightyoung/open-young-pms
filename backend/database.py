"""Database configuration and session management."""

from typing import AsyncGenerator

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, sessionmaker

from api.services.fastapi_code_generator.models import Base

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/pms"

# Async engine (preferred)
async_engine = create_async_engine(DATABASE_URL, echo=False, pool_size=20, max_overflow=10)
AsyncSessionLocal = async_sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)

# Sync engine (for alembic migrations / CLI)
sync_engine = create_engine(
    DATABASE_URL.replace("+asyncpg", "").replace("postgresql+asyncpg", "postgresql"), pool_size=5
)
SyncSessionLocal = sessionmaker(sync_engine, autocommit=False, autoflush=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Async dependency for FastAPI."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def get_sync_db() -> Session:
    """Sync dependency for background tasks."""
    db = SyncSessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db() -> None:
    """Create all tables. Call once at startup."""
    import asyncio

    asyncio.get_event_loop().run_until_complete(_init_db_async())


async def _init_db_async() -> None:
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
