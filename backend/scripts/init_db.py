import asyncio
import uuid
from datetime import datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from api.services.fastapi_code_generator.database import init_db, _get_async_session_factory
from api.services.fastapi_code_generator.models import (
    Company, Department, Role, User, Project, Phase, Task
)
from api.services.fastapi_code_generator.auth import hash_password

async def seed_data():
    """初始化基础演示数据"""
    async_session = _get_async_session_factory()
    
    async with async_session() as session:
        # 1. 创建公司
        company = Company(
            id=str(uuid.uuid4()),
            name="示例工程集团",
            code="CORP001"
        )
        session.add(company)
        
        # 2. 创建部门
        dept = Department(
            id=str(uuid.uuid4()),
            company_id=company.id,
            name="工程技术部",
            code="ENG_DEPT"
        )
        session.add(dept)
        
        # 3. 创建角色
        roles = [
            Role(id=str(uuid.uuid4()), name="super_admin", label="超级管理员", is_system=True),
            Role(id=str(uuid.uuid4()), name="project_manager", label="项目负责人", is_system=True),
            Role(id=str(uuid.uuid4()), name="site_staff", label="现场人员", is_system=True),
        ]
        session.add_all(roles)
        
        # 4. 创建用户
        admin_user = User(
            id=str(uuid.uuid4()),
            company_id=company.id,
            department_id=dept.id,
            role_id=roles[0].id,
            username="admin",
            email="admin@example.com",
            hashed_password=hash_password("admin123"),
            full_name="系统管理员"
        )
        pm_user = User(
            id=str(uuid.uuid4()),
            company_id=company.id,
            department_id=dept.id,
            role_id=roles[1].id,
            username="pm_user",
            email="pm@example.com",
            hashed_password=hash_password("pm123"),
            full_name="张经理"
        )
        session.add_all([admin_user, pm_user])
        
        # 5. 创建项目
        project = Project(
            id=str(uuid.uuid4()),
            company_id=company.id,
            department_id=dept.id,
            name="J-2X高精线联调项目",
            code="PJ2026001",
            status="active",
            manager_id=pm_user.id,
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=90)
        )
        session.add(project)
        
        # 6. 创建阶段与任务
        phase = Phase(
            id=str(uuid.uuid4()),
            project_id=project.id,
            name="安装调试阶段",
            status="in_progress"
        )
        session.add(phase)
        
        task = Task(
            id=str(uuid.uuid4()),
            phase_id=phase.id,
            title="控制系统接线",
            priority="high",
            status="in_progress",
            assignee_id=pm_user.id,
            start_date=datetime.utcnow(),
            due_date=datetime.utcnow() + timedelta(days=7)
        )
        session.add(task)
        
        await session.commit()
        print("✅ 演示数据初始化成功！")

async def main():
    print("🚀 正在初始化数据库表结构...")
    await init_db()
    print("🚀 正在注入演示数据...")
    await seed_data()
    print("✨ 全部完成！")

if __name__ == "__main__":
    asyncio.run(main())
