import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography, Select, DatePicker } from 'antd'
import { AlertOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons'
import { api } from '../api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']

export default function HazardStats() {
  const [summary, setSummary] = useState({})
  const [trend, setTrend] = useState([])
  const [byType, setByType] = useState([])
  const [byStatus, setByStatus] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [s, t, bt, bs] = await Promise.all([
        api.get('/dashboard/summary').catch(() => ({})),
        api.get('/dashboard/hazard-trend').catch(() => ({ data: [] })),
        api.get('/dashboard/hazard-by-type').catch(() => ({ data: [] })),
        api.get('/dashboard/hazard-by-status').catch(() => ({ data: [] })),
      ])
      setSummary(s?.hazard ? s : (s?.data || {}))
      setTrend(Array.isArray(t) ? t : (t?.items || []))
      setByType(Array.isArray(bt) ? bt : (bt?.items || []))
      setByStatus(bs?.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const summaryData = [
    { label: '隐患总数', value: summary.total_hazards || 0, icon: <AlertOutlined />, color: '#ef4444' },
    { label: '待处理', value: summary.pending_hazards || 0, icon: <ClockCircleOutlined />, color: '#f97316' },
    { label: '整改中', value: summary.rectifying_hazards || 0, icon: <WarningOutlined />, color: '#eab308' },
    { label: '已关闭', value: summary.closed_hazards || 0, icon: <CheckCircleOutlined />, color: '#22c55e' },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ color: '#e4e4e7', marginBottom: 16 }}>
        <AlertOutlined style={{ marginRight: 8 }} />隐患统计
      </Title>

      <Row gutter={[16, 16]}>
        {summaryData.map((d, i) => (
          <Col span={6} key={i}>
            <Card style={{ background: '#18181b', border: '1px solid #27272a', textAlign: 'center' }}>
              <div style={{ color: d.color, fontSize: 28, marginBottom: 8 }}>{d.icon}</div>
              <Statistic title={<Text style={{ color: '#71717a' }}>{d.label}</Text>} value={d.value}
                valueStyle={{ color: d.color, fontSize: 28 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={16}>
          <Card title={<Text style={{ color: '#e4e4e7' }}>30天隐患趋势</Text>} style={{ background: '#18181b', border: '1px solid #27272a' }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#27272a', border: '1px solid #3f3f46', color: '#e4e4e7' }} />
                <Bar dataKey="count" fill="#ef4444" name="隐患数" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card title={<Text style={{ color: '#e4e4e7' }}>类型分布</Text>} style={{ background: '#18181b', border: '1px solid #27272a', height: '100%' }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} ${value}`}>
                  {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title={<Text style={{ color: '#e4e4e7' }}>状态分布</Text>} style={{ background: '#18181b', border: '1px solid #27272a' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis dataKey="status" type="category" tick={{ fill: '#71717a', fontSize: 11 }} width={60} />
                <Tooltip contentStyle={{ background: '#27272a', border: '1px solid #3f3f46', color: '#e4e4e7' }} />
                <Bar dataKey="count" fill="#3b82f6" name="数量" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
