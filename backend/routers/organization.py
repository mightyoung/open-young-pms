"""Organization management routes."""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas.organization import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
    UserDepartmentAssign,
    UserOrganizationResponse,
)
from api.response import ApiResponse
from services.organization_service import org_service
from api.services.fastapi_code_generator.models import User
from services.permission_service import has_permission

router = APIRouter(prefix="/organization", tags=["组织架构"])


def require_permission(action: str):
    async def dependency(request: Request):
        user: User = request.state.user
        if not has_permission(user, action):
            raise HTTPException(status_code=403, detail="权限不足")
        return user

    return Depends(dependency)


async def get_current_user(request: Request) -> User:
    if not hasattr(request.state, "user"):
        raise HTTPException(status_code=401, detail="未认证")
    return request.state.user


@router.get("/departments/tree")
async def get_department_tree(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tree = await org_service.get_department_tree(db)
    return ApiResponse.ok(tree)


@router.get("/departments/{department_id}")
async def get_department(
    department_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not await org_service.can_view_department(db, current_user, department_id):
        raise HTTPException(status_code=403, detail="无权限访问该部门")

    from sqlalchemy import select
    from models.organization import Department

    result = await db.execute(select(Department).where(Department.id == department_id, Department.is_active == True))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=404, detail="部门不存在")

    return ApiResponse.ok(DepartmentResponse.model_validate(dept))


@router.post("/departments", response_model=ApiResponse)
async def create_department(
    department: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = require_permission("department:create"),
):
    dept = await org_service.create_department(db, department.model_dump())
    return ApiResponse.ok({"id": dept.id, "name": dept.name})


@router.put("/departments/{department_id}", response_model=ApiResponse)
async def update_department(
    department_id: str,
    department: DepartmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = require_permission("department:update"),
):
    dept = await org_service.update_department(
        db, department_id, {k: v for k, v in department.model_dump().items() if v is not None}
    )
    if not dept:
        raise HTTPException(status_code=404, detail="部门不存在")
    return ApiResponse.ok({"id": dept.id})


@router.delete("/departments/{department_id}", response_model=ApiResponse)
async def delete_department(
    department_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = require_permission("department:delete"),
):
    ok, msg = await org_service.delete_department(db, department_id)
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return ApiResponse.ok({"message": msg})


@router.get("/departments/{department_id}/users", response_model=ApiResponse)
async def get_department_users(
    department_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not await org_service.can_view_department(db, current_user, department_id):
        raise HTTPException(status_code=403, detail="无权限访问该部门")

    users = await org_service.get_department_users(db, department_id)
    return ApiResponse.ok(
        [{"id": u.id, "username": u.username, "full_name": u.full_name, "email": u.email} for u in users]
    )


@router.get("/users/{user_id}/departments", response_model=ApiResponse)
async def get_user_departments(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if str(current_user.id) != user_id:
        if not has_permission(current_user, "user:read"):
            raise HTTPException(status_code=403, detail="无权限查看他人部门信息")

    orgs = await org_service.get_user_departments(db, user_id)
    return ApiResponse.ok([UserOrganizationResponse.model_validate(o) for o in orgs])


@router.put("/users/{user_id}/departments", response_model=ApiResponse)
async def assign_user_departments(
    user_id: str,
    assignments: list[UserDepartmentAssign],
    db: AsyncSession = Depends(get_db),
    current_user: User = require_permission("user:assign"),
):
    orgs = await org_service.assign_user_departments(db, user_id, [a.model_dump() for a in assignments])
    return ApiResponse.ok([UserOrganizationResponse.model_validate(o) for o in orgs])
