import { useCallback, useEffect, useMemo, useState } from 'react'
import { reportsFeatureApi } from '../api'

export const REPORT_TYPES = {
  daily: { label: '日报', bg: '#dbeafe', color: '#1e40af' },
  weekly: { label: '周报', bg: '#dcfce7', color: '#166534' },
  monthly: { label: '月报', bg: '#fef3c7', color: '#92400e' },
}

export const STATUS_MAP = {
  draft: { label: '草稿', bg: '#f3f4f6', color: '#6b7280' },
  pending: { label: '待审批', bg: '#fef3c7', color: '#92400e' },
  submitted: { label: '待审批', bg: '#fef3c7', color: '#92400e' },
  approved: { label: '已通过', bg: '#dcfce7', color: '#166534' },
  rejected: { label: '已驳回', bg: '#fee2e2', color: '#991b1b' },
}

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? response
}

function rows(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  return []
}

function displayUser(value) {
  if (!value) return '-'
  if (typeof value === 'string') return value
  return value.full_name || value.username || value.name || '-'
}

function displayContent(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.text || value.summary || value.content || JSON.stringify(value)
}

export function normalizeReport(raw) {
  const type = raw.type ?? raw.report_type ?? 'daily'
  const content = raw.content ?? raw.progress ?? raw.summary ?? ''
  return {
    id: raw.id,
    type,
    title: raw.title ?? `${REPORT_TYPES[type]?.label || '报告'} - ${raw.created_at || ''}`,
    project: raw.project ?? raw.project_name ?? raw.project_id ?? '-',
    author: displayUser(raw.author ?? raw.author_name ?? raw.created_by_name),
    dept: raw.dept ?? raw.department ?? raw.department_name ?? '-',
    createTime: raw.createTime ?? raw.created_at ?? '-',
    status: raw.status ?? 'draft',
    progress: displayContent(content),
    stats: raw.stats ?? {
      completed: raw.completed_count ?? 0,
      pending: raw.pending_count ?? 0,
      issues: raw.issue_count ?? 0,
    },
  }
}

export function useReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await reportsFeatureApi.list({ page: 1, page_size: 100 })
      setReports(rows(unwrap(response)).map(normalizeReport))
    } catch (err) {
      setReports([])
      setError(err?.message || '报告列表加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const submitReport = useCallback(
    async values => {
      await reportsFeatureApi.submit(values)
      await loadReports()
    },
    [loadReports]
  )

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const stats = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter(report => ['pending', 'submitted'].includes(report.status)).length,
      approved: reports.filter(report => report.status === 'approved').length,
    }),
    [reports]
  )

  return { reports, stats, loading, error, reload: loadReports, submitReport }
}
