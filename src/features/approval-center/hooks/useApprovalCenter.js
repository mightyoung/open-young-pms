import { useState, useCallback } from 'react'
import { approvalCenterFeatureApi } from '../api'

const TYPE_MAP = {
  report: { label: '报告', color: '#115cb9' },
  contract: { label: '合同', color: '#52c41a' },
  budget: { label: '预算', color: '#faad14' },
  schedule: { label: '进度', color: '#8b5cf6' },
}

const PRIORITY_MAP = {
  normal: { label: '普通', color: 'default' },
  high: { label: '紧急', color: 'orange' },
  urgent: { label: '加急', color: 'red' },
}

export { TYPE_MAP, PRIORITY_MAP }

export function useApprovalCenter() {
  const [pending, setPending] = useState([])
  const [approved] = useState([])
  const [rejected] = useState([])
  const [loading, setLoading] = useState(false)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await approvalCenterFeatureApi.listTasks({
        status: 'pending',
        page: 1,
        page_size: 100,
      })
      const data = res?.data?.data || res?.data || {}
      setPending(data.items || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  const approve = useCallback(async (taskId, comment) => {
    await approvalCenterFeatureApi.approve(taskId, { comment })
    setPending(prev => prev.filter(t => t.id !== taskId))
  }, [])

  const reject = useCallback(async (taskId, reason) => {
    await approvalCenterFeatureApi.reject(taskId, { reason })
    setPending(prev => prev.filter(t => t.id !== taskId))
  }, [])

  return {
    pending,
    approved,
    rejected,
    loading,
    loadTasks,
    approve,
    reject,
    TYPE_MAP,
    PRIORITY_MAP,
  }
}
