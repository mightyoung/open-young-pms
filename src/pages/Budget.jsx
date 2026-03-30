import React, { useState, useEffect } from 'react'
import { colors } from '../styles/theme'
import { Card, Typography, Select, Table, Progress, Row, Col, Statistic } from 'antd'
import { DollarOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { api } from '../api'
import SkeletonContent from '../components/SkeletonContent'

const { Title, Text } = Typography

export default function Budget() {
  const [projectId, setProjectId] = useState(null)
  const [projects, setProjects] = useState([])
  const [budgetData, setBudgetData] = useState(null)

  useEffect(() => {
    api.get('/projects').then(d => {
      const items = d?.items || d || []
      setProjects(items)
      if (items.length > 0) setProjectId(items[0].id)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!projectId) return
    // 模拟预算数据（实际可接ERP，这里用静态演示）
    setBudgetData({
      total_budget: 5000000,
      spent: 2150000,
      contract_amount: 3800000,
      contract_paid: 1520000,
      contract_pending: 2280000,
      items: [
        { category: '建安工程费', budget: 3000000, spent: 1400000, contract: 2200000, paid: 880000 },
        { category: '设备购置费', budget: 800000, spent: 350000, contract: 600000, paid: 300000 },
        { category: '安装工程费', budget: 600000, spent: 280000, contract: 500000, paid: 220000 },
        { category: '其他费用', budget: 600000, spent: 120000, contract: 500000, paid: 120000 },
      ]
    })
  }, [projectId])

  const items = budgetData?.items || []
  const totalBudget = budgetData?.total_budget || 0
  const totalSpent = budgetData?.spent || 0
  const executionRate = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  const columns = [
    { title: '费用科目', dataIndex: 'category', render: t => <Text style={{ color: colors.text.primary }}>{t}</Text> },
    {
      title: '预算金额', dataIndex: 'budget', key: 'budget',
      render: v => <Text style={{ color: colors.accent }}>{v?.toLocaleString()} 元</Text>
    },
    {
      title: '已执行', dataIndex: 'spent', key: 'spent',
      render: (v, r) => (
        <div>
          <Text style={{ color: colors.success }}>{v?.toLocaleString()} 元</Text>
          <Progress percent={r.budget > 0 ? Math.round(v / r.budget * 100) : 0} size="small"
            strokeColor={colors.success} showInfo={false} style={{ marginTop: 4 }} />
        </div>
      )
    },
    {
      title: '合同额', dataIndex: 'contract', key: 'contract',
      render: v => <Text style={{ color: colors.text.secondary }}>{v?.toLocaleString()} 元</Text>
    },
    {
      title: '已付款', dataIndex: 'paid', key: 'paid',
      render: v => <Text style={{ color: colors.warning }}>{v?.toLocaleString()} 元</Text>
    },
    {
      title: '执行率', key: 'rate',
      render: (_, r) => {
        const pct = r.budget > 0 ? Math.round(r.spent / r.budget * 100) : 0
        return (
          <Text style={{ color: pct > 100 ? colors.danger : pct > 80 ? colors.warning : colors.success }}>
            {pct}%
          </Text>
        )
      }
    },
  ]

  if (loading) return <div style={{ padding: 24 }}><SkeletonContent type='kpi' /></div>

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ color: colors.text.primary, margin: 0 }}>
          <DollarOutlined style={{ marginRight: 8 }} />预算执行情况
        </Title>
        <Select value={projectId} onChange={setProjectId} style={{ width: 200 }} placeholder="选择项目">
          {projects.map(p => <Select.Option key={p.id} value={p.id}>{p.name || p.project_name}</Select.Option>)}
        </Select>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card style={{ background: colors.bg.page, border: '1px solid #27272a', textAlign: 'center' }}>
            <Statistic title={<Text style={{ color: colors.text.muted }}>总预算</Text>} value={totalBudget}
              valueStyle={{ color: colors.accent, fontSize: 20 }} suffix="元" />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ background: colors.bg.page, border: '1px solid #27272a', textAlign: 'center' }}>
            <Statistic title={<Text style={{ color: colors.text.muted }}>已执行</Text>} value={totalSpent}
              valueStyle={{ color: colors.success, fontSize: 20 }} suffix="元" />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ background: colors.bg.page, border: '1px solid #27272a', textAlign: 'center' }}>
            <Statistic title={<Text style={{ color: colors.text.muted }}>执行率</Text>} value={executionRate}
              valueStyle={{ color: executionRate > 100 ? colors.danger : executionRate > 80 ? colors.warning : colors.success, fontSize: 20 }}
              suffix="%" prefix={executionRate > 100 ? <WarningOutlined /> : <CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ background: colors.bg.page, border: '1px solid #27272a', textAlign: 'center' }}>
            <Statistic title={<Text style={{ color: colors.text.muted }}>剩余预算</Text>}
              value={Math.max(0, totalBudget - totalSpent)}
              valueStyle={{ color: colors.text.muted, fontSize: 20 }} suffix="元" />
          </Card>
        </Col>
      </Row>

      <Card style={{ background: colors.bg.page, border: '1px solid #27272a' }}>
        <Table dataSource={items} columns={columns} rowKey="category" size="small" pagination={false}
          locale={{ emptyText: '暂无预算数据' }} />
      </Card>
    </div>
  )
}
