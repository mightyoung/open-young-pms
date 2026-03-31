import React, { useMemo } from 'react'
import { Row, Col, Card, Progress, Typography, Tag, Table, Badge, Tooltip, Button } from 'antd'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from 'lucide-react'

const { Title, Text } = Typography

// 颜色配置 - 国企蓝白风
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

const STATUS_COLORS = {
  normal: COLORS.success,
  warning: COLORS.warning,
  critical: COLORS.danger,
}

// 模拟数据
const PROJECT_HEALTH = {
  total: 52,
  normal: 40,
  warning: 8,
  critical: 4,
}

const PROJECTS = [
  {
    id: 1,
    name: '产线自动化改造项目',
    status: 'normal',
    progress: 78,
    budget: 85,
    leader: '张经理',
  },
  { id: 2, name: '新厂房建设项目', status: 'normal', progress: 95, budget: 87, leader: '李经理' },
  {
    id: 3,
    name: 'XX集团设备安装工程',
    status: 'warning',
    progress: 62,
    budget: 70,
    leader: '王经理',
  },
  {
    id: 4,
    name: '检测设备采购项目',
    status: 'critical',
    progress: 35,
    budget: 45,
    leader: '刘经理',
  },
  { id: 5, name: '研发中心升级项目', status: 'normal', progress: 88, budget: 82, leader: '陈经理' },
  {
    id: 6,
    name: '污水处理系统改造',
    status: 'warning',
    progress: 55,
    budget: 60,
    leader: '赵经理',
  },
]

const TREND_DATA = [
  { name: '1月', value: 45 },
  { name: '2月', value: 52 },
  { name: '3月', value: 48 },
  { name: '4月', value: 63 },
  { name: '5月', value: 58 },
  { name: '6月', value: 72 },
]

const PIE_DATA = [
  { name: '安全隐患', value: 35, color: COLORS.danger },
  { name: '质量缺陷', value: 25, color: COLORS.warning },
  { name: '设备故障', value: 20, color: COLORS.primary },
  { name: '工艺偏差', value: 12, color: '#8b5cf6' },
  { name: '其他', value: 8, color: COLORS.textMuted },
]

const ALERTS = [
  {
    id: 1,
    type: 'critical',
    project: '检测设备采购项目',
    issue: '进度滞后25%，设备到货延迟',
    time: '2小时前',
  },
  {
    id: 2,
    type: 'warning',
    project: 'XX集团设备安装项目',
    issue: '预算执行偏快92%，需关注',
    time: '5小时前',
  },
  { id: 3, type: 'critical', project: 'O3厂区建设项目', issue: '图纸冲突导致停工', time: '1天前' },
]

// 健康度雷达组件
const HealthRadar = () => (
  <Card
    title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Zap size={18} color={COLORS.primary} />
        <span>全局健康度</span>
      </div>
    }
    extra={<Tag color="green">实时更新</Tag>}
    style={{ borderRadius: 12, height: '100%' }}
  >
    <div style={{ textAlign: 'center', marginBottom: 16 }}>
      <Progress
        type="circle"
        percent={Math.round((PROJECT_HEALTH.normal / PROJECT_HEALTH.total) * 100)}
        strokeColor={COLORS.success}
        size={100}
        format={p => (
          <span style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.text }}>{p}%</span>
        )}
      />
      <div style={{ marginTop: 8, color: COLORS.textMuted, fontSize: 12 }}>
        在建项目 {PROJECT_HEALTH.total} 个
      </div>
    </div>
    <Row gutter={8}>
      <Col span={8}>
        <div
          style={{
            textAlign: 'center',
            padding: '8px 4px',
            background: `${COLORS.success}15`,
            borderRadius: 8,
          }}
        >
          <CheckCircle2 size={20} color={COLORS.success} />
          <div style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.success }}>
            {PROJECT_HEALTH.normal}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>正常</div>
        </div>
      </Col>
      <Col span={8}>
        <div
          style={{
            textAlign: 'center',
            padding: '8px 4px',
            background: `${COLORS.warning}15`,
            borderRadius: 8,
          }}
        >
          <Clock size={20} color={COLORS.warning} />
          <div style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.warning }}>
            {PROJECT_HEALTH.warning}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>缓滞</div>
        </div>
      </Col>
      <Col span={8}>
        <div
          style={{
            textAlign: 'center',
            padding: '8px 4px',
            background: `${COLORS.danger}15`,
            borderRadius: 8,
          }}
        >
          <AlertTriangle size={20} color={COLORS.danger} />
          <div style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.danger }}>
            {PROJECT_HEALTH.critical}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>延期</div>
        </div>
      </Col>
    </Row>
  </Card>
)

// 项目九宫格
const ProjectGrid = () => (
  <Card title="50强项目战情" style={{ borderRadius: 12, height: '100%' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {PROJECTS.map(project => (
        <Tooltip key={project.id} title={`负责人: ${project.leader}`}>
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              border: `2px solid ${STATUS_COLORS[project.status]}30`,
              background: `${STATUS_COLORS[project.status]}08`,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: STATUS_COLORS[project.status],
                }}
              />
              <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                {project.name.substring(0, 8)}...
              </span>
            </div>
            <Progress
              percent={project.progress}
              size="small"
              strokeColor={STATUS_COLORS[project.status]}
              showInfo={false}
            />
            <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4 }}>
              进度 {project.progress}% | 预算 {project.budget}%
            </div>
          </div>
        </Tooltip>
      ))}
    </div>
  </Card>
)

// 趋势图
const TrendChart = () => (
  <Card title="项目完成趋势" style={{ borderRadius: 12 }}>
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={TREND_DATA}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLORS.textMuted }} />
        <YAxis tick={{ fontSize: 11, fill: COLORS.textMuted }} />
        <RechartsTooltip />
        <Area
          type="monotone"
          dataKey="value"
          stroke={COLORS.primary}
          strokeWidth={2}
          fill="url(#colorValue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </Card>
)

// 问题分布饼图
const IssueDistribution = () => (
  <Card title="问题类型分布" style={{ borderRadius: 12 }}>
    <Row gutter={16}>
      <Col span={12}>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={PIE_DATA}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={60}
              paddingAngle={2}
              dataKey="value"
            >
              {PIE_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Col>
      <Col span={12}>
        {PIE_DATA.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
            <span style={{ fontSize: 11, color: COLORS.text, flex: 1 }}>{item.name}</span>
            <span style={{ fontSize: 11, color: COLORS.textMuted }}>{item.value}%</span>
          </div>
        ))}
      </Col>
    </Row>
  </Card>
)

// 异常追回列表
const AlertList = () => (
  <Card
    title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <AlertTriangle size={18} color={COLORS.danger} />
        <span>异常追回列表</span>
      </div>
    }
    extra={
      <Button type="link" size="small" style={{ color: COLORS.primary }}>
        查看全部
      </Button>
    }
    style={{ borderRadius: 12, height: '100%' }}
  >
    {ALERTS.map((alert, i) => (
      <div
        key={alert.id}
        style={{
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          background: `${STATUS_COLORS[alert.type]}08`,
          border: `1px solid ${STATUS_COLORS[alert.type]}30`,
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Badge status={alert.type === 'critical' ? 'error' : 'warning'} />
          <span style={{ fontWeight: 600, fontSize: 13, color: COLORS.text }}>{alert.project}</span>
        </div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>{alert.issue}</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted }}>{alert.time}</div>
      </div>
    ))}
  </Card>
)

// 全局燃耗指标
const BurnRate = () => (
  <Card title="全局燃耗指标" style={{ borderRadius: 12 }}>
    <Row gutter={16}>
      <Col span={12}>
        <div style={{ textAlign: 'center', padding: 16, background: COLORS.bg, borderRadius: 8 }}>
          <DollarSign size={20} color={COLORS.primary} style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.text }}>80%</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>预算消耗</div>
          <Progress
            percent={80}
            showInfo={false}
            strokeColor={COLORS.warning}
            style={{ marginTop: 8 }}
          />
        </div>
      </Col>
      <Col span={12}>
        <div style={{ textAlign: 'center', padding: 16, background: COLORS.bg, borderRadius: 8 }}>
          <TrendingUp size={20} color={COLORS.success} style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.text }}>92%</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>产能利用率</div>
          <Progress
            percent={92}
            showInfo={false}
            strokeColor={COLORS.success}
            style={{ marginTop: 8 }}
          />
        </div>
      </Col>
    </Row>
    <div
      style={{
        marginTop: 16,
        padding: 12,
        background: `${COLORS.success}10`,
        borderRadius: 8,
        border: `1px solid ${COLORS.success}30`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CheckCircle2 size={16} color={COLORS.success} />
        <span style={{ fontSize: 12, color: COLORS.success, fontWeight: 500 }}>
          预判：系统完全健康
        </span>
      </div>
    </div>
  </Card>
)

// 项目列表
const ProjectTable = () => {
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: STATUS_COLORS[record.status],
            }}
          />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </div>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: v => <Progress percent={v} size="small" strokeColor={COLORS.primary} />,
    },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
      render: v => <span style={{ color: v > 90 ? COLORS.danger : COLORS.text }}>{v}%</span>,
    },
    { title: '负责人', dataIndex: 'leader', key: 'leader' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Button type="link" size="small" style={{ color: COLORS.primary }}>
          钻取
        </Button>
      ),
    },
  ]

  return (
    <Card title="项目执行一览" style={{ borderRadius: 12 }}>
      <Table columns={columns} dataSource={PROJECTS} rowKey="id" pagination={false} size="small" />
    </Card>
  )
}

export default function StrategicCockpit() {
  return (
    <div style={{ padding: 24, background: COLORS.bg, minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: COLORS.text, margin: 0 }}>
          战区司令舱
        </Title>
        <Text style={{ color: COLORS.textMuted }}>公司领导专属 · 全局战略视角</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <HealthRadar />
        </Col>
        <Col span={12}>
          <ProjectGrid />
        </Col>
        <Col span={6}>
          <BurnRate />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <TrendChart />
        </Col>
        <Col span={6}>
          <IssueDistribution />
        </Col>
        <Col span={6}>
          <AlertList />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProjectTable />
        </Col>
      </Row>
    </div>
  )
}
