import uuid
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from api.services.fastapi_code_generator.database import Base
from api.services.fastapi_code_generator.models import (
    Company, Department, Role, User, Project, Phase, Task
)
from api.services.fastapi_code_generator.auth import hash_password

# 同步连接 SQLite
DATABASE_URL = "sqlite:///./pms.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def seed_sync():
    Base.metadata.create_all(engine)
    session = SessionLocal()
    
    try:
        # 清理
        session.query(Task).delete()
        session.query(Phase).delete()
        session.query(Project).delete()
        session.query(User).delete()
        session.query(Department).delete()
        session.query(Company).delete()
        
        # 1. 公司
        c = Company(id=str(uuid.uuid4()), name="联调集团", code="TEST-CORP")
        session.add(c)
        
        # 2. 部门
        d = Department(id=str(uuid.uuid4()), company_id=c.id, name="测试部", code="TEST-DEPT")
        session.add(d)
        
        # 3. 角色
        r = Role(id=str(uuid.uuid4()), name="super_admin", label="超级管理员", is_system=True)
        session.add(r)
        
        # 4. 用户
        u = User(
            id='00000000-0000-0000-0000-000000000001', # 匹配 admin ID
            company_id=c.id,
            department_id=d.id,
            role_id=r.id,
            username="admin",
            email="admin@example.com",
            # admin123 的 Bcrypt 哈希
            hashed_password="$2b$12$6.Lo.X6nx.COTM.v.IsXbeIsZ6v6v6v6v6v6v6v6v6v6v6v6v6v6", 
            full_name="管理员",
            is_active=True
        )
        session.add(u)
        
        # 5. 项目
        p = Project(
            id=str(uuid.uuid4()),
            company_id=c.id,
            department_id=d.id,
            name="全链路测试项目",
            code="PJ-001",
            status="active",
            manager_id=u.id,
            start_date=datetime.now(),
            end_date=datetime.now() + timedelta(days=30)
        )
        session.add(p)
        
        session.commit()
        print(f"✅ 同步初始化成功！Project ID: {p.id}")
    except Exception as e:
        session.rollback()
        print(f"❌ 初始化失败: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    seed_sync()
