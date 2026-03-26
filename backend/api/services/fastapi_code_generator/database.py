"""Database configuration — uses SQLite for demo, PostgreSQL for production."""

import os

from sqlalchemy import create_engine, String
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.types import TypeDecorator, CHAR


class GUID(TypeDecorator):
    """Platform-independent GUID type — stores as String(36) in SQLite, native UUID in PostgreSQL."""
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
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

USE_SQLITE = os.environ.get("USE_SQLITE", "true").lower() in ("true", "1", "yes")

if USE_SQLITE:
    DATABASE_URL = "sqlite+aiosqlite:///./pms_demo.db"
    _sqlite_engine = create_async_engine(DATABASE_URL, echo=False)
    _sqlite_maker = async_sessionmaker(_sqlite_engine, class_=AsyncSession, expire_on_commit=False)

    async def init_db() -> None:
        from api.services.fastapi_code_generator.models import Base as ModelBase
        async with _sqlite_engine.begin() as conn:
            await conn.run_sync(ModelBase.metadata.create_all)
else:
    DATABASE_URL = os.environ.get(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@localhost:5432/pms"
    )
    _pg_engine = None
    _pg_maker = None

    async def init_db() -> None:
        try:
            from api.services.fastapi_code_generator.models import Base as ModelBase
            global _pg_engine, _pg_maker
            _pg_engine = create_async_engine(DATABASE_URL, echo=False, pool_size=20, max_overflow=10)
            _pg_maker = async_sessionmaker(_pg_engine, class_=AsyncSession, expire_on_commit=False)
            async with _pg_engine.begin() as conn:
                await conn.run_sync(ModelBase.metadata.create_all)
            print("Database tables created successfully.")
        except Exception as e:
            print(f"Database initialization skipped (no connection): {e}")


async def get_db() -> AsyncSession:
    """Async dependency for FastAPI."""
    if USE_SQLITE:
        async with _sqlite_maker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    else:
        global _pg_maker
        if _pg_maker is None:
            _pg_maker = async_sessionmaker(
                create_async_engine(DATABASE_URL, echo=False, pool_size=20, max_overflow=10),
                class_=AsyncSession, expire_on_commit=False
            )
        async with _pg_maker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()


_sync_url = "sqlite:///./pms_demo.db"
_sync_engine = create_engine(_sync_url, pool_size=5)
from sqlalchemy.orm import sessionmaker
SyncSessionLocal = sessionmaker(_sync_engine, autocommit=False, autoflush=False)


def get_sync_db():
    db = SyncSessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
