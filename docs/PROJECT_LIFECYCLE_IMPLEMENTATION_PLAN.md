# 项目生命周期改造实施计划与测试大纲

更新时间：2026-06-17

## 1. 第一批改造范围

本实施计划对应 `docs/PROJECT_LIFECYCLE_REDESIGN.md` 的第一批安全切片，目标是把“项目类型 + 流程模板 + 生命周期阶段 + 阶段门 + 工作项元数据”落成可调用、可测试、可逐步接入前端的基础能力。

第一批不做数据库迁移，不删除旧任务、项目、审批、隐患等能力，不替换框架，也不把所有页面一次性重写。第一批使用兼容现有代码的内存模板/服务数据结构，先验证领域模型、API 合同、前端信息架构和测试路径。

## 2. 设计约束

- 后端新增能力只进入 `backend/api/routers`、`backend/api/services`、`backend/schemas` 和必要的 `backend/models` 文件。
- 不新增 `backend/routers` legacy 路由。
- 前端新增项目生命周期能力放在 `src/features/projects`。
- 不新增 `src/pages/*.jsx`。
- 不新增外部依赖。
- 保留 React + Vite + Ant Design + FastAPI + SQLAlchemy 主栈。
- 保留既有项目列表、任务、隐患、审批等模块入口。

## 3. 文件目标

### 3.1 后端文件

新增：

- `backend/schemas/project_lifecycle.py`
- `backend/api/services/project_lifecycle/__init__.py`
- `backend/api/services/project_lifecycle/templates.py`
- `backend/api/services/project_lifecycle/service.py`
- `backend/api/routers/project_lifecycle.py`
- `backend/tests/test_project_lifecycle.py`

修改：

- `backend/main.py`

### 3.2 前端文件

新增：

- `src/features/projects/api/projectLifecycleApi.js`
- `src/features/projects/hooks/useProjectLifecycle.js`
- `src/features/projects/pages/ProjectLifecyclePage.jsx`
- `src/features/projects/components/ProjectTypeSelector.jsx`
- `src/features/projects/components/LifecycleTimeline.jsx`
- `src/features/projects/components/WorkItemSummary.jsx`

修改：

- `src/app/routes.jsx`
- `src/app/route-map.js`
- `src/app/menu.config.js` 仅在需要增加明确入口时修改。
- `src/features/projects/pages/ProjectsPage.jsx` 仅做轻量入口增强，不重写整页。
- `src/test/smoke.test.jsx`

## 4. 后端 API 合同

### 4.1 项目类型

`GET /api/v1/project-lifecycle/project-types`

返回三类项目：

- `software_product`：软件产品开发流程
- `integration_engineering`：集成/工程项目管理流程
- `software_project`：软件项目管理流程

### 4.2 流程模板

`GET /api/v1/project-lifecycle/process-templates`

查询参数：

- `project_type` 可选

返回每类项目的默认模板，包含：

- `id`
- `project_type`
- `name`
- `description`
- `stages`
- `work_item_types`
- `metrics`

### 4.3 从模板创建项目视图

`POST /api/v1/project-lifecycle/projects/from-template`

第一批不直接写数据库，而是返回一个“可创建项目预览”，用于前端验证流程选择和生命周期初始化：

- `project`
- `template`
- `lifecycle`
- `stage_gates`
- `work_item_types`

后续数据库迁移完成后，该接口再切换为真实创建。

### 4.4 项目生命周期

`GET /api/v1/project-lifecycle/projects/{project_id}/lifecycle`

第一批允许通过查询参数 `project_type` 选择模板，返回对应生命周期视图：

- `project_id`
- `project_type`
- `stages`
- `stage_gates`
- `metrics`

### 4.5 工作项

`GET /api/v1/project-lifecycle/projects/{project_id}/work-items`

返回第一批模板工作项摘要，用于前端项目详情页验证不同项目类型的信息架构。

`POST /api/v1/project-lifecycle/projects/{project_id}/work-items`

创建内存工作项响应。字段：

- `type`
- `title`
- `status`
- `priority`
- `assignee_id`
- `parent_id`

### 4.6 状态流转

`POST /api/v1/project-lifecycle/work-items/{work_item_id}/transition`

字段：

- `target_status`

第一批做模板状态合法性校验，非法状态返回 400。

## 5. 前端页面大纲

### 5.1 项目类型与模板选择

在项目管理入口加入三类项目的类型选择能力：

- 软件产品开发
- 集成/工程项目
- 软件项目

选择类型后展示对应模板摘要，包括阶段数量、工作项类型和关键指标。

### 5.2 项目生命周期详情页

新增路由：

`/projects/lifecycle`

第一批用查询参数或默认项目类型展示生命周期，不强依赖真实项目 ID。页面包含：

- 项目类型选择器
- 模板说明
- 阶段时间线
- 阶段门清单
- 工作项类型摘要
- 指标摘要

后续改为 `/projects/:id/lifecycle` 并与真实项目详情壳层合并。

### 5.3 工作项摘要

不同项目类型展示不同工作项重点：

- 软件产品开发：epic、story、bug、release、feedback
- 集成/工程项目：milestone、risk、issue、change_request、deliverable
- 软件项目：requirement、development_task、test_case、defect、release_package

## 6. 测试大纲

### 6.1 后端单元测试

文件：`backend/tests/test_project_lifecycle.py`

测试项：

1. 三类项目类型完整返回。
2. 默认模板包含三类项目且模板 ID 唯一。
3. 按项目类型过滤模板。
4. `build_lifecycle_preview` 能为三类项目生成阶段和阶段门。
5. `create_work_item` 接受合法工作项类型。
6. `create_work_item` 拒绝不属于当前项目类型的工作项类型。
7. `transition_work_item` 接受合法状态。
8. `transition_work_item` 拒绝非法状态。

### 6.2 前端 smoke tests

文件：`src/test/smoke.test.jsx`

测试项：

1. `projectLifecycleApi` 暴露 `listProjectTypes`、`listTemplates`、`previewFromTemplate`、`getLifecycle`、`listWorkItems`、`createWorkItem`、`transitionWorkItem`。
2. `useProjectLifecycle` 可导入。
3. `ProjectLifecyclePage` 可导入。
4. `route-map` 包含项目生命周期入口。

### 6.3 验证命令

后端：

```bash
cd backend
pytest tests/test_project_lifecycle.py -v
```

前端：

```bash
npx vitest run src/test/smoke.test.jsx
```

构建：

```bash
npm run build
```

若现有仓库已有 unrelated 失败，记录失败来源，不把 unrelated 失败算作本切片完成证据。

## 7. 验收标准

第一批完成后应满足：

1. 文档明确第一批文件边界、API 合同、UI 范围和测试大纲。
2. 后端能返回三类项目类型与默认流程模板。
3. 后端能生成生命周期预览和工作项摘要。
4. 后端能校验工作项类型与状态流转。
5. 前端能显示项目生命周期页面，并允许切换三类项目类型。
6. 项目管理原有入口不被删除。
7. targeted backend tests 通过。
8. frontend smoke tests 通过或仅暴露 unrelated 既有问题。

## 8. 后续扩展

第一批验证通过后，再进入数据库持久化阶段：

1. 增加 Alembic migration 或项目当前迁移机制。
2. 将模板、阶段、阶段门、工作项写入数据库。
3. 将旧 `tasks` 迁移为 `work_items(type=task)` 的兼容层。
4. 将审批中心接入阶段门。
5. 将项目详情改为 `/projects/:id/overview`、`/projects/:id/lifecycle`、`/projects/:id/work-items` 等真实项目上下文路由。
