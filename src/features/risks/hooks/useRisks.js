import { useState } from 'react'

export const LEVEL_MAP = {
  high: { label: '高风险', bg: '#fee2e2', color: '#991b1b' },
  medium: { label: '中风险', bg: '#fef3c7', color: '#92400e' },
  low: { label: '低风险', bg: '#dcfce7', color: '#166534' },
}

export const STATUS_MAP = {
  identified: { label: '已识别', bg: '#dbeafe', color: '#1e40af' },
  monitoring: { label: '监控中', bg: '#fef3c7', color: '#92400e' },
  resolved: { label: '已解决', bg: '#dcfce7', color: '#166534' },
  accepted: { label: '已接受', bg: '#f3f4f6', color: '#6b7280' },
}

export const CAT_MAP = {
  safety: { label: '安全', bg: '#fee2e2', color: '#991b1b' },
  quality: { label: '质量', bg: '#fef3c7', color: '#92400e' },
  schedule: { label: '进度', bg: '#dbeafe', color: '#1e40af' },
  cost: { label: '成本', bg: '#fce7f3', color: '#be185d' },
  compliance: { label: '合规', bg: '#f3f4f6', color: '#6b7280' },
  other: { label: '其他', bg: '#f3f4f6', color: '#6b7280' },
}

const MOCK_RISKS = [
  {
    id: 1,
    code: 'RSK-2026-001',
    title: '关键设备交货延期',
    category: 'schedule',
    level: 'high',
    status: 'monitoring',
    project: 'J-2X高精线联调项目',
    probability: 70,
    impact: 80,
    score: 56,
    owner: '张经理',
    dueDate: '2026-04-10',
    desc: '高精度数控设备供应商产能紧张，存在延期交货风险，可能影响整体工期。',
    measures: ['与供应商签订延期违约条款', '备选供应商方案准备中', '调整安装计划至4月15日'],
  },
  {
    id: 2,
    code: 'RSK-2026-002',
    title: '设计变更导致返工',
    category: 'quality',
    level: 'high',
    status: 'monitoring',
    project: 'J-2X高精线联调项目',
    probability: 60,
    impact: 85,
    score: 51,
    owner: '李工',
    dueDate: '2026-04-05',
    desc: '设计院图纸与现场尺寸存在偏差，返工风险较高。',
    measures: ['联系设计院确认尺寸', '现场复核测量', '提前采购替代材料'],
  },
  {
    id: 3,
    code: 'RSK-2026-003',
    title: '施工人员安全风险',
    category: 'safety',
    level: 'medium',
    status: 'monitoring',
    project: '高压管路安装工程',
    probability: 40,
    impact: 90,
    score: 36,
    owner: '王经理',
    dueDate: '2026-05-31',
    desc: '高空作业和密闭空间作业存在安全风险。',
    measures: ['每日安全交底', '配备安全监护人员', '特种作业持证上岗'],
  },
  {
    id: 4,
    code: 'RSK-2026-004',
    title: '预算超支风险',
    category: 'cost',
    level: 'medium',
    status: 'identified',
    project: 'J-2X高精线联调项目',
    probability: 50,
    impact: 70,
    score: 35,
    owner: '张经理',
    dueDate: '2026-06-30',
    desc: '因设计变更和材料涨价，项目预算可能超支10%~15%。',
    measures: ['建立预算预警机制', '变更管控流程', '定期成本分析'],
  },
  {
    id: 5,
    code: 'RSK-2026-005',
    title: '供应商资金链断裂',
    category: 'cost',
    level: 'high',
    status: 'monitoring',
    project: 'J-2X高精线联调项目',
    probability: 30,
    impact: 95,
    score: 28.5,
    owner: '张经理',
    dueDate: '2026-03-31',
    desc: '主供应商资金状况不佳，存在履约风险。',
    measures: ['已预付30%款项', '增加履约保证金', '监控供应商经营状况'],
  },
  {
    id: 6,
    code: 'RSK-2026-006',
    title: '环保合规风险',
    category: 'compliance',
    level: 'low',
    status: 'resolved',
    project: 'O3厂区建设项目',
    probability: 20,
    impact: 60,
    score: 12,
    owner: '李经理',
    dueDate: '2026-02-28',
    desc: '部分环保审批文件尚未齐全。',
    measures: ['已补充环评批复', '加强环境监测', '合规培训'],
  },
  {
    id: 7,
    code: 'RSK-2026-007',
    title: '雨季施工影响进度',
    category: 'schedule',
    level: 'medium',
    status: 'accepted',
    project: 'O3厂区建设项目',
    probability: 80,
    impact: 50,
    score: 40,
    owner: '李经理',
    dueDate: '2026-06-30',
    desc: '雨季（6-7月）可能影响室外施工进度。',
    measures: ['调整施工计划', '搭建雨棚', '制定赶工方案'],
  },
]

export function useRisks() {
  const [data] = useState(MOCK_RISKS)
  const [filterLevel, setFilterLevel] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = data.filter(r => {
    if (filterLevel && r.level !== filterLevel) return false
    if (filterStatus && r.status !== filterStatus) return false
    return true
  })

  const stats = {
    total: data.length,
    high: data.filter(r => r.level === 'high').length,
    medium: data.filter(r => r.level === 'medium').length,
    monitoring: data.filter(r => r.status === 'monitoring').length,
  }

  return { data, filtered, stats, filterLevel, filterStatus, setFilterLevel, setFilterStatus }
}
