"""Routers package."""

from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.projects import router as projects_router
from routers.tasks import router as tasks_router
from routers.permission import router as permission_router, admin_router as permission_admin_router
