# PMS 项目管理信息系统

> 基于 PRD v1.2 + 权限体系 的完整项目管理平台

---

## 🚀 快速启动

### 前置要求

- **Node.js 20+**
- **Python 3.13+**
- **PostgreSQL 16+** (或通过 docker-compose 启动)
- **Redis 7+** (或通过 docker-compose 启动)

### 方式一：Docker Compose（一键启动）

```bash
# 启动数据库和 Redis
docker-compose up -d postgres redis

# 启动后端
cd backend
cp .env.example .env   # 编辑填入 JWT_SECRET 等配置（已有模板）
uvicorn main:app --reload --host 0.0.0.0 --port 8001

# 启动前端（另一个终端）
npm run dev            # Vite dev server → http://localhost:5173
```

**注意**：当前 docker-compose 只启动数据库和 Redis，不包含前端构建（前端通过 `npm run dev` 本地开发）。

### 方式二：本地开发

```bash
# 1. 后端
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # 必须设置 JWT_SECRET
uvicorn main:app --reload --port 8001

# 2. 前端（根目录）
npm install
npm run dev            # http://localhost:5173，API 代理到 localhost:8001
```

---

## 📁 项目结构

```
pms-template/
├── src/                    # React 前端源码（Vite + Ant Design + Tailwind）
│   ├── api/                # HTTP 客户端、错误类、Domain API
│   ├── app/                # AppRoot、路由配置、菜单、AuthSession
│   ├── components/         # 共享组件
│   ├── contexts/           # React Context（AuthContext）
│   ├── features/           # 按领域组织的功能模块（dashboard, users, projects, tasks, notifications, reports, forum, hazards, risks, quality, organization）
│   ├── hooks/              # 自定义 Hooks
│   ├── pages/              # 页面组件（legacy，仍在使用）
│   ├── styles/             # 主题和全局样式
│   └── utils/              # 工具函数
│
├── backend/                # FastAPI 后端
│   ├── api/
│   │   ├── routers/        # Layer 3 — canonical for all new development（CI 强制冻结 Layer 2）
│   │   └── services/
│   │       └── fastapi_code_generator/  # Layer 1 — auto-generated（不要直接编辑）
│   ├── routers/           # Layer 2 — legacy（冻结：禁止新增文件，CI 架构门禁）
│   ├── middleware/         # 中间件（PermissionMiddleware, AuditMiddleware）
│   ├── models/             # SQLAlchemy 模型
│   ├── schemas/            # Pydantic schemas
│   └── main.py             # FastAPI 应用入口，路由分三层注册
│
├── mobile/                 # uni-app 移动端源码
├── pms-uniapp/            # uni-app 项目副本
├── dist/                   # Vite 生产构建输出（.gitignore）
├── docker-compose.yml      # 仅包含 PostgreSQL + Redis
├── vite.config.js          # Vite 配置，API 代理到 :8001
└── package.json            # 前端依赖（根目录）
```

---

## 🔐 环境变量

### 后端（`backend/.env`）

```bash
# 数据库（必需）
DATABASE_URL=postgresql+asyncpg://postgres:postgres123@localhost:5432/pms_db

# JWT（生产必须设置强密钥）
JWT_SECRET=your-strong-secret-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS（逗号分隔）
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 前端（`.env` 或 vite.config.js）

```bash
# API 代理目标（已在 vite.config.js 中配置，无需单独设置）
# VITE_API_BASE_URL=/api/v1   (通过 Vite proxy 转发)
```

---

## 🔧 端口规范

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 Vite Dev | 5173 | `npm run dev` |
| 后端 API | 8001 | `uvicorn main:app --port 8001` |
| PostgreSQL | 5432 | docker-compose |
| Redis | 6379 | docker-compose |

> **注意**：之前存在 8000/8001 混用，现已统一为 **8001**。

---

## 📊 功能模块

| 模块 | 前端 | 后端 | 状态 |
|------|------|------|------|
| 用户权限体系 | ✅ | ✅ | P0 |
| 随手拍·隐患管理 | ✅ | ✅ | P0 |
| API 规范 | ✅ | ✅ | P0 |
| 文件服务 | ✅ | ✅ | P0 |
| Docker 环境 | ✅ | ✅ | P0 |
| 项目管理 | ✅ | ✅ | P1 |
| 任务管理 | ✅ | ✅ | P1 |
| 论坛 | ✅ | ✅ | P1 |
| 消息通知 | ✅ | ✅ | P1 |
| 报告中心 | ✅ | ✅ | P1 |
| 风险管理 | ✅ | ✅ | P1 |
| 质量管理 | ✅ | ✅ | P1 |
| 组织架构 | ✅ | ✅ | P1 |
| 审批流引擎 | ⏳ | ✅ | P1 |
| 监测看板 | ⏳ | ⏳ | P2 |
| AI 助手 | ⏳ | ⏳ | P2 |
| 移动端 | ✅ | ⏳ | P2 |

---

## 🎨 技术栈

- **前端**：React 18 + Vite + Ant Design 5 + Tailwind CSS 3 + Framer Motion + Recharts
- **后端**：FastAPI + SQLAlchemy 2.0 (async) + PostgreSQL + Redis + Pydantic v2
- **移动端**：uni-app (Vue3)
- **认证**：JWT (HS256)，密钥从环境变量读取

---

## 🧪 测试

```bash
# 前端测试、格式检查、构建
npm run lint      # ESLint (0 errors required)
npx vitest run    # Vitest smoke tests
npm run build     # 生产构建

# 后端测试
cd backend
pytest tests/ -v              # 所有测试 (auth + health + schemas + permissions)
pytest tests/ -v -k health    # 仅健康检查测试
```

> **CI 质量门禁**：所有检查均强制执行，无 `continue-on-error` 绕过。

---

## 📝 开发指南

### 添加新 API 端点

新 API 端点应添加到 `backend/api/routers/`（Layer 3）。
`backend/routers/`（Layer 2）是冻结目录，**禁止新增文件**（CI 架构门禁强制执行）。

1. 在 `backend/api/routers/` 创建路由文件
2. 使用 `from api.services.fastapi_code_generator.auth import get_current_user, require_role` 做认证
3. 使用 `from api.services.fastapi_code_generator.database import get_db` 获取数据库 session
4. 在 `backend/main.py` 的 Layer 3 区块注册路由

### 添加新页面

新页面应添加到 `src/features/<feature>/pages/`（参考 `src/features/dashboard/`）。
`src/pages/` 是冻结目录，**禁止新增 `.jsx` 文件**（CI 架构门禁强制执行）。

1. 在 `src/features/<feature>/pages/` 创建 `.jsx` 页面文件
2. 在 `src/features/<feature>/api.js` 添加领域 API 方法（如需要）
3. 在 `src/app/route-map.js` 添加路由元信息
4. 在 `src/app/menu.config.js` 添加菜单项
5. 在 `src/app/routes.jsx` 添加路由路径（使用 `React.lazy` + `Suspense`）

---

## 📄 许可证

MIT License
