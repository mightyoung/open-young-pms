import { useState } from 'react'

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
  equipment: { label: '设备问题', bg: '#dbeafe', color: '#1e40af' },
  other: { label: '其他', bg: '#f3f4f6', color: '#6b7280' },
}

export const LEVEL_MAP = {
  urgent: { label: '紧急', bg: '#fee2e2', color: '#991b1b' },
  major: { label: '重大', bg: '#fef3c7', color: '#92400e' },
  general: { label: '一般', bg: '#dbeafe', color: '#1e40af' },
  minor: { label: '轻微', bg: '#f3f4f6', color: '#6b7280' },
}

export const AUTO_DISPATCH_RULES = [
  { type: 'safety', level: 'urgent', assignee: '王安全', dept: '安环部', sla: '2小时' },
  { type: 'safety', level: 'major', assignee: '张工', dept: '安环部', sla: '4小时' },
  { type: 'quality', level: 'major', assignee: '陈工', dept: '质量部', sla: '8小时' },
  { type: 'equipment', level: 'urgent', assignee: '刘工', dept: '设备部', sla: '1小时' },
]

const MOCK_DATA = [
  {
    id: 1,
    title: '3号车间配电箱门未关闭',
    type: 'safety',
    level: 'urgent',
    status: 'rectifying',
    location: '3号车间-A区配电房',
    reporter: '李师傅',
    assignee: '王安全',
    phone: '138****1234',
    desc: '配电箱门敞开，存在触电风险，现场已设置警示标志。',
    photos: 2,
    gps: '31.2304°N, 121.4737°E',
    createTime: '10:20',
    deadline: '12:20',
  },
  {
    id: 2,
    title: '钢结构焊接质量不达标',
    type: 'quality',
    level: 'major',
    status: 'pending_acceptance',
    location: '2号厂房-北侧钢结构',
    reporter: '张监',
    assignee: '陈工',
    phone: '139****5678',
    desc: '焊缝存在气孔，未按图施工，需整改后重新验收。',
    photos: 3,
    gps: '31.2310°N, 121.4740°E',
    createTime: '昨天 14:30',
    deadline: '今天 14:30',
  },
  {
    id: 3,
    title: '施工废料未及时清理',
    type: 'environment',
    level: 'general',
    status: 'assigned',
    location: 'O3厂区-东侧施工区',
    reporter: '刘工',
    assignee: '李师傅',
    phone: '137****9012',
    desc: '现场堆积大量废钢材和包装材料，影响通道。',
    photos: 1,
    gps: '31.2295°N, 121.4730°E',
    createTime: '昨天 09:15',
    deadline: '明天 09:15',
  },
  {
    id: 4,
    title: '塔吊电缆绝缘层破损',
    type: 'equipment',
    level: 'urgent',
    status: 'pending',
    location: '主厂房-3号塔吊',
    reporter: '王师傅',
    assignee: '待分配',
    phone: '136****3456',
    desc: '塔吊主电缆外护套破损，需立即停电检修。',
    photos: 2,
    gps: '31.2308°N, 121.4735°E',
    createTime: '今天 08:05',
    deadline: '10:05',
  },
  {
    id: 5,
    title: '临边防护栏杆缺失',
    type: 'safety',
    level: 'major',
    status: 'confirmed',
    location: '2号平台-3层临边',
    reporter: '李师傅',
    assignee: '张工',
    phone: '138****7890',
    desc: '2号平台3层临边防护栏杆缺失，已用临时围栏隔离。',
    photos: 1,
    gps: '31.2302°N, 121.4742°E',
    createTime: '前天 16:40',
    deadline: '昨天 16:40',
  },
  {
    id: 6,
    title: '脚手架扣件松动',
    type: 'safety',
    level: 'general',
    status: 'closed',
    location: '3号车间-外脚手架',
    reporter: '王工',
    assignee: '李师傅',
    phone: '139****2345',
    desc: '外脚手架部分扣件松动，整改完成，已验收。',
    photos: 2,
    gps: '31.2298°N, 121.4728°E',
    createTime: '3天前',
    deadline: '—',
  },
]

export function useHazards() {
  const [data] = useState(MOCK_DATA)
  const [tab, setTab] = useState('all')

  const filtered = tab === 'all' ? data : data.filter(d => d.status === tab)
  const stats = {
    total: data.length,
    pending: data.filter(d => ['pending', 'assigned'].includes(d.status)).length,
    rectifying: data.filter(d => d.status === 'rectifying').length,
    closed: data.filter(d => d.status === 'closed').length,
  }

  return { data, filtered, stats, tab, setTab }
}
