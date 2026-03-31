import React, { useState, useEffect } from 'react'
import { colors } from '../styles/theme'
import { Card, Row, Col, Statistic, Typography, Select, DatePicker } from 'antd'
import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons'
import { api } from '../api'
import SkeletonContent from '../components/SkeletonContent'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const COLORS = [
  colors.danger,
  colors.warning,
  colors.warning,
  colors.success,
  colors.accent,
  '#8b5cf6',
]

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
      setSummary(s?.hazard ? s : s?.data || {})
      setTrend(Array.isArray(t) ? t : t?.items || [])
      setByType(Array.isArray(bt) ? bt : bt?.items || [])
      setByStatus(bs?.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const summaryData = [
    {
      label: '隐患总数',
      value: summary.total_hazards || 0,
      icon: <AlertOutlined />,
      color: colors.danger,
    },
    {
      label: '待处理',
      value: summary.pending_hazards || 0,
      icon: <ClockCircleOutlined />,
      color: colors.warning,
    },
    {
      label: '整改中',
      value: summary.rectifying_hazards || 0,
      icon: <WarningOutlined />,
      color: colors.warning,
    },
    {
      label: '已关闭',
      value: summary.closed_hazards || 0,
      icon: <CheckCircleOutlined />,
      color: colors.success,
    },
  ]

  if (loading)
    return (
      <div style={{ padding: 24 }}>
        <SkeletonContent type="dashboard" />
      </div>
    )

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ color: colors.text.primary, marginBottom: 16 }}>
        <AlertOutlined style={{ marginRight: 8 }} />
        隐患统计
      </Title>

      <Row gutter={[16, 16]}>
        {summaryData.map((d, i) => (
          <Col span={6} key={i}>
            <Card
              style={{
                background: colors.bg.page,
                border: '1px solid #e5e7eb',
                textAlign: 'center',
              }}
            >
              <div style={{ color: d.color, fontSize: 28, marginBottom: 8 }}>{d.icon}</div>
              <Statistic
                title={<Text style={{ color: colors.text.muted }}>{d.label}</Text>}
                value={d.value}
                valueStyle={{ color: d.color, fontSize: 28 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={16}>
          <Card
            title={<Text style={{ color: colors.text.primary }}>30天隐患趋势</Text>}
            style={{ background: colors.bg.page, border: '1px solid #e5e7eb' }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.bg.card} />
                <XAxis dataKey="date" tick={{ fill: colors.text.muted, fontSize: 11 }} />
                <YAxis tick={{ fill: colors.text.muted, fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: colors.bg.card,
                    border: '1px solid #e5e7eb',
                    color: colors.text.primary,
                  }}
                />
                <Bar dataKey="count" fill={colors.danger} name="隐患数" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title={<Text style={{ color: colors.text.primary }}>类型分布</Text>}
            style={{ background: colors.bg.page, border: '1px solid #e5e7eb', height: '100%' }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={byType}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name} ${value}`}
                >
                  {byType.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ color: colors.text.secondary, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card
            title={<Text style={{ color: colors.text.primary }}>状态分布</Text>}
            style={{ background: colors.bg.page, border: '1px solid #e5e7eb' }}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={colors.bg.card} />
                <XAxis type="number" tick={{ fill: colors.text.muted, fontSize: 11 }} />
                <YAxis
                  dataKey="status"
                  type="category"
                  tick={{ fill: colors.text.muted, fontSize: 11 }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    background: colors.bg.card,
                    border: '1px solid #e5e7eb',
                    color: colors.text.primary,
                  }}
                />
                <Bar dataKey="count" fill={colors.accent} name="数量" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
