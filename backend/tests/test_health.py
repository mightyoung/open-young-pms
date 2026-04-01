"""Unit tests for health check router — no DB required."""

import pytest
from unittest.mock import MagicMock, AsyncMock, patch

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestLiveness:
    """Tests for GET /health liveness endpoint."""

    @pytest.mark.asyncio
    async def test_liveness_returns_up(self):
        from routers.health import liveness

        result = await liveness()
        assert result["status"] == "UP"
        assert result["tier"] == "liveness"
        assert result["service"] == "pms-backend"
        assert "timestamp" in result


class TestReadiness:
    """Tests for GET /health/ready endpoint."""

    @pytest.mark.asyncio
    async def test_readiness_db_connected(self):
        from routers.health import readiness

        mock_engine = MagicMock()
        mock_conn = MagicMock()
        mock_engine.connect = MagicMock(return_value=mock_conn)
        mock_conn.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_conn.__aexit__ = AsyncMock()
        mock_conn.execute = AsyncMock()

        with patch("routers.health._get_async_engine", return_value=mock_engine):
            result = await readiness()

        assert result["status"] == "UP"
        assert result["tier"] == "readiness"
        assert result["database"] == "connected"

    @pytest.mark.asyncio
    async def test_readiness_db_unreachable_returns_down(self):
        from routers.health import readiness

        mock_engine = MagicMock()
        mock_engine.connect = MagicMock(side_effect=Exception("connection refused"))

        with patch("routers.health._get_async_engine", return_value=mock_engine):
            result = await readiness()

        assert result["status"] == "DOWN"
        assert result["tier"] == "readiness"
        assert result["database"] == "unreachable"
        assert "error" in result
