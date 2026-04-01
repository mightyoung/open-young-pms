"""初始化数据库 — 生成随手拍安全员和组织架构数据."""

import asyncio

from sqlalchemy import select
from api.services.fastapi_code_generator.database import AsyncSessionLocal
from api.services.fastapi_code_generator.models import (
    Company,
    Department,
    Role,
    User,
    # 随手拍专职安全员
)
from api.services.fastapi_code_generator.auth import hash_password


FULL_TIME_SAFETY_STAFF = [
    # (姓名, 岗位, 职责类型)
    ("迟诚", "安全环保室主任", "综合协调,重大隐患"),
    ("刘灵滢", "安全环保岗", "职业卫生"),
    ("杨东", "电气工程岗", "电气安全"),
    ("黄虎", "现场安全岗", "安全生产"),
    ("任仲恒", "消防管理岗", "消防安全"),
    ("崔同响", "保卫室室主任", "保卫安全"),
    ("钟先成", "保卫管理岗", "保卫安全"),
    ("高明", "保卫管理岗", "保卫安全"),
]

DEPARTMENTS = [
    ("综合办公室", "何秀贞"),
    ("保密办公室", "李刚"),
    ("战略发展部", "陈鹏"),
    ("科技与项目管理部", "汤博帆"),
    ("市场经营部", "蒲韬"),
    ("生产运营部", "陈垠竹"),
    ("体系与信息化部", "何媛"),
    ("人力资源部", "徐欢"),
    ("党群工作部", "许俐"),
    ("财务管理部", "戚宁"),
    ("品质管控部", "赵宇红"),
    ("纪检部", "万佳丽"),
    ("审计与风险法律部", "林垠希"),
    ("系统总体部", "范文丽"),
    ("特种计算机事业部", "杨宏刚"),
    ("无人机事业部", "黄虹淞"),
    ("机器人创新中心", "张静逸"),
    ("智能制造事业部", "邹欣凌"),
    ("智能测控事业部", "康钦梅"),
    ("产品制造部", "权文博"),
    ("测评中心", "苏豪磊"),
    ("维博公司", "苏少芳"),
    ("杭州公司", "章宇"),
]

ROLE_PERMISSIONS = {
    "super_admin": {{"all": True}},
    "company_admin": {
        {"projects": ["create", "read", "update", "delete"], "hazards": ["assign", "confirm", "push", "accept"]}
    },
    "dept_leader": {{"projects": ["read", "update"], "reports": ["approve"]}},
    "safety_staff": {{"hazards": ["confirm", "push", "accept", "transfer"], "inspections": ["submit"]}},
    "project_manager": {{"projects": ["create", "read", "update"], "tasks": ["create", "read", "update"]}},
    "site_staff": {{"hazards": ["create"], "inspections": ["submit"], "tasks": ["read"]}},
}


async def seed_data():
    async with AsyncSessionLocal() as db:
        # Check if already seeded
        result = await db.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded, skipping.")
            return

        # Company
        company = Company(name="示例公司", code="AISoft")
        db.add(company)
        await db.flush()

        # Roles
        roles = {{}}
        for name, perms in ROLE_PERMISSIONS.items():
            role = Role(name=name, label=name.replace("_", " ").title(), permissions=perms)
            db.add(role)
            await db.flush()
            roles[name] = role

        # Departments
        dept_objects = {{}}
        for dept_name, admin_name in DEPARTMENTS:
            dept = Department(company_id=company.id, name=dept_name, code=dept_name[:4])
            db.add(dept)
            await db.flush()
            dept_objects[dept_name] = dept

        # Safety department
        safety_dept = Department(company_id=company.id, name="安全保障部", code="SAFE")
        db.add(safety_dept)
        await db.flush()

        # Safety staff users
        safety_role = roles.get("safety_staff")
        for name, position, duty in FULL_TIME_SAFETY_STAFF:
            user = User(
                company_id=company.id,
                department_id=safety_dept.id,
                role_id=safety_role.id if safety_role else None,
                username=name,
                email="{name}@example.com",
                hashed_password=hash_password("password123"),
                full_name=name,
                is_active=True,
            )
            db.add(user)

        # Department admin users
        for dept_name, (admin_name, full_name) in zip(DEPARTMENTS, [(n, n) for n, _ in DEPARTMENTS]):
            dept = dept_objects[dept_name]
            user = User(
                company_id=company.id,
                department_id=dept.id,
                role_id=roles["site_staff"].id,
                username=dept_name[:4] + "_admin",
                email="{dept_name[:4]}_admin@example.com",
                hashed_password=hash_password("password123"),
                full_name=admin_name,
                is_active=True,
            )
            db.add(user)

        await db.commit()
        print("Seed data inserted successfully!")
        print("  - Company: 1")
        print(f"  - Roles: {len(roles)}")
        print(f"  - Departments: {len(DEPARTMENTS) + 1}")
        print(f"  - Safety staff: {len(FULL_TIME_SAFETY_STAFF)}")
        print(f"  - Dept admin users: {len(DEPARTMENTS)}")
        print("  Default password: password123")


if __name__ == "__main__":
    asyncio.run(seed_data())
