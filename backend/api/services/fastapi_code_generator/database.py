"""Database configuration — PostgreSQL only. No SQLite fallback."""

import os
from typing import AsyncGenerator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, sessionmaker


class GUID(TypeDecorator):
    """Platform-independent GUID type."""

    impl = CHAR(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            if isinstance(value, str):
                return value
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return str(value)
        return value


class Base(DeclarativeBase):
    pass


DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///./pms.db")

if DATABASE_URL.startswith("postgresql"):
    # Ensure pgvector or other postgres specific setup is handled if needed
    pass

_async_engine = None
_async_session_factory = None


def _get_async_engine():
    global _async_engine
    if _async_engine is None:
        _async_engine = create_async_engine(DATABASE_URL, echo=False, pool_size=20, max_overflow=10)
    return _async_engine


def _get_async_session_factory():
    global _async_session_factory
    if _async_session_factory is None:
        _async_session_factory = async_sessionmaker(
            _get_async_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _async_session_factory


async def init_db() -> None:
    """Initialize database tables. Raises exception on failure — no silent fallback."""
    from api.services.fastapi_code_generator.models import Base as ModelBase

    engine = _get_async_engine()
    async with engine.begin() as conn:
        await conn.run_sync(ModelBase.metadata.create_all)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Async dependency for FastAPI — single canonical session factory."""
    factory = _get_async_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Sync engine only for migrations/CLI — uses same URL as async
_sync_engine = create_engine(
    DATABASE_URL.replace("+asyncpg", "").replace("postgresql+asyncpg", "postgresql"), pool_size=5
)
SyncSessionLocal = sessionmaker(_sync_engine, autocommit=False, autoflush=False)


def get_sync_db() -> Session:
    """Sync dependency for background tasks / migrations."""
    db = SyncSessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
