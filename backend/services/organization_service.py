"""Organization service — department tree, user org, CRUD operations."""

import uuid
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.organization import Department, UserOrganization
from api.services.fastapi_code_generator.models import User


class OrganizationService:
    async def get_department_tree(self, db: AsyncSession) -> list[dict]:
        result = await db.execute(
            select(Department).where(Department.is_active == True).order_by(Department.sort_order)
        )
        departments = result.scalars().all()

        user_count_q = await db.execute(
            select(UserOrganization.department_id, func.count(UserOrganization.user_id)).group_by(
                UserOrganization.department_id
            )
        )
        user_counts = dict(user_count_q.all())

        root_depts = [d for d in departments if d.parent_id is None]

        def build_node(dept: Department) -> dict:
            children = [d for d in departments if d.parent_id == dept.id]
            return {
                "id": dept.id,
                "name": dept.name,
                "code": dept.code,
                "level": dept.level,
                "children": [build_node(c) for c in children],
                "user_count": user_counts.get(dept.id, 0),
            }

        return [build_node(d) for d in root_depts]

    async def get_user_departments(self, db: AsyncSession, user_id: str) -> list[UserOrganization]:
        result = await db.execute(
            select(UserOrganization)
            .where(UserOrganization.user_id == user_id)
            .options(selectinload(UserOrganization.department))
        )
        return list(result.scalars().all())

    async def get_department_users(
        self, db: AsyncSession, department_id: str, include_children: bool = True
    ) -> list[User]:
        if include_children:
            descendant_ids = await self._get_descendant_ids(db, department_id)
            dept_filter = UserOrganization.department_id.in_(descendant_ids)
        else:
            dept_filter = UserOrganization.department_id == department_id

        result = await db.execute(
            select(User).join(UserOrganization, User.id == UserOrganization.user_id).where(dept_filter)
        )
        return list(result.scalars().all())

    async def _get_descendant_ids(self, db: AsyncSession, department_id: str) -> list[str]:
        result = await db.execute(select(Department).where(Department.is_active == True))
        all_depts = {d.id: d for d in result.scalars().all()}

        descendants = []
        queue = [department_id]
        while queue:
            current = queue.pop(0)
            for dept in all_depts.values():
                if dept.parent_id == current:
                    descendants.append(dept.id)
                    queue.append(dept.id)
        return descendants + [department_id]

    async def can_view_department(self, db: AsyncSession, user: User, department_id: str) -> bool:
        role_code = getattr(getattr(user, "role", None), "name", None) or getattr(user, "role_name", None)
        if role_code == "super_admin":
            return True

        if role_code == "company_leader":
            return True

        if role_code in ("dept_leader", "section_chief"):
            if str(user.department_id) == department_id:
                return True
            descendants = await self._get_descendant_ids(db, department_id)
            return str(user.department_id) in descendants

        user_orgs = await self.get_user_departments(db, str(user.id))
        return any(str(org.department_id) == department_id and org.is_default for org in user_orgs)

    async def create_department(self, db: AsyncSession, data: dict) -> Department:
        dept = Department(
            id=str(uuid.uuid4()),
            name=data["name"],
            code=data["code"],
            parent_id=data.get("parent_id"),
            level=data.get("level", 1),
            sort_order=data.get("sort_order", 0),
            manager_id=data.get("manager_id"),
        )
        db.add(dept)
        await db.commit()
        await db.refresh(dept)
        return dept

    async def update_department(self, db: AsyncSession, department_id: str, data: dict) -> Optional[Department]:
        result = await db.execute(select(Department).where(Department.id == department_id))
        dept = result.scalar_one_or_none()
        if not dept:
            return None
        for key in ("name", "parent_id", "sort_order", "manager_id"):
            if key in data and data[key] is not None:
                setattr(dept, key, data[key])
        await db.commit()
        await db.refresh(dept)
        return dept

    async def delete_department(self, db: AsyncSession, department_id: str) -> tuple[bool, str]:
        result = await db.execute(select(Department).where(Department.id == department_id))
        dept = result.scalar_one_or_none()
        if not dept:
            return False, "部门不存在"

        child_result = await db.execute(
            select(Department).where(
                Department.parent_id == department_id,
                Department.is_active == True,
            )
        )
        if child_result.scalars().first():
            return False, "该部门存在子部门，无法删除"

        user_result = await db.execute(select(UserOrganization).where(UserOrganization.department_id == department_id))
        if user_result.scalars().first():
            return False, "该部门下有用户，无法删除"

        dept.is_active = False
        await db.commit()
        return True, "删除成功"

    async def assign_user_departments(
        self, db: AsyncSession, user_id: str, assignments: list[dict]
    ) -> list[UserOrganization]:
        await db.execute(select(UserOrganization).where(UserOrganization.user_id == user_id))

        existing_result = await db.execute(select(UserOrganization).where(UserOrganization.user_id == user_id))
        existing = {org.department_id: org for org in existing_result.scalars().all()}

        for a in assignments:
            dept_id = a["department_id"]
            if dept_id in existing:
                org = existing[dept_id]
                if "position" in a:
                    org.position = a["position"]
                org.is_default = a.get("is_default", False)
            else:
                org = UserOrganization(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    department_id=dept_id,
                    position=a.get("position"),
                    is_default=a.get("is_default", False),
                )
                db.add(org)

        await db.commit()
        return await self.get_user_departments(db, user_id)


org_service = OrganizationService()
