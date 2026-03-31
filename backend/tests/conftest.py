"""Backend test configuration — set up test environment before any app imports."""

import os

# Set test environment variables BEFORE any application imports.
# This must be at the very top because auth.py raises RuntimeError at import time
# when JWT_SECRET is not set.
os.environ.setdefault("JWT_SECRET", "test-secret-for-pytest-only-min-32-chars")
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/pms_db_test")
os.environ.setdefault("ENVIRONMENT", "test")

# Now imports that depend on env vars (like auth.py) will not crash during collection.
