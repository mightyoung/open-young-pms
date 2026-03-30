# PMS 项目管理信息系统

> 基于 PRD v1.2 + 权限体系 的完整项目管理平台

---

## 🚀 快速启动

### 方式一：Docker Compose（一键启动）

```bash
# 克隆项目后直接运行
cd pms-template
docker-compose up -d

# 访问服务
# 前端: http://localhost
# 后端API: http://localhost:8000
# API文档: http://localhost:8000/docs
```

### 方式二：本地开发

```bash
# 1. 后端
cd backend
cp .env.example .env  # 编辑填入配置
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 2. 前端
cd frontend
npm install
npm run dev

# 3. 移动端 (需要 HBuilderX)
# 使用 HBuilderX 打开 mobile 目录
```

---

## 📁 项目结构

```
pms-template/
├── frontend/          # React + Ant Design 前端
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── pages/      # 页面
│   │   ├── contexts/    # 权限Context
│   │   └── utils/      # 工具
│   └── package.json
│
├── backend/           # FastAPI 后端
│   ├── routers/       # API路由
│   ├── services/      # 业务服务
│   ├── models/        # 数据模型
│   ├── schemas/        # Pydantic模型
│   └── main.py
│
├── mobile/           # uni-app 移动端
│   ├── src/
│   │   ├── pages/     # 页面
│   │   ├── components/ # 组件
│   │   ├── api/       # API调用
│   │   └── stores/     # Pinia状态
│   └── package.json
│
├── docker-compose.yml  # Docker编排
├── SPEC.md           # 设计规范
└── TODO.md           # 开发追踪
```

---

## 📊 功能模块

### P0 - 基础模块

| 模块 | 前端 | 后端 |
|------|------|------|
| 用户权限体系 | ✅ | ✅ |
| 随手拍 | ✅ | ✅ |
| API规范 | ✅ | ✅ |
| 文件服务 | ✅ | ✅ |
| Docker环境 | ✅ | ✅ |

### P1 - 核心业务

| 模块 | 前端 | 后端 |
|------|------|------|
| 组织架构 | ⏳ | ✅ |
| 论坛增强 | ⏳ | ✅ |
| 消息通知 | ⏳ | ✅ |
| 报告管理 | ⏳ | ✅ |
| 任务管理 | ⏳ | ✅ |

### P2 - 高级功能

| 模块 | 前端 | 后端 |
|------|------|------|
| 审批流引擎 | ⏳ | ✅ |
| 监测看板 | ⏳ | ✅ |
| AI助手 | ⏳ | ✅ |
| 日志审计 | ⏳ | ✅ |
| 移动端 | ✅ | ⏳ |

---

## 🔐 权限体系

### 角色定义

| 角色 | 代码 | 说明 |
|------|------|------|
| 超级管理员 | super_admin | 系统配置、用户管理 |
| 公司领导 | company_leader | 全局视图、审批 |
| 部门领导 | dept_leader | 部门项目管理 |
| 科室负责人 | section_chief | 问题审批 |
| 项目负责人 | project_manager | 单项目管理 |
| 现场人员 | field_staff | 问题上报、任务执行 |

### 权限矩阵

```
┌────────────────┬──────┬──────────┬──────────┬────────┬──────────┬──────────┐
│ 功能           │ 超管 │ 公司领导 │ 部门领导 │ 科室  │ 项目负责 │ 现场人员 │
├────────────────┼──────┼──────────┼──────────┼────────┼──────────┼──────────┤
│ 系统管理       │  ✅  │    ❌    │    ❌    │   ❌   │    ❌    │    ❌    │
│ 创建项目       │  ✅  │    ✅    │    ✅    │   ❌   │    ❌    │    ❌    │
│ 随手拍上报     │  ✅  │    ✅    │    ✅    │   ✅   │    ✅    │    ✅    │
│ 问题指派       │  ✅  │    ❌    │    ❌    │   ✅   │    ✅    │    ❌    │
│ AI对话         │  ✅  │    ✅    │    ✅    │   ✅   │  负责项目 │    ✅    │
└────────────────┴──────┴──────────┴──────────┴────────┴──────────┴──────────┘
```

---

## 🎨 设计规范

遵循 **Impeccable Design** 原则：

- **Typography**: Plus Jakarta Sans + Outfit
- **Color**: oklch 现代色彩系统
- **Layout**: 状态优先、效率至上
- **Motion**: ease-out-quart 缓动

详见 [SPEC.md](./SPEC.md)

---

## 🔧 配置

### 环境变量

**后端** (`backend/.env`):
```bash
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/pms_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key
DASHSCOPE_API_KEY=your_api_key  # 通义千问
```

**前端** (`frontend/.env`):
```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 必需服务

- **PostgreSQL 16+** (或使用 Docker)
- **Redis 7+** (或使用 Docker)
- **Python 3.13+**
- **Node.js 20+**

---

## 📝 开发指南

### 添加新模型

1. 创建 `models/xxx.py`
2. 创建 `schemas/xxx.py`
3. 创建 `services/xxx_service.py`
4. 创建 `routers/xxx.py`
5. 在 `main.py` 注册路由

### 添加新页面

1. 在 `src/pages/` 创建 `.jsx` 文件
2. 在路由配置中添加路由
3. 在侧边栏添加菜单项（如需要权限，使用 `PermissionGate`）

---

## 🧪 测试

```bash
# 后端测试
cd backend
pytest tests/ -v

# 前端构建
cd frontend
npm run build
```

---

## 📄 许可证

MIT License

---

*最后更新: 2026-03-30*
