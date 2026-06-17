# 项目流程与前后端重构改造方案

更新时间：2026-06-17

## 1. 改造目标

当前系统已经具备项目、任务、隐患、审批、合同、质量、风险、资源、报告等模块，但“项目管理”仍偏单一项目流。改造目标是把系统升级为可支持三类项目的项目运营平台：

1. 软件产品开发流程
2. 集成/工程项目管理流程
3. 软件项目管理流程

技术方向上不建议一次性替换现有 React + Vite + Ant Design + FastAPI + SQLAlchemy 技术栈。当前仓库已经要求新前端进入 `src/features/*`，新后端进入 `backend/api/routers/*`，并标记 `src/pages` 与 `backend/routers` 为 legacy/冻结演进方向。因此本方案采用“保留主栈、抽象流程内核、分阶段替换页面和 API”的方式。

## 2. 外部最佳实践依据

### 2.1 软件产品开发

- Scrum Guide 将产品开发组织为 Product Goal、Product Backlog、Sprint、Increment、Definition of Done，适合作为软件产品持续迭代的流程基线。
- DORA 能力模型强调持续集成、持续交付、测试自动化、可观测性、小批量交付、价值流可视化，适合作为软件交付效能指标来源。

参考：
- https://scrumguides.org/scrum-guide.html
- https://dora.dev/capabilities/

### 2.2 集成/工程项目管理

- PMI PMBOK 强调价值交付、项目治理、范围、进度、成本、风险、资源、干系人等绩效域，适合工程型项目的全生命周期治理。
- OpenProject 等成熟项目管理系统以 Work Package、Gantt、Boards、Milestones、Cost、Documents、Meetings、Risk 等对象组织工程交付。

参考：
- https://www.pmi.org/standards/pmbok
- https://www.openproject.org/docs/user-guide/work-packages/

### 2.3 企业级前后端框架

- Ant Design 是面向企业级产品的 React 设计体系，当前项目已经使用 Ant Design，应优先复用它的设计语言、表格、表单、导航、反馈组件，并可补充 ProComponents。
- Refine 是面向内部工具、后台、仪表盘和 B2B 应用的 React meta-framework，可与 Ant Design 集成，适合在资源管理、列表、详情、表单、权限、数据提供层做增量引入。
- FastAPI 当前仍适合作为后端 API 框架，不建议因流程重构而替换后端框架。

参考：
- https://ant.design/docs/spec/introduce/
- https://procomponents.ant.design/
- https://refine.dev/core/docs/
- https://fastapi.tiangolo.com/

## 3. 三类项目流程定义

### 3.1 软件产品开发流程

适用场景：内部平台、SaaS、移动应用、持续迭代型产品。

推荐流程：

1. 机会/反馈收集
2. 产品发现与需求澄清
3. Product Backlog 管理
4. Sprint 计划
5. 设计、开发、测试、评审
6. 可用增量交付
7. 发布与灰度
8. 数据反馈与复盘

核心对象：

- Product Goal
- Roadmap
- Epic / Feature / User Story
- Sprint
- Release
- Defect
- Experiment
- Customer Feedback

关键指标：

- Sprint 完成率
- 缺陷逃逸率
- 发布频率
- Lead Time
- Change Failure Rate
- MTTR

页面建议：

- 产品路线图
- 需求池
- Backlog
- Sprint Board
- 发布计划
- 用户反馈
- DORA 指标

### 3.2 集成/工程项目管理流程

适用场景：工程建设、系统集成、交付周期长、合同/资源/质量/风险强约束项目。

推荐流程：

1. 立项
2. 范围与 WBS 计划
3. 设计/采购/施工或集成
4. 进度、成本、质量、风险监控
5. 联调/试运行
6. 验收
7. 移交与关闭

核心对象：

- Project Charter
- WBS
- Milestone
- Contract
- Resource Plan
- Risk
- Issue
- Change Request
- Quality Inspection
- Acceptance Record
- Delivery Document

关键指标：

- 里程碑达成率
- 计划偏差
- 成本偏差
- 风险关闭率
- 质量问题关闭率
- 验收通过率

页面建议：

- WBS / 甘特图
- 里程碑
- 合同管理
- 资源计划
- 风险与问题
- 质量检查
- 隐患整改
- 变更单
- 验收与归档

### 3.3 软件项目管理流程

适用场景：客户定制软件、外包交付、内部一次性交付项目、强验收软件工程。

推荐流程：

1. 商务/立项
2. 需求基线
3. 方案与架构设计
4. 开发计划
5. 开发与代码评审
6. 集成测试
7. UAT / 客户验收
8. 上线部署
9. 运维移交

核心对象：

- Requirement Baseline
- Design Document
- Module
- Development Task
- Test Case
- Defect
- Release Package
- Deployment Plan
- Acceptance Form
- Change Request

关键指标：

- 需求变更率
- 测试通过率
- 缺陷关闭率
- 版本延期率
- 验收一次通过率
- 上线回滚次数

页面建议：

- 需求规格
- 设计文档
- 开发任务
- 测试用例
- 缺陷管理
- 发布单
- 验收单
- 变更记录
- 运维移交清单

## 4. 目标业务架构

### 4.1 核心思想

不要为三类项目各写一套硬编码页面和 API，而是建立统一项目流程内核：

```text
Project Type
  -> Process Template
    -> Lifecycle Stages
      -> Stage Gates
        -> Work Item Types
          -> Work Items
            -> Workflow States / Transitions
```

这样三类项目共享底层能力，但拥有不同默认模板、字段、阶段门和页面组合。

### 4.2 建议新增领域模型

- `ProjectType`
  - `software_product`
  - `integration_engineering`
  - `software_project`

- `ProcessTemplate`
  - 模板名称
  - 适用项目类型
  - 默认阶段
  - 默认工作项类型
  - 默认权限策略

- `LifecycleStage`
  - 阶段名称
  - 阶段顺序
  - 阶段状态
  - 阶段负责人

- `StageGate`
  - 阶段门名称
  - 必填交付物
  - 审批角色
  - 通过条件

- `WorkItemType`
  - `epic`
  - `story`
  - `task`
  - `bug`
  - `risk`
  - `issue`
  - `change_request`
  - `milestone`
  - `deliverable`

- `WorkItem`
  - 所属项目
  - 类型
  - 标题
  - 状态
  - 优先级
  - 负责人
  - 父子关系
  - 计划时间
  - 实际时间
  - 依赖关系

- `WorkflowState`
  - 状态编码
  - 状态名称
  - 所属模板/工作项类型

- `WorkflowTransition`
  - 来源状态
  - 目标状态
  - 允许角色
  - 前置条件
  - 触发动作

- `ArtifactTemplate`
  - PRD、WBS、测试报告、验收单、变更单、发布单等模板

- `ProjectMetricSnapshot`
  - 进度、成本、质量、风险、交付效能等快照指标

## 5. 后端重构方案

### 5.1 保留 FastAPI，建立流程服务层

新增代码放在：

- `backend/api/routers/project_lifecycle.py`
- `backend/api/routers/work_items.py`
- `backend/api/routers/process_templates.py`
- `backend/api/services/project_lifecycle/`
- `backend/schemas/project_lifecycle.py`
- `backend/models/project_lifecycle.py`

避免继续扩张：

- `backend/routers/*`
- `backend/api/services/fastapi_code_generator/*` 手改生成层

### 5.2 API 设计

建议新增 API：

```text
GET    /api/v1/project-types
GET    /api/v1/process-templates
POST   /api/v1/projects/from-template
GET    /api/v1/projects/{id}/lifecycle
PATCH  /api/v1/projects/{id}/lifecycle/stages/{stage_id}
GET    /api/v1/projects/{id}/work-items
POST   /api/v1/projects/{id}/work-items
PATCH  /api/v1/work-items/{id}
POST   /api/v1/work-items/{id}/transition
GET    /api/v1/projects/{id}/stage-gates
POST   /api/v1/projects/{id}/stage-gates/{gate_id}/submit
POST   /api/v1/projects/{id}/stage-gates/{gate_id}/approve
GET    /api/v1/projects/{id}/metrics
```

### 5.3 兼容策略

当前已有 `projects`、`tasks`、`hazards`、`approval`、`contracts`、`quality`、`risks`、`resources` 等模块。迁移期不删除旧接口：

1. 旧 `tasks` API 继续可用
2. 新 `work_items` 先作为新项目详情页的数据源
3. 逐步把 WBS、看板、甘特图接入 `work_items`
4. 旧任务模型最终成为 `work_items(type=task)` 的兼容视图

## 6. 前端重构方案

### 6.1 技术选择

推荐路线：React + Vite + Ant Design 继续保留，增量引入 ProComponents，并评估 Refine 用于资源型页面。

不推荐当前阶段直接迁移 Next.js，原因：

- 系统是内部管理平台，SSR/SEO 不是核心收益
- 当前 Vite 代理、React Router、Ant Design 已经成型
- 大迁移会掩盖真正问题：流程模型缺失、页面信息架构分散、legacy/API 分层不清

### 6.2 页面结构

建议新增或改造为：

```text
/projects
  项目组合列表，支持按三类项目筛选

/projects/new
  第一步选择项目类型
  第二步选择流程模板
  第三步填写基础信息

/projects/:id/overview
  项目总览

/projects/:id/lifecycle
  阶段、阶段门、流程状态

/projects/:id/work-items
  统一工作项表

/projects/:id/board
  看板

/projects/:id/timeline
  WBS / 甘特图 / 依赖

/projects/:id/deliverables
  交付物和模板文档

/projects/:id/risks
  风险、问题、变更

/projects/:id/quality
  质量、测试、验收

/projects/:id/settings
  项目模板、字段、权限、通知配置
```

### 6.3 UI 风格

采用企业级后台风格：

- 左侧主导航保持稳定
- 项目详情内使用顶部项目上下文栏
- 使用 Tabs 区分 Overview / Lifecycle / Work Items / Timeline / Quality
- 列表页使用高级筛选、批量操作、保存视图
- 表单页使用分步表单和侧边抽屉
- 阶段门使用 Steps + 审批状态 + 必填交付物清单
- 工作项详情使用 Drawer，避免频繁跳页

## 7. 分阶段实施计划

### 阶段 0：基线冻结

目标：

- 记录当前项目、任务、审批、隐患、质量、合同、风险 API 状态
- 增加项目管理关键 smoke tests
- 明确 legacy 目录只修不扩

验收：

- 当前项目列表、任务列表、登录、仪表盘 smoke 通过
- 文档记录旧 API 与新 API 的兼容边界

### 阶段 1：流程模板内核

目标：

- 新增项目类型、流程模板、生命周期阶段、阶段门模型
- 新增 `projects/from-template`
- 创建三套默认模板 seed

验收：

- 能创建三类项目
- 每类项目自动生成不同阶段
- 项目详情可返回 lifecycle 数据

### 阶段 2：统一工作项

目标：

- 新增 `work_items`
- 支持父子结构、依赖、状态流转
- 兼容现有任务看板和甘特图

验收：

- 软件产品项目能创建 story/bug/release
- 工程项目能创建 milestone/risk/change_request
- 软件项目能创建 requirement/test_case/defect

### 阶段 3：项目详情重构

目标：

- 重构 `src/features/projects`
- 新增项目详情壳层
- 通过项目类型动态显示不同 tabs 和默认视图

验收：

- 三类项目进入详情后显示不同信息架构
- 公共页面组件复用
- 不新增 `src/pages/*.jsx`

### 阶段 4：阶段门与审批整合

目标：

- 阶段门接入审批中心
- 支持提交、退回、通过
- 必填交付物校验

验收：

- 工程项目立项、验收可以审批
- 软件项目需求基线、上线可以审批
- 软件产品发布可以审批或记录

### 阶段 5：指标与运营看板

目标：

- 三类项目各自指标模型
- 项目组合视图
- 风险、质量、交付效能看板

验收：

- 软件产品显示 DORA/发布/缺陷
- 工程项目显示进度/成本/风险/质量
- 软件项目显示需求变更/测试/验收

## 8. 风险与控制

| 风险 | 影响 | 控制策略 |
| --- | --- | --- |
| 一次性重写过大 | 业务不可用、测试断裂 | 先抽象流程内核，旧 API 兼容 |
| 三类流程分叉成三套代码 | 维护成本高 | 用模板和工作项类型表达差异 |
| 页面重构只换皮 | 业务流程仍不清晰 | 先改信息架构和状态机，再改视觉 |
| 后端继续扩张 legacy 层 | 架构债务加深 | 新增 API 只进 `backend/api/routers` |
| 引入框架过多 | 学习和迁移成本过高 | Ant Design 为主，Refine/ProComponents 试点后再扩大 |

## 9. 推荐决策

推荐采用以下决策：

1. 项目管理内核改为“项目类型 + 流程模板 + 工作项 + 阶段门”
2. 前端保留 React + Vite + Ant Design
3. 逐步引入 Ant Design ProComponents
4. Refine 仅在资源型 CRUD 页面试点，不作为第一阶段强依赖
5. 后端保留 FastAPI + SQLAlchemy
6. 新业务只进入 `backend/api/routers` 和新服务层
7. 三类项目流程先以 seed 模板落地，再开放配置能力

## 10. 下一步执行建议

下一步应进入阶段 0 和阶段 1：

1. 增加 `ProjectType` / `ProcessTemplate` / `LifecycleStage` / `StageGate` 模型设计
2. 写三套默认流程模板 seed
3. 新增 `POST /api/v1/projects/from-template`
4. 新增项目创建页：选择项目类型、选择模板、填写基础信息
5. 新增项目详情 lifecycle tab
6. 补充后端单元测试和前端 smoke tests
