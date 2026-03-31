"""FastAPI main application — generated from PRD.

NOTE: This file is a standalone generated app. The actual running application
is at backend/main.py. This file is not imported and is kept for reference only.
"""

import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.services.fastapi_code_generator.database import init_db
from api.services.fastapi_code_generator.routers import (
    auth_router,
    users_router,
    projects_router,
    tasks_router,
    hazard_reports_router,
    inspections_router,
    reports_router,
    notifications_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    await init_db()
    yield
    print("Shutting down...")


app = FastAPI(
    title="Project Management System API",
    description="Generated from PRD — FastAPI + SQLAlchemy + JWT",
    version="1.0.0",
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────

_cors_origins = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else []
if not _cors_origins:
    _cors_origins = ["http://localhost:5173", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)


# ── Exception Handlers ────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc), "timestamp": datetime.now(timezone.utc).isoformat()},
    )


# ── Routers ──────────────────────────────────────────────────

app.include_router(auth_router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(users_router, prefix="/api/v1/users", tags=["用户管理"])
app.include_router(projects_router, prefix="/api/v1/projects", tags=["项目管理"])
app.include_router(tasks_router, prefix="/api/v1/tasks", tags=["任务管理"])
app.include_router(hazard_reports_router, prefix="/api/v1/hazards", tags=["随手拍"])
app.include_router(inspections_router, prefix="/api/v1/inspections", tags=["扫码巡检"])
app.include_router(reports_router, prefix="/api/v1/reports", tags=["报告管理"])
app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["消息通知"])


# ── Health ───────────────────────────────────────────────────

@app.get("/health", tags=["健康检查"])
async def health():
    return {"status": "UP", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/", tags=["根"])
async def root():
    return {"message": "Project Management System API", "version": "1.0.0"}
