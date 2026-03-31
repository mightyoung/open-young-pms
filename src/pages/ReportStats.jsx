import React, { useState, useEffect } from 'react'
import { colors } from '../styles/theme'
import { Card, Row, Col, Statistic, Typography, Select, Table, Tag, Progress } from 'antd'
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
} from '@ant-design/icons'
import { api } from '../api'
import SkeletonContent from '../components/SkeletonContent'
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

  useEffect(() => {
    load()
  }, [period])

  const statsData = [
    {
      label: '报告总数',
      value: summary.total || 0,
      icon: <FileTextOutlined />,
      color: colors.accent,
    },
    {
      label: '已通过',
      value: summary.approved || 0,
      icon: <CheckCircleOutlined />,
      color: colors.success,
    },
    {
      label: '已驳回',
      value: summary.rejected || 0,
      icon: <ClockCircleOutlined />,
      color: colors.danger,
    },
    { label: '待审批', value: summary.pending || 0, icon: <RiseOutlined />, color: colors.warning },
  ]

  const typeData = Object.entries(summary.by_type || {}).map(([type, count]) => ({
    type:
      type === 'daily' ? '日报' : type === 'weekly' ? '周报' : type === 'monthly' ? '月报' : type,
    count,
  }))

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: t => (
        <Tag>{t === 'daily' ? '日报' : t === 'weekly' ? '周报' : t === 'monthly' ? '月报' : t}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: s => (
        <Tag color={s === 'approved' ? 'green' : s === 'rejected' ? 'red' : 'orange'}>
          {s === 'approved' ? '已通过' : s === 'rejected' ? '已驳回' : '待审批'}
        </Tag>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: t => (
        <Text style={{ color: colors.text.muted, fontSize: 12 }}>
          {t ? new Date(t).toLocaleString() : '-'}
        </Text>
      ),
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ color: colors.text.primary, margin: 0 }}>
          <FileTextOutlined style={{ marginRight: 8 }} />
          报告统计
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

      <Row gutter={16}>
        <Col span={12}>
          <Card
            title={<Text style={{ color: colors.text.primary }}>通过率</Text>}
            style={{ background: colors.bg.page, border: '1px solid #e5e7eb' }}
          >
            {summary.total > 0 ? (
              <Progress
                percent={Math.round(((summary.approved || 0) / summary.total) * 100)}
                strokeColor={colors.success}
                trailColor={colors.bg.card}
                format={p => <Text style={{ color: colors.success }}>{p}%</Text>}
              />
            ) : (
              <Text style={{ color: colors.text.muted }}>暂无数据</Text>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={<Text style={{ color: colors.text.primary }}>报告类型分布</Text>}
            style={{ background: colors.bg.page, border: '1px solid #e5e7eb' }}
          >
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.bg.card} />
                  <XAxis dataKey="type" tick={{ fill: colors.text.muted, fontSize: 11 }} />
                  <YAxis tick={{ fill: colors.text.muted, fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: colors.bg.card,
                      border: colors.bg.elevated,
                      color: colors.text.primary,
                    }}
                  />
                  <Bar dataKey="count" fill={colors.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Text style={{ color: colors.text.muted }}>暂无数据</Text>
            )}
          </Card>
        </Col>
      </Row>

      <Card
        title={<Text style={{ color: colors.text.primary }}>最近报告</Text>}
        style={{ background: colors.bg.page, border: '1px solid #e5e7eb', marginTop: 16 }}
      >
        <Table dataSource={recent} columns={columns} rowKey="id" size="small" pagination={false} />
      </Card>
    </div>
  )
}
