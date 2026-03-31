"""Tiered health check endpoints."""

from datetime import datetime

from fastapi import APIRouter, status
from sqlalchemy import text

from api.services.fastapi_code_generator.database import _get_async_engine

router = APIRouter(tags=["健康检查"])


@router.get("/health", status_code=status.HTTP_200_OK)
async def liveness():
    """Tier 1: Application liveness. Returns UP if the process is running."""
    return {
        "status": "UP",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "pms-backend",
        "tier": "liveness",
    }


@router.get("/health/ready", status_code=status.HTTP_200_OK)
async def readiness():
    """Tier 2: Readiness. Returns UP only if database is reachable."""
    try:
        engine = _get_async_engine()
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {
            "status": "UP",
            "timestamp": datetime.utcnow().isoformat(),
            "service": "pms-backend",
            "tier": "readiness",
            "database": "connected",
        }
    except Exception as e:
        return {
            "status": "DOWN",
            "timestamp": datetime.utcnow().isoformat(),
            "service": "pms-backend",
            "tier": "readiness",
            "database": "unreachable",
            "error": str(e),
        }


@router.get("/health/db", status_code=status.HTTP_200_OK)
async def database_detail():
    """Tier 3: Database detail. Returns DB version and connection info."""
    engine = _get_async_engine()
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT version()"))
        version = result.scalar()
        pg_result = await conn.execute(text("SELECT pg_database_size(current_database())"))
        db_size = pg_result.scalar()
    return {
        "status": "UP",
        "timestamp": datetime.utcnow().isoformat(),
        "tier": "database",
        "database": "postgresql",
        "version": version,
        "database_size_bytes": db_size,
    }
