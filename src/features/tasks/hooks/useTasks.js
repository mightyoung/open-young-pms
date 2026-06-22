import { useCallback, useEffect, useMemo, useState } from 'react'
import { calculateCriticalPath, findResourceConflicts, wbsToTree } from '../../../utils/wbs'
import { tasksFeatureApi } from '../api'

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? response
}

function normalizeRows(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  return []
}

function displayUser(value, fallback = '-') {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value.full_name || value.username || value.name || fallback
}

function normalizeStatus(status) {
  const value = status || 'pending'
  if (value === 'in_progress' || value === 'active') return 'inprogress'
  if (value === 'completed') return 'done'
  return value
}

function normalizeTask(raw, index) {
  const depends = raw.depends ?? raw.dependencies ?? raw.predecessor_ids ?? []
  return {
    id: raw.id ?? index + 1,
    wbs: raw.wbs ?? raw.wbs_code ?? raw.code ?? String(index + 1),
    title: raw.title ?? raw.name ?? '未命名任务',
    phase: raw.phase ?? raw.phase_name ?? '-',
    assignee: displayUser(raw.assignee, raw.assignee_name ?? raw.owner_name ?? '-'),
    startDate: raw.startDate ?? raw.planned_start ?? raw.start_date ?? '-',
    endDate: raw.endDate ?? raw.planned_end ?? raw.end_date ?? raw.due_date ?? '-',
    progress: Number(raw.progress ?? raw.progress_percent ?? 0),
    status: normalizeStatus(raw.status),
    priority: raw.priority ?? 'medium',
    duration: Number(raw.duration ?? raw.estimated_days ?? 1),
    depends: Array.isArray(depends) ? depends : [],
    critical: Boolean(raw.critical),
    parentKey: raw.parentKey ?? raw.parent_id ?? null,
  }
}

function toWbsTreeRows(tasks) {
  return tasks.map(task => ({
    id: String(task.id),
    title: `${task.wbs ? `${task.wbs} ` : ''}${task.title}`,
    parentKey: task.parentKey ? String(task.parentKey) : null,
    wbs: task.wbs,
    progress: task.progress,
  }))
}

export function useTasks(projectId) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = projectId
        ? await tasksFeatureApi.tree(projectId)
        : await tasksFeatureApi.list({ page: 1, page_size: 200 })
      const rows = normalizeRows(unwrap(response))
      setTasks(rows.map(normalizeTask))
    } catch (err) {
      setTasks([])
      setError(err?.message || '任务列表加载失败')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const criticalIds = useMemo(() => calculateCriticalPath(tasks), [tasks])
  const criticalTasks = useMemo(() => tasks.filter(task => criticalIds.includes(task.id)), [tasks, criticalIds])
  const teamMembers = useMemo(
    () => Array.from(new Set(tasks.map(task => task.assignee).filter(Boolean))),
    [tasks]
  )
  const conflicts = useMemo(() => findResourceConflicts(tasks, teamMembers), [tasks, teamMembers])
  const wbsTreeData = useMemo(() => wbsToTree(toWbsTreeRows(tasks)), [tasks])
  const resourceData = useMemo(
    () =>
      teamMembers.map(member => ({
        name: member,
        tasks: tasks.filter(task => task.assignee === member).length,
        inProgress: tasks.filter(
          task => task.assignee === member && task.status === 'inprogress'
        ).length,
        done: tasks.filter(task => task.assignee === member && task.status === 'done').length,
      })),
    [tasks, teamMembers]
  )

  return {
    tasks,
    loading,
    error,
    reload: loadTasks,
    criticalIds,
    criticalTasks,
    conflicts,
    wbsTreeData,
    resourceData,
    teamMembers,
  }
}
