import React, { useState, useEffect } from 'react'
import { Avatar, Button, Badge, Layout, Menu, Typography, Tooltip, Popover, List } from 'antd'
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  BellOutlined,
  PlusOutlined,
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

  // Global search shortcut: Cmd+K (Mac) / Ctrl+K (Windows/Linux)
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
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={240}
        style={{ background: '#ffffff', borderRight: '1px solid #e5e7eb' }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: collapsed ? '0 16px' : '0 20px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: '#115cb9',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            P
          </div>
          {!collapsed && (
            <Text strong style={{ marginLeft: 12, fontSize: 16 }}>
              PMS 控制台
            </Text>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderInlineEnd: 'none', paddingTop: 12 }}
        />

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: collapsed ? 12 : 16,
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <Avatar style={{ background: '#115cb9' }}>
              {(user?.full_name || user?.name || user?.username || 'U').slice(0, 1)}
            </Avatar>
            {!collapsed && (
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#323235',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.full_name || user?.name || user?.username || '未命名用户'}
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>{user?.role || 'member'}</div>
              </div>
            )}
          </div>
          {!collapsed && <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} />}
        </div>
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 20px',
            background: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(prev => !prev)}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tooltip title="搜索 (⌘K)">
              <Button
                type="text"
                icon={<SearchOutlined />}
                onClick={() => setSearchOpen(true)}
                style={{ color: '#5f5f61' }}
              />
            </Tooltip>
            <Popover
              trigger="click"
              open={notifOpen}
              onOpenChange={setNotifOpen}
              placement="bottomRight"
              title={
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontWeight: 600, fontSize: 14 }}>通知中心</span>
                  {unreadCount > 0 && (
                    <Button
                      type="link"
                      size="small"
                      onClick={markAllRead}
                      style={{ fontSize: 12, padding: 0 }}
                    >
                      全部已读
                    </Button>
                  )}
                </div>
              }
              content={
                <div style={{ width: 320, maxHeight: 400, overflowY: 'auto' }}>
                  {recent.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: '#8c8c8c' }}>
                      暂无通知
                    </div>
                  ) : (
                    <List
                      size="small"
                      dataSource={recent}
                      renderItem={item => (
                        <List.Item
                          style={{
                            padding: '10px 0',
                            cursor: 'pointer',
                            background: item.is_read ? 'transparent' : '#f0f7ff',
                            borderRadius: 8,
                            paddingLeft: 8,
                          }}
                          onClick={() => {
                            if (!item.is_read) markRead(item.id)
                            setNotifOpen(false)
                            navigate('/notifications')
                          }}
                        >
                          <List.Item.Meta
                            title={
                              <span style={{ fontSize: 13, fontWeight: item.is_read ? 400 : 600 }}>
                                {item.title}
                              </span>
                            }
                            description={
                              <span style={{ fontSize: 12, color: '#8c8c8c' }}>{item.content}</span>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                  <div
                    style={{
                      textAlign: 'center',
                      borderTop: '1px solid #f0f0f0',
                      paddingTop: 8,
                      marginTop: 4,
                    }}
                  >
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setNotifOpen(false)
                        navigate('/notifications')
                      }}
                    >
                      查看全部 →
                    </Button>
                  </div>
                </div>
              }
            >
              <Tooltip title="通知">
                <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                  <Button type="text" icon={<BellOutlined />} style={{ color: '#5f5f61' }} />
                </Badge>
              </Tooltip>
            </Popover>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => navigate('/hazards')}
              style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
            >
              随手拍
            </Button>
          </div>
        </Header>
        <Content style={{ minHeight: 0 }}>
          <Outlet />
        </Content>
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      </Layout>
    </Layout>
  )
}
