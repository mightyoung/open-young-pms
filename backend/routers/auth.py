"""认证路由."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.services.fastapi_code_generator.auth import (
    verify_password,
    create_access_token,
    hash_password,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import User
from api.services.fastapi_code_generator.schemas import LoginRequest, TokenResponse, UserResponse
from api.response import ApiResponse
from schemas import ErrorCode
from middleware.exception import ApiException

router = APIRouter()


@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.username == data.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.hashed_password):
        raise ApiException(code=ErrorCode.UNAUTHORIZED.code, message="用户名或密码错误")
    if not user.is_active:
        raise ApiException.from_error_code(ErrorCode.FORBIDDEN, message="账户已被禁用")

    token = create_access_token(data={"sub": str(user.id), "username": user.username})
    token_resp = TokenResponse(
        access_token=token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )
    return ApiResponse.ok(token_resp)


@router.post("/register", response_model=ApiResponse)
async def register(
    username: str,
    email: str,
    password: str,
    full_name: str,
    db: AsyncSession = Depends(get_db),
):
    hashed = hash_password(password)
    user = User(username=username, email=email, hashed_password=hashed, full_name=full_name)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return ApiResponse.ok({"user_id": str(user.id)}, message="注册成功")
