"""角色与权限管理路由"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from api.response import ApiResponse
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import Role, User

router = APIRouter(prefix="/roles", tags=["角色权限"])


@router.get("")
async def list_roles(
    db=Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取角色列表（所有用户可见）。GET /api/v1/roles"""
    result = await db.execute(select(Role).order_by(Role.is_system.desc(), Role.created_at))
    rows = result.scalars().all()
    return ApiResponse.ok(
        [
            {
                "id": r.id,
                "name": r.name,
                "label": r.label,
                "permissions": r.permissions or {},
                "is_system": r.is_system,
            }
            for r in rows
        ]
    )


@router.get("/{role_id}")
async def get_role(
    role_id: UUID,
    db=Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取角色详情。GET /api/v1/roles/{id}"""
    result = await db.execute(select(Role).where(Role.id == str(role_id)))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="角色不存在")
    return ApiResponse.ok(
        {
            "id": role.id,
            "name": role.name,
            "label": role.label,
            "permissions": role.permissions or {},
            "is_system": role.is_system,
        }
    )


@router.post("")
async def create_role(
    data: dict,
    db=Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建角色（仅管理员）。POST /api/v1/roles"""
    # TODO: 权限校验 — 检查当前用户是否有 admin 权限
    role = Role(
        name=data.get("name"),
        label=data.get("label"),
        permissions=data.get("permissions", {}),
        is_system=False,
    )
    db.add(role)
    await db.commit()
    await db.refresh(role)
    return ApiResponse.ok(
        {
            "id": role.id,
            "name": role.name,
            "label": role.label,
            "permissions": role.permissions,
            "is_system": role.is_system,
        }
    )


@router.patch("/{role_id}")
async def update_role(
    role_id: UUID,
    data: dict,
    db=Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新角色（仅管理员）。PATCH /api/v1/roles/{id}"""
    result = await db.execute(select(Role).where(Role.id == str(role_id)))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="角色不存在")
    if role.is_system:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="系统内置角色不可修改")

    if "label" in data:
        role.label = data["label"]
    if "permissions" in data:
        role.permissions = data["permissions"]

    await db.commit()
    return ApiResponse.ok(
        {
            "id": role.id,
            "name": role.name,
            "label": role.label,
            "permissions": role.permissions,
            "is_system": role.is_system,
        }
    )


@router.delete("/{role_id}")
async def delete_role(
    role_id: UUID,
    db=Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除角色（仅管理员，且非系统角色）。DELETE /api/v1/roles/{id}"""
    result = await db.execute(select(Role).where(Role.id == str(role_id)))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="角色不存在")
    if role.is_system:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="系统内置角色不可删除")

    await db.delete(role)
    await db.commit()
    return ApiResponse.ok()
