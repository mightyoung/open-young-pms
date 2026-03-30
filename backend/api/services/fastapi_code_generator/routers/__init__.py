"""Routers package — generated from PRD."""

from api.services.fastapi_code_generator.routers.auth import router as auth_router
from api.services.fastapi_code_generator.routers.users import router as users_router
from api.services.fastapi_code_generator.routers.projects import router as projects_router
from api.services.fastapi_code_generator.routers.tasks import router as tasks_router
from api.services.fastapi_code_generator.routers.hazard_reports import router as hazard_reports_router
from api.services.fastapi_code_generator.routers.inspection import router as inspections_router
from api.services.fastapi_code_generator.routers.reports import router as reports_router
from api.services.fastapi_code_generator.routers.notifications import router as notifications_router

__all__ = [
    "auth_router",
    "users_router",
    "projects_router",
    "tasks_router",
    "hazard_reports_router",
    "inspections_router",
    "reports_router",
    "notifications_router",
]
