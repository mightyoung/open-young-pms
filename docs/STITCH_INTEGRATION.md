# Stitch 设计系统集成文档

> 更新时间: 2026-03-30

## 设计来源

- **工具**: Google Stitch AI
- **项目**: PMS UI Design
- **项目ID**: `8004525097705286938`
- **设计系统**: Azure Ethos (MANROPE + INTER)
- **主题色**: `#115cb9` (蓝色)

## 已集成的文件

### 1. 设计系统定义
- **文件**: `src/styles/stitch-design-system.js`
- **内容**: 
  - 完整颜色系统
  - 字体配置
  - 圆角规范
  - 阴影系统
  - 角色颜色
  - 状态颜色

### 2. 亮色主题 CSS
- **文件**: `src/styles/stitch-theme.css`
- **内容**:
  - CSS 变量定义
  - 卡片样式
  - 按钮样式
  - 输入框样式
  - 徽章/标签样式
  - 侧边栏样式
  - 表格样式
  - 标签页样式
  - 进度条样式
  - 动画

### 3. 通用组件库
- **文件**: `src/components/PMSComponents.jsx`
- **组件**:
  - `RoleBadge` - 角色徽章
  - `StatusBadge` - 状态徽章
  - `MetricCard` - 指标卡片
  - `ProgressBar` - 进度条
  - `Tabs` - 标签页
  - `PageHeader` - 页面标题
  - `EmptyState` - 空状态
  - `SearchInput` - 搜索框

### 4. 登录页更新
- **文件**: `src/pages/Login.jsx`
- **更新**: 使用 Stitch 设计系统重新设计

### 5. 主题切换
- **文件**: `src/main.jsx`
- **功能**: 支持亮色/暗色主题切换

## 颜色系统

### 主色系
| 变量 | 色值 | 用途 |
|------|------|------|
| primary | #115cb9 | 主按钮、主链接 |
| primary-container | #d7e2ff | 主色容器背景 |
| on-primary | #f7f7ff | 主色上文字 |
| primary-dim | #0050a7 | 主色深色 |

### 角色颜色
| 角色 | 色值 |
|------|------|
| 超级管理员 | #ff4d4f |
| 公司领导 | #1890ff |
| 部门领导 | #722ed1 |
| 科室负责人 | #faad14 |
| 项目经理 | #52c41a |
| 现场人员 | #13c2c2 |

### 状态颜色
| 状态 | 色值 | 标签 |
|------|------|------|
| active | #52c41a | 进行中 |
| planning | #1890ff | 规划中 |
| completed | #8c8c8c | 已完成 |
| pending | #faad14 | 待处理 |
| high | #ff4d4f | 高风险 |

## 使用方式

### 在组件中使用设计系统变量

```jsx
import '../styles/stitch-theme.css'

function MyComponent() {
  return (
    <div style={{ 
      background: 'var(--color-surface-container-lowest)',
      borderRadius: 'var(--radius-lg)',
      padding: 16,
    }}>
      <span style={{ color: 'var(--color-primary)' }}>主色文字</span>
    </div>
  )
}
```

### 使用通用组件

```jsx
import { RoleBadge, StatusBadge, MetricCard } from '../components/PMSComponents'

function MyPage() {
  return (
    <div>
      <RoleBadge role="project_manager" />
      <StatusBadge status="pending" />
      <MetricCard title="项目总数" value={42} icon="📊" />
    </div>
  )
}
```

### 主题切换

```jsx
// 切换到亮色主题
localStorage.setItem('pms-theme', 'light')
window.location.reload()

// 切换到暗色主题
localStorage.setItem('pms-theme', 'dark')
window.location.reload()
```

## 后续优化

### 已优化页面 ✅
以下页面已完成基于 Stitch 设计系统的优化：
1. ~~Login.jsx~~ → ✅ 登录页
2. ~~Dashboard.jsx~~ → ✅ 驾驶舱
3. ~~HazardManagement.jsx~~ → ✅ 隐患管理
4. ~~ApprovalCenter.jsx~~ → ✅ 审批中心
5. ~~Contracts.jsx~~ → ✅ 合同管理
6. ~~Quality.jsx~~ → ✅ 质量管理
7. ~~Risks.jsx~~ → ✅ 风险管理
8. ~~Resources.jsx~~ → ✅ 资源调度
9. ~~KnowledgeBase.jsx~~ → ✅ 知识库
10. ~~AIChat.jsx~~ → ✅ AI 助手
11. ~~Notifications.jsx~~ → ✅ 通知中心
12. ~~Users.jsx~~ → ✅ 用户管理

**🎉 所有页面已优化完成！**

### UI 截图
项目 UI 截图保存在：
- `~/clawd/workspace/designs/pms-login-screen.png`
- `~/clawd/workspace/designs/pms-screens/latest-screen.png`

## 查看设计稿

1. 打开 https://stitch.withgoogle.com/
2. 登录 Google 账号
3. 找到项目 "PMS UI Design"
4. 查看所有生成的屏幕设计
