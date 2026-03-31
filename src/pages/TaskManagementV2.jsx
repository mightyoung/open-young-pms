import React, { useState, useMemo } from 'react'
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Typography,
  Progress,
  Badge,
  Tooltip,
  Tree,
  Divider,
  message,
  Alert,
  List,
  Avatar,
  Tabs,
} from 'antd'
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  FolderTree,
  GitBranch,
  AlertTriangle,
  Link2,
  PlayCircle,
  PauseCircle,
  Zap,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
} from 'recharts'
import { calculateCriticalPath, findResourceConflicts, wbsToTree } from '../utils/wbs'

const { Title, Text } = Typography
const { TextArea } = Input
const { RangePicker } = DatePicker

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

const MOCK_TASKS = [
  {
    id: 1,
    wbs: '1.1',
    title: '需求调研',
    phase: '方案设计',
    assignee: '张三',
    startDate: '2026-01-15',
    endDate: '2026-02-15',
    progress: 100,
    status: 'done',
    priority: 'high',
    duration: 4,
    depends: [],
    critical: false,
  },
  {
    id: 2,
    wbs: '1.2',
    title: '技术方案编制',
    phase: '方案设计',
    assignee: '李四',
    startDate: '2026-02-01',
    endDate: '2026-03-15',
    progress: 100,
    status: 'done',
    priority: 'high',
    duration: 5,
    depends: [1],
    critical: true,
  },
  {
    id: 3,
    wbs: '1.3',
    title: '方案评审',
    phase: '方案设计',
    assignee: '王五',
    startDate: '2026-03-01',
    endDate: '2026-04-15',
    progress: 80,
    status: 'inprogress',
    priority: 'high',
    duration: 3,
    depends: [2],
    critical: true,
  },
  {
    id: 4,
    wbs: '2.1',
    title: '设备选型',
    phase: '设备采购',
    assignee: '赵六',
    startDate: '2026-02-15',
    endDate: '2026-03-31',
    progress: 100,
    status: 'done',
    priority: 'medium',
    duration: 4,
    depends: [],
    critical: false,
  },
  {
    id: 5,
    wbs: '2.2',
    title: '招标',
    phase: '设备采购',
    assignee: '张三',
    startDate: '2026-03-01',
    endDate: '2026-04-30',
    progress: 65,
    status: 'inprogress',
    priority: 'medium',
    duration: 6,
    depends: [4],
    critical: false,
  },
  {
    id: 6,
    wbs: '2.3',
    title: '合同签订',
    phase: '设备采购',
    assignee: '李四',
    startDate: '2026-05-01',
    endDate: '2026-05-15',
    progress: 0,
    status: 'pending',
    priority: 'medium',
    duration: 2,
    depends: [5],
    critical: true,
  },
  {
    id: 7,
    wbs: '3.1',
    title: '基础施工',
    phase: '安装施工',
    assignee: '赵六',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    progress: 30,
    status: 'inprogress',
    priority: 'high',
    duration: 8,
    depends: [5],
    critical: true,
  },
  {
    id: 8,
    wbs: '3.2',
    title: '设备就位',
    phase: '安装施工',
    assignee: '王五',
    startDate: '2026-07-01',
    endDate: '2026-07-15',
    progress: 0,
    status: 'pending',
    priority: 'medium',
    duration: 2,
    depends: [7],
    critical: false,
  },
  {
    id: 9,
    wbs: '4.1',
    title: '单机调试',
    phase: '调试验收',
    assignee: '张三',
    startDate: '2026-07-16',
    endDate: '2026-08-15',
    progress: 0,
    status: 'pending',
    priority: 'high',
    duration: 4,
    depends: [8],
    critical: true,
  },
  {
    id: 10,
    wbs: '4.2',
    title: '联调联试',
    phase: '调试验收',
    assignee: '李四',
    startDate: '2026-08-16',
    endDate: '2026-09-15',
    progress: 0,
    status: 'pending',
    priority: 'high',
    duration: 4,
    depends: [9],
    critical: true,
  },
]

const WBS_ITEMS = [
  { id: '0', title: '产线自动化改造项目', parentKey: null, wbs: '0' },
  { id: '1', title: '1. 方案设计', parentKey: '0', wbs: '1' },
  { id: '1-1', title: '1.1 需求调研', parentKey: '1', wbs: '1.1', progress: 100 },
  { id: '1-2', title: '1.2 技术方案编制', parentKey: '1', wbs: '1.2', progress: 100 },
  { id: '1-3', title: '1.3 方案评审', parentKey: '1', wbs: '1.3', progress: 80 },
  { id: '2', title: '2. 设备采购', parentKey: '0', wbs: '2' },
  { id: '2-1', title: '2.1 设备选型', parentKey: '2', wbs: '2.1', progress: 100 },
  { id: '2-2', title: '2.2 招标', parentKey: '2', wbs: '2.2', progress: 65 },
  { id: '2-3', title: '2.3 合同签订', parentKey: '2', wbs: '2.3', progress: 0 },
  { id: '3', title: '3. 安装施工', parentKey: '0', wbs: '3' },
  { id: '3-1', title: '3.1 基础施工', parentKey: '3', wbs: '3.1', progress: 30 },
  { id: '3-2', title: '3.2 设备就位', parentKey: '3', wbs: '3.2', progress: 0 },
  { id: '4', title: '4. 调试验收', parentKey: '0', wbs: '4' },
  { id: '4-1', title: '4.1 单机调试', parentKey: '4', wbs: '4.1', progress: 0 },
  { id: '4-2', title: '4.2 联调联试', parentKey: '4', wbs: '4.2', progress: 0 },
]

const TEAM_MEMBERS = ['张三', '李四', '王五', '赵六']

export default function TaskManagementV2() {
  const [activeTab, setActiveTab] = useState('wbs')
  const [tasks] = useState(MOCK_TASKS)
  const [showConflict, setShowConflict] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  const criticalIds = useMemo(() => calculateCriticalPath(tasks), [tasks])
  const criticalTasks = tasks.filter(t => criticalIds.includes(t.id))
  const conflicts = useMemo(() => findResourceConflicts(tasks, TEAM_MEMBERS), [tasks])

  const wbsTreeData = useMemo(() => wbsToTree(WBS_ITEMS), [])

  const ganttData = tasks.map(t => ({
    ...t,
    start: new Date(t.startDate).getTime(),
    end: new Date(t.endDate).getTime(),
    critical: criticalIds.includes(t.id),
  }))

  const resourceData = TEAM_MEMBERS.map(member => ({
    name: member,
    tasks: tasks.filter(t => t.assignee === member).length,
    inProgress: tasks.filter(t => t.assignee === member && t.status === 'inprogress').length,
    done: tasks.filter(t => t.assignee === member && t.status === 'done').length,
  }))

  const columns = [
    {
      title: 'WBS',
      dataIndex: 'wbs',
      width: 70,
      render: (v, r) => <Tag color={r.critical ? COLORS.danger : COLORS.primary}>{v}</Tag>,
    },
    {
      title: '任务名称',
      dataIndex: 'title',
      render: (v, r) => (
        <Space>
          {v}
          {r.critical && <Zap size={12} color={COLORS.danger} />}
        </Space>
      ),
    },
    { title: '负责人', dataIndex: 'assignee', width: 80 },
    { title: '工期', dataIndex: 'duration', width: 60, render: v => `${v}天` },
    { title: '开始日期', dataIndex: 'startDate', width: 100 },
    { title: '结束日期', dataIndex: 'endDate', width: 100 },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 120,
      render: v => <Progress percent={v} size="small" strokeColor={COLORS.primary} />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: v => (
        <Tag color={v === 'done' ? 'success' : v === 'inprogress' ? 'processing' : 'default'}>
          {v === 'done' ? '已完成' : v === 'inprogress' ? '进行中' : '待开始'}
        </Tag>
      ),
    },
    {
      title: '前置任务',
      dataIndex: 'depends',
      width: 100,
      render: deps =>
        deps.length > 0 ? (
          <Space>
            <Link2 size={12} />
            {deps.map(d => tasks.find(t => t.id === d)?.wbs).join(', ')}
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
  ]

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', padding: '24px 28px' }}>
      <Card
        title={
          <Space>
            <FolderTree size={16} color={COLORS.primary} />
            <span>任务管理 2.0</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<Zap size={14} />} onClick={() => setShowConflict(true)}>
              资源冲突{' '}
              {conflicts.length > 0 && (
                <Badge count={conflicts.length} style={{ background: COLORS.danger }} />
              )}
            </Button>
            <Button type="primary" icon={<Plus size={14} />}>
              新建任务
            </Button>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'wbs',
              label: (
                <Space>
                  <FolderTree size={14} />
                  WBS分解
                </Space>
              ),
            },
            {
              key: 'critical',
              label: (
                <Space>
                  <Zap size={14} />
                  关键路径 ({criticalTasks.length})
                </Space>
              ),
            },
            {
              key: 'gantt',
              label: (
                <Space>
                  <Calendar size={14} />
                  甘特图
                </Space>
              ),
            },
            {
              key: 'resource',
              label: (
                <Space>
                  <User size={14} />
                  资源负载
                </Space>
              ),
            },
          ]}
        />

        {activeTab === 'wbs' && (
          <Row gutter={24}>
            <Col span={14}>
              <Tree
                treeData={wbsTreeData}
                showLine={{ showLeafIcon: false }}
                defaultExpandAll
                titleRender={node => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    <Text>{node.title}</Text>
                    {node.progress !== undefined && (
                      <Progress
                        percent={node.progress}
                        size="small"
                        style={{ width: 80 }}
                        strokeColor={COLORS.primary}
                      />
                    )}
                  </div>
                )}
              />
            </Col>
            <Col span={10}>
              <Card size="small" title="任务统计" style={{ background: COLORS.bg }}>
                <Row gutter={[8, 8]}>
                  {[
                    { label: '总任务', value: tasks.length, color: COLORS.primary },
                    {
                      label: '进行中',
                      value: tasks.filter(t => t.status === 'inprogress').length,
                      color: COLORS.warning,
                    },
                    {
                      label: '已完成',
                      value: tasks.filter(t => t.status === 'done').length,
                      color: COLORS.success,
                    },
                    { label: '关键任务', value: criticalTasks.length, color: COLORS.danger },
                  ].map(s => (
                    <Col span={12} key={s.label}>
                      <div
                        style={{
                          background: COLORS.card,
                          borderRadius: 8,
                          padding: 12,
                          textAlign: 'center',
                          border: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>
                          {s.value}
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted }}>{s.label}</div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
              <Card size="small" title="关键路径任务" style={{ marginTop: 16 }}>
                {criticalTasks.map(t => (
                  <div
                    key={t.id}
                    style={{
                      padding: '6px 0',
                      borderBottom: `1px solid ${COLORS.border}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Space>
                      <Tag color={COLORS.danger}>{t.wbs}</Tag>
                      <Text>{t.title}</Text>
                    </Space>
                    <Text type="secondary">{t.duration}天</Text>
                  </div>
                ))}
              </Card>
            </Col>
          </Row>
        )}

        {activeTab === 'critical' && (
          <div>
            <Alert
              message={
                <Space>
                  <Zap size={14} color={COLORS.danger} />
                  <Text>关键路径分析</Text>
                </Space>
              }
              description={`当前项目有 ${criticalTasks.length} 个关键任务，关键路径上的任务延迟将直接影响项目整体工期。`}
              type="error"
              style={{ marginBottom: 16 }}
            />
            <Table
              dataSource={criticalTasks}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        )}

        {activeTab === 'gantt' && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{ width: 12, height: 12, background: COLORS.danger, borderRadius: 2 }}
                  />
                  <Text>关键任务</Text>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{ width: 12, height: 12, background: COLORS.primary, borderRadius: 2 }}
                  />
                  <Text>非关键任务</Text>
                </div>
              </Col>
            </Row>
            <Table
              dataSource={tasks}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="small"
              rowClassName={r => (criticalIds.includes(r.id) ? 'critical-row' : '')}
            />
            <style>{`.critical-row { background: ${COLORS.danger}10 !important; }`}</style>
          </div>
        )}

        {activeTab === 'resource' && (
          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title="人员工作负载">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={resourceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Bar dataKey="inProgress" stackId="a" fill={COLORS.warning} name="进行中" />
                    <Bar dataKey="done" stackId="a" fill={COLORS.success} name="已完成" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="资源冲突检测">
                {conflicts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: COLORS.textMuted }}>
                    <CheckCircle2 size={24} color={COLORS.success} />
                    <div style={{ marginTop: 8 }}>暂无资源冲突</div>
                  </div>
                ) : (
                  conflicts.map((c, i) => (
                    <Alert
                      key={i}
                      type="warning"
                      message={
                        <Space>
                          <AlertTriangle size={14} />
                          <Text>{c.resource}</Text>
                          <Text type="secondary">
                            在 {c.task.wbs} {c.task.title} 与{' '}
                            {c.overlapped.map(o => o.wbs).join(', ')} 存在时间冲突
                          </Text>
                        </Space>
                      }
                      style={{ marginBottom: 8 }}
                    />
                  ))
                )}
              </Card>
            </Col>
          </Row>
        )}
      </Card>

      <Modal
        title={
          <Space>
            <AlertTriangle size={16} color={COLORS.danger} />
            资源冲突详情
          </Space>
        }
        open={showConflict}
        onCancel={() => setShowConflict(false)}
        footer={<Button onClick={() => setShowConflict(false)}>关闭</Button>}
        width={600}
      >
        {conflicts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <CheckCircle2 size={48} color={COLORS.success} />
            <div style={{ marginTop: 16, fontSize: 16 }}>恭喜！暂无资源冲突</div>
          </div>
        ) : (
          conflicts.map((c, i) => (
            <Card key={i} size="small" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Avatar style={{ background: COLORS.primary }}>{c.resource[0]}</Avatar>
                <Text strong>{c.resource}</Text>
                <Badge
                  count={`${c.overlapped.length} 项冲突`}
                  style={{ background: COLORS.danger }}
                />
              </div>
              {c.overlapped.map((t, j) => (
                <Tag key={j} color={COLORS.danger}>
                  {t.wbs} {t.title}
                </Tag>
              ))}
            </Card>
          ))
        )}
      </Modal>
    </div>
  )
}
