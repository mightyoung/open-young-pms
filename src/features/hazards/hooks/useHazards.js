import { useCallback, useEffect, useMemo, useState } from 'react'
import { hazardsFeatureApi } from '../api'

export const STATUS_MAP = {
  pending: { label: '待分配', bg: '#fef3c7', color: '#92400e' },
  assigned: { label: '已分配', bg: '#dbeafe', color: '#1e40af' },
  confirmed: { label: '已确认', bg: '#dbeafe', color: '#1e40af' },
  rectifying: { label: '整改中', bg: '#fef3c7', color: '#f97316' },
  pending_acceptance: { label: '待验收', bg: '#fce7f3', color: '#be185d' },
  closed: { label: '已关闭', bg: '#dcfce7', color: '#166534' },
  rejected: { label: '已驳回', bg: '#fee2e2', color: '#991b1b' },
}

export const TYPE_MAP = {
  safety: { label: '安全隐患', bg: '#fee2e2', color: '#991b1b' },
  quality: { label: '质量缺陷', bg: '#fef3c7', color: '#92400e' },
  environment: { label: '环境问题', bg: '#dcfce7', color: '#166534' },
  other: { label: '其他', bg: '#f3f4f6', color: '#6b7280' },
}

export const LEVEL_MAP = {
  urgent: { label: '紧急', bg: '#fee2e2', color: '#991b1b' },
  major: { label: '重大', bg: '#fef3c7', color: '#92400e' },
  general: { label: '一般', bg: '#dbeafe', color: '#1e40af' },
}

export const AUTO_DISPATCH_RULES = [
  { type: 'safety', level: 'urgent', target: '安全主管' },
  { type: 'safety', level: 'major', target: '专职安全员' },
  { type: 'quality', level: 'major', target: '质量负责人' },
  { type: 'environment', level: 'general', target: '环保专员' },
]

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? response
}

function rows(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  return []
}

export function normalizeHazard(raw) {
  const rawType = raw.type ?? raw.hazard_type
  const rawLevel = raw.level ?? raw.urgency ?? 'general'
  return {
    id: raw.id,
    title: raw.title ?? raw.name ?? '未命名隐患',
    type: TYPE_MAP[rawType] ? rawType : 'other',
    level: LEVEL_MAP[rawLevel] ? rawLevel : 'general',
    status: raw.status ?? 'pending',
    location: raw.location ?? '-',
    reporter: raw.reporter ?? raw.reporter_name ?? raw.created_by_name ?? '-',
    assignee: raw.assignee ?? raw.assignee_name ?? raw.assigned_to_name ?? '待分配',
    phone: raw.phone ?? raw.contact_phone ?? '-',
    desc: raw.desc ?? raw.description ?? '',
    photos: Array.isArray(raw.photos) ? raw.photos.length : Number(raw.photo_count ?? 0),
    gps: raw.gps ?? raw.geo_location ?? '-',
    createTime: raw.createTime ?? raw.created_at ?? '-',
    deadline: raw.deadline ?? raw.due_at ?? '-',
  }
}

export function useHazards() {
  const [data, setData] = useState([])
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadHazards = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await hazardsFeatureApi.list({ page: 1, page_size: 100 })
      setData(rows(unwrap(response)).map(normalizeHazard))
    } catch (err) {
      setData([])
      setError(err?.message || '隐患列表加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const createHazard = useCallback(
    async values => {
      await hazardsFeatureApi.create(values)
      await loadHazards()
    },
    [loadHazards]
  )

  useEffect(() => {
    loadHazards()
  }, [loadHazards])

  const filtered = useMemo(
    () => (tab === 'all' ? data : data.filter(item => item.status === tab)),
    [data, tab]
  )

  const stats = useMemo(
    () => ({
      total: data.length,
      pending: data.filter(item => ['pending', 'assigned', 'confirmed'].includes(item.status)).length,
      rectifying: data.filter(item => ['rectifying', 'pending_acceptance'].includes(item.status)).length,
      closed: data.filter(item => item.status === 'closed').length,
    }),
    [data]
  )

  return { data, filtered, stats, tab, setTab, loading, error, reload: loadHazards, createHazard }
}
