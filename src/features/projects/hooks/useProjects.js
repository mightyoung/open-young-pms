import { useCallback, useEffect, useMemo, useState } from 'react'
import { message } from 'antd'
import { projectsFeatureApi } from '../api'

export const PROJ_STATUS = {
  planning: { label: '规划中', bg: '#dbeafe', color: '#1e40af' },
  bidding: { label: '招投标', bg: '#fef3c7', color: '#92400e' },
  executing: { label: '执行中', bg: '#dcfce7', color: '#166534' },
  active: { label: '执行中', bg: '#dcfce7', color: '#166534' },
  suspended: { label: '已暂停', bg: '#f3f4f6', color: '#6b7280' },
  completed: { label: '已完成', bg: '#dcfce7', color: '#166534' },
  closed: { label: '已关闭', bg: '#f3f4f6', color: '#6b7280' },
  unknown: { label: '未知', bg: '#f3f4f6', color: '#6b7280' },
}

const EMPTY_MEMBERS = []

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? response
}

function normalizeProject(raw) {
  return {
    id: raw.id,
    name: raw.name ?? raw.title ?? '未命名项目',
    code: raw.code ?? raw.project_code ?? raw.id,
    status: raw.status ?? 'unknown',
    progress: Number(raw.progress ?? raw.completion_rate ?? 0),
    party_a: raw.party_a ?? raw.customer_name ?? '-',
    party_b: raw.party_b ?? raw.vendor_name ?? '-',
    leader: raw.leader ?? raw.manager_name ?? raw.owner_name ?? '-',
    dept: raw.dept ?? raw.department ?? raw.department_name ?? '-',
    start: raw.start ?? raw.start_date ?? '-',
    end: raw.end ?? raw.end_date ?? '-',
    budget: Number(raw.budget ?? raw.amount ?? 0),
    spent: Number(raw.spent ?? raw.actual_cost ?? 0),
    hazards: Number(raw.hazards ?? raw.hazard_count ?? 0),
    risks: Number(raw.risks ?? raw.risk_count ?? 0),
    members: Number(raw.members ?? raw.member_count ?? 0),
    description: raw.description ?? raw.desc ?? '',
  }
}

function normalizeList(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.items ?? payload?.data?.items ?? []
  return rows.map(normalizeProject)
}

export function useProjects() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await projectsFeatureApi.list({ page: 1, page_size: 100 })
      setData(normalizeList(unwrap(response)))
    } catch (err) {
      setData([])
      setError(err?.message || '项目列表加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const filtered = useMemo(
    () =>
      data.filter(project => {
        const matchSearch =
          !search || project.name.includes(search) || String(project.code || '').includes(search)
        const matchStatus = !filterStatus || project.status === filterStatus
        return matchSearch && matchStatus
      }),
    [data, search, filterStatus]
  )

  const stats = useMemo(
    () => ({
      total: data.length,
      executing: data.filter(project => ['executing', 'active'].includes(project.status)).length,
      planning: data.filter(project => project.status === 'planning').length,
      budgetTotal: data.reduce((sum, project) => sum + (Number(project.budget) || 0), 0),
    }),
    [data]
  )

  const createProject = useCallback(
    async values => {
      await projectsFeatureApi.create(values)
      message.success('项目已创建')
      await loadProjects()
    },
    [loadProjects]
  )

  const updateProject = useCallback(
    async (id, values) => {
      await projectsFeatureApi.update(id, values)
      message.success('项目已更新')
      await loadProjects()
    },
    [loadProjects]
  )

  const deleteProject = useCallback(
    async id => {
      await projectsFeatureApi.remove(id)
      message.success('项目已删除')
      await loadProjects()
    },
    [loadProjects]
  )

  return {
    data,
    filtered,
    loading,
    error,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    stats,
    reload: loadProjects,
    createProject,
    updateProject,
    deleteProject,
    members: EMPTY_MEMBERS,
  }
}
