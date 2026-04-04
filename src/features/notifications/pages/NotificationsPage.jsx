import React, { useState, useEffect } from 'react'
import { Tag, Button } from 'antd'
import {
  CheckOutlined,
  BellOutlined,
  FileTextOutlined,
  WarningOutlined,
  AuditOutlined,
  MessageOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { PageHeader, EmptyState } from '../../../components/PMSComponents'
import { useNotifications, timeAgo } from '../hooks/useNotifications'

export const TYPE_MAP = {
  task: { label: '任务', icon: <FileTextOutlined />, bg: '#dbeafe', color: '#1e40af' },
  issue: { label: '隐患', icon: <WarningOutlined />, bg: '#fee2e2', color: '#991b1b' },
  report: { label: '报告', icon: <FileTextOutlined />, bg: '#fef3c7', color: '#92400e' },
  approval: { label: '审批', icon: <AuditOutlined />, bg: '#d5d1f2', color: '#484661' },
  system: { label: '系统', icon: <BellOutlined />, bg: '#f3f4f6', color: '#6b7280' },
  mention: { label: '@我', icon: <MessageOutlined />, bg: '#dcfce7', color: '#166534' },
}

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, load, markAllRead, markRead } = useNotifications()
  const [tab, setTab] = useState('all')
  const navigate = useNavigate()

  const handleLoad = async () => {
    const params = { page: 1, page_size: 50 }
    if (tab === 'unread') params.unread_only = true
    await load(params)
  }

  useEffect(() => {
    handleLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const filtered =
    tab === 'all' || tab === 'unread' ? notifications : notifications.filter(n => n.type === tab)

  const stats = {
    total: notifications.length,
    unread: unreadCount,
    byType: Object.entries(TYPE_MAP).reduce((acc, [k]) => {
      acc[k] = notifications.filter(n => n.type === k).length
      return acc
    }, {}),
  }

  return (
    <div style={styles.page}>
      <PageHeader
        title="消息中心"
        subtitle={unreadCount > 0 ? `您有 ${unreadCount} 条未读消息` : '暂无未读消息'}
        icon={<BellOutlined style={{ color: 'var(--color-primary)' }} />}
        actions={
          <Button
            icon={<SettingOutlined />}
            onClick={() => navigate('/notification-settings')}
            style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
          >
            通知设置
          </Button>
        }
      />

      <div style={styles.statsRow}>
        <div style={styles.statCard} onClick={() => setTab('all')}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>全部消息</div>
        </div>
        <div
          style={{ ...styles.statCard, borderLeft: '3px solid #fee2e2' }}
          onClick={() => setTab('unread')}
        >
          <div style={{ ...styles.statValue, color: '#991b1b' }}>{stats.unread}</div>
          <div style={styles.statLabel}>未读消息</div>
        </div>
        {Object.entries(TYPE_MAP)
          .slice(0, 4)
          .map(([k, v]) => (
            <div key={k} style={styles.statCard} onClick={() => setTab(k)}>
              <div style={{ ...styles.statValue, color: v.color }}>{stats.byType[k] || 0}</div>
              <div style={styles.statLabel}>{v.label}</div>
            </div>
          ))}
      </div>

      <div style={styles.filterBar}>
        <div style={styles.tabsWrapper}>
          {['all', 'unread'].map(key => (
            <button
              key={key}
              style={{
                ...styles.tab,
                ...(tab === key ? styles.tabActive : {}),
              }}
              onClick={() => setTab(key)}
            >
              {key === 'all' ? '全部' : '未读'}
              {key === 'all' && unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
            </button>
          ))}
        </div>
        <Button
          icon={<CheckOutlined />}
          onClick={markAllRead}
          disabled={unreadCount === 0}
          style={styles.markAllBtn}
        >
          全部已读
        </Button>
      </div>

      <div style={styles.listCard}>
        {loading ? (
          <div style={styles.loading}>加载中...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="暂无消息"
            description={tab === 'unread' ? '所有消息都已读' : '暂无消息记录'}
          />
        ) : (
          <div style={styles.list}>
            {filtered.map(notif => (
              <div
                key={notif.id}
                style={{
                  ...styles.notifItem,
                  background: notif.is_read ? 'transparent' : 'var(--color-primary-container)',
                }}
                onClick={() => markRead(notif)}
              >
                <div style={styles.notifIcon}>
                  <span
                    style={{
                      ...styles.iconWrapper,
                      background: TYPE_MAP[notif.type]?.bg || '#f3f4f6',
                      color: TYPE_MAP[notif.type]?.color || '#6b7280',
                    }}
                  >
                    {TYPE_MAP[notif.type]?.icon || <BellOutlined />}
                  </span>
                </div>
                <div style={styles.notifContent}>
                  <div style={styles.notifHeader}>
                    <Tag
                      style={{
                        ...styles.typeTag,
                        background: TYPE_MAP[notif.type]?.bg || '#f3f4f6',
                        color: TYPE_MAP[notif.type]?.color || '#6b7280',
                        border: 'none',
                      }}
                    >
                      {TYPE_MAP[notif.type]?.label || notif.type}
                    </Tag>
                    <span style={styles.notifTime}>{timeAgo(notif.created_at)}</span>
                  </div>
                  <div style={{ ...styles.notifTitle, fontWeight: notif.is_read ? 400 : 600 }}>
                    {notif.title}
                  </div>
                  <div style={styles.notifText}>{notif.content}</div>
                </div>
                {!notif.is_read && <div style={styles.unreadDot} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100vh' },
  statsRow: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  statCard: {
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px 20px',
    boxShadow: 'var(--shadow-soft)',
    cursor: 'pointer',
    minWidth: 100,
    borderLeft: '3px solid var(--color-primary)',
    transition: 'all 0.2s',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    fontFamily: 'var(--font-headline)',
    color: 'var(--color-on-surface)',
  },
  statLabel: { fontSize: 13, color: 'var(--color-on-surface-variant)', marginTop: 4 },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabsWrapper: {
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
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  tabActive: {
    background: 'var(--color-surface-container-lowest)',
    color: 'var(--color-primary)',
    boxShadow: 'var(--shadow-soft)',
  },
  badge: {
    background: '#991b1b',
    color: 'white',
    borderRadius: 'var(--radius-full)',
    padding: '0 6px',
    fontSize: 11,
    fontWeight: 600,
  },
  markAllBtn: { background: 'var(--color-surface-container-lowest)', border: 'none' },
  listCard: {
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-soft)',
  },
  loading: { textAlign: 'center', padding: 48, color: 'var(--color-on-surface-variant)' },
  list: { display: 'flex', flexDirection: 'column' },
  notifItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderBottom: '1px solid var(--color-outline-variant)',
    cursor: 'pointer',
    transition: 'background 0.2s',
    position: 'relative',
  },
  notifIcon: { flexShrink: 0 },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
  },
  notifContent: { flex: 1, minWidth: 0 },
  notifHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  typeTag: { fontSize: 12, padding: '0 6px' },
  notifTime: { fontSize: 12, color: 'var(--color-on-surface-variant)', marginLeft: 'auto' },
  notifTitle: { fontSize: 14, color: 'var(--color-on-surface)', marginBottom: 2 },
  notifText: {
    fontSize: 13,
    color: 'var(--color-on-surface-variant)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  unreadDot: {
    position: 'absolute',
    right: 16,
    top: 24,
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--color-primary)',
  },
}
