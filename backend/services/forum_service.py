import re
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.forum import ForumPost, ForumReply, ForumLike, ForumFavorite
from api.services.fastapi_code_generator.models import User
from schemas.forum import PostCreate, ReplyCreate
from schemas.response import PageResult


class ForumService:

    async def create_post(
        self, db: AsyncSession, author_id: str, title: str, content: str, project_id: str = None
    ) -> ForumPost:
        post = ForumPost(
            id=str(uuid.uuid4()),
            title=title,
            content=content,
            author_id=author_id,
            project_id=project_id,
        )
        db.add(post)
        await db.commit()
        await db.refresh(post)
        return post

    async def get_post_detail(
        self, db: AsyncSession, post_id: str, current_user_id: str = None
    ) -> Optional[ForumPost]:
        result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
        post = result.scalar_one_or_none()
        if post:
            post.view_count += 1
            await db.commit()
        return post

    async def _is_liked(self, db: AsyncSession, user_id: str, post_id: str) -> bool:
        r = await db.execute(
            select(ForumLike).where(ForumLike.user_id == user_id, ForumLike.post_id == post_id)
        )
        return r.scalar_one_or_none() is not None

    async def _is_favorited(self, db: AsyncSession, user_id: str, post_id: str) -> bool:
        r = await db.execute(
            select(ForumFavorite).where(ForumFavorite.user_id == user_id, ForumFavorite.post_id == post_id)
        )
        return r.scalar_one_or_none() is not None

    async def list_posts(
        self, db: AsyncSession, page: int = 1, page_size: int = 20,
        project_id: str = None, filter_essence: bool = False,
        current_user_id: str = None,
    ) -> PageResult:
        query = select(ForumPost)
        if project_id:
            query = query.where(ForumPost.project_id == project_id)
        if filter_essence:
            query = query.where(ForumPost.is_essence == True)

        total_q = select(func.count()).select_from(ForumPost)
        if project_id:
            total_q = total_q.where(ForumPost.project_id == project_id)
        if filter_essence:
            total_q = total_q.where(ForumPost.is_essence == True)
        total = (await db.execute(total_q)).scalar() or 0

        query = query.order_by(desc(ForumPost.is_pinned), desc(ForumPost.created_at))
        query = query.offset((page - 1) * page_size).limit(page_size)
        items = (await db.execute(query)).scalars().all()

        post_responses = []
        for p in items:
            is_liked = await self._is_liked(db, current_user_id, p.id) if current_user_id else False
            is_fav = await self._is_favorited(db, current_user_id, p.id) if current_user_id else False
            post_responses.append({
                "id": p.id,
                "title": p.title,
                "content": p.content,
                "author_id": p.author_id,
                "project_id": p.project_id,
                "is_pinned": p.is_pinned,
                "is_essence": p.is_essence,
                "view_count": p.view_count,
                "like_count": p.like_count,
                "reply_count": p.reply_count,
                "is_liked": is_liked,
                "is_favorited": is_fav,
                "created_at": p.created_at,
            })

        return PageResult(
            items=post_responses,
            total=total,
            page=page,
            page_size=page_size,
            has_more=(page * page_size) < total,
        )

    async def create_reply(
        self, db: AsyncSession, post_id: str, author_id: str, content: str,
        reply_to_id: str = None, mentioned_users: list = None,
    ) -> ForumReply:
        reply = ForumReply(
            id=str(uuid.uuid4()),
            post_id=post_id,
            author_id=author_id,
            content=content,
            reply_to_id=reply_to_id,
            mentioned_users=mentioned_users or [],
        )
        db.add(reply)

        post_result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
        post = post_result.scalar_one_or_none()
        if post:
            post.reply_count += 1

        await db.commit()
        await db.refresh(reply)
        return reply

    async def get_post_replies(self, db: AsyncSession, post_id: str) -> list[ForumReply]:
        result = await db.execute(
            select(ForumReply).where(ForumReply.post_id == post_id).order_by(ForumReply.created_at)
        )
        return list(result.scalars().all())

    async def like_post(self, db: AsyncSession, user_id: str, post_id: str) -> bool:
        existing = await db.execute(
            select(ForumLike).where(ForumLike.user_id == user_id, ForumLike.post_id == post_id)
        )
        if existing.scalar_one_or_none():
            return False

        like = ForumLike(id=str(uuid.uuid4()), user_id=user_id, post_id=post_id)
        db.add(like)

        post_result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
        post = post_result.scalar_one_or_none()
        if post:
            post.like_count += 1

        await db.commit()
        return True

    async def unlike_post(self, db: AsyncSession, user_id: str, post_id: str) -> bool:
        result = await db.execute(
            select(ForumLike).where(ForumLike.user_id == user_id, ForumLike.post_id == post_id)
        )
        like = result.scalar_one_or_none()
        if not like:
            return False

        await db.delete(like)

        post_result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
        post = post_result.scalar_one_or_none()
        if post and post.like_count > 0:
            post.like_count -= 1

        await db.commit()
        return True

    async def favorite_post(self, db: AsyncSession, user_id: str, post_id: str) -> bool:
        existing = await db.execute(
            select(ForumFavorite).where(ForumFavorite.user_id == user_id, ForumFavorite.post_id == post_id)
        )
        if existing.scalar_one_or_none():
            return False

        fav = ForumFavorite(id=str(uuid.uuid4()), user_id=user_id, post_id=post_id)
        db.add(fav)
        await db.commit()
        return True

    async def unfavorite_post(self, db: AsyncSession, user_id: str, post_id: str) -> bool:
        result = await db.execute(
            select(ForumFavorite).where(ForumFavorite.user_id == user_id, ForumFavorite.post_id == post_id)
        )
        fav = result.scalar_one_or_none()
        if not fav:
            return False
        await db.delete(fav)
        await db.commit()
        return True

    async def pin_post(self, db: AsyncSession, post_id: str, is_pinned: bool) -> bool:
        result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
        post = result.scalar_one_or_none()
        if not post:
            return False
        post.is_pinned = is_pinned
        await db.commit()
        return True

    async def mark_essence(self, db: AsyncSession, post_id: str, is_essence: bool) -> bool:
        result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
        post = result.scalar_one_or_none()
        if not post:
            return False
        post.is_essence = is_essence
        await db.commit()
        return True

    async def delete_post(self, db: AsyncSession, post_id: str) -> bool:
        result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
        post = result.scalar_one_or_none()
        if not post:
            return False
        await db.delete(post)
        await db.commit()
        return True

    def extract_mentions(self, content: str) -> list[str]:
        return re.findall(r"@(\w+)", content)

    async def get_user_favorites(
        self, db: AsyncSession, user_id: str, page: int = 1, page_size: int = 20,
    ) -> PageResult:
        total_q = select(func.count()).select_from(ForumFavorite).where(ForumFavorite.user_id == user_id)
        total = (await db.execute(total_q)).scalar() or 0

        result = await db.execute(
            select(ForumFavorite)
            .where(ForumFavorite.user_id == user_id)
            .order_by(desc(ForumFavorite.created_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        favorites = result.scalars().all()

        post_ids = [f.post_id for f in favorites]
        if post_ids:
            posts_result = await db.execute(select(ForumPost).where(ForumPost.id.in_(post_ids)))
            posts_map = {p.id: p for p in posts_result.scalars().all()}
        else:
            posts_map = {}

        items = []
        for f in favorites:
            post = posts_map.get(f.post_id)
            if post:
                items.append({
                    "id": post.id,
                    "title": post.title,
                    "content": post.content,
                    "author_id": post.author_id,
                    "project_id": post.project_id,
                    "is_pinned": post.is_pinned,
                    "is_essence": post.is_essence,
                    "view_count": post.view_count,
                    "like_count": post.like_count,
                    "reply_count": post.reply_count,
                    "is_liked": await self._is_liked(db, user_id, post.id),
                    "is_favorited": True,
                    "created_at": post.created_at,
                })

        return PageResult(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            has_more=(page * page_size) < total,
        )


forum_service = ForumService()
