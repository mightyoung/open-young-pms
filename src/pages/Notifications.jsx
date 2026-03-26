import React, { useState, useEffect } from 'react'
import { colors } from '../styles/theme'
import { Card, List, Tag, Button, Badge, Empty, Spin } from 'antd'
import { CheckOutlined, BellOutlined } from '@ant-design/icons'
import { api } from '../api'

const TYPE_MAP = {
  task: { label: '任务', color: 'blue' },
  issue: { label: '隐患', color: 'red' },
  report: { label: '报告', color: 'orange' },
  approval: { label: '审批', color: 'purple' },
  system: { label: '系统', color: 'default' },
  mention: { label: '@我', color: 'green' },
}

const timeAgo = (t) => {
  if (!t) return ''
  const diff = (Date.now() - new Date(t)) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff/60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff/3600)}小时前`
  return `${Math.floor(diff/86400)}天前`
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  const load = async () => {
    setLoading(true)
    try {
      const params = { page: 1, page_size: 50 }
      if (tab === 'unread') params.unread_only = true
      const res = await api.get('/notifications', { params })
      const items = res?.items || res?.data?.items || []
      setNotifications(items)
      setUnreadCount(res?.unread_count || res?.data?.unread_count || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [tab])

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (e) {}
  }

  const markRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (e) {}
  }

  const tabItems = [
    { key: 'all', label: <Badge count={unreadCount} size="small" offset={[6, -2]}><span>全部</span></Badge> },
    { key: 'unread', label: '未读' },
    { key: 'task', label: '任务' },
    { key: 'issue', label: '隐患' },
    { key: 'report', label: '报告' },
    { key: 'approval', label: '审批' },
  ]

  const filtered = tab === 'all' || tab === 'unread'
    ? notifications
    : notifications.filter(n => n.type === tab)

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ color: colors.text.primary, margin: 0 }}>
          <BellOutlined style={{ marginRight: 8 }} />消息中心
          {unreadCount > 0 && <Badge count={unreadCount} style={{ marginLeft: 8 }} />}
        </h2>
        <Button icon={<CheckOutlined />} onClick={markAllRead} disabled={unreadCount === 0}>全部已读</Button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabItems.map(t => (
          <Button key={t.key} type={tab === t.key ? 'primary' : 'default'} onClick={() => setTab(t.key)}>
            {typeof t.label === 'object' ? t.label.props.children : t.label}
          </Button>
        ))}
      </div>

      <Card style={{ background: colors.bg.card, border: '1px solid #3f3f46' }}>
        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div> :
         filtered.length === 0 ? <Empty description="暂无消息" style={{ marginTop: 60 }} /> : (
          <List
            dataSource={filtered}
            renderItem={item => {
              const cfg = TYPE_MAP[item.type] || TYPE_MAP.system
              return (
                <List.Item
                  style={{
                    background: item.is_read ? 'transparent' : 'rgba(59,130,246,0.08)',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 4,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => !item.is_read && markRead(item.id)}
                >
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Tag color={cfg.color}>{cfg.label}</Tag>
                      <span style={{ color: colors.text.primary, fontWeight: item.is_read ? 400 : 600 }}>{item.title}</span>
                      {!item.is_read && <Tag color="cyan" style={{ marginLeft: 'auto' }}>未读</Tag>}
                    </div>
                    <div style={{ color: colors.text.muted, fontSize: 13 }}>{item.content}</div>
                    <div style={{ color: colors.text.disabled, fontSize: 12, marginTop: 4 }}>{timeAgo(item.created_at)}</div>
                  </div>
                </List.Item>
              )
            }}
          />
        )}
      </Card>
    </div>
  )
}
