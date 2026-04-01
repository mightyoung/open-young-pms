import { useState } from 'react'

export const REPORT_TYPES = {
  daily: { label: '日报', bg: '#dbeafe', color: '#1e40af' },
  weekly: { label: '周报', bg: '#dcfce7', color: '#166534' },
  monthly: { label: '月报', bg: '#fef3c7', color: '#92400e' },
}

export const STATUS_MAP = {
  draft: { label: '草稿', bg: '#f3f4f6', color: '#6b7280' },
  pending: { label: '待审批', bg: '#fef3c7', color: '#92400e' },
  approved: { label: '已通过', bg: '#dcfce7', color: '#166534' },
  rejected: { label: '已驳回', bg: '#fee2e2', color: '#991b1b' },
}

const MOCK_REPORTS = [
  {
    id: 1,
    type: 'daily',
    title: '日报 - 2026-03-30',
    project: 'J-2X高精线联调项目',
    author: '张经理',
    dept: '工程部',
    createTime: '2026-03-30 18:00',
    status: 'approved',
    progress: '主轴落位完成，遭遇尺寸偏差，等待图纸变更。',
    stats: { completed: 3, pending: 2, issues: 1 },
  },
  {
    id: 2,
    type: 'weekly',
    title: '周报 - 第13周',
    project: 'J-2X高精线联调项目',
    author: '张经理',
    dept: '工程部',
    createTime: '2026-03-28 17:30',
    status: 'approved',
    progress: '完成主轴安装、电气接线检查，尺寸偏差问题已联系设计院。',
    stats: { completed: 12, pending: 5, issues: 2 },
  },
  {
    id: 3,
    type: 'daily',
    title: '日报 - 2026-03-29',
    project: 'O3厂区建设项目',
    author: '李经理',
    dept: '工程部',
    createTime: '2026-03-29 17:45',
    status: 'pending',
    progress: '完成场地平整，正在进行基础放线。',
    stats: { completed: 2, pending: 4, issues: 0 },
  },
  {
    id: 4,
    type: 'monthly',
    title: '月报 - 2026年3月',
    project: 'J-2X高精线联调项目',
    author: '张经理',
    dept: '工程部',
    createTime: '2026-03-31 09:00',
    status: 'pending',
    progress: '3月完成产值约占合同额35%，进度符合预期。质量控制良好，无重大安全事件。',
    stats: { completed: 28, pending: 8, issues: 3 },
  },
  {
    id: 5,
    type: 'daily',
    title: '日报 - 2026-03-28',
    project: '高压管路安装工程',
    author: '王经理',
    dept: '安装部',
    createTime: '2026-03-28 17:30',
    status: 'rejected',
    progress: '管道焊接完成60%，材料已到场。',
    stats: { completed: 5, pending: 3, issues: 1 },
  },
  {
    id: 6,
    type: 'weekly',
    title: '周报 - 第12周',
    project: '高压管路安装工程',
    author: '王经理',
    dept: '安装部',
    createTime: '2026-03-21 17:00',
    status: 'approved',
    progress: '完成管道铺设200米，焊接完成30个点位。',
    stats: { completed: 18, pending: 7, issues: 2 },
  },
]

export function useReports() {
  const [reports] = useState(MOCK_REPORTS)

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    approved: reports.filter(r => r.status === 'approved').length,
  }

  return { reports, stats }
}
