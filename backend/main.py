"""FastAPI main application — PM System Backend."""

from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.dependencies import exception_handler, RequestIDMiddleware
from api.routers.upload import router as upload_router
from api.routers.roles import router as roles_router
from api.routers.data_service import router as data_service_router
from api.routers.knowledge import router as knowledge_router
from routers.dashboard import router as dashboard_router
from routers.approval import router as approval_router
from api.routers.quality import router as quality_router
from api.routers.contracts import router as contracts_router
from api.routers.notification_settings import router as notification_settings_router
from api.routers.export import router as export_router
from routers.audit import router as audit_router
from api.routers.forum import router as forum_api_router
from api.routers.companies import router as companies_router
from api.routers.departments import router as departments_router
from api.routers.risks import router as risks_router, RESOURCE_ROUTER
from api.routers.ai_chat import router as ai_chat_router
from routers.ai import router as new_ai_router
from api.services.fastapi_code_generator.database import init_db
from api.services.fastapi_code_generator.routers import (
    auth_router,
    users_router,
    projects_router,
    hazard_reports_router,
    inspections_router,
    reports_router,
    notifications_router,
)
from routers.tasks import router as tasks_router
from middleware.permission import PermissionMiddleware
from routers.files import router as files_router
from routers.permission import router as permission_router, admin_router as permission_admin_router


# Local notification & websocket routers
from routers.notifications import router as notifications_rest_router
from routers.reports import router as reports_custom_router
from routers.websocket import router as websocket_router
from routers.organization import router as organization_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await init_db()
    except Exception as e:
        print(f"DB init skipped: {e}")
    yield


app = FastAPI(
    title="Project Management System API",
    description="Generated from PRD — FastAPI + SQLAlchemy + JWT + PostgreSQL",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(PermissionMiddleware)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_exception_handler(Exception, exception_handler)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.include_router(websocket_router, tags=["WebSocket"])


app.include_router(upload_router, prefix="/api/v1", tags=["文件上传"])
app.include_router(roles_router, prefix="/api/v1", tags=["角色权限"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(users_router, prefix="/api/v1/users", tags=["用户管理"])
app.include_router(projects_router, prefix="/api/v1/projects", tags=["项目管理"])
app.include_router(tasks_router, prefix="/api/v1", tags=["任务管理"])
app.include_router(hazard_reports_router, prefix="/api/v1/hazards", tags=["随手拍"])
app.include_router(inspections_router, prefix="/api/v1", tags=["扫码巡检"])
app.include_router(reports_custom_router, prefix="/api/v1", tags=["报告管理(自定义)"])
app.include_router(reports_router, prefix="/api/v1/reports", tags=["报告管理"])
app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["消息通知"])
app.include_router(notifications_rest_router, prefix="/api/v1/notifications/v2", tags=["消息通知V2"])
app.include_router(data_service_router, prefix="/api/v1", tags=["数据服务"])
app.include_router(knowledge_router, prefix="/api/v1", tags=["知识库"])
app.include_router(dashboard_router, prefix="/api/v1", tags=["监测看板"])
app.include_router(approval_router, prefix="/api/v1", tags=["审批流"])
app.include_router(quality_router, prefix="/api/v1", tags=["质量管理"])
app.include_router(contracts_router, prefix="/api/v1", tags=["合同管理"])
app.include_router(risks_router, prefix="/api/v1", tags=["风险管理"])
app.include_router(RESOURCE_ROUTER, prefix="/api/v1", tags=["资源调度"])
app.include_router(notification_settings_router, prefix="/api/v1", tags=["通知设置"])
app.include_router(audit_router, prefix="/api/v1", tags=["审计日志"])
from routers.forum import router as forum_router
app.include_router(forum_api_router, prefix="/api/v1", tags=["论坛"])
app.include_router(forum_router, prefix="/api/v1", tags=["论坛增强"])
app.include_router(companies_router, prefix="/api/v1", tags=["公司管理"])
app.include_router(departments_router, prefix="/api/v1", tags=["部门管理"])
app.include_router(ai_chat_router, prefix="/api/v1", tags=["AI助手"])
app.include_router(new_ai_router, prefix="/api/v1", tags=["AI助手V2"])
app.include_router(permission_router, prefix="/api/v1", tags=["权限"])
app.include_router(permission_admin_router, prefix="/api/v1", tags=["角色管理"])
app.include_router(files_router, prefix="/api/v1", tags=["文件管理"])
app.include_router(organization_router, prefix="/api/v1", tags=["组织架构"])


@app.get("/health", tags=["健康检查"])
async def health():
    return {"status": "UP", "timestamp": datetime.utcnow().isoformat(), "service": "pms-backend"}


@app.get("/", tags=["根"])
async def root():
    return {
        "message": "Project Management System API",
        "version": "1.0.0",
        "docs": "/docs",
    }
