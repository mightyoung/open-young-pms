import { useState, useMemo, useCallback } from 'react'
import { message } from 'antd'
// projectsFeatureApi available for real API integration: import { projectsFeatureApi } from '../api'

const MOCK_PROJECTS = [
  {
    id: 1,
    name: 'J-2X高精线联调项目',
    code: 'PRJ-2026-001',
    status: 'executing',
    progress: 78,
    party_a: 'XX装备集团',
    party_b: '我公司',
    leader: '张经理',
    dept: '工程部',
    start: '2026-01-01',
    end: '2026-06-30',
    budget: 850,
    spent: 623,
    hazards: 12,
    risks: 3,
    members: 8,
  },
  {
    id: 2,
    name: 'O3厂区建设项目',
    code: 'PRJ-2026-002',
    status: 'planning',
    progress: 25,
    party_a: 'XX化工集团',
    party_b: '我公司',
    leader: '李经理',
    dept: '工程部',
    start: '2026-03-01',
    end: '2026-12-31',
    budget: 1200,
    spent: 180,
    hazards: 3,
    risks: 5,
    members: 5,
  },
  {
    id: 3,
    name: '高压管路安装工程',
    code: 'PRJ-2026-003',
    status: 'executing',
    progress: 55,
    party_a: 'YY能源公司',
    party_b: '我公司',
    leader: '王经理',
    dept: '安装部',
    start: '2025-11-01',
    end: '2026-08-30',
    budget: 450,
    spent: 298,
    hazards: 8,
    risks: 2,
    members: 6,
  },
  {
    id: 4,
    name: '软件系统集成项目',
    code: 'PRJ-2026-004',
    status: 'bidding',
    progress: 10,
    party_a: 'ZZ科技公司',
    party_b: '我公司',
    leader: '刘经理',
    dept: '信息部',
    start: '2026-04-01',
    end: '2026-10-31',
    budget: 320,
    spent: 30,
    hazards: 0,
    risks: 4,
    members: 4,
  },
  {
    id: 5,
    name: '环保设备升级项目',
    code: 'PRJ-2025-015',
    status: 'completed',
    progress: 100,
    party_a: 'WW环保集团',
    party_b: '我公司',
    leader: '陈经理',
    dept: '工程部',
    start: '2025-01-01',
    end: '2025-12-31',
    budget: 600,
    spent: 578,
    hazards: 5,
    risks: 1,
    members: 7,
  },
]

const MOCK_MEMBERS = [
  { id: 1, name: '张经理', role: '项目经理', dept: '工程部', avatar: '张' },
  { id: 2, name: '李工', role: '技术负责人', dept: '工程部', avatar: '李' },
  { id: 3, name: '王工', role: '安全员', dept: '安环部', avatar: '王' },
  { id: 4, name: '刘工', role: '施工员', dept: '安装部', avatar: '刘' },
  { id: 5, name: '陈工', role: '质量员', dept: '质量部', avatar: '陈' },
]

export const PROJ_STATUS = {
  planning: { label: '规划中', bg: '#dbeafe', color: '#1e40af' },
  bidding: { label: '招投标', bg: '#fef3c7', color: '#92400e' },
  executing: { label: '执行中', bg: '#dcfce7', color: '#166534' },
  suspended: { label: '已暂停', bg: '#f3f4f6', color: '#6b7280' },
  completed: { label: '已完成', bg: '#dcfce7', color: '#166534' },
  closed: { label: '已关闭', bg: '#f3f4f6', color: '#6b7280' },
}

export function useProjects() {
  const [data, setData] = useState(MOCK_PROJECTS)
  const [loading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = useMemo(
    () =>
      data.filter(p => {
        if (search && !p.name.includes(search) && !p.code.includes(search)) return false
        if (filterStatus && p.status !== filterStatus) return false
        return true
      }),
    [data, search, filterStatus]
  )

  const stats = useMemo(
    () => ({
      total: data.length,
      executing: data.filter(p => p.status === 'executing').length,
      planning: data.filter(p => p.status === 'planning').length,
      budgetTotal: data.reduce((s, p) => s + p.budget, 0),
      budgetSpent: data.reduce((s, p) => s + p.spent, 0),
    }),
    [data]
  )

  const createProject = useCallback(
    async values => {
      const newItem = {
        ...values,
        id: Date.now(),
        code: `PRJ-${new Date().getFullYear()}-${String(data.length + 1).padStart(3, '0')}`,
        progress: 0,
        members: 0,
        hazards: 0,
        risks: 0,
      }
      setData(prev => [newItem, ...prev])
      message.success('项目创建成功')
    },
    [data.length]
  )

  const updateProject = useCallback((id, values) => {
    setData(prev => prev.map(p => (p.id === id ? { ...p, ...values } : p)))
    message.success('项目更新成功')
  }, [])

  const deleteProject = useCallback(id => {
    setData(prev => prev.filter(p => p.id !== id))
    message.success('已删除')
  }, [])

  return {
    data,
    filtered,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    stats,
    createProject,
    updateProject,
    deleteProject,
    mockMembers: MOCK_MEMBERS,
  }
}
