# PMS 阶段一完成报告

> 日期：2026-04-05
> 阶段：Phase 1 - 基础设施与核心功能

---

## 一、概述

### 1.1 阶段目标

建立 PMS 项目管理系统的技术基础设施，实现用户权限体系、随手拍隐患管理模块，并完成 API 规范定义。

### 1.2 完成时间

- 计划：第 1-4 周 (~2026-04-24)
- 当前进度：第 4 周进行中

### 1.3 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React + Vite | React 18 |
| UI 组件库 | Ant Design | 5.x |
| 路由 | React Router | 6.x |
| 状态管理 | Zustand | - |
| 后端框架 | FastAPI | 0.109+ |
| 数据库 | SQLite / PostgreSQL | - |
| ORM | SQLAlchemy | 2.x |
| 认证 | JWT | - |

---

## 二、已完成功能

### 2.1 用户权限体系

| 功能 | 前端 | 后端 | 状态 |
|------|------|------|------|
| 用户认证 (JWT) | ✅ | ✅ | P0 |
| 登录/注册 | ✅ | ✅ | P0 |
| 权限模型 | ✅ | ✅ | P0 |
| 权限中间件 | ✅ | ✅ | P0 |
| 用户管理页面 | ✅ | ✅ | P0 |
| 角色管理页面 | ✅ | ✅ | P0 |
| 个人中心 | ✅ | ✅ | P0 |

### 2.2 随手拍·隐患管理

| 功能 | 前端 | 后端 | 状态 |
|------|------|------|------|
| 隐患列表页 | ✅ | ✅ | P0 |
| 隐患详情页 | ✅ | ✅ | P0 |
| 隐患表单 | ✅ | ✅ | P0 |
| 隐患指派 | ✅ | ✅ | P0 |
| 隐患确认 | ✅ | ✅ | P0 |
| 隐患推送 | ✅ | ✅ | P0 |
| 文件上传 | ✅ | ✅ | P0 |
| 草稿箱 | ✅ | ✅ | P1 |
| 重复检测 (pHash) | ⏳ | ⏳ | P2 |

### 2.3 项目管理

| 功能 | 前端 | 后端 | 状态 |
|------|------|------|------|
| 项目列表 | ✅ | ✅ | P1 |
| 项目详情 | ✅ | ✅ | P1 |
| 项目创建 | ✅ | ✅ | P1 |
| 甘特图 | ✅ | ✅ | P1 |

### 2.4 任务管理

| 功能 | 前端 | 后端 | 状态 |
|------|------|------|------|
| 任务列表 | ✅ | ✅ | P1 |
| 任务详情 | ✅ | ✅ | P1 |
| 任务创建 | ✅ | ✅ | P1 |
| 任务看板 | ✅ | ✅ | P1 |

---

## 三、前端项目结构

```
pms-template/
├── src/
│   ├── api/                    # API 客户端
│   │   ├── index.js           # API 入口
│   │   ├── client.js          # Axios 实例
│   │   └── *.js               # 各模块 API
│   │
│   ├── app/
│   │   ├── routes.jsx        # 路由配置
│   │   ├── route-map.js       # 路由元数据
│   │   ├── menu.config.js     # 菜单配置
│   │   └── MainLayout.jsx     # 主布局
│   │
│   ├── components/             # 公共组件
│   │   ├── PMSComponents.jsx   # PMS 专用组件
│   │   ├── PageHeader.jsx     # 页面标题
│   │   └── *.jsx
│   │
│   ├── features/              # 功能模块
│   │   ├── dashboard/         # 仪表盘
│   │   ├── users/             # 用户管理
│   │   ├── roles/             # 角色管理
│   │   ├── profile/           # 个人中心
│   │   ├── hazards/           # 隐患管理
│   │   ├── projects/         # 项目管理
│   │   ├── tasks/             # 任务管理
│   │   ├── notifications/     # 消息通知
│   │   ├── reports/           # 报告中心
│   │   ├── forum/             # 论坛
│   │   ├── organization/      # 组织架构
│   │   ├── approval-center/   # 审批中心
│   │   └── ...
│   │
│   ├── hooks/                 # 自定义 Hooks
│   ├── styles/                # 样式
│   └── utils/                 # 工具函数
│
├── scripts/
│   └── pms_integration_test.py  # 集成测试脚本
│
└── docs/
    └── PHASE1_SUMMARY.md       # 本文档
```

---

## 四、后端 API 清单

### 4.1 认证 API

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| POST | `/api/v1/auth/login` | 用户登录 | ✅ |
| POST | `/api/v1/auth/register` | 用户注册 | ✅ |

### 4.2 用户管理 API

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/api/v1/users/me` | 获取当前用户 | ✅ |
| GET | `/api/v1/users` | 列出用户 | ✅ |

### 4.3 角色权限 API

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/api/v1/roles` | 列出角色 | ✅ |
| POST | `/api/v1/roles` | 创建角色 | ✅ |
| PATCH | `/api/v1/roles/{id}` | 更新角色 | ✅ |
| DELETE | `/api/v1/roles/{id}` | 删除角色 | ✅ |

### 4.4 组织架构 API

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/api/v1/companies` | 列出公司 | ✅ |
| GET | `/api/v1/departments` | 列出部门 | ✅ |
| GET | `/api/v1/departments/tree` | 部门树 | ✅ |

### 4.5 隐患管理 API

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/api/v1/hazards` | 列出隐患 | ✅ |
| GET | `/api/v1/hazards/{id}` | 隐患详情 | ✅ |
| POST | `/api/v1/hazards` | 创建隐患 | ✅ |
| POST | `/api/v1/hazards/{id}/assign` | 指派隐患 | ✅ |
| POST | `/api/v1/hazards/{id}/confirm` | 确认隐患 | ✅ |
| POST | `/api/v1/hazards/{id}/push` | 推送隐患 | ✅ |
| GET | `/api/v1/hazards/stats/summary` | 隐患统计 | ✅ |
| GET | `/api/v1/hazards/drafts` | 草稿箱 | ⏳ |

### 4.6 通知设置 API

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/api/v1/notification-settings` | 获取通知设置 | ✅ |
| PUT | `/api/v1/notification-settings` | 更新通知设置 | ✅ |

### 4.7 项目管理 API

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/api/v1/projects` | 列出项目 | ✅ |
| GET | `/api/v1/projects/{id}` | 项目详情 | ✅ |

### 4.8 报告中心 API

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/api/v1/reports/summary` | 报告统计 | ✅ |

### 4.9 审批 API

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/api/v1/approval/my-tasks` | 我的审批任务 | ✅ |

### 4.10 仪表盘 API

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/api/v1/dashboard/summary` | 汇总数据 | ✅ |

---

## 五、数据库 Schema

### 5.1 核心表结构

```sql
-- 用户表
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL
);

-- 角色表
CREATE TABLE roles (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    label VARCHAR(100) NOT NULL,
    permissions JSON NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL
);

-- 公司表
CREATE TABLE companies (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- 部门表
CREATE TABLE departments (
    id CHAR(36) PRIMARY KEY,
    company_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    parent_id CHAR(36),
    leader_id CHAR(36),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (parent_id) REFERENCES departments(id)
);

-- 隐患表
CREATE TABLE hazards (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    severity VARCHAR(20),
    status VARCHAR(20),
    reporter_id CHAR(36),
    assignee_id CHAR(36),
    location VARCHAR(200),
    images JSON,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- 通知设置表
CREATE TABLE notification_settings (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) UNIQUE NOT NULL,
    issue_assign BOOLEAN DEFAULT TRUE,
    issue_verify BOOLEAN DEFAULT TRUE,
    reply_like BOOLEAN DEFAULT TRUE,
    mention BOOLEAN DEFAULT TRUE,
    approval BOOLEAN DEFAULT TRUE,
    system BOOLEAN DEFAULT TRUE,
    in_app BOOLEAN DEFAULT TRUE,
    email BOOLEAN DEFAULT FALSE,
    push BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 六、部署说明

### 6.1 前端部署

```bash
cd pms-template

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm test

# 代码检查
npm run lint
```

### 6.2 后端部署

```bash
cd backend

# 创建虚拟环境
python3 -m venv .venv
source .venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 设置环境变量
export JWT_SECRET="your-secret-key-change-in-production"
export DATABASE_URL="sqlite:///./pms.db"  # 开发环境

# 初始化数据库
python scripts/init_db.py

# 运行开发服务器
uvicorn main:app --reload --port 8001
```

### 6.3 Docker 部署 (生产)

```bash
cd backend

# 构建镜像
docker build -t pms-backend:latest .

# 运行容器
docker run -d -p 8001:8001 \
  -e JWT_SECRET="your-secret-key" \
  -e DATABASE_URL="postgresql://user:pass@host:5432/pms" \
  pms-backend:latest
```

---

## 七、测试

### 7.1 运行集成测试

```bash
# 确保后端服务已启动
cd backend
source .venv/bin/activate
JWT_SECRET="dev-secret" uvicorn main:app --port 8001 &

# 运行测试
cd ..
python3 scripts/pms_integration_test.py
```

### 7.2 导入 Postman 测试集合

1. 打开 Postman
2. 导入 `scripts/pms_phase1_api_tests.postman_collection.json`
3. 配置环境变量 `baseUrl`: `http://localhost:8001/api/v1`
4. 运行集合

---

## 八、已知问题

| # | 问题 | 优先级 | 状态 |
|---|------|--------|------|
| 1 | `/hazards/drafts` 返回 422 | P1 | ⏳ 待修复 |
| 2 | `/forum/posts` 返回 500 | P1 | ⏳ 待修复 |
| 3 | `/reports` 仅支持 POST | P2 | ⏳ 待添加 GET |
| 4 | `/tasks` 仅支持 POST | P2 | ⏳ 待添加 GET |
| 5 | pHash 重复检测未实现 | P2 | ⏳ 待开发 |

---

## 九、后续计划

### Phase 2 (第 5-10 周)

- 组织架构完整功能
- 论坛完整功能
- 消息通知
- 报告管理
- 任务甘特图

### Phase 3 (第 11-18 周)

- 审批流引擎
- 监测驾驶舱
- 扫码巡检
- 移动端

### Phase 4 (第 19-24 周)

- AI 助手
- 日志审计
- ERP 对接

---

## 十、提交记录

| 日期 | Commit | 说明 |
|------|--------|------|
| 2026-04-05 | f2e75c5b | feat: 添加草稿箱路由和菜单配置 |
| 2026-04-05 | d953f80c | test: 添加 PMS Phase 1 集成测试脚本 |
| 2026-04-05 | c0f11c8c | feat: 完善角色管理和个人中心页面 |
| 2026-04-05 | ea79f8c6 | feat: 修复 lint，新增页面 |

---

*文档生成时间：2026-04-05*
