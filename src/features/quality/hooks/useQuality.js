import { useState } from 'react'

export const CATEGORY_MAP = {
  structural: { label: '结构工程', bg: '#dbeafe', color: '#1e40af' },
  electrical: { label: '电气工程', bg: '#fef3c7', color: '#92400e' },
  pipe: { label: '管道工程', bg: '#dcfce7', color: '#166534' },
  decoration: { label: '装饰装修', bg: '#fce7f3', color: '#be185d' },
  other: { label: '其他', bg: '#f3f4f6', color: '#6b7280' },
}

export const RESULT_MAP = {
  pending: { label: '待检查', bg: '#fef3c7', color: '#92400e' },
  passed: { label: '合格', bg: '#dcfce7', color: '#166534' },
  failed: { label: '不合格', bg: '#fee2e2', color: '#991b1b' },
}

const MOCK_STANDARDS = [
  { id: 1, code: 'STD-STR-001', name: '钢结构焊接质量标准', category: 'structural', version: 'v2.1', effective: '2026-01-01', status: 'active', items: 15, desc: '适用于所有钢构件焊接施工的质量验收，涵盖焊缝外观、尺寸、无损检测要求。' },
  { id: 2, code: 'STD-ELC-001', name: '电气接线验收规范', category: 'electrical', version: 'v1.5', effective: '2025-06-01', status: 'active', items: 22, desc: '电气设备安装、接线、接地等工程的质量验收标准。' },
  { id: 3, code: 'STD-PIP-001', name: '管道安装施工规范', category: 'pipe', version: 'v3.0', effective: '2026-02-01', status: 'active', items: 18, desc: '工业管道安装施工及验收规范，含材质、焊接、试压要求。' },
  { id: 4, code: 'STD-STR-002', name: '混凝土浇筑质量标准', category: 'structural', version: 'v1.2', effective: '2025-03-01', status: 'inactive', items: 12, desc: '混凝土结构施工质量控制标准，含配合比、养护、强度要求。' },
]

const MOCK_INSPECTIONS = [
  { id: 1, code: 'INS-20260330-001', name: 'J-2X主轴基础验收', project: 'J-2X高精线联调项目', category: 'structural', result: 'passed', inspector: '陈工', checkDate: '2026-03-28', nextDate: '2026-04-15', status: 'pending' },
  { id: 2, code: 'INS-20260329-001', name: '3号车间电气布线检查', project: 'J-2X高精线联调项目', category: 'electrical', result: 'failed', inspector: '陈工', checkDate: '2026-03-29', nextDate: '—', status: 'pending', issue: '部分回路绝缘电阻不达标' },
  { id: 3, code: 'INS-20260327-001', name: '高压管路焊接探伤', project: '高压管路安装工程', category: 'pipe', result: 'pending', inspector: '张监', checkDate: '2026-03-27', nextDate: '2026-04-05', status: 'pending' },
  { id: 4, code: 'INS-20260325-001', name: '钢结构防腐涂装检查', project: 'J-2X高精线联调项目', category: 'structural', result: 'passed', inspector: '陈工', checkDate: '2026-03-25', nextDate: '2026-04-20', status: 'done' },
  { id: 5, code: 'INS-20260320-001', name: '接地系统测试', project: 'O3厂区建设项目', category: 'electrical', result: 'passed', inspector: '陈工', checkDate: '2026-03-20', nextDate: '2026-05-20', status: 'done' },
]

export function useQuality() {
  const [tab, setTab] = useState('standards')
  return { tab, setTab, standards: MOCK_STANDARDS, inspections: MOCK_INSPECTIONS }
}
