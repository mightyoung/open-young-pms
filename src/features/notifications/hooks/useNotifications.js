import { useState, useCallback } from 'react'
import { notificationsFeatureApi } from '../api'

const timeAgo = t => {
  if (!t) return ''
  const diff = (Date.now() - new Date(t)) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${Math.floor(diff / 86400)}天前`
}

export { timeAgo }

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const res = await notificationsFeatureApi.list(params)
      const items = res?.items || res?.data?.items || []
      setNotifications(items)
      setUnreadCount(res?.unread_count || res?.data?.unread_count || 0)
    } catch {
      // keep empty state on error
    } finally {
      setLoading(false)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await notificationsFeatureApi.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch {}
  }, [])

  const markRead = useCallback(async record => {
    if (record.is_read) return
    try {
      await notificationsFeatureApi.markRead(record.id)
      setNotifications(prev =>
        prev.map(n => (n.id === record.id ? { ...n, is_read: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }, [])

  return {
    notifications,
    unreadCount,
    loading,
    load,
    markAllRead,
    markRead,
  }
}
