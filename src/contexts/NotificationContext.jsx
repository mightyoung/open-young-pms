/**
 * NotificationContext — global unread count shared across header badge and NotificationCenter dropdown.
 * Reads real unread count from the API so the bell badge always reflects current state.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { notificationsFeatureApi } from '../features/notifications/api'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await notificationsFeatureApi.list({ page: 1, page_size: 5 })
      const items = res?.items || res?.data?.items || []
      setRecent(items)
      // Backend returns unread_count at top level or nested
      const count = res?.unread_count ?? res?.data?.unread_count ?? 0
      setUnreadCount(count)
    } catch {
      // Non-critical: badge degrades gracefully
    } finally {
      setLoading(false)
    }
  }, [])

  // Poll every 60 seconds so badge stays fresh
  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 60_000)
    return () => clearInterval(interval)
  }, [refresh])

  const markAllRead = useCallback(async () => {
    try {
      await notificationsFeatureApi.markAllRead()
      setUnreadCount(0)
      setRecent(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch {}
  }, [])

  const markRead = useCallback(async id => {
    try {
      await notificationsFeatureApi.markRead(id)
      setUnreadCount(prev => Math.max(0, prev - 1))
      setRecent(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch {}
  }, [])

  return (
    <NotificationContext.Provider value={{ unreadCount, recent, loading, refresh, markAllRead, markRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotificationContext must be used inside <NotificationProvider>')
  return ctx
}
