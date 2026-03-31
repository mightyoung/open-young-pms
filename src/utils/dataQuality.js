/**
 * Data quality radar and governance utilities
 */

export function calculateQualityScore(asset) {
  const { completeness, accuracy, timeliness, consistency, uniqueness } = asset
  const weights = {
    completeness: 0.25,
    accuracy: 0.3,
    timeliness: 0.15,
    consistency: 0.15,
    uniqueness: 0.15,
  }
  return Math.round(
    completeness * weights.completeness +
      accuracy * weights.accuracy +
      timeliness * weights.timeliness +
      consistency * weights.consistency +
      uniqueness * weights.uniqueness
  )
}

export function getQualityLevel(score) {
  if (score >= 90) return { level: '优秀', color: '#52c41a' }
  if (score >= 75) return { level: '良好', color: '#115cb9' }
  if (score >= 60) return { level: '一般', color: '#faad14' }
  return { level: '较差', color: '#ff4d4f' }
}

export const SECURITY_LEVELS = [
  { value: 'public', label: '公开', color: '#52c41a', desc: '可对外公开' },
  { value: 'internal', label: '内部', color: '#115cb9', desc: '仅内部人员可见' },
  { value: 'confidential', label: '机密', color: '#faad14', desc: '核心成员可见' },
  { value: 'secret', label: '绝密', color: '#ff4d4f', desc: '仅管理层可见' },
]

export const DEFAULT_DATA_ASSETS = [
  {
    id: 'asset-1',
    name: '项目主数据',
    category: '项目数据',
    owner: '项目管理部',
    quality: 85,
    security: 'internal',
    completeness: 90,
    accuracy: 85,
    timeliness: 80,
    consistency: 85,
    uniqueness: 80,
  },
  {
    id: 'asset-2',
    name: '隐患台账',
    category: '安全数据',
    owner: '安全部',
    quality: 78,
    security: 'confidential',
    completeness: 75,
    accuracy: 80,
    timeliness: 75,
    consistency: 80,
    uniqueness: 80,
  },
  {
    id: 'asset-3',
    name: '任务进度数据',
    category: '任务数据',
    owner: '调度室',
    quality: 92,
    security: 'internal',
    completeness: 95,
    accuracy: 90,
    timeliness: 95,
    consistency: 90,
    uniqueness: 90,
  },
  {
    id: 'asset-4',
    name: '人员组织数据',
    category: '人员数据',
    owner: '人力资源部',
    quality: 88,
    security: 'confidential',
    completeness: 90,
    accuracy: 88,
    timeliness: 85,
    consistency: 90,
    uniqueness: 88,
  },
  {
    id: 'asset-5',
    name: '设备运行数据',
    category: '设备数据',
    owner: '设备部',
    quality: 65,
    security: 'internal',
    completeness: 60,
    accuracy: 70,
    timeliness: 60,
    consistency: 70,
    uniqueness: 70,
  },
  {
    id: 'asset-6',
    name: '报告文档库',
    category: '文档数据',
    owner: '综合管理部',
    quality: 80,
    security: 'internal',
    completeness: 78,
    accuracy: 82,
    timeliness: 80,
    consistency: 80,
    uniqueness: 80,
  },
]
