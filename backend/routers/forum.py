"""论坛路由."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import User
from services.forum_service import forum_service
from schemas.forum import PostCreate, ReplyCreate, PostResponse, ReplyResponse, UserBrief
from schemas.response import ApiResponse
from middleware.exception import ApiException

router = APIRouter()


async def _get_user_brief(db: AsyncSession, user_id: str) -> UserBrief:
    from sqlalchemy import select
    from api.services.fastapi_code_generator.models import User
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user:
        return UserBrief(id=str(user.id), username=user.username, full_name=user.full_name)
    return UserBrief(id=user_id, username="", full_name="")


async def _build_post_response(db: AsyncSession, post, current_user_id: str = None) -> PostResponse:
    is_liked = await forum_service._is_liked(db, current_user_id, post.id) if current_user_id else False
    is_favorited = await forum_service._is_favorited(db, current_user_id, post.id) if current_user_id else False
    author = await _get_user_brief(db, post.author_id)
    return PostResponse(
        id=post.id,
        title=post.title,
        content=post.content,
        author=author,
        project_id=post.project_id,
        is_pinned=post.is_pinned,
        is_essence=post.is_essence,
        view_count=post.view_count,
        like_count=post.like_count,
        reply_count=post.reply_count,
        is_liked=is_liked,
        is_favorited=is_favorited,
        created_at=post.created_at,
    )


async def _build_reply_response(db: AsyncSession, reply) -> ReplyResponse:
    author = await _get_user_brief(db, reply.author_id)
    mentioned = []
    for uid in (reply.mentioned_users or []):
        mentioned.append(await _get_user_brief(db, uid))
    return ReplyResponse(
        id=reply.id,
        content=reply.content,
        author=author,
        reply_to_id=reply.reply_to_id,
        mentioned_users=mentioned,
        created_at=reply.created_at,
    )


@router.post("/posts", status_code=status.HTTP_201_CREATED, response_model=ApiResponse[PostResponse])
async def create_post(
    post_data: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = await forum_service.create_post(
        db=db,
        author_id=str(current_user.id),
        title=post_data.title,
        content=post_data.content,
        project_id=post_data.project_id,
    )
    response = await _build_post_response(db, post, str(current_user.id))
    return ApiResponse.ok(response, message="发帖成功")


@router.get("/posts", response_model=ApiResponse)
async def list_posts(
    page: int = 1,
    page_size: int = 20,
    project_id: str = None,
    filter_essence: bool = False,
    db: AsyncSession = Depends(get_db),
):
    result = await forum_service.list_posts(
        db=db, page=page, page_size=page_size,
        project_id=project_id, filter_essence=filter_essence,
    )
    return ApiResponse.ok(result)


@router.get("/posts/{post_id}", response_model=ApiResponse[PostResponse])
async def get_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = await forum_service.get_post_detail(db, post_id, str(current_user.id))
    if not post:
        raise ApiException(code="B0001", message="帖子不存在")
    response = await _build_post_response(db, post, str(current_user.id))
    return ApiResponse.ok(response)


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = await forum_service.delete_post(db, post_id)
    if not post:
        raise ApiException(code="B0001", message="帖子不存在")


@router.post("/posts/{post_id}/replies", status_code=status.HTTP_201_CREATED, response_model=ApiResponse[ReplyResponse])
async def create_reply(
    post_id: str,
    reply_data: ReplyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = await forum_service.get_post_detail(db, post_id)
    if not post:
        raise ApiException(code="B0001", message="帖子不存在")
    _mentioned = reply_data.reply_to_id  # will be set by extract_mentions
    reply = await forum_service.create_reply(
        db=db,
        post_id=post_id,
        author_id=str(current_user.id),
        content=reply_data.content,
        reply_to_id=reply_data.reply_to_id,
        mentioned_users=None,
    )
    response = await _build_reply_response(db, reply)
    return ApiResponse.ok(response, message="回帖成功")


@router.get("/posts/{post_id}/replies", response_model=ApiResponse)
async def get_replies(
    post_id: str,
    db: AsyncSession = Depends(get_db),
):
    replies = await forum_service.get_post_replies(db, post_id)
    items = [await _build_reply_response(db, r) for r in replies]
    return ApiResponse.ok({"items": items, "total": len(items)})


@router.post("/posts/{post_id}/like", response_model=ApiResponse)
async def like_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    liked = await forum_service.like_post(db, str(current_user.id), post_id)
    return ApiResponse.ok({"liked": liked})


@router.delete("/posts/{post_id}/like", response_model=ApiResponse)
async def unlike_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    unliked = await forum_service.unlike_post(db, str(current_user.id), post_id)
    return ApiResponse.ok({"unliked": unliked})


@router.post("/posts/{post_id}/favorite", response_model=ApiResponse)
async def favorite_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorited = await forum_service.favorite_post(db, str(current_user.id), post_id)
    return ApiResponse.ok({"favorited": favorited})


@router.delete("/posts/{post_id}/favorite", response_model=ApiResponse)
async def unfavorite_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    unfavorited = await forum_service.unfavorite_post(db, str(current_user.id), post_id)
    return ApiResponse.ok({"unfavorited": unfavorited})


@router.put("/posts/{post_id}/pin", response_model=ApiResponse)
async def pin_post(
    post_id: str,
    is_pinned: bool,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ok = await forum_service.pin_post(db, post_id, is_pinned)
    if not ok:
        raise ApiException(code="B0001", message="帖子不存在")
    return ApiResponse.ok({"is_pinned": is_pinned})


@router.put("/posts/{post_id}/essence", response_model=ApiResponse)
async def mark_essence(
    post_id: str,
    is_essence: bool,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ok = await forum_service.mark_essence(db, post_id, is_essence)
    if not ok:
        raise ApiException(code="B0001", message="帖子不存在")
    return ApiResponse.ok({"is_essence": is_essence})


@router.get("/users/{user_id}/favorites", response_model=ApiResponse)
async def get_user_favorites(
    user_id: str,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
):
    result = await forum_service.get_user_favorites(db, user_id, page, page_size)
    return ApiResponse.ok(result)
