import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography, Select, Table, Tag, Progress } from 'antd'
import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, RiseOutlined } from '@ant-design/icons'
import { api } from '../api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const { Title, Text } = Typography

export default function ReportStats() {
  const [period, setPeriod] = useState('month')
  const [summary, setSummary] = useState({})
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/reports/summary', { params: { period } })
      const data = res?.data || res || {}
      setSummary(data)
      setRecent(data.reports || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [period])

  const statsData = [
    { label: '报告总数', value: summary.total || 0, icon: <FileTextOutlined />, color: '#3b82f6' },
    { label: '已通过', value: summary.approved || 0, icon: <CheckCircleOutlined />, color: '#22c55e' },
    { label: '已驳回', value: summary.rejected || 0, icon: <ClockCircleOutlined />, color: '#ef4444' },
    { label: '待审批', value: summary.pending || 0, icon: <RiseOutlined />, color: '#f97316' },
  ]

  const typeData = Object.entries(summary.by_type || {}).map(([type, count]) => ({ type: type === 'daily' ? '日报' : type === 'weekly' ? '周报' : type === 'monthly' ? '月报' : type, count }))

  const columns = [
    { title: '类型', dataIndex: 'type', key: 'type', render: t => <Tag>{t === 'daily' ? '日报' : t === 'weekly' ? '周报' : t === 'monthly' ? '月报' : t}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', render: s => <Tag color={s === 'approved' ? 'green' : s === 'rejected' ? 'red' : 'orange'}>{s === 'approved' ? '已通过' : s === 'rejected' ? '已驳回' : '待审批'}</Tag> },
    { title: '提交时间', dataIndex: 'submitted_at', key: 'submitted_at', render: t => <Text style={{ color: '#71717a', fontSize: 12 }}>{t ? new Date(t).toLocaleString() : '-'}</Text> },
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ color: '#e4e4e7', margin: 0 }}>
          <FileTextOutlined style={{ marginRight: 8 }} />报告统计
        </Title>
        <Select value={period} onChange={setPeriod} style={{ width: 120 }}>
          <Select.Option value="day">日报</Select.Option>
          <Select.Option value="week">周报</Select.Option>
          <Select.Option value="month">月报</Select.Option>
        </Select>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {statsData.map((d, i) => (
          <Col span={6} key={i}>
            <Card style={{ background: '#18181b', border: '1px solid #27272a', textAlign: 'center' }}>
              <div style={{ color: d.color, fontSize: 28, marginBottom: 8 }}>{d.icon}</div>
              <Statistic title={<Text style={{ color: '#71717a' }}>{d.label}</Text>} value={d.value} valueStyle={{ color: d.color, fontSize: 28 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title={<Text style={{ color: '#e4e4e7' }}>通过率</Text>} style={{ background: '#18181b', border: '1px solid #27272a' }}>
            {summary.total > 0 ? (
              <Progress
                percent={Math.round(((summary.approved || 0) / summary.total) * 100)}
                strokeColor="#22c55e"
                trailColor="#27272a"
                format={p => <Text style={{ color: '#22c55e' }}>{p}%</Text>}
              />
            ) : <Text style={{ color: '#71717a' }}>暂无数据</Text>}
          </Card>
        </Col>
        <Col span={12}>
          <Card title={<Text style={{ color: '#e4e4e7' }}>报告类型分布</Text>} style={{ background: '#18181b', border: '1px solid #27272a' }}>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="type" tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#27272a', border: '#3f3f46', color: '#e4e4e7' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Text style={{ color: '#71717a' }}>暂无数据</Text>}
          </Card>
        </Col>
      </Row>

      <Card title={<Text style={{ color: '#e4e4e7' }}>最近报告</Text>} style={{ background: '#18181b', border: '1px solid #27272a', marginTop: 16 }}>
        <Table dataSource={recent} columns={columns} rowKey="id" size="small" pagination={false} />
      </Card>
    </div>
  )
}
