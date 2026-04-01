"""Unit tests for JWT authentication and role-based access control."""

import pytest
from datetime import timedelta
from unittest.mock import MagicMock
from uuid import uuid4

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestDecodeToken:
    """Tests for decode_token — JWT validation without DB."""

    def test_decode_valid_token(self):
        from api.services.fastapi_code_generator.auth import create_access_token, decode_token

        token = create_access_token({"sub": str(uuid4())})
        payload = decode_token(token)
        assert "sub" in payload
        assert "exp" in payload

    def test_decode_invalid_token(self):
        from api.services.fastapi_code_generator.auth import decode_token
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            decode_token("not.a.valid.token")
        assert exc_info.value.status_code == 401

    def test_decode_tampered_token(self):
        from api.services.fastapi_code_generator.auth import decode_token
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            decode_token("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature")
        assert exc_info.value.status_code == 401


class TestRequireRole:
    """Tests for require_role dependency factory — async, so run with pytest.mark.asyncio."""

    @pytest.mark.asyncio
    async def test_user_has_required_role_passes(self):
        from api.services.fastapi_code_generator.auth import require_role

        mock_user = MagicMock()
        mock_user.role = MagicMock()
        mock_user.role.name = "admin"
        mock_user.role.value = None

        checker = require_role("admin")
        result = await checker(mock_user)
        assert result == mock_user

    @pytest.mark.asyncio
    async def test_user_lacks_required_role_raises_403(self):
        from api.services.fastapi_code_generator.auth import require_role
        from fastapi import HTTPException

        mock_user = MagicMock()
        mock_user.role = MagicMock()
        mock_user.role.name = "viewer"
        mock_user.role.value = None

        checker = require_role("admin", "super_admin")
        with pytest.raises(HTTPException) as exc_info:
            await checker(mock_user)
        assert exc_info.value.status_code == 403

    @pytest.mark.asyncio
    async def test_user_with_role_value_passes(self):
        from api.services.fastapi_code_generator.auth import require_role

        mock_user = MagicMock()
        mock_user.role = MagicMock()
        mock_user.role.name = None
        mock_user.role.value = "project_manager"

        checker = require_role("project_manager")
        result = await checker(mock_user)
        assert result == mock_user

    @pytest.mark.asyncio
    async def test_user_with_no_role_raises_403(self):
        from api.services.fastapi_code_generator.auth import require_role
        from fastapi import HTTPException

        mock_user = MagicMock()
        mock_user.role = None

        checker = require_role("admin")
        with pytest.raises(HTTPException) as exc_info:
            await checker(mock_user)
        assert exc_info.value.status_code == 403


class TestCreateAccessToken:
    """Tests for create_access_token."""

    def test_token_contains_sub(self):
        from api.services.fastapi_code_generator.auth import create_access_token, decode_token

        user_id = str(uuid4())
        token = create_access_token({"sub": user_id})
        payload = decode_token(token)
        assert payload["sub"] == user_id

    def test_token_with_custom_expiry(self):
        from api.services.fastapi_code_generator.auth import create_access_token, decode_token

        token = create_access_token({"sub": str(uuid4())}, expires_delta=timedelta(hours=1))
        payload = decode_token(token)
        assert "exp" in payload
