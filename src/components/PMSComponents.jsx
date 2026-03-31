/**
 * PMS 通用组件库 - 基于 Stitch Azure Ethos 设计系统
 * 更新时间: 2026-03-30
 */
import React from 'react'

// 角色徽章
export function RoleBadge({ role }) {
  const roleLabels = {
    super_admin: '超级管理员',
    company_leader: '公司领导',
    dept_leader: '部门领导',
    section_chief: '科室负责人',
    project_manager: '项目经理',
    field_staff: '现场人员',
  }

  return (
    <span className={`pms-badge-role ${role}`} style={badgeStyles[role]}>
      {roleLabels[role] || role}
    </span>
  )
}

const badgeStyles = {
  super_admin: { background: 'var(--color-role-super-admin)' },
  company_leader: { background: 'var(--color-role-company-leader)' },
  dept_leader: { background: 'var(--color-role-dept-leader)' },
  section_chief: { background: 'var(--color-role-section-chief)' },
  project_manager: { background: 'var(--color-role-project-manager)' },
  field_staff: { background: 'var(--color-role-field-staff)' },
}

// 状态徽章
export function StatusBadge({ status }) {
  const config = {
    active: { bg: '#dcfce7', color: '#166534', label: '进行中' },
    planning: { bg: '#dbeafe', color: '#1e40af', label: '规划中' },
    completed: { bg: '#f3f4f6', color: '#6b7280', label: '已完成' },
    pending: { bg: '#fef3c7', color: '#92400e', label: '待处理' },
    in_progress: { bg: '#dbeafe', color: '#1e40af', label: '处理中' },
    resolved: { bg: '#dcfce7', color: '#166534', label: '已解决' },
    open: { bg: '#fef3c7', color: '#92400e', label: '未解决' },
    monitoring: { bg: '#dbeafe', color: '#1e40af', label: '监控中' },
    idle: { bg: '#dcfce7', color: '#166534', label: '空闲' },
    in_use: { bg: '#dbeafe', color: '#1e40af', label: '使用中' },
    maintenance: { bg: '#fef3c7', color: '#92400e', label: '维修中' },
    high: { bg: '#fee2e2', color: '#991b1b', label: '高风险' },
    medium: { bg: '#fef3c7', color: '#92400e', label: '中风险' },
    low: { bg: '#dcfce7', color: '#166534', label: '低风险' },
  }

  const { bg, color, label } = config[status] || { bg: '#f3f4f6', color: '#6b7280', label: status }

  return <span style={{ ...badgeBase, background: bg, color }}>{label}</span>
}

const badgeBase = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 10px',
  borderRadius: 'var(--radius-full)',
  fontSize: 12,
  fontWeight: 500,
}

// 指标卡片
export function MetricCard({ title, value, icon, trend }) {
  return (
    <div style={metricCardStyles.card}>
      <div style={metricCardStyles.header}>
        <span style={metricCardStyles.icon}>{icon}</span>
        <span style={metricCardStyles.title}>{title}</span>
      </div>
      <div style={metricCardStyles.value}>{value}</div>
      {trend && (
        <div
          style={{
            ...metricCardStyles.trend,
            color: trend > 0 ? 'var(--color-status-active)' : 'var(--color-error)',
          }}
        >
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}

const metricCardStyles = {
  card: {
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
    boxShadow: 'var(--shadow-soft)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 14,
    color: 'var(--color-on-surface-variant)',
  },
  value: {
    fontSize: 32,
    fontWeight: 700,
    fontFamily: 'var(--font-headline)',
    color: 'var(--color-on-surface)',
  },
  trend: {
    fontSize: 13,
    marginTop: 4,
  },
}

// 进度条
export function ProgressBar({ value, max = 100, color = 'var(--color-primary)' }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div style={progressStyles.track}>
      <div style={{ ...progressStyles.bar, width: `${percentage}%`, background: color }} />
    </div>
  )
}

const progressStyles = {
  track: {
    height: 6,
    background: 'var(--color-surface-container)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 'var(--radius-full)',
    transition: 'width 0.3s var(--cubic-smooth)',
  },
}

// 标签页
export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div style={tabsStyles.container}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            ...tabsStyles.tab,
            ...(activeTab === tab.key ? tabsStyles.tabActive : {}),
          }}
        >
          {tab.label}
          {tab.count !== undefined && <span style={tabsStyles.count}>{tab.count}</span>}
        </button>
      ))}
    </div>
  )
}

const tabsStyles = {
  container: {
    display: 'flex',
    gap: 4,
    background: 'var(--color-surface-container)',
    padding: 4,
    borderRadius: 'var(--radius-lg)',
  },
  tab: {
    padding: '8px 16px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    background: 'transparent',
    color: 'var(--color-on-surface-variant)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  tabActive: {
    background: 'var(--color-surface-container-lowest)',
    color: 'var(--color-primary)',
    boxShadow: 'var(--shadow-soft)',
  },
  count: {
    background: 'var(--color-surface-container-high)',
    padding: '0 6px',
    borderRadius: 'var(--radius-full)',
    fontSize: 12,
  },
}

// 页面标题
export function PageHeader({ title, subtitle, actions, icon }) {
  return (
    <div style={pageHeaderStyles.container}>
      <div style={pageHeaderStyles.left}>
        {icon && <span style={pageHeaderStyles.icon}>{icon}</span>}
        <div>
          <h1 style={pageHeaderStyles.title}>{title}</h1>
          {subtitle && <p style={pageHeaderStyles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div style={pageHeaderStyles.actions}>{actions}</div>}
    </div>
  )
}

const pageHeaderStyles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  left: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
  },
  icon: {
    fontSize: 28,
    lineHeight: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    fontFamily: 'var(--font-headline)',
    color: 'var(--color-on-background)',
    letterSpacing: '-0.02em',
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: 'var(--color-on-surface-variant)',
    marginTop: 4,
  },
  actions: {
    display: 'flex',
    gap: 12,
  },
}

// 空状态
export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={emptyStyles.container}>
      <div style={emptyStyles.icon}>{icon || '📭'}</div>
      <h3 style={emptyStyles.title}>{title}</h3>
      <p style={emptyStyles.description}>{description}</p>
      {action && <div style={emptyStyles.action}>{action}</div>}
    </div>
  )
}

const emptyStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    textAlign: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--color-on-surface)',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: 'var(--color-on-surface-variant)',
    marginBottom: 20,
  },
  action: {
    marginTop: 8,
  },
}

// 搜索框
export function SearchInput({ placeholder = '搜索...', value, onChange }) {
  return (
    <div style={searchStyles.wrapper}>
      <span style={searchStyles.icon}>🔍</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={searchStyles.input}
      />
    </div>
  )
}

const searchStyles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--color-surface-container-high)',
    borderRadius: 'var(--radius-md)',
    padding: '8px 12px',
  },
  icon: {
    fontSize: 14,
  },
  input: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: 14,
    color: 'var(--color-on-surface)',
    flex: 1,
    fontFamily: 'var(--font-body)',
  },
}
