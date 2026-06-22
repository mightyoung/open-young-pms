import React from 'react'
import { Button, Col, Row, Space } from 'antd'
import {
  AlertOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  FileTextOutlined,
  RiseOutlined,
  SafetyOutlined,
  ToolOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { EmptyState, PageHeader, ProgressBar, SkeletonContent } from '../../../components/PMSComponents'
import { useDashboardData } from '../hooks/useDashboardData'

const typeColors = ['#0f766e', '#2563eb', '#d97706', '#dc2626', '#7c3aed']

const statusColors = {
  pending: { bg: '#fef3c7', color: '#92400e' },
  in_progress: { bg: '#dbeafe', color: '#1e40af' },
  resolved: { bg: '#dcfce7', color: '#166534' },
}

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
        <div style={styles.panel}>
          <EmptyState type="list" title="暂无数据" description="暂无仪表盘数据" />
        </div>
      </div>
    )
  }

  const hazard = summary.hazard || {}
  const task = summary.task || {}
  const generatedAt = summary.generated_at
    ? new Date(summary.generated_at).toLocaleString('zh-CN')
    : '尚未同步'

  return (
    <div style={styles.page}>
      <section className="dashboard-hero" style={styles.hero}>
        <div>
          <PageHeader
            title="监测驾驶舱"
            subtitle={`数据更新于 ${generatedAt}`}
            icon={<DashboardOutlined style={{ color: 'var(--color-primary)' }} />}
          />
          <p style={styles.heroCopy}>集中查看隐患、整改、任务和报告状态，辅助项目团队快速定位当天重点。</p>
        </div>
        <Space wrap size={10}>
          <Button type="primary" icon={<SafetyOutlined />} onClick={() => navigate('/hazards')}>
            上报隐患
          </Button>
          <Button icon={<AuditOutlined />} onClick={() => navigate('/approval-center')}>
            处理审批
          </Button>
        </Space>
      </section>

      <Row gutter={[16, 16]} style={styles.kpiGrid}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            icon={<SafetyOutlined />}
            label="随手拍总数"
            value={hazard.total || 0}
            meta="进入隐患台账"
            onClick={() => navigate('/hazards')}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            icon={<CheckCircleOutlined />}
            label="整改率"
            value={`${hazard.closure_rate || 0}%`}
            meta="闭环完成情况"
            progress={hazard.closure_rate || 0}
            tone="success"
            onClick={() => navigate('/tasks')}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            icon={<ToolOutlined />}
            label="任务完成率"
            value={`${task.completion_rate || 0}%`}
            meta="任务中心"
            progress={task.completion_rate || 0}
            onClick={() => navigate('/tasks')}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            icon={<FileTextOutlined />}
            label="报告总数"
            value={summary.report?.total || 0}
            meta="查看报告中心"
            tone="warning"
            onClick={() => navigate('/reports')}
          />
        </Col>
      </Row>

      <section className="dashboard-action-panel" style={styles.actionPanel}>
        <div>
          <h2 style={styles.sectionTitle}>快捷入口</h2>
          <p style={styles.sectionDesc}>把高频动作集中在顶部，减少跨模块查找。</p>
        </div>
        <Space wrap size={10}>
          {[
            { icon: <SafetyOutlined />, label: '隐患管理', path: '/hazards' },
            { icon: <ToolOutlined />, label: '任务中心', path: '/tasks' },
            { icon: <AlertOutlined />, label: '风险管理', path: '/risks' },
            { icon: <AuditOutlined />, label: '审批中心', path: '/approval-center' },
            { icon: <FileTextOutlined />, label: '报告中心', path: '/reports' },
          ].map(item => (
            <Button key={item.path} icon={item.icon} onClick={() => navigate(item.path)} style={styles.actionBtn}>
              {item.label}
            </Button>
          ))}
        </Space>
      </section>

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.sectionTitle}>随手拍趋势</h2>
            <p style={styles.sectionDesc}>近 30 天隐患上报数量</p>
          </div>
          <RiseOutlined style={{ color: 'var(--color-primary)', fontSize: 20 }} />
        </div>
        <TrendBars data={hazardTrend} />
      </section>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <section style={styles.panel}>
            <h2 style={styles.sectionTitle}>类型分布</h2>
            <div style={styles.typeList}>
              {hazardByType.length === 0 ? (
                <EmptyState type="list" />
              ) : (
                hazardByType.map((item, index) => (
                  <div key={item.name || index} style={styles.typeItem}>
                    <div style={styles.typeHeader}>
                      <span style={styles.typeName}>{item.name}</span>
                      <span style={styles.typeValue}>
                        {item.value} 条 / {item.rate}%
                      </span>
                    </div>
                    <ProgressBar value={item.rate} max={100} color={typeColors[index % typeColors.length]} />
                  </div>
                ))
              )}
            </div>
          </section>
        </Col>
        <Col xs={24} lg={12}>
          <section style={styles.panel}>
            <h2 style={styles.sectionTitle}>状态分布</h2>
            <div className="dashboard-status-grid" style={styles.statusGrid}>
              {hazardByStatus.length === 0 ? (
                <EmptyState type="list" />
              ) : (
                hazardByStatus.map((item, index) => {
                  const statusColor = statusColors[item.key] || { bg: '#f3f4f6', color: '#6b7280' }
                  return (
                    <div key={item.key || index} style={{ ...styles.statusCard, background: statusColor.bg }}>
                      <div style={{ ...styles.statusValue, color: statusColor.color }}>{item.value}</div>
                      <div style={{ ...styles.statusLabel, color: statusColor.color }}>{item.name}</div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </Col>
      </Row>
    </div>
  )
}

function KpiCard({ icon, label, value, meta, progress, tone = 'primary', onClick }) {
  const toneColor = tone === 'success' ? '#15803d' : tone === 'warning' ? '#d97706' : 'var(--color-primary)'

  return (
    <button type="button" style={styles.kpiCard} className="clickable-card" onClick={onClick}>
      <div style={styles.kpiHeader}>
        <span style={{ ...styles.kpiIcon, color: toneColor }}>{icon}</span>
        <span style={styles.kpiLabel}>{label}</span>
      </div>
      <div style={{ ...styles.kpiValue, color: toneColor }}>{value}</div>
      <div style={styles.kpiMeta}>{meta}</div>
      {progress !== undefined && (
        <div style={styles.progressWrapper}>
          <ProgressBar value={progress} max={100} color={toneColor} />
        </div>
      )}
    </button>
  )
}

function TrendBars({ data }) {
  if (!data.length) {
    return <EmptyState type="list" />
  }

  const maxCount = Math.max(...data.map(item => item.count), 1)

  return (
    <div style={styles.chartContainer}>
      {data.map((item, index) => (
        <div key={`${item.date || index}-${index}`} style={styles.chartBar}>
          <div
            title={`${item.date}: ${item.count}条`}
            style={{
              ...styles.chartBarFill,
              height: `${Math.max((item.count / maxCount) * 100, item.count > 0 ? 4 : 0)}%`,
              background: item.count > 0 ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
            }}
          />
          <span style={styles.chartLabel}>{index % 5 === 0 ? item.date?.slice(5) : ''}</span>
        </div>
      ))}
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100dvh',
    padding: 24,
    background: 'transparent',
  },
  hero: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 20,
    marginBottom: 18,
    padding: 24,
    border: '1px solid var(--color-border)',
    borderRadius: 16,
    background:
      'linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(236, 253, 245, 0.88)), var(--color-surface-container-lowest)',
    boxShadow: 'var(--shadow-soft)',
  },
  heroCopy: {
    maxWidth: 620,
    margin: '-12px 0 0 40px',
    color: 'var(--color-on-surface-variant)',
    fontSize: 14,
    lineHeight: 1.7,
  },
  kpiGrid: {
    marginBottom: 16,
  },
  kpiCard: {
    width: '100%',
    minHeight: 164,
    textAlign: 'left',
    background: 'var(--color-surface-container-lowest)',
    border: '1px solid var(--color-border)',
    borderRadius: 14,
    padding: 18,
    boxShadow: 'var(--shadow-soft)',
  },
  kpiHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  kpiIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 10,
    background: 'var(--color-primary-bg-light)',
    fontSize: 17,
  },
  kpiLabel: {
    color: 'var(--color-on-surface-variant)',
    fontSize: 13,
    fontWeight: 600,
  },
  kpiValue: {
    color: 'var(--color-on-surface)',
    fontSize: 34,
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: 0,
  },
  kpiMeta: {
    marginTop: 8,
    color: 'var(--color-text-muted)',
    fontSize: 12,
  },
  progressWrapper: {
    marginTop: 14,
  },
  actionPanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
    padding: '16px 18px',
    border: '1px solid var(--color-border)',
    borderRadius: 14,
    background: 'var(--color-surface-container-lowest)',
    boxShadow: 'var(--shadow-sm)',
  },
  actionBtn: {
    borderColor: 'var(--color-border)',
    color: 'var(--color-on-surface)',
    fontWeight: 600,
  },
  panel: {
    marginBottom: 16,
    padding: 20,
    background: 'var(--color-surface-container-lowest)',
    border: '1px solid var(--color-border)',
    borderRadius: 14,
    boxShadow: 'var(--shadow-soft)',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    margin: 0,
    color: 'var(--color-on-surface)',
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: 0,
  },
  sectionDesc: {
    margin: '4px 0 0',
    color: 'var(--color-on-surface-variant)',
    fontSize: 13,
  },
  chartContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    height: 220,
    paddingTop: 8,
  },
  chartBar: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    minWidth: 4,
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 999,
    minHeight: 2,
  },
  chartLabel: {
    minHeight: 14,
    color: 'var(--color-text-muted)',
    fontSize: 11,
  },
  typeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginTop: 16,
  },
  typeItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  typeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
  },
  typeName: {
    color: 'var(--color-on-surface)',
    fontWeight: 700,
  },
  typeValue: {
    color: 'var(--color-on-surface-variant)',
    fontSize: 13,
    whiteSpace: 'nowrap',
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 12,
    marginTop: 16,
  },
  statusCard: {
    minHeight: 110,
    borderRadius: 14,
    padding: 16,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  statusValue: {
    fontSize: 30,
    fontWeight: 800,
    lineHeight: 1.1,
  },
  statusLabel: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: 600,
  },
}
