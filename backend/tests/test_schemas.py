"""Unit tests for Pydantic response schemas."""

from datetime import datetime

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestApiResponse:
    """Tests for ApiResponse schema."""

    def test_ok_with_data(self):
        from schemas.response import ApiResponse
        resp = ApiResponse.ok({"user": "test"}, message="ok")
        assert resp.code == 0
        assert resp.message == "ok"
        assert resp.data == {"user": "test"}

    def test_ok_without_data(self):
        from schemas.response import ApiResponse
        resp = ApiResponse.ok()
        assert resp.code == 0
        assert resp.data is None

    def test_error(self):
        from schemas.response import ApiResponse
        resp = ApiResponse.error(4001, "validation failed")
        assert resp.code == 4001
        assert resp.message == "validation failed"
        assert resp.data is None

    def test_timestamp_set(self):
        from schemas.response import ApiResponse
        resp = ApiResponse.ok()
        assert resp.timestamp is not None
        # Should be a valid ISO string
        datetime.fromisoformat(resp.timestamp.replace("Z", "+00:00"))


class TestPageResult:
    """Tests for PageResult schema."""

    def test_pagination_fields(self):
        from schemas.response import PageResult
        resp = PageResult(
            items=[{"id": 1}, {"id": 2}],
            total=50,
            page=2,
            page_size=20,
            has_more=True,
        )
        assert len(resp.items) == 2
        assert resp.total == 50
        assert resp.page == 2
        assert resp.page_size == 20
        assert resp.has_more is True

    def test_empty_page(self):
        from schemas.response import PageResult
        resp = PageResult(items=[], total=0, page=1, page_size=20, has_more=False)
        assert resp.items == []
        assert resp.has_more is False
