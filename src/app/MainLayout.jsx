import React, { useEffect, useState } from 'react'
import { Avatar, Badge, Button, Layout, List, Menu, Popover, Tooltip, Typography } from 'antd'
import {
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { MENU_ITEMS } from './menu.config'
import { getMenuKeyByPath } from './route-map'
import { resolveIcon } from './icon-map'
import { useAuth } from '../hooks/useAuth'
import { useNotificationContext } from '../contexts/NotificationContext'
import GlobalSearch from '../components/GlobalSearch/GlobalSearch'

const { Header, Sider, Content } = Layout
const { Text } = Typography

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { unreadCount, recent, markRead, markAllRead } = useNotificationContext()

  const selectedKey = getMenuKeyByPath(location.pathname)
  const displayName = user?.full_name || user?.name || user?.username || '未命名用户'

  useEffect(() => {
    const handler = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleMenuClick = ({ key }) => {
    const target = MENU_ITEMS.find(item => item.key === key)
    if (target) navigate(target.path)
  }

  const menuItems = React.useMemo(
    () =>
      MENU_ITEMS.map(item => ({
        ...item,
        icon: item.iconKey ? React.createElement(resolveIcon(item.iconKey)) : null,
      })),
    []
  )

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Layout className="pms-app-shell" style={styles.shell}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={252}
        collapsedWidth={76}
        style={styles.sider}
      >
        <div style={{ ...styles.brand, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={styles.brandMark}>P</div>
          {!collapsed && (
            <div style={styles.brandText}>
              <Text strong style={styles.brandName}>
                PMS 控制台
              </Text>
              <Text style={styles.brandSubline}>项目运营管理</Text>
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={styles.menu}
        />

        <div style={{ ...styles.userDock, alignItems: collapsed ? 'center' : 'stretch' }}>
          <div style={{ ...styles.userSummary, justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <Avatar style={styles.avatar}>{displayName.slice(0, 1).toUpperCase()}</Avatar>
            {!collapsed && (
              <div style={styles.userText}>
                <div style={styles.userName}>{displayName}</div>
                <div style={styles.userRole}>{user?.role || 'member'}</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} style={styles.logoutBtn}>
              退出
            </Button>
          )}
        </div>
      </Sider>

      <Layout style={styles.main}>
        <Header className="pms-shell-header" style={styles.header}>
          <div style={styles.headerLeft}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(prev => !prev)}
              style={styles.iconButton}
            />
            <button type="button" className="pms-shell-search" style={styles.searchBox} onClick={() => setSearchOpen(true)}>
              <SearchOutlined style={{ color: 'var(--color-text-muted)' }} />
              <span style={styles.searchText}>搜索项目、隐患、报告</span>
              <span style={styles.shortcut}>⌘K</span>
            </button>
          </div>

          <div style={styles.headerRight}>
            <Popover
              trigger="click"
              open={notifOpen}
              onOpenChange={setNotifOpen}
              placement="bottomRight"
              title={
                <div style={styles.popoverTitle}>
                  <span style={styles.popoverHeading}>通知中心</span>
                  {unreadCount > 0 && (
                    <Button type="link" size="small" onClick={markAllRead} style={styles.linkBtn}>
                      全部已读
                    </Button>
                  )}
                </div>
              }
              content={
                <div style={styles.notificationPanel}>
                  {recent.length === 0 ? (
                    <div style={styles.emptyNotice}>暂无通知</div>
                  ) : (
                    <List
                      size="small"
                      dataSource={recent}
                      renderItem={item => (
                        <List.Item
                          style={{
                            ...styles.notificationItem,
                            background: item.is_read ? 'transparent' : 'var(--color-primary-bg-light)',
                          }}
                          onClick={() => {
                            if (!item.is_read) markRead(item.id)
                            setNotifOpen(false)
                            navigate('/notifications')
                          }}
                        >
                          <List.Item.Meta
                            title={
                              <span style={{ ...styles.notificationTitle, fontWeight: item.is_read ? 500 : 700 }}>
                                {item.title}
                              </span>
                            }
                            description={<span style={styles.notificationDesc}>{item.content}</span>}
                          />
                        </List.Item>
                      )}
                    />
                  )}
                  <div style={styles.panelFooter}>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setNotifOpen(false)
                        navigate('/notifications')
                      }}
                    >
                      查看全部
                    </Button>
                  </div>
                </div>
              }
            >
              <Tooltip title="通知">
                <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                  <Button type="text" icon={<BellOutlined />} style={styles.iconButton} />
                </Badge>
              </Tooltip>
            </Popover>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/hazards')} style={styles.cta}>
              随手拍
            </Button>
          </div>
        </Header>
        <Content style={styles.content}>
          <Outlet />
        </Content>
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      </Layout>
    </Layout>
  )
}

const styles = {
  shell: {
    minHeight: '100dvh',
    background: 'var(--color-background)',
  },
  sider: {
    position: 'sticky',
    top: 0,
    height: '100dvh',
    overflow: 'hidden',
    background: 'var(--color-sidebar)',
    borderRight: '1px solid var(--color-border)',
  },
  brand: {
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 18px',
    borderBottom: '1px solid var(--color-border-light)',
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    letterSpacing: 0,
    boxShadow: '0 10px 24px rgba(15, 118, 110, 0.24)',
    flex: '0 0 auto',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  brandName: {
    fontSize: 16,
    color: 'var(--color-sidebar-text)',
    lineHeight: 1.2,
  },
  brandSubline: {
    marginTop: 2,
    fontSize: 12,
    color: 'var(--color-sidebar-text-muted)',
  },
  menu: {
    borderInlineEnd: 'none',
    paddingTop: 12,
    background: 'transparent',
  },
  userDock: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 10,
    border: '1px solid var(--color-border-light)',
    borderRadius: 14,
    background: 'var(--color-surface-container-lowest)',
    boxShadow: 'var(--shadow-sm)',
  },
  userSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  avatar: {
    background: 'var(--color-primary)',
    color: '#ffffff',
    fontWeight: 700,
    flex: '0 0 auto',
  },
  userText: {
    minWidth: 0,
  },
  userName: {
    color: 'var(--color-on-surface)',
    fontSize: 13,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userRole: {
    color: 'var(--color-text-muted)',
    fontSize: 12,
  },
  logoutBtn: {
    justifyContent: 'flex-start',
    color: 'var(--color-text-secondary)',
    paddingLeft: 4,
  },
  main: {
    minWidth: 0,
    background: 'var(--color-background)',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    height: 68,
    padding: '0 24px',
    background: 'rgba(255, 255, 255, 0.88)',
    borderBottom: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
    flex: 1,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    color: 'var(--color-text-secondary)',
  },
  searchBox: {
    width: 'min(420px, 46vw)',
    height: 40,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 12px',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface-container-lowest)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
  },
  searchText: {
    flex: 1,
    textAlign: 'left',
    fontSize: 13,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  shortcut: {
    padding: '2px 6px',
    borderRadius: 6,
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-muted)',
    fontSize: 11,
    lineHeight: 1.2,
  },
  cta: {
    background: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
    fontWeight: 700,
  },
  content: {
    minHeight: 0,
    background: 'radial-gradient(circle at top right, rgba(15, 118, 110, 0.08), transparent 28rem), var(--color-background)',
  },
  popoverTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 24,
  },
  popoverHeading: {
    color: 'var(--color-on-surface)',
    fontSize: 14,
    fontWeight: 700,
  },
  linkBtn: {
    color: 'var(--color-primary)',
    fontSize: 12,
    padding: 0,
  },
  notificationPanel: {
    width: 340,
    maxHeight: 420,
    overflowY: 'auto',
  },
  emptyNotice: {
    color: 'var(--color-text-muted)',
    padding: '28px 0',
    textAlign: 'center',
  },
  notificationItem: {
    padding: '10px 8px',
    borderRadius: 10,
    cursor: 'pointer',
  },
  notificationTitle: {
    color: 'var(--color-on-surface)',
    fontSize: 13,
  },
  notificationDesc: {
    color: 'var(--color-on-surface-variant)',
    fontSize: 12,
  },
  panelFooter: {
    marginTop: 4,
    paddingTop: 8,
    textAlign: 'center',
    borderTop: '1px solid var(--color-border-light)',
  },
}
