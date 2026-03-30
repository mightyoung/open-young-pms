/**
 * 监测驾驶舱 - 基于 Stitch Azure Ethos 设计系统
 * 更新时间: 2026-03-30
 */
import React, { useState, useEffect } from 'react'
import { Row, Col, Statistic, Empty } from 'antd'
import { SafetyOutlined, CheckCircleOutlined, FileTextOutlined, DashboardOutlined, RiseOutlined } from '@ant-design/icons'
import { api } from '../api'
import { PageHeader, MetricCard, ProgressBar } from '../components/PMSComponents'

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

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>加载中...</div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div style={styles.page}>
        <Empty description="暂无数据" />
      </div>
    )
  }

  const hazard = summary.hazard || {}
  const task = summary.task || {}
  const maxCount = Math.max(...hazardTrend.map(d => d.count), 1)

  // 类型颜色映射
  const typeColors = ['#115cb9', '#52c41a', '#faad14', '#ff4d4f', '#722ed1']
  const statusColors = {
    pending: { bg: '#fef3c7', color: '#92400e' },
    in_progress: { bg: '#dbeafe', color: '#1e40af' },
    resolved: { bg: '#dcfce7', color: '#166534' },
  }

  return (
    <div style={styles.page}>
      {/* 页面标题 */}
      <PageHeader
        title="监测驾驶舱"
        subtitle={`更新于 ${summary.generated_at ? new Date(summary.generated_at).toLocaleString('zh-CN') : '—'}`}
        icon={<DashboardOutlined style={{ color: 'var(--color-primary)' }} />}
      />

      {/* KPI 指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <SafetyOutlined style={{ ...styles.kpiIcon, color: 'var(--color-primary)' }} />
              <span style={styles.kpiLabel}>随手拍总数</span>
            </div>
            <div style={styles.kpiValue}>{hazard.total || 0}</div>
            <div style={styles.kpiTrend}>
              <RiseOutlined /> 本月新增
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <CheckCircleOutlined style={{ ...styles.kpiIcon, color: '#52c41a' }} />
              <span style={styles.kpiLabel}>整改率</span>
            </div>
            <div style={{ ...styles.kpiValue, color: '#52c41a' }}>
              {hazard.closure_rate || 0}%
            </div>
            <div style={styles.progressWrapper}>
              <ProgressBar value={hazard.closure_rate || 0} max={100} color="#52c41a" />
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <CheckCircleOutlined style={{ ...styles.kpiIcon, color: 'var(--color-primary)' }} />
              <span style={styles.kpiLabel}>任务完成率</span>
            </div>
            <div style={styles.kpiValue}>{task.completion_rate || 0}%</div>
            <div style={styles.progressWrapper}>
              <ProgressBar value={task.completion_rate || 0} max={100} />
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <FileTextOutlined style={{ ...styles.kpiIcon, color: '#faad14' }} />
              <span style={styles.kpiLabel}>报告总数</span>
            </div>
            <div style={styles.kpiValue}>{summary.report?.total || 0}</div>
            <div style={styles.kpiTrend}>
              <RiseOutlined /> 本月新增
            </div>
          </div>
        </Col>
      </Row>

      {/* 趋势图 */}
      <div style={styles.chartCard}>
        <div style={styles.chartTitle}>随手拍趋势（近30天）</div>
        <div style={styles.chartContainer}>
          {hazardTrend.map((d, i) => (
            <div key={i} style={styles.chartBar}>
              <div
                title={`${d.date}: ${d.count}条`}
                style={{
                  ...styles.chartBarFill,
                  height: `${Math.max((d.count / maxCount) * 100, d.count > 0 ? 4 : 0)}%`,
                  background: d.count > 0 ? 'var(--color-primary)' : 'var(--color-surface-container)',
                }}
              />
              <span style={styles.chartLabel}>
                {i % 5 === 0 ? d.date?.slice(5) : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 分布图 */}
      <Row gutter={[16, 16]}>
        {/* 类型分布 */}
        <Col xs={24} lg={12}>
          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>随手拍类型分布</div>
            <div style={styles.typeList}>
              {hazardByType.length === 0 ? (
                <div style={styles.emptyText}>暂无数据</div>
              ) : (
                hazardByType.map((item, i) => (
                  <div key={i} style={styles.typeItem}>
                    <div style={styles.typeHeader}>
                      <span style={styles.typeName}>{item.name}</span>
                      <span style={styles.typeValue}>{item.value}条 · {item.rate}%</span>
                    </div>
                    <ProgressBar 
                      value={item.rate} 
                      max={100} 
                      color={typeColors[i % typeColors.length]} 
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>

        {/* 状态分布 */}
        <Col xs={24} lg={12}>
          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>随手拍状态分布</div>
            <div style={styles.statusGrid}>
              {hazardByStatus.length === 0 ? (
                <div style={styles.emptyText}>暂无数据</div>
              ) : (
                hazardByStatus.map((item, i) => {
                  const statusColor = statusColors[item.key] || { bg: '#f3f4f6', color: '#6b7280' }
                  return (
                    <div key={i} style={{ ...styles.statusCard, background: statusColor.bg }}>
                      <div style={{ ...styles.statusValue, color: statusColor.color }}>
                        {item.value}
                      </div>
                      <div style={{ ...styles.statusLabel, color: statusColor.color }}>
                        {item.name}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}

const styles = {
  page: {
    padding: 24,
    background: 'var(--color-background)',
    minHeight: '100vh',
  },
  loading: {
    textAlign: 'center',
    padding: 48,
    color: 'var(--color-on-surface-variant)',
  },
  kpiCard: {
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
    boxShadow: 'var(--shadow-soft)',
  },
  kpiHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  kpiIcon: {
    fontSize: 20,
  },
  kpiLabel: {
    fontSize: 14,
    color: 'var(--color-on-surface-variant)',
  },
  kpiValue: {
    fontSize: 32,
    fontWeight: 700,
    fontFamily: 'var(--font-headline)',
    color: 'var(--color-on-surface)',
  },
  kpiTrend: {
    fontSize: 12,
    color: 'var(--color-on-surface-variant)',
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  progressWrapper: {
    marginTop: 8,
  },
  chartCard: {
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
    boxShadow: 'var(--shadow-soft)',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-on-surface)',
    marginBottom: 16,
  },
  chartContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 4,
    height: 120,
    overflowX: 'auto',
  },
  chartBar: {
    flex: 1,
    minWidth: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: '3px 3px 0 0',
    transition: 'height 0.3s',
    marginTop: 'auto',
  },
  chartLabel: {
    fontSize: 9,
    color: 'var(--color-on-surface-variant)',
    marginTop: 4,
    whiteSpace: 'nowrap',
  },
  typeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  typeItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  typeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeName: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--color-on-surface)',
  },
  typeValue: {
    fontSize: 13,
    color: 'var(--color-on-surface-variant)',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: 'var(--color-on-surface-variant)',
  },
  statusGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusCard: {
    borderRadius: 'var(--radius-md)',
    padding: '12px 20px',
    minWidth: 100,
    textAlign: 'center',
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 700,
    fontFamily: 'var(--font-headline)',
  },
  statusLabel: {
    fontSize: 12,
    marginTop: 4,
  },
}
