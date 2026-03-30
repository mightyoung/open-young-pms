# PMS 项目设计规范

> 基于 PRD v1.2 | 版本：v1.0 | 日期：2026-03-30

---

## 1. 设计理念

### 1.1 产品定位
面向单部门工程项目管理的全流程数字化平台，覆盖项目立项→执行→监控→收尾全生命周期。

### 1.2 核心用户
- 现场人员：问题上报、任务执行
- 项目负责人：项目全局管理
- 部门/公司领导：监控决策

### 1.3 设计风格
**Industrial Executive** — 专业、高效、清晰
- 色彩：深蓝主色 + 状态色（安全红/警告黄/成功绿）
- 字体：思源黑体 + Inter
- 布局：信息密度高，操作路径短

---

## 2. 权限体系（6角色）

### 2.1 角色定义

| 角色 | 英文 | 说明 |
|------|------|------|
| 超级管理员 | Super Admin | 系统配置、用户管理 |
| 公司领导 | Company Leader | 全局视图、审批 |
| 部门领导 | Department Leader | 部门项目管理 |
| 科室负责人 | Section Chief | 问题审批 |
| 项目负责人 | Project Manager | 单项目管理 |
| 现场人员 | Field Staff | 问题上报、任务执行 |

### 2.2 权限矩阵

```
┌────────────────┬──────┬──────────┬──────────┬────────┬──────────┬──────────┐
│ 功能           │ 超管 │ 公司领导 │ 部门领导 │ 科室  │ 项目负责 │ 现场人员 │
├────────────────┼──────┼──────────┼──────────┼────────┼──────────┼──────────┤
│ 系统管理       │  ✅  │    ❌    │    ❌    │   ❌   │    ❌    │    ❌    │
│ 创建项目       │  ✅  │    ✅    │    ✅    │   ❌   │    ❌    │    ❌    │
│ 查看所有项目   │  ✅  │    ✅    │    ✅    │   ❌   │    ❌    │    ❌    │
│ 查看本部门项目 │  ✅  │    ✅    │    ✅    │   ✅   │    ❌    │    ❌    │
│ 查看负责项目   │  ✅  │    ✅    │    ✅    │   ✅   │    ✅    │    ❌    │
│ 查看参与项目   │  ✅  │    ✅    │    ✅    │   ✅   │    ✅    │    ✅    │
│ 随手拍上报     │  ✅  │    ✅    │    ✅    │   ✅   │    ✅    │    ✅    │
│ 问题指派       │  ✅  │    ❌    │    ❌    │   ✅   │    ✅    │    ❌    │
│ 问题整改       │  ✅  │    ❌    │    ❌    │   ❌   │    ✅    │ 被指派人 │
│ 问题验收       │  ✅  │    ❌    │    ❌    │   ✅   │    ✅    │    ❌    │
│ 报告审批       │  ✅  │    ✅    │    ✅    │   ✅   │    ✅    │    ❌    │
│ AI对话         │  ✅  │    ✅    │    ✅    │   ✅   │ 负责项目 │    ✅    │
│ 论坛发帖       │  ✅  │    ✅    │    ✅    │   ✅   │    ✅    │    ✅    │
└────────────────┴──────┴──────────┴──────────┴────────┴──────────┴──────────┘
```

### 2.3 权限实现策略

```javascript
// 基于角色的权限控制 (RBAC)
// 1. 角色定义
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_LEADER: 'company_leader',
  DEPT_LEADER: 'dept_leader',
  SECTION_CHIEF: 'section_chief',
  PROJECT_MANAGER: 'project_manager',
  FIELD_STAFF: 'field_staff'
}

// 2. 权限矩阵
const PERMISSION_MATRIX = {
  [ROLES.SUPER_ADMIN]: ['*'], // 所有权限
  [ROLES.COMPANY_LEADER]: ['project:read:all', 'approval:*', 'report:read:all', 'ai:chat'],
  [ROLES.DEPT_LEADER]: ['project:read:dept', 'approval:dept', 'report:read:dept', 'ai:chat'],
  [ROLES.SECTION_CHIEF]: ['approval:section', 'issue:verify', 'report:read:section'],
  [ROLES.PROJECT_MANAGER]: ['project:manage', 'task:*', 'issue:manage', 'report:manage', 'ai:chat:project'],
  [ROLES.FIELD_STAFF]: ['issue:create', 'task:execute', 'report:create']
}

// 3. 项目维度权限
// 项目负责人/现场人员的权限需要绑定到具体项目
const PROJECT_PERMISSIONS = {
  project_manager: {
    canView: (user, project) => user.assignedProjects.includes(project.id),
    canEdit: (user, project) => user.managedProjects.includes(project.id)
  },
  field_staff: {
    canView: (user, project) => user.assignedProjects.includes(project.id),
    canOperate: (user, project, task) => task.assigneeId === user.id
  }
}
```

---

## 3. 页面架构

### 3.1 角色首页

| 角色 | 首页 | 核心功能 |
|------|------|----------|
| 超管 | /admin | 用户管理、系统配置 |
| 公司领导 | /dashboard | 驾驶舱、项目全局 |
| 部门领导 | /dept | 部门项目、监测大屏 |
| 科室负责人 | /approvals | 待审批问题 |
| 项目负责人 | /projects | 项目详情、任务、甘特图 |
| 现场人员 | /mobile | 随手拍、我的任务 |

### 3.2 路由设计

```
/                           → 重定向到角色首页
/login                      → 登录页

// 超级管理员
/admin                      → 系统概览
/admin/users                → 用户管理
/admin/roles               → 角色配置
/admin/departments         → 部门管理
/admin/workflows           → 审批流配置

// 公司领导
/dashboard                 → 驾驶舱
/projects                  → 所有项目列表
/issues/all               → 问题总览
/reports/all               → 报告总览
/ai                        → AI助手

// 部门领导
/dept                      → 部门概览
/projects/my-dept           → 本部门项目
/issues/dept              → 本部门问题
/monitor                   → 监测大屏

// 科室负责人
/approvals                 → 待我审批
/issues/section            → 本科室问题

// 项目负责人
/projects                  → 我的项目
/projects/:id              → 项目详情
/projects/:id/tasks        → 任务看板
/projects/:id/gantt         → 甘特图
/projects/:id/issues        → 项目问题
/projects/:id/reports      → 项目报告

// 现场人员（移动端）
/mobile                     → 移动端首页
/mobile/capture            → 随手拍
/mobile/tasks              → 我的任务
/mobile/reports            → 我的报告

// 通用
/forum                     → 论坛
/notifications             → 消息中心
/settings                  → 个人设置
```

---

## 4. 组件规范

### 4.1 状态色彩

| 状态 | 色值 | 用途 |
|------|------|------|
| 安全/正常 | #52c41a | 进度正常、无问题 |
| 警告/预警 | #faad14 | 进度滞后、即将超期 |
| 危险/紧急 | #ff4d4f | 紧急问题、超期 |
| 资讯/进行中 | #1890ff | 进行中状态 |
| 草稿 | #d9d9d9 | 草稿状态 |

### 4.2 关键组件

#### ProjectCard 项目卡片
```
┌──────────────────────────────┐
│ 🟢 项目名称                    │
│ 进度: ████████░░ 85%        │
│ 预算: ███████░░░ 78%        │
│ 成员: 23人 │ 问题: 5个       │
│ [进入项目] [甘特图] [问题]    │
└──────────────────────────────┘
```

#### IssueCard 问题卡片
```
┌──────────────────────────────┐
│ 🔴 [安全] 问题标题           │
│ 项目：xxx │ 上报人：王五     │
│ 位置：3号竖井-15米深处       │
│ 紧急程度：紧急               │
│ 状态：待指派                  │
│ [指派] [查看详情]            │
└──────────────────────────────┘
```

#### StatCard 统计卡片
```
┌──────────┐
│  18个   │ ← 大号数字
│ 进行中   │ ← 标签
│  ↑2     │ ← 变化趋势
└──────────┘
```

### 4.3 权限组件

```jsx
// PermissionGate 权限门控组件
<PermissionGate 
  requires={['project:create']}
  fallback={<Button disabled>无权限创建</Button>}
>
  <Button type="primary">创建项目</Button>
</PermissionGate>

// RoleBadge 角色标签
<RoleBadge role="project_manager" />

// ProjectFilter 项目过滤器（根据权限过滤可见项目）
<ProjectFilter 
  user={currentUser}
  projects={allProjects}
  render={filteredProjects => <ProjectList data={filteredProjects} />}
/>
```

---

## 5. 技术实现

### 5.1 前端权限控制

```javascript
// 1. 权限 Context
const PermissionContext = createContext({
  user: null,
  permissions: [],
  roles: [],
  can: (action, resource) => boolean,
  canAccessProject: (projectId) => boolean
})

// 2. 权限 Hook
const usePermission = () => useContext(PermissionContext)

// 3. 路由守卫
<ProtectedRoute 
  requires={['project:read']}
  projectId={projectId}
>
  <ProjectDetail />
</ProtectedRoute>

// 4. API 权限拦截
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      message.error('您没有权限执行此操作')
    }
    return Promise.reject(error)
  }
)
```

### 5.2 项目维度权限过滤

```javascript
// 后端返回数据时过滤
const filterProjectsByPermission = (projects, user) => {
  const { roles, assignedProjects } = user
  
  if (roles.includes('super_admin') || roles.includes('company_leader')) {
    return projects // 可见所有
  }
  
  if (roles.includes('dept_leader')) {
    return projects.filter(p => p.departmentId === user.departmentId)
  }
  
  if (roles.includes('project_manager')) {
    return projects.filter(p => assignedProjects.includes(p.id))
  }
  
  return projects.filter(p => assignedProjects.includes(p.id))
}
```

### 5.3 组件可见性

```jsx
// 根据角色条件渲染
{user.roles.includes('section_chief') && (
  <ApproveSection />
)}

// 或使用权限组件
<PermissionGate requires="issue:verify">
  <VerifyButton onClick={handleVerify} />
</PermissionGate>
```

---

## 6. 移动端设计

### 6.1 TabBar 配置

```
┌────────────────────────────────────┐
│ Tab 1: 首页                         │
│   - 快捷入口（4宫格）              │
│   - 我的待办卡片                   │
│   - 今日统计卡片                   │
├────────────────────────────────────┤
│ Tab 2: 统计                        │
│   - 项目状态看板                   │
│   - 问题汇总看板                   │
├────────────────────────────────────┤
│ Tab 3: 项目                        │
│   - 项目列表                       │
│   - 项目详情                       │
├────────────────────────────────────┤
│ Tab 4: 审批                        │
│   - 待我审批                       │
│   - 我发起的                       │
├────────────────────────────────────┤
│ Tab 5: 我的                        │
│   - 个人信息                       │
│   - 我的报告                       │
│   - 设置                          │
└────────────────────────────────────┘
```

### 6.2 随手拍流程

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  拍照   │ → │ 选择类型  │ → │  填写描述 │ → │  提交    │ → │  成功   │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
     ↓                                               ↓
  自动获取位置                                  分配整改人
  自动压缩图片                                  发送通知
```

---

## 7. MVP 开发优先级

### P0（核心基础）
1. 用户权限体系（6角色 + RBAC）
2. 项目管理基础（CRUD + 成员管理）
3. 随手拍模块（拍照上报 + 整改闭环）

### P1（核心功能）
4. 任务管理（WBS + 甘特图）
5. 消息通知（站内 + Push）
6. 报告管理（日周月报 + 审批）

### P2（增强功能）
7. 审批流引擎
8. 监测看板
9. 论坛模块
10. AI助手

---

## 8. 验收标准

### 权限验证
- [ ] 6个角色可正常登录
- [ ] 各角色只能看到有权限的菜单
- [ ] 各角色只能操作有权限的功能
- [ ] 项目维度权限正确过滤

### 功能验证
- [ ] 随手拍完整流程可用
- [ ] 任务创建/分配/完成流程可用
- [ ] 报告提交/审批流程可用
- [ ] 消息通知正常推送

### 性能验证
- [ ] 首屏加载 < 2秒
- [ ] API响应 < 500ms
- [ ] 100并发用户支持

---

## 9. 实现状态

### 权限系统
- [x] `src/constants/permissions.js` - 角色定义、权限矩阵、路由映射
- [x] `src/contexts/PermissionContext.jsx` - 权限 Context provider
- [x] `src/hooks/usePermission.js` - usePermission hook 导出
- [x] `src/components/PermissionGate/index.jsx` - 权限门控组件
- [x] `src/components/RoleBadge/index.jsx` - 角色 Badge 组件
- [x] `src/components/ProtectedRoute/index.jsx` - 角色首页路由守卫

### 关键组件
- [x] `src/components/ProjectCard/index.jsx` - 项目卡片（进度条、预算执行率、状态色彩）
- [x] `src/components/IssueCard/index.jsx` - 问题卡片（类型图标、紧急程度、状态色彩）
- [x] `src/components/StatCard/index.jsx` - 统计卡片（大号数字+变化趋势）

### 移动端
- [x] `src/pages/mobile/Capture.jsx` - 随手拍页面（拍照→类型→描述→提交，支持 GPS、图片压缩、离线草稿）

### 布局
- [x] `src/components/Layout/Sidebar.jsx` - 权限菜单过滤（6角色菜单可见性）
