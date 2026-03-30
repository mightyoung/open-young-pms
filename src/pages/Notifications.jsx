import React, { useState, useEffect } from 'react'
import EmptyState from '../components/EmptyState';
import { colors } from '../styles/theme'
import { Card, Tag, Button, Badge, Empty, Space } from 'antd'
import { CheckOutlined, BellOutlined, EyeOutlined } from '@ant-design/icons'
import { api } from '../api'
import ProTable from '../components/ProTable'
import SkeletonContent from '../components/SkeletonContent'

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

  const markRead = async (record) => {
    if (record.is_read) return
    try {
      await api.post(`/notifications/${record.id}/read`)
      setNotifications(prev => prev.map(n => n.id === record.id ? { ...n, is_read: true } : n))
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

  const baseColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: t => {
        const cfg = TYPE_MAP[t] || TYPE_MAP.system
        return <Tag color={cfg.color}>{cfg.label}</Tag>
      },
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (t, r) => (
        <span style={{ color: colors.text.primary, fontWeight: r.is_read ? 400 : 600 }}>{t}</span>
      ),
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      render: t => <span style={{ color: colors.text.muted, fontSize: 13 }}>{t}</span>,
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: t => <span style={{ color: colors.text.disabled, fontSize: 12 }}>{timeAgo(t)}</span>,
    },
    {
      title: '状态',
      dataIndex: 'is_read',
      key: 'is_read',
      render: v => v ? null : <Tag color="cyan">未读</Tag>,
    },
  ]

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
        {loading ? <SkeletonContent type='list' /> :
         filtered.length === 0 ? <EmptyState type="list" title="暂无消息" style={{ marginTop: 60 }} /> : (
          <ProTable
            dataSource={filtered}
            columns={baseColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 20, showTotal: t => `共 ${t} 条` }}
            extraActions={[
              { key: 'read', label: '标为已读', icon: <EyeOutlined />, onClick: markRead, showIcon: false },
            ]}
            onRow={record => ({
              onClick: () => markRead(record),
              style: { cursor: 'pointer', background: record.is_read ? 'transparent' : 'rgba(59,130,246,0.08)', borderRadius: 8 },
            })}
          />
        )}
      </Card>
    </div>
  )
}
