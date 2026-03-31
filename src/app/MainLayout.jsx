import React from 'react'
import { Avatar, Button, Layout, Menu, Typography } from 'antd'
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { MENU_ITEMS } from './menu.config'
import { getMenuKeyByPath } from './route-map'
import { useAuth } from '../hooks/useAuth'

const { Header, Sider, Content } = Layout
const { Text } = Typography

export default function MainLayout() {
  const [collapsed, setCollapsed] = React.useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const selectedKey = getMenuKeyByPath(location.pathname)

  const handleMenuClick = ({ key }) => {
    const target = MENU_ITEMS.find((item) => item.key === key)
    if (target) navigate(target.path)
  }

  const menuItems = React.useMemo(
    () =>
      MENU_ITEMS.map((item) => ({
        ...item,
        icon: item.icon ? React.createElement(item.icon) : null,
      })),
    [],
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
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: collapsed ? '0 16px' : '0 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: '#115cb9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
            P
          </div>
          {!collapsed && <Text strong style={{ marginLeft: 12, fontSize: 16 }}>PMS 控制台</Text>}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderInlineEnd: 'none', paddingTop: 12 }}
        />

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: collapsed ? 12 : 16, borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <Avatar style={{ background: '#115cb9' }}>
              {(user?.full_name || user?.name || user?.username || 'U').slice(0, 1)}
            </Avatar>
            {!collapsed && (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#323235', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.full_name || user?.name || user?.username || '未命名用户'}
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>{user?.role || 'member'}</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} />
          )}
        </div>
      </Sider>

      <Layout>
        <Header style={{ padding: '0 20px', background: '#ffffff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((prev) => !prev)}
          />
          <Text type="secondary">第一批迁移：login / dashboard / users</Text>
        </Header>
        <Content style={{ minHeight: 0 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
