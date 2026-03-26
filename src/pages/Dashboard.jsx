import React, { useState, useEffect } from 'react'
import { colors } from '../styles/theme'
import { Card, Row, Col, Statistic, Spin, Empty } from 'antd'
import { SafetyOutlined, CheckCircleOutlined, FileTextOutlined, DashboardOutlined } from '@ant-design/icons'
import { api } from '../api'

const D = {
  bg: colors.bg.base,
  surface: colors.bg.page,
  card: colors.bg.card,
  elevated: colors.bg.elevated,
  border: colors.bg.elevated,
  accent: colors.accent,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  text: colors.text.primary,
  textSec: colors.text.muted,
  textMuted: colors.text.disabled,
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [hazardTrend, setHazardTrend] = useState([])
  const [hazardByType, setHazardByType] = useState([])
  const [hazardByStatus, setHazardByStatus] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [s, t, bt, bs] = await Promise.all([
          api.get('/dashboard/summary').catch(() => null),
          api.get('/dashboard/hazard-trend').catch(() => []),
          api.get('/dashboard/hazard-by-type').catch(() => []),
          api.get('/dashboard/hazard-by-status').catch(() => []),
        ])
        setSummary(s || null)
        setHazardTrend(Array.isArray(t) ? t : (t?.items || []))
        setHazardByType(Array.isArray(bt) ? bt : (bt?.items || []))
        setHazardByStatus(Array.isArray(bs) ? bs : (bs?.items || []))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <Spin size="large" />
    </div>
  )

  if (!summary) return <Empty description="暂无数据" style={{ marginTop: 80 }} />

  const hazard = summary.hazard || {}
  const task = summary.task || {}
  const maxCount = Math.max(...hazardTrend.map(d => d.count), 1)

  return (
    <div style={{ padding: 24, background: colors.bg.base, minHeight: '100vh' }}>
      {/* 标题 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <DashboardOutlined style={{ color: colors.accent, fontSize: 20, marginRight: 8 }} />
        <h2 style={{ color: colors.text.primary, margin: 0 }}>监测驾驶舱</h2>
        <span style={{ marginLeft: 'auto', color: colors.text.secondary, fontSize: 12 }}>
          更新于 {summary.generated_at ? new Date(summary.generated_at).toLocaleString('zh-CN') : '—'}
        </span>
      </div>

      {/* KPI 卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: colors.bg.card, border: `1px solid ${colors.bg.border}` }}>
            <Statistic
              title={<span style={{ color: colors.text.secondary }}>随手拍总数</span>}
              value={hazard.total || 0}
              prefix={<SafetyOutlined style={{ color: colors.accent }} />}
              valueStyle={{ color: colors.text.primary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: colors.bg.card, border: `1px solid ${colors.bg.border}` }}>
            <Statistic
              title={<span style={{ color: colors.text.secondary }}>整改率</span>}
              value={hazard.closure_rate || 0}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: colors.success }} />}
              valueStyle={{ color: colors.success }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: colors.bg.card, border: `1px solid ${colors.bg.border}` }}>
            <Statistic
              title={<span style={{ color: colors.text.secondary }}>任务完成率</span>}
              value={task.completion_rate || 0}
              suffix="%"
              valueStyle={{ color: colors.text.primary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: colors.bg.card, border: `1px solid ${colors.bg.border}` }}>
            <Statistic
              title={<span style={{ color: colors.text.secondary }}>报告数</span>}
              value={summary.report?.total || 0}
              prefix={<FileTextOutlined style={{ color: colors.warning }} />}
              valueStyle={{ color: colors.text.primary }}
            />
          </Card>
        </Col>
      </Row>

      {/* 随手拍趋势 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            title={<span style={{ color: colors.text.primary }}>随手拍趋势（近30天）</span>}
            style={{ background: colors.bg.card, border: `1px solid ${colors.bg.border}` }}
            headStyle={{ borderBottom: `1px solid ${colors.bg.border}` }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, overflowX: 'auto' }}>
              {hazardTrend.map((d, i) => (
                <div key={i} style={{ flex: 1, minWidth: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    title={`${d.date}: ${d.count}条`}
                    style={{
                      width: '100%',
                      height: `${Math.max((d.count / maxCount) * 100, d.count > 0 ? 4 : 0)}%`,
                      background: d.count > 0 ? colors.accent : colors.bg.elevated,
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.3s',
                      minHeight: d.count > 0 ? 4 : 0,
                    }}
                  />
                  <span style={{ fontSize: 9, color: colors.text.muted, marginTop: 4, whiteSpace: 'nowrap' }}>
                    {i % 5 === 0 ? d.date : ''}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 类型分布 + 状态分布 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: colors.text.primary }}>随手拍类型分布</span>}
            style={{ background: colors.bg.card, border: `1px solid ${colors.bg.border}` }}
            headStyle={{ borderBottom: `1px solid ${colors.bg.border}` }}
          >
            {hazardByType.length === 0 ? (
              <div style={{ color: colors.text.secondary, textAlign: 'center', padding: 20 }}>暂无数据</div>
            ) : (
              hazardByType.map((item, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: colors.text.primary }}>{item.name}</span>
                    <span style={{ color: colors.text.secondary }}>{item.value}条 · {item.rate}%</span>
                  </div>
                  <div style={{ background: colors.bg.page, borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${item.rate}%`,
                        height: '100%',
                        background: [colors.accent, colors.success, colors.warning, colors.danger][i % 4],
                        borderRadius: 4,
                        transition: 'width 0.5s',
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: colors.text.primary }}>随手拍状态分布</span>}
            style={{ background: colors.bg.card, border: `1px solid ${colors.bg.border}` }}
            headStyle={{ borderBottom: `1px solid ${colors.bg.border}` }}
          >
            {hazardByStatus.length === 0 ? (
              <div style={{ color: colors.text.secondary, textAlign: 'center', padding: 20 }}>暂无数据</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {hazardByStatus.map((item, i) => {
                  const colors = [colors.accent, colors.warning, colors.success, colors.danger, colors.text.secondary]
                  return (
                    <div key={i} style={{
                      background: colors.bg.page,
                      border: `1px solid ${colors.bg.border}`,
                      borderRadius: 8,
                      padding: '8px 16px',
                      minWidth: 100,
                      textAlign: 'center',
                    }}>
                      <div style={{ color: colors[i % colors.length], fontSize: 20, fontWeight: 700 }}>
                        {item.value}
                      </div>
                      <div style={{ color: colors.text.secondary, fontSize: 12, marginTop: 2 }}>{item.name}</div>
                      <div style={{ color: colors.text.muted, fontSize: 11 }}>{item.rate}%</div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
