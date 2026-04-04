import React from 'react'
import { Row, Col, Button, Space } from 'antd'
import {
  SafetyOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  DashboardOutlined,
  RiseOutlined,
  ArrowRightOutlined,
  ToolOutlined,
  AlertOutlined,
  AuditOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
  PageHeader,
  ProgressBar,
  EmptyState,
  SkeletonContent,
} from '../../../components/PMSComponents'
import { useDashboardData } from '../hooks/useDashboardData'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { loading, summary, hazardTrend, hazardByType, hazardByStatus } = useDashboardData()

  if (loading) {
    return (
      <div style={styles.page}>
        <PageHeader
          title="监测驾驶舱"
          icon={<DashboardOutlined style={{ color: 'var(--color-primary)' }} />}
        />
        <SkeletonContent type="dashboard" />
      </div>
    )
  }

  if (!summary) {
    return (
      <div style={styles.page}>
        <PageHeader
          title="监测驾驶舱"
          icon={<DashboardOutlined style={{ color: 'var(--color-primary)' }} />}
        />
        <EmptyState type="list" title="暂无数据" description="暂无仪表盘数据" />
      </div>
    )
  }

  const hazard = summary.hazard || {}
  const task = summary.task || {}
  const maxCount = Math.max(...hazardTrend.map(item => item.count), 1)
  const typeColors = ['#115cb9', '#52c41a', '#faad14', '#ff4d4f', '#722ed1']
  const statusColors = {
    pending: { bg: '#fef3c7', color: '#92400e' },
    in_progress: { bg: '#dbeafe', color: '#1e40af' },
    resolved: { bg: '#dcfce7', color: '#166534' },
  }

  return (
    <div style={styles.page}>
      <PageHeader
        title="监测驾驶舱"
        subtitle={`更新于 ${summary.generated_at ? new Date(summary.generated_at).toLocaleString('zh-CN') : '—'}`}
        icon={<DashboardOutlined style={{ color: 'var(--color-primary)' }} />}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <div
            style={styles.kpiCard}
            onClick={() => navigate('/hazards')}
            className="clickable-card"
          >
            <div style={styles.kpiHeader}>
              <SafetyOutlined style={{ ...styles.kpiIcon, color: 'var(--color-primary)' }} />
              <span style={styles.kpiLabel}>随手拍总数</span>
            </div>
            <div style={styles.kpiValue}>{hazard.total || 0}</div>
            <div style={styles.kpiTrend}>
              <RiseOutlined /> 本月新增{' '}
              <ArrowRightOutlined style={{ fontSize: 10, marginLeft: 4 }} />
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div style={styles.kpiCard} onClick={() => navigate('/tasks')} className="clickable-card">
            <div style={styles.kpiHeader}>
              <CheckCircleOutlined style={{ ...styles.kpiIcon, color: '#52c41a' }} />
              <span style={styles.kpiLabel}>整改率</span>
            </div>
            <div style={{ ...styles.kpiValue, color: '#52c41a' }}>{hazard.closure_rate || 0}%</div>
            <div style={styles.progressWrapper}>
              <ProgressBar value={hazard.closure_rate || 0} max={100} color="#52c41a" />
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div style={styles.kpiCard} onClick={() => navigate('/tasks')} className="clickable-card">
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
          <div
            style={styles.kpiCard}
            onClick={() => navigate('/reports')}
            className="clickable-card"
          >
            <div style={styles.kpiHeader}>
              <FileTextOutlined style={{ ...styles.kpiIcon, color: '#faad14' }} />
              <span style={styles.kpiLabel}>报告总数</span>
            </div>
            <div style={styles.kpiValue}>{summary.report?.total || 0}</div>
            <div style={styles.kpiTrend}>
              <RiseOutlined /> 本月新增{' '}
              <ArrowRightOutlined style={{ fontSize: 10, marginLeft: 4 }} />
            </div>
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <div style={styles.actionCard}>
            <div style={styles.actionTitle}>快捷入口</div>
            <Space wrap size={12}>
              <Button
                icon={<SafetyOutlined />}
                onClick={() => navigate('/hazards')}
                style={styles.actionBtn}
              >
                隐患管理
              </Button>
              <Button
                icon={<ToolOutlined />}
                onClick={() => navigate('/tasks')}
                style={styles.actionBtn}
              >
                任务中心
              </Button>
              <Button
                icon={<AlertOutlined />}
                onClick={() => navigate('/risks')}
                style={styles.actionBtn}
              >
                风险管理
              </Button>
              <Button
                icon={<AuditOutlined />}
                onClick={() => navigate('/approval-center')}
                style={styles.actionBtn}
              >
                审批中心
              </Button>
              <Button
                icon={<FileTextOutlined />}
                onClick={() => navigate('/reports')}
                style={styles.actionBtn}
              >
                报告中心
              </Button>
            </Space>
          </div>
        </Col>
      </Row>

      <div style={styles.chartCard}>
        <div style={styles.chartTitle}>随手拍趋势（近30天）</div>
        <div style={styles.chartContainer}>
          {hazardTrend.map((item, index) => (
            <div key={index} style={styles.chartBar}>
              <div
                title={`${item.date}: ${item.count}条`}
                style={{
                  ...styles.chartBarFill,
                  height: `${Math.max((item.count / maxCount) * 100, item.count > 0 ? 4 : 0)}%`,
                  background:
                    item.count > 0 ? 'var(--color-primary)' : 'var(--color-surface-container)',
                }}
              />
              <span style={styles.chartLabel}>{index % 5 === 0 ? item.date?.slice(5) : ''}</span>
            </div>
          ))}
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>随手拍类型分布</div>
            <div style={styles.typeList}>
              {hazardByType.length === 0 ? (
                <EmptyState type="list" />
              ) : (
                hazardByType.map((item, index) => (
                  <div key={index} style={styles.typeItem}>
                    <div style={styles.typeHeader}>
                      <span style={styles.typeName}>{item.name}</span>
                      <span style={styles.typeValue}>
                        {item.value}条 · {item.rate}%
                      </span>
                    </div>
                    <ProgressBar
                      value={item.rate}
                      max={100}
                      color={typeColors[index % typeColors.length]}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>随手拍状态分布</div>
            <div style={styles.statusGrid}>
              {hazardByStatus.length === 0 ? (
                <EmptyState type="list" />
              ) : (
                hazardByStatus.map((item, index) => {
                  const statusColor = statusColors[item.key] || { bg: '#f3f4f6', color: '#6b7280' }
                  return (
                    <div key={index} style={{ ...styles.statusCard, background: statusColor.bg }}>
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
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100vh' },
  kpiCard: {
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
    boxShadow: 'var(--shadow-soft)',
  },
  kpiHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  kpiIcon: { fontSize: 20 },
  kpiLabel: { fontSize: 14, color: 'var(--color-on-surface-variant)' },
  kpiValue: { fontSize: 32, fontWeight: 700, color: 'var(--color-on-surface)' },
  kpiTrend: { marginTop: 8, fontSize: 12, color: 'var(--color-on-surface-variant)' },
  progressWrapper: { marginTop: 12 },
  chartCard: {
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
    boxShadow: 'var(--shadow-soft)',
    marginBottom: 16,
  },
  chartTitle: { fontSize: 16, fontWeight: 600, color: 'var(--color-on-surface)', marginBottom: 16 },
  chartContainer: { display: 'flex', alignItems: 'flex-end', gap: 8, height: 220 },
  chartBar: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  chartBarFill: { width: '100%', borderRadius: 999, minHeight: 2 },
  chartLabel: { fontSize: 11, color: 'var(--color-on-surface-variant)' },
  typeList: { display: 'flex', flexDirection: 'column', gap: 16 },
  typeItem: { display: 'flex', flexDirection: 'column', gap: 8 },
  typeHeader: { display: 'flex', justifyContent: 'space-between', gap: 12 },
  typeName: { color: 'var(--color-on-surface)', fontWeight: 500 },
  typeValue: { color: 'var(--color-on-surface-variant)', fontSize: 13 },
  statusGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 },
  statusCard: { borderRadius: 16, padding: 16, textAlign: 'center' },
  statusValue: { fontSize: 28, fontWeight: 700 },
  statusLabel: { fontSize: 13 },
  actionCard: {
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    padding: 16,
    boxShadow: 'var(--shadow-soft)',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-on-surface)',
    marginBottom: 12,
  },
  actionBtn: { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' },
}
