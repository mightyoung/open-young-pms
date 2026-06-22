import { useState, useCallback } from 'react'
import { approvalCenterFeatureApi } from '../api'

const TYPE_MAP = {
  report: { label: '报告', color: '#115cb9' },
  contract: { label: '合同', color: '#52c41a' },
  budget: { label: '预算', color: '#faad14' },
  schedule: { label: '进度', color: '#8b5cf6' },
  project: { label: '项目', color: '#115cb9' },
  task: { label: '任务', color: '#8b5cf6' },
  hazard: { label: '隐患', color: '#ff4d4f' },
}

const PRIORITY_MAP = {
  normal: { label: '普通', color: 'default' },
  high: { label: '紧急', color: 'orange' },
  urgent: { label: '加急', color: 'red' },
}

export { TYPE_MAP, PRIORITY_MAP }

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? response
}

function rows(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

function userName(user) {
  if (!user) return '-'
  if (typeof user === 'string') return user
  return user.full_name || user.username || '-'
}

function normalizeTask(raw) {
  const title =
    raw.title ||
    raw.flow_name ||
    [raw.entity_type, raw.node_name].filter(Boolean).join(' - ') ||
    '待审批事项'

  return {
    id: raw.id,
    instanceId: raw.instance_id || raw.instanceId || raw.id,
    title,
    type: raw.entity_type || raw.type || 'report',
    applicant: raw.applicant || userName(raw.initiator),
    dept: raw.dept || raw.department || '-',
    submitTime: raw.submitTime || raw.created_at || '-',
    priority: raw.priority || 'normal',
    status: raw.status || 'pending',
  }
}

export function useApprovalCenter() {
  const [pending, setPending] = useState([])
  const [approved] = useState([])
  const [rejected] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await approvalCenterFeatureApi.listTasks()
      setPending(rows(unwrap(res)).map(normalizeTask))
    } catch (err) {
      setPending([])
      setError(err?.message || '审批任务加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const approve = useCallback(
    async (taskId, comment) => {
      const task = pending.find(item => item.id === taskId)
      const instanceId = task?.instanceId || taskId
      await approvalCenterFeatureApi.approve(instanceId, { comment })
      setPending(prev => prev.filter(t => t.id !== taskId))
    },
    [pending]
  )

  const reject = useCallback(
    async (taskId, reason) => {
      const task = pending.find(item => item.id === taskId)
      const instanceId = task?.instanceId || taskId
      await approvalCenterFeatureApi.reject(instanceId, { comment: reason })
      setPending(prev => prev.filter(t => t.id !== taskId))
    },
    [pending]
  )

  return {
    pending,
    approved,
    rejected,
    loading,
    error,
    stats: {
      pending: pending.length,
      approvedToday: approved.length,
      rejectedToday: rejected.length,
      avgTime: '-',
    },
    loadTasks,
    approve,
    reject,
    TYPE_MAP,
    PRIORITY_MAP,
  }
}
