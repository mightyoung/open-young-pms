"""用户管理路由."""

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import User
from api.services.fastapi_code_generator.schemas import UserResponse
from schemas import ApiResponse, PageResult

router = APIRouter()


@router.get("/me", response_model=ApiResponse[UserResponse])
async def get_me(current_user: User = Depends(get_current_user)):
    return ApiResponse.ok(UserResponse.model_validate(current_user))


@router.get("", response_model=PageResult[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(User).where(User.is_active == True)
    total_q = select(func.count()).select_from(User).where(User.is_active == True)
    total = (await db.execute(total_q)).scalar() or 0

    items = (await db.execute(query)).scalars().all()

    return PageResult(
        items=[UserResponse.model_validate(u) for u in items], total=total, page=1, page_size=total, has_more=False
    )
