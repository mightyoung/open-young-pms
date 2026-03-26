import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Spin, Empty } from 'antd'
import { SafetyOutlined, CheckCircleOutlined, FileTextOutlined, DashboardOutlined } from '@ant-design/icons'
import { api } from '../api'

const D = {
  bg: '#09090b',
  surface: '#18181b',
  card: '#27272a',
  elevated: '#3f3f46',
  border: '#3f3f46',
  accent: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  text: '#e4e4e7',
  textSec: '#71717a',
  textMuted: '#52525b',
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
    <div style={{ padding: 24, background: D.bg, minHeight: '100vh' }}>
      {/* 标题 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <DashboardOutlined style={{ color: D.accent, fontSize: 20, marginRight: 8 }} />
        <h2 style={{ color: D.text, margin: 0 }}>监测驾驶舱</h2>
        <span style={{ marginLeft: 'auto', color: D.textSec, fontSize: 12 }}>
          更新于 {summary.generated_at ? new Date(summary.generated_at).toLocaleString('zh-CN') : '—'}
        </span>
      </div>

      {/* KPI 卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: D.card, border: `1px solid ${D.border}` }}>
            <Statistic
              title={<span style={{ color: D.textSec }}>随手拍总数</span>}
              value={hazard.total || 0}
              prefix={<SafetyOutlined style={{ color: D.accent }} />}
              valueStyle={{ color: D.text }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: D.card, border: `1px solid ${D.border}` }}>
            <Statistic
              title={<span style={{ color: D.textSec }}>整改率</span>}
              value={hazard.closure_rate || 0}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: D.success }} />}
              valueStyle={{ color: D.success }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: D.card, border: `1px solid ${D.border}` }}>
            <Statistic
              title={<span style={{ color: D.textSec }}>任务完成率</span>}
              value={task.completion_rate || 0}
              suffix="%"
              valueStyle={{ color: D.text }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: D.card, border: `1px solid ${D.border}` }}>
            <Statistic
              title={<span style={{ color: D.textSec }}>报告数</span>}
              value={summary.report?.total || 0}
              prefix={<FileTextOutlined style={{ color: D.warning }} />}
              valueStyle={{ color: D.text }}
            />
          </Card>
        </Col>
      </Row>

      {/* 随手拍趋势 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            title={<span style={{ color: D.text }}>随手拍趋势（近30天）</span>}
            style={{ background: D.card, border: `1px solid ${D.border}` }}
            headStyle={{ borderBottom: `1px solid ${D.border}` }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, overflowX: 'auto' }}>
              {hazardTrend.map((d, i) => (
                <div key={i} style={{ flex: 1, minWidth: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    title={`${d.date}: ${d.count}条`}
                    style={{
                      width: '100%',
                      height: `${Math.max((d.count / maxCount) * 100, d.count > 0 ? 4 : 0)}%`,
                      background: d.count > 0 ? D.accent : D.elevated,
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.3s',
                      minHeight: d.count > 0 ? 4 : 0,
                    }}
                  />
                  <span style={{ fontSize: 9, color: D.textMuted, marginTop: 4, whiteSpace: 'nowrap' }}>
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
            title={<span style={{ color: D.text }}>随手拍类型分布</span>}
            style={{ background: D.card, border: `1px solid ${D.border}` }}
            headStyle={{ borderBottom: `1px solid ${D.border}` }}
          >
            {hazardByType.length === 0 ? (
              <div style={{ color: D.textSec, textAlign: 'center', padding: 20 }}>暂无数据</div>
            ) : (
              hazardByType.map((item, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: D.text }}>{item.name}</span>
                    <span style={{ color: D.textSec }}>{item.value}条 · {item.rate}%</span>
                  </div>
                  <div style={{ background: D.surface, borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${item.rate}%`,
                        height: '100%',
                        background: [D.accent, D.success, D.warning, D.danger][i % 4],
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
            title={<span style={{ color: D.text }}>随手拍状态分布</span>}
            style={{ background: D.card, border: `1px solid ${D.border}` }}
            headStyle={{ borderBottom: `1px solid ${D.border}` }}
          >
            {hazardByStatus.length === 0 ? (
              <div style={{ color: D.textSec, textAlign: 'center', padding: 20 }}>暂无数据</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {hazardByStatus.map((item, i) => {
                  const colors = [D.accent, D.warning, D.success, D.danger, D.textSec]
                  return (
                    <div key={i} style={{
                      background: D.surface,
                      border: `1px solid ${D.border}`,
                      borderRadius: 8,
                      padding: '8px 16px',
                      minWidth: 100,
                      textAlign: 'center',
                    }}>
                      <div style={{ color: colors[i % colors.length], fontSize: 20, fontWeight: 700 }}>
                        {item.value}
                      </div>
                      <div style={{ color: D.textSec, fontSize: 12, marginTop: 2 }}>{item.name}</div>
                      <div style={{ color: D.textMuted, fontSize: 11 }}>{item.rate}%</div>
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
