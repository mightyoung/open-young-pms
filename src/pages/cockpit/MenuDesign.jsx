import React, { useState } from 'react'
import { Layout, Menu, Input, Badge, Avatar, Dropdown, Button, Tooltip, Tour } from 'antd'
import {
  LayoutDashboard,
  Kanban,
  Calendar,
  BarChart3,
  Activity,
  BarChart,
  FolderKanban,
  AlertTriangle,
  Shield,
  FileSearch,
  GitBranch,
  ClipboardList,
  FileText,
  PieChart,
  CheckCircle2,
  Clock,
  MessageCircle,
  BookOpen,
  FileText as FileTextIcon,
  Users,
  Settings,
  UserCog,
  Bell,
  Search,
  LogOut,
  User,
  Cog,
  Database,
  Printer,
  Clipboard,
  BellRing,
  Truck,
  Flag,
  MessageSquare,
} from 'lucide-react'

const { Sider, Header, Content } = Layout
const { SubMenu } = Menu

// ============ 优化后的菜单结构 ============
// 设计原则：扁平化、分组合理、常用优先、次要隐藏
const OPTIMIZED_MENU = [
  // 第1组：核心入口（始终可见）
  {
    key: 'group-core',
    icon: <LayoutDashboard size={16} />,
    label: '核心入口',
    children: [
      { key: 'dashboard', label: '仪表盘', icon: <LayoutDashboard size={16} /> },
      { key: 'kanban', label: '看板', icon: <Kanban size={16} /> },
    ],
  },
  // 第2组：驾驶舱（高层专用）
  {
    key: 'group-cockpit',
    icon: <BarChart3 size={16} />,
    label: '驾驶舱',
    children: [
      {
        key: 'strategic-cockpit',
        label: '司令舱',
        icon: <BarChart3 size={16} />,
        badge: null,
        desc: '高管专用',
      },
      {
        key: 'tactical-cockpit',
        label: '指挥台',
        icon: <BarChart size={16} />,
        desc: '部门长专用',
      },
      {
        key: 'operational-cockpit',
        label: '作战台',
        icon: <Activity size={16} />,
        desc: '项目经理专用',
      },
    ],
  },
  // 第3组：项目管理（核心业务）
  {
    key: 'group-project',
    icon: <FolderKanban size={16} />,
    label: '项目管理',
    children: [
      { key: 'projects', label: '项目列表', icon: <FolderKanban size={16} /> },
      { key: 'hazards', label: '随手拍', icon: <AlertTriangle size={16} />, badge: 3 },
      { key: 'gantt', label: '甘特图', icon: <GitBranch size={16} /> },
    ],
  },
  // 第4组：报告与审批
  {
    key: 'group-workflow',
    icon: <ClipboardList size={16} />,
    label: '工作流',
    children: [
      { key: 'report-write', label: '填写报告', icon: <FileText size={16} /> },
      { key: 'reports', label: '报告中心', icon: <ClipboardList size={16} /> },
      { key: 'approval', label: '审批中心', icon: <CheckCircle2 size={16} />, badge: 5 },
    ],
  },
  // 第5组：AI与知识
  {
    key: 'group-ai',
    icon: <MessageCircle size={16} />,
    label: '智能',
    children: [
      { key: 'ai', label: 'AI 助手', icon: <MessageCircle size={16} />, desc: '智能问答' },
      { key: 'docs', label: '文档中心', icon: <FileTextIcon size={16} /> },
      { key: 'knowledge', label: '知识库', icon: <BookOpen size={16} /> },
    ],
  },
  // 第6组：配置管理（可折叠）
  {
    key: 'group-system',
    icon: <Cog size={16} />,
    label: '系统',
    children: [
      { key: 'users', label: '用户管理', icon: <UserCog size={16} /> },
      { key: 'organization', label: '组织管理', icon: <Users size={16} /> },
      { key: 'quality', label: '质量管理', icon: <Flag size={16} /> },
      { key: 'contracts', label: '合同管理', icon: <FileTextIcon size={16} /> },
      { key: 'budget', label: '预算管理', icon: <BarChart size={16} /> },
      { key: 'resources', label: '资源管理', icon: <Truck size={16} /> },
      { key: 'data-gov', label: '数据治理', icon: <Database size={16} /> },
      { key: 'audit', label: '审计日志', icon: <Shield size={16} /> },
    ],
  },
]

// 底部固定菜单
const BOTTOM_MENU = [
  { key: 'notifications', label: '通知中心', icon: <Bell size={16} />, badge: 3 },
  { key: 'settings', label: '个人设置', icon: <Settings size={16} /> },
]

const COLORS = {
  primary: '#115cb9',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
  bg: '#f5f7fa',
  sidebar: '#1a1a2e',
  sidebarText: 'rgba(255,255,255,0.85)',
  sidebarTextMuted: 'rgba(255,255,255,0.45)',
  border: 'rgba(255,255,255,0.1)',
}

export default function OptimizedMenu() {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedKey, setSelectedKey] = useState('dashboard')
  const [openKeys, setOpenKeys] = useState(['group-core'])

  const renderMenuItem = item => {
    if (item.children) {
      return (
        <SubMenu
          key={item.key}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: COLORS.sidebarTextMuted }}>{item.icon}</span>
              <span style={{ color: COLORS.sidebarText }}>{item.label}</span>
            </div>
          }
          popupClassName="custom-submenu"
        >
          {item.children.map(child => (
            <Menu.Item
              key={child.key}
              style={{
                paddingLeft: 24,
                margin: '2px 8px',
                borderRadius: 8,
                height: 40,
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      color: selectedKey === child.key ? COLORS.primary : COLORS.sidebarTextMuted,
                    }}
                  >
                    {child.icon}
                  </span>
                  <span
                    style={{
                      color:
                        selectedKey === child.key ? COLORS.sidebarText : COLORS.sidebarTextMuted,
                    }}
                  >
                    {child.label}
                  </span>
                </div>
                {child.badge && (
                  <Badge
                    count={child.badge}
                    size="small"
                    style={{ backgroundColor: COLORS.danger }}
                  />
                )}
              </div>
            </Menu.Item>
          ))}
        </SubMenu>
      )
    }
    return <Menu.Item key={item.key} style={{ display: 'none' }} />
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        style={{
          background: COLORS.sidebar,
          borderRight: `1px solid ${COLORS.border}`,
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            borderBottom: `1px solid ${COLORS.border}`,
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${COLORS.primary}, #1890ff)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 16,
            }}
          >
            P
          </div>
          {!collapsed && (
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>ProjectX</div>
              <div style={{ color: COLORS.sidebarTextMuted, fontSize: 11 }}>项目管理信息系统</div>
            </div>
          )}
        </div>

        {/* 搜索框 */}
        {!collapsed && (
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}` }}>
            <Input
              prefix={<Search size={14} color={COLORS.sidebarTextMuted} />}
              placeholder="搜索菜单..."
              size="small"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: 8,
                color: COLORS.sidebarText,
              }}
            />
          </div>
        )}

        {/* 菜单 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 64px - 60px - 64px)',
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            onClick={({ key }) => setSelectedKey(key)}
            style={{
              background: 'transparent',
              border: 'none',
              flex: 1,
              overflowY: 'auto',
            }}
            theme="dark"
          >
            {OPTIMIZED_MENU.map(item => renderMenuItem(item))}
          </Menu>
        </div>

        {/* 底部菜单 */}
        <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: '8px' }}>
          {BOTTOM_MENU.map(item => (
            <Tooltip key={item.key} title={collapsed ? item.label : ''} placement="right">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: COLORS.sidebarTextMuted,
                  transition: 'all 0.2s',
                }}
              >
                <Badge count={item.badge} size="small" style={{ backgroundColor: COLORS.danger }}>
                  <span style={{ color: COLORS.sidebarTextMuted }}>{item.icon}</span>
                </Badge>
                {!collapsed && <span style={{ color: COLORS.sidebarText }}>{item.label}</span>}
              </div>
            </Tooltip>
          ))}
        </div>

        {/* 用户信息 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: collapsed ? '12px' : '12px 16px',
            borderTop: `1px solid ${COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Avatar
            size={32}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary}, #1890ff)` }}
          >
            项目
          </Avatar>
          {!collapsed && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div
                style={{
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                项目经理
              </div>
              <div style={{ color: COLORS.sidebarTextMuted, fontSize: 11 }}>管理员</div>
            </div>
          )}
        </div>
      </Sider>

      {/* 主内容区 */}
      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            background: '#fff',
            padding: '16px 28px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="text"
              icon={collapsed ? <LayoutDashboard size={18} /> : null}
              onClick={() => setCollapsed(!collapsed)}
            />
            <Input
              prefix={<Search size={14} />}
              placeholder="搜索任务、成员、文档..."
              style={{ width: 300, borderRadius: 8 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge count={3} size="small">
              <Button type="text" icon={<Bell size={18} />} />
            </Badge>
            <Button type="text" icon={<Settings size={18} />} />
          </div>
        </Header>
        <Content style={{ padding: 24, background: COLORS.bg, minHeight: 'calc(100vh - 65px)' }}>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <h2 style={{ color: '#323235' }}>优化后的菜单布局</h2>
            <p style={{ color: '#8c8c8c' }}>点击左侧菜单查看效果</p>
            <div
              style={{
                marginTop: 24,
                color: '#8c8c8c',
                fontSize: 13,
                textAlign: 'left',
                maxWidth: 600,
                margin: '24px auto',
                lineHeight: 1.8,
              }}
            >
              <h4 style={{ color: '#323235' }}>优化要点：</h4>
              <ul>
                <li>
                  <strong>分组精简：</strong>从 11 组减少到 6 组，更易记忆
                </li>
                <li>
                  <strong>层级扁平：</strong>核心入口 2 层，避免深层嵌套
                </li>
                <li>
                  <strong>常用优先：</strong>仪表盘、看板、随手拍等高频功能置顶
                </li>
                <li>
                  <strong>智能分组：</strong>AI 与知识库独立分组，突出智能化定位
                </li>
                <li>
                  <strong>快捷入口：</strong>搜索框 + 通知Badge + 个人设置
                </li>
                <li>
                  <strong>视觉层次：</strong>图标 + 标签 + 徽章多维度标识
                </li>
              </ul>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
