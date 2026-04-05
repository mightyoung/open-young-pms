"""Permission API — user permissions, role management."""

import uuid

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel

from api.services.fastapi_code_generator.database import get_sync_db
from api.services.fastapi_code_generator.models import User
from api.services.fastapi_code_generator.auth import get_current_user
from services.permission_service import get_user_permissions
from models.permission import PermissionRole
from api.response import ApiResponse
from schemas import ErrorCode, PageResult
from middleware.exception import ApiException

router = APIRouter(prefix="/users/me", tags=["权限"])


class PermissionsResponse(BaseModel):
    roles: list[str]
    permissions: list[str]
    assigned_projects: list[str]
    managed_projects: list[str]


@router.get("/permissions", response_model=ApiResponse[PermissionsResponse])
async def get_my_permissions(current_user: User = Depends(get_current_user)):
    """Get current user's roles, permissions, and project assignments."""
    roles = [current_user.role.name] if current_user.role else []
    return ApiResponse.ok(
        PermissionsResponse(
            roles=roles,
            permissions=get_user_permissions(current_user),
            assigned_projects=current_user.assigned_projects or [],
            managed_projects=current_user.managed_projects or [],
        )
    )


class RoleCreate(BaseModel):
    code: str
    name: str
    permissions: list[str] = []
    is_system: bool = False


class RoleResponse(BaseModel):
    id: str
    code: str
    name: str
    permissions: list[str]
    is_system: bool


class UserProjectsUpdate(BaseModel):
    assigned_projects: list[str] = []
    managed_projects: list[str] = []


admin_router = APIRouter(prefix="/admin", tags=["角色管理"])


def _check_super_admin(current_user: User = Depends(get_current_user)):
    if not current_user.role or current_user.role.name != "super_admin":
        raise ApiException.from_error_code(ErrorCode.PERMISSION_DENIED)
    return current_user


@admin_router.post("/roles", response_model=ApiResponse[RoleResponse], status_code=status.HTTP_201_CREATED)
async def create_role(
    data: RoleCreate,
    _: User = Depends(_check_super_admin),
    db=Depends(get_sync_db),
):
    """Create a new role (super_admin only)."""
    existing = db.query(PermissionRole).filter(PermissionRole.code == data.code).first()
    if existing:
        raise ApiException(code=ErrorCode.INVALID_PARAMS.code, message="Role code already exists")
    role = PermissionRole(
        id=str(uuid.uuid4()),
        code=data.code,
        name=data.name,
        permissions=data.permissions,
        is_system=data.is_system,
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    return ApiResponse.ok(
        RoleResponse(
            id=role.id,
            code=role.code,
            name=role.name,
            permissions=role.permissions or [],
            is_system=role.is_system,
        ),
        message="创建成功",
    )


@admin_router.get("/roles", response_model=PageResult[RoleResponse])
async def list_roles(
    _: User = Depends(_check_super_admin),
    db=Depends(get_sync_db),
):
    """List all roles (super_admin only)."""
    roles = db.query(PermissionRole).all()
    return PageResult(
        items=[
            RoleResponse(
                id=r.id,
                code=r.code,
                name=r.name,
                permissions=r.permissions or [],
                is_system=r.is_system,
            )
            for r in roles
        ],
        total=len(roles),
        page=1,
        page_size=len(roles),
        has_more=False,
    )


@admin_router.put("/users/{user_id}/roles", response_model=ApiResponse)
async def assign_roles(
    user_id: str,
    role_codes: list[str],
    _: User = Depends(_check_super_admin),
    db=Depends(get_sync_db),
):
    """Assign roles to a user (super_admin only)."""
    from api.services.fastapi_code_generator.models import User as DBUser

    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not user:
        raise ApiException.from_error_code(ErrorCode.USER_NOT_FOUND)
    valid_roles = db.query(PermissionRole).filter(PermissionRole.code.in_(role_codes)).all()
    if len(valid_roles) != len(role_codes):
        raise ApiException.from_error_code(ErrorCode.ROLE_NOT_FOUND)
    if valid_roles:
        user.role = valid_roles[0]
    db.commit()
    return ApiResponse.ok(message="Roles assigned")


@admin_router.put("/users/{user_id}/projects", response_model=ApiResponse)
async def assign_projects(
    user_id: str,
    data: UserProjectsUpdate,
    _: User = Depends(_check_super_admin),
    db=Depends(get_sync_db),
):
    """Assign projects to a user (super_admin only)."""
    from api.services.fastapi_code_generator.models import User as DBUser

    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not user:
        raise ApiException.from_error_code(ErrorCode.USER_NOT_FOUND)
    user.assigned_projects = data.assigned_projects
    user.managed_projects = data.managed_projects
    db.commit()
    return ApiResponse.ok(message="Projects assigned")
