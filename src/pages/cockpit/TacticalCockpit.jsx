import React from 'react'
import { Row, Col, Card, Progress, Typography, Tag, Alert, Badge } from 'antd'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { AlertTriangle, Zap, Calendar, HardDrive } from 'lucide-react'

const { Title, Text } = Typography

const COLORS = {
  primary: '#115cb9',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
  bg: '#f5f7fa',
  card: '#ffffff',
  border: '#e5e7eb',
  text: '#323235',
  textMuted: '#8c8c8c',
}

// 模拟数据
const DEPT_STATS = {
  totalProjects: 5,
  deliveryRate: 92,
  idleManpower: 0,
  nextWeekRisk: '吊车征用撞车',
}

const PROJECTS_PROGRESS = [
  { name: '数控产线', progress: 85, budget: 78, status: 'normal' },
  { name: '厂房建设', progress: 62, budget: 65, status: 'warning' },
  { name: '高压管路', progress: 45, budget: 55, status: 'warning' },
  { name: '软件系统', progress: 90, budget: 85, status: 'normal' },
  { name: '环保设备', progress: 70, budget: 72, status: 'normal' },
]

const RESOURCE_CONFLICT = [
  { week: '4/01', projectA: 80, projectB: 0, projectC: 0, projectD: 60 },
  { week: '4/08', projectA: 100, projectB: 20, projectC: 0, projectD: 80 },
  { week: '4/15', projectA: 60, projectB: 90, projectC: 30, projectD: 40 },
  { week: '4/22', projectA: 20, projectB: 100, projectC: 100, projectD: 20 },
  { week: '4/29', projectA: 0, projectB: 80, projectC: 60, projectD: 0 },
]

const MANPOWER_LOAD = [
  { name: '研发组', value: 90, status: 'warning' },
  { name: '安装组', value: 120, status: 'danger' },
  { name: '法务组', value: 40, status: 'normal' },
  { name: '采购组', value: 75, status: 'normal' },
  { name: '质检组', value: 85, status: 'normal' },
]

const ECO_CHANGES = [
  { project: '项目C', type: '图纸延期', count: 6, status: 'critical' },
  { project: '项目A', type: '变更申请', count: 2, status: 'warning' },
  { project: '项目B', type: '物料变更', count: 1, status: 'normal' },
]

// 部门概览
const DeptOverview = () => (
  <Card style={{ borderRadius: 12 }}>
    <Row gutter={16}>
      <Col span={6}>
        <div style={{ textAlign: 'center', padding: 16, background: COLORS.bg, borderRadius: 8 }}>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: COLORS.primary }}>
            {DEPT_STATS.totalProjects}
          </div>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>在建项目</div>
        </div>
      </Col>
      <Col span={6}>
        <div style={{ textAlign: 'center', padding: 16, background: COLORS.bg, borderRadius: 8 }}>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: COLORS.success }}>
            {DEPT_STATS.deliveryRate}%
          </div>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>交付率</div>
        </div>
      </Col>
      <Col span={6}>
        <div style={{ textAlign: 'center', padding: 16, background: COLORS.bg, borderRadius: 8 }}>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: COLORS.success }}>
            {DEPT_STATS.idleManpower}
          </div>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>闲置人力</div>
        </div>
      </Col>
      <Col span={6}>
        <div
          style={{
            textAlign: 'center',
            padding: 16,
            background: `${COLORS.danger}10`,
            borderRadius: 8,
            border: `1px solid ${COLORS.danger}30`,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.danger }}>
            🚨 {DEPT_STATS.nextWeekRisk}
          </div>
          <div style={{ fontSize: 12, color: COLORS.danger }}>下周风险预警</div>
        </div>
      </Col>
    </Row>
  </Card>
)

// 多项目横向进度
const ProjectProgress = () => (
  <Card
    title="多项目横向进度对比"
    style={{ borderRadius: 12 }}
    extra={<Tag icon={<Calendar size={12} />}>4月视图</Tag>}
  >
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={PROJECTS_PROGRESS} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: COLORS.textMuted }} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fill: COLORS.text }}
          width={60}
        />
        <RechartsTooltip />
        <Bar dataKey="progress" fill={COLORS.primary} radius={[0, 4, 4, 0]} name="进度%" />
      </BarChart>
    </ResponsiveContainer>
    <div style={{ marginTop: 12 }}>
      {PROJECTS_PROGRESS.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 60, fontSize: 12, color: COLORS.text }}>{p.name}</span>
          <Progress
            percent={p.progress}
            size="small"
            strokeColor={p.status === 'warning' ? COLORS.warning : COLORS.primary}
            style={{ flex: 1 }}
          />
          <Tag color={p.status === 'warning' ? 'orange' : 'blue'} style={{ marginRight: 0 }}>
            {p.status === 'warning' ? '预警' : '正常'}
          </Tag>
        </div>
      ))}
    </div>
  </Card>
)

// 资源冲突时间轴
const ResourceConflict = () => {
  const conflictData = [
    { date: '4/22', content: '项目B 与 项目C 在同日征用【特级焊工组】', severity: 'critical' },
    { date: '4/22', content: '项目C 与 项目A 争抢【高精度数控机床】', severity: 'critical' },
    { date: '4/29', content: '项目B 需要【100吨吊车】但档期冲突', severity: 'warning' },
  ]

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HardDrive size={18} color={COLORS.danger} />
          <span>多项目横向资源冲突盘</span>
        </div>
      }
      style={{ borderRadius: 12 }}
    >
      <Alert
        type="error"
        icon={<AlertTriangle size={16} />}
        message="系统检测到资源冲突，请手动拖拽进度让行"
        style={{ marginBottom: 16, borderRadius: 8 }}
      />

      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={RESOURCE_CONFLICT}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: COLORS.textMuted }} />
          <YAxis tick={{ fontSize: 10, fill: COLORS.textMuted }} />
          <RechartsTooltip />
          <Line
            type="monotone"
            dataKey="projectA"
            stroke={COLORS.primary}
            strokeWidth={2}
            dot={{ r: 4 }}
            name="项目A"
          />
          <Line
            type="monotone"
            dataKey="projectB"
            stroke={COLORS.success}
            strokeWidth={2}
            dot={{ r: 4 }}
            name="项目B"
          />
          <Line
            type="monotone"
            dataKey="projectC"
            stroke={COLORS.danger}
            strokeWidth={2}
            dot={{ r: 4 }}
            name="项目C"
          />
          <Line
            type="monotone"
            dataKey="projectD"
            stroke={COLORS.warning}
            strokeWidth={2}
            dot={{ r: 4 }}
            name="项目D"
          />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 16 }}>
        {conflictData.map((c, i) => (
          <div
            key={i}
            style={{
              padding: 10,
              marginBottom: 8,
              borderRadius: 8,
              background: `${COLORS.danger}08`,
              border: `1px solid ${COLORS.danger}30`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Badge status={c.severity === 'critical' ? 'error' : 'warning'} />
            <span style={{ fontSize: 12, color: COLORS.text }}>
              {c.date} · {c.content}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// 人效负载雷达
const ManpowerLoad = () => {
  const radarData = MANPOWER_LOAD.map(m => ({
    subject: m.name,
    value: m.value,
    fullMark: 150,
  }))

  return (
    <Card title="人效负载雷达" style={{ borderRadius: 12 }}>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
          <PolarGrid stroke={COLORS.border} />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: COLORS.text }} />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 150]}
            tick={{ fontSize: 10, fill: COLORS.textMuted }}
          />
          <Radar
            name="负载率"
            dataKey="value"
            stroke={COLORS.primary}
            fill={COLORS.primary}
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div style={{ marginTop: 12 }}>
        {MANPOWER_LOAD.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ width: 50, fontSize: 11, color: COLORS.text }}>{m.name}</span>
            <Progress
              percent={m.value}
              size="small"
              strokeColor={
                m.status === 'danger'
                  ? COLORS.danger
                  : m.status === 'warning'
                    ? COLORS.warning
                    : COLORS.success
              }
              style={{ flex: 1 }}
            />
            <Tag
              color={m.status === 'danger' ? 'red' : m.status === 'warning' ? 'orange' : 'green'}
              style={{ marginRight: 0 }}
            >
              {m.value > 100 ? '过载' : m.value < 60 ? '过闲' : '正常'}
            </Tag>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ECO变更榜单
const ECOChanges = () => (
  <Card
    title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Zap size={18} color={COLORS.warning} />
        <span>ECO图纸变更堵塞榜单</span>
      </div>
    }
    style={{ borderRadius: 12 }}
  >
    {ECO_CHANGES.map((eco, i) => (
      <div
        key={i}
        style={{
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          background: eco.status === 'critical' ? `${COLORS.danger}08` : `${COLORS.warning}08`,
          border: `1px solid ${eco.status === 'critical' ? COLORS.danger : COLORS.warning}30`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontWeight: 600, color: COLORS.text, fontSize: 13 }}>{eco.project}</div>
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>{eco.type}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: eco.status === 'critical' ? COLORS.danger : COLORS.warning,
            }}
          >
            {eco.count}
          </div>
          <div style={{ fontSize: 10, color: COLORS.textMuted }}>次</div>
        </div>
        {i === 0 && (
          <Tag color="red" style={{ marginRight: 0 }}>
            🏆 严重拖后腿
          </Tag>
        )}
      </div>
    ))}
  </Card>
)

export default function TacticalCockpit() {
  return (
    <div style={{ padding: 24, background: COLORS.bg, minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: COLORS.text, margin: 0 }}>
          前线指挥部
        </Title>
        <Text style={{ color: COLORS.textMuted }}>部门领导专属 · 横向协调视角</Text>
      </div>

      <DeptOverview />

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <ProjectProgress />
        </Col>
        <Col span={12}>
          <ResourceConflict />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <ManpowerLoad />
        </Col>
        <Col span={12}>
          <ECOChanges />
        </Col>
      </Row>
    </div>
  )
}
