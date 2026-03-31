import { motion } from 'framer-motion'
import { Tooltip } from 'antd'
import {
  LayoutDashboard,
  Kanban,
  Users,
  FileText,
  Bell,
  Settings,
  Shield,
  FolderKanban,
  AlertTriangle,
  BarChart3,
  MessageCircle,
  CheckCircle2,
  ClipboardList,
  FileBarChart,
  Monitor,
  Activity,
  BookOpen,
  UsersRound,
  GitBranch,
  Calendar,
  Database,
  MessageSquare,
  ChevronRight,
  Camera,
  ListTodo,
  FileText as ReportIcon,
} from 'lucide-react'

const ALL_MENU_ITEMS = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, permission: 'dashboard' },
  { id: 'kanban', label: '看板', icon: Kanban, permission: null },
  { id: 'team', label: '团队', icon: Users, permission: null },
  { id: 'docs', label: '文档', icon: FileText, permission: null },
  { id: 'projects', label: '所有项目', icon: FolderKanban, permission: 'projects' },
  {
    id: 'projects/my-dept',
    label: '本部门项目',
    icon: FolderKanban,
    permission: 'projects/my-dept',
  },
  { id: 'issues/all', label: '问题总览', icon: AlertTriangle, permission: 'issues/all' },
  { id: 'issues/dept', label: '本部门问题', icon: AlertTriangle, permission: 'issues/dept' },
  { id: 'issues/section', label: '本科室问题', icon: AlertTriangle, permission: 'issues/section' },
  { id: 'reports/all', label: '报告总览', icon: FileBarChart, permission: 'reports/all' },
  { id: 'reports/section', label: '本科室报告', icon: FileBarChart, permission: 'reports/section' },
  { id: 'monitor', label: '监测大屏', icon: Monitor, permission: 'monitor' },
  { id: 'approvals', label: '待我审批', icon: CheckCircle2, permission: 'approvals' },
  { id: 'ai', label: 'AI 对话', icon: MessageCircle, permission: 'ai' },
  { id: 'forum', label: '论坛', icon: MessageSquare, permission: null },
  { id: 'notifications', label: '通知中心', icon: Bell, permission: null },
  { id: 'settings', label: '设置', icon: Settings, permission: null },
  { id: 'admin', label: '系统管理', icon: Shield, permission: 'admin' },
  { id: 'admin/users', label: '用户管理', icon: UsersRound, permission: 'admin' },
  { id: 'dept', label: '部门概览', icon: BarChart3, permission: 'dept' },
  { id: 'gantt', label: '甘特图', icon: GitBranch, permission: null },
  { id: 'calendar', label: '日程管理', icon: Calendar, permission: null },
  { id: 'budget', label: '预算管理', icon: BarChart3, permission: null },
  { id: 'risks', label: '风险管理', icon: Activity, permission: null },
  { id: 'knowledge', label: '知识库', icon: BookOpen, permission: null },
  { id: 'quality', label: '质量管理', icon: CheckCircle2, permission: null },
  { id: 'resources', label: '资源管理', icon: Database, permission: null },
  { id: 'mobile', label: '移动首页', icon: Kanban, permission: 'mobile' },
  { id: 'mobile/capture', label: '随手拍', icon: Camera, permission: 'mobile' },
  { id: 'mobile/tasks', label: '我的任务', icon: ListTodo, permission: 'mobile' },
  { id: 'mobile/reports', label: '我的报告', icon: ReportIcon, permission: 'mobile' },
]

const ROLE_VISIBLE_MENUS = {
  super_admin: ALL_MENU_ITEMS,
  company_leader: ALL_MENU_ITEMS.filter(m =>
    [
      'dashboard',
      'projects',
      'issues/all',
      'reports/all',
      'approvals',
      'ai',
      'forum',
      'notifications',
      'settings',
    ].includes(m.id)
  ),
  dept_leader: ALL_MENU_ITEMS.filter(m =>
    [
      'dept',
      'projects/my-dept',
      'issues/dept',
      'monitor',
      'approvals',
      'ai',
      'forum',
      'notifications',
      'settings',
    ].includes(m.id)
  ),
  section_chief: ALL_MENU_ITEMS.filter(m =>
    [
      'approvals',
      'issues/section',
      'reports/section',
      'ai',
      'forum',
      'notifications',
      'settings',
    ].includes(m.id)
  ),
  project_manager: ALL_MENU_ITEMS.filter(m =>
    ['projects', 'gantt', 'approvals', 'ai', 'forum', 'notifications', 'settings'].includes(m.id)
  ),
  field_staff: ALL_MENU_ITEMS.filter(m =>
    [
      'mobile',
      'mobile/capture',
      'mobile/tasks',
      'mobile/reports',
      'forum',
      'notifications',
      'settings',
    ].includes(m.id)
  ),
}

export function Sidebar({ collapsed, activeMenu, setActiveMenu, user }) {
  const role = user?.role || 'field_staff'
  const menuItems = ROLE_VISIBLE_MENUS[role] || ROLE_VISIBLE_MENUS.field_staff

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        height: '100vh',
        background: 'rgba(19, 19, 26, 0.95)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          padding: collapsed ? '20px 16px' : '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #115cb9, #115cb9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          P
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontSize: 18,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #115cb9, #115cb9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap',
            }}
          >
            ProjectX
          </motion.span>
        )}
      </div>

      <nav style={{ flex: 1, padding: '16px 8px', overflowY: 'auto' }}>
        {menuItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeMenu === id

          const button = (
            <motion.button
              key={id}
              onClick={() => setActiveMenu(id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '12px' : '12px 16px',
                marginBottom: 2,
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                position: 'relative',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(99,102,241,0.15), transparent)'
                  : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                transition: 'all 0.2s ease',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarActive"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 2,
                    height: 24,
                    background: '#115cb9',
                    borderRadius: 2,
                  }}
                />
              )}
              <Icon size={20} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {label}
                </motion.span>
              )}
            </motion.button>
          )

          return collapsed ? (
            <Tooltip key={id} title={label} placement="right">
              {button}
            </Tooltip>
          ) : (
            button
          )
        })}
      </nav>

      <div
        style={{
          padding: collapsed ? '16px 12px' : '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #115cb9, #115cb9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: 14,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {user?.name?.[0] || 'P'}
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>
              {user?.name || '用户'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              {user?.roleLabel || user?.role || '现场人员'}
            </div>
          </motion.div>
        )}
      </div>
    </motion.aside>
  )
}

export default Sidebar
