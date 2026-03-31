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
  DatePicker,
  Row,
  Col,
  Typography,
  Progress,
  Badge,
  Tooltip,
  Tree,
  message,
} from 'antd'
import { Plus, Edit2, Trash2, FolderTree, GanttChart, Export } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts'
import { measureText } from '../utils/pretextMeasure'

const { Title, Text } = Typography
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

const WBS_DATA = [
  {
    title: '产线自动化改造项目',
    key: '0',
    wbs: '0',
    children: [
      {
        title: '1. 方案设计',
        key: '0-1',
        wbs: '1',
        children: [
          { title: '1.1 需求调研', key: '0-1-1', wbs: '1.1', progress: 100 },
          { title: '1.2 技术方案编制', key: '0-1-2', wbs: '1.2', progress: 100 },
          { title: '1.3 方案评审', key: '0-1-3', wbs: '1.3', progress: 80 },
        ],
      },
      {
        title: '2. 设备采购',
        key: '0-2',
        wbs: '2',
        children: [
          { title: '2.1 设备选型', key: '0-2-1', wbs: '2.1', progress: 100 },
          { title: '2.2 招标', key: '0-2-2', wbs: '2.2', progress: 65 },
          { title: '2.3 合同签订', key: '0-2-3', wbs: '2.3', progress: 30 },
          { title: '2.4 到货验收', key: '0-2-4', wbs: '2.4', progress: 0 },
        ],
      },
      {
        title: '3. 安装施工',
        key: '0-3',
        wbs: '3',
        children: [
          { title: '3.1 基础施工', key: '0-3-1', wbs: '3.1', progress: 0 },
          { title: '3.2 设备就位', key: '0-3-2', wbs: '3.2', progress: 0 },
          { title: '3.3 管线连接', key: '0-3-3', wbs: '3.3', progress: 0 },
          { title: '3.4 电气接线', key: '0-3-4', wbs: '3.4', progress: 0 },
        ],
      },
      {
        title: '4. 调试验收',
        key: '0-4',
        wbs: '4',
        children: [
          { title: '4.1 单机调试', key: '0-4-1', wbs: '4.1', progress: 0 },
          { title: '4.2 联调联试', key: '0-4-2', wbs: '4.2', progress: 0 },
          { title: '4.3 性能测试', key: '0-4-3', wbs: '4.3', progress: 0 },
          { title: '4.4 验收交付', key: '0-4-4', wbs: '4.4', progress: 0 },
        ],
      },
    ],
  },
]

const TASKS = [
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
  },
  {
    id: 5,
    wbs: '2.2',
    title: '招标',
    phase: '设备采购',
    assignee: '钱七',
    startDate: '2026-03-15',
    endDate: '2026-05-31',
    progress: 65,
    status: 'inprogress',
    priority: 'medium',
  },
  {
    id: 6,
    wbs: '2.3',
    title: '合同签订',
    phase: '设备采购',
    assignee: '孙八',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    progress: 30,
    status: 'inprogress',
    priority: 'low',
  },
]

const GANTT_DATA = [
  { name: '1.1 需求调研', start: 0, end: 4, progress: 100 },
  { name: '1.2 技术方案', start: 2, end: 7, progress: 100 },
  { name: '1.3 方案评审', start: 6, end: 12, progress: 80 },
  { name: '2.1 设备选型', start: 4, end: 10, progress: 100 },
  { name: '2.2 招标', start: 8, end: 16, progress: 65 },
  { name: '2.3 合同签订', start: 14, end: 20, progress: 30 },
  { name: '3.1 基础施工', start: 18, end: 28, progress: 0 },
]

const WEEKLY_PROGRESS = [
  { week: 'W1', planned: 10, actual: 10 },
  { week: 'W2', planned: 15, actual: 12 },
  { week: 'W3', planned: 20, actual: 18 },
  { week: 'W4', planned: 25, actual: 28 },
  { week: 'W5', planned: 30, actual: 32 },
  { week: 'W6', planned: 35, actual: 30 },
]

export default function TaskManagement() {
  const [view, setView] = useState('wbs')
  const [tasks, setTasks] = useState(TASKS)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Pretext: pre-compute row heights for virtual scrolling optimization
  const _taskRowMetrics = useMemo(() => {
    return tasks.map(task => {
      const titleMetrics = measureText(task.title, '500 14px Inter, sans-serif', 140)
      return {
        id: task.id,
        titleHeight: titleMetrics.height,
        estimatedHeight: Math.max(titleMetrics.height, 20) + 80,
      }
    })
  }, [tasks])

  const handleAdd = () => {
    form.resetFields()
    setModalVisible(true)
  }

  const handleDeleteTask = task => {
    setTasks(prev => prev.filter(t => t.id !== task.id))
    message.success(`任务「${task.title}」已删除`)
  }

  const handleEditTask = task => {
    message.info(`编辑任务「${task.title}」功能开发中`)
  }

  const handleCreateTask = () => {
    form
      .validateFields()
      .then(values => {
        setLoading(true)
        setTimeout(() => {
          const newTask = {
            id: tasks.length + 1,
            wbs: values.wbs || `${tasks.length + 1}`,
            title: values.title,
            phase: values.phase,
            assignee: values.assignee,
            startDate: values.date?.[0]?.format('YYYY-MM-DD') || '',
            endDate: values.date?.[1]?.format('YYYY-MM-DD') || '',
            progress: 0,
            status: 'pending',
            priority: values.priority || 'medium',
          }
          setTasks(prev => [...prev, newTask])
          setLoading(false)
          setModalVisible(false)
          message.success('任务创建成功！')
        }, 800)
      })
      .catch(() => {
        message.warning('请填写必填项')
      })
  }

  const columns = [
    { title: 'WBS', dataIndex: 'wbs', key: 'wbs', width: 80 },
    {
      title: '任务名称',
      dataIndex: 'title',
      key: 'title',
      width: 150,
      render: text => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    { title: '阶段', dataIndex: 'phase', key: 'phase', width: 100 },
    { title: '负责人', dataIndex: 'assignee', key: 'assignee', width: 80 },
    {
      title: '时间',
      key: 'date',
      width: 200,
      render: (_, record) => `${record.startDate} ~ ${record.endDate}`,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: v => <Progress percent={v} size="small" strokeColor={COLORS.primary} />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: v => {
        const statusMap = { done: '已完成', inprogress: '进行中', pending: '待开始' }
        const colorMap = { done: 'success', inprogress: 'processing', pending: 'default' }
        return <Badge status={colorMap[v]} text={statusMap[v]} />
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: v => {
        const map = { high: '高', medium: '中', low: '低' }
        const color = { high: 'red', medium: 'orange', low: 'blue' }
        return <Tag color={color[v]}>{map[v]}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<Edit2 size={14} />}
              onClick={() => handleEditTask(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              size="small"
              danger
              icon={<Trash2 size={14} />}
              onClick={() => handleDeleteTask(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const ganttColors = ['#115cb9', '#52c41a', '#faad14', '#ff4d4f', '#8b5cf6', '#06b6d4']

  return (
    <div style={{ padding: 24, background: COLORS.bg, minHeight: '100vh' }}>
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Title level={3} style={{ color: COLORS.text, margin: 0 }}>
            任务管理
          </Title>
          <Text style={{ color: COLORS.textMuted }}>WBS分解 · 甘特图 · 进度追踪</Text>
        </div>
        <Space>
          <Button.Group>
            <Button
              icon={<FolderTree size={14} />}
              type={view === 'wbs' ? 'primary' : 'default'}
              onClick={() => setView('wbs')}
            >
              WBS视图
            </Button>
            <Button
              icon={<GanttChart size={14} />}
              type={view === 'gantt' ? 'primary' : 'default'}
              onClick={() => setView('gantt')}
            >
              甘特图
            </Button>
          </Button.Group>
          <Button icon={<Export size={14} />} onClick={() => message.info('导出功能开发中')}>
            导出
          </Button>
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>
            新建任务
          </Button>
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.primary }}>
              {tasks.length}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>总任务数</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.success }}>
              {tasks.filter(t => t.status === 'done').length}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>已完成</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.warning }}>
              {tasks.filter(t => t.status === 'inprogress').length}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>进行中</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.danger }}>0</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>超期</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={view === 'wbs' ? 24 : 16}>
          <Card style={{ borderRadius: 12, marginBottom: 16 }}>
            {view === 'wbs' && (
              <div>
                <Title level={5}>工作分解结构 (WBS)</Title>
                <Tree
                  showTreeLine
                  defaultExpandAll
                  treeData={WBS_DATA}
                  titleRender={node => (
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}
                    >
                      <span
                        style={{ fontFamily: 'monospace', color: COLORS.textMuted, fontSize: 12 }}
                      >
                        {node.wbs}
                      </span>
                      <span style={{ flex: 1 }}>{node.title}</span>
                      {node.progress !== undefined && (
                        <Progress percent={node.progress} size="small" style={{ width: 100 }} />
                      )}
                    </div>
                  )}
                />
              </div>
            )}
            {view === 'gantt' && (
              <div>
                <Title level={5}>甘特图</Title>
                <div style={{ overflowX: 'auto' }}>
                  <div
                    style={{
                      display: 'flex',
                      marginLeft: 120,
                      borderBottom: `1px solid ${COLORS.border}`,
                      paddingBottom: 8,
                      marginBottom: 16,
                    }}
                  >
                    {['1月', '2月', '3月', '4月', '5月', '6月'].map((m, i) => (
                      <div
                        key={i}
                        style={{
                          width: 100,
                          textAlign: 'center',
                          fontSize: 12,
                          color: COLORS.textMuted,
                        }}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                  {GANTT_DATA.map((task, i) => (
                    <div
                      key={i}
                      style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}
                    >
                      <div style={{ width: 120, fontSize: 12, color: COLORS.text }}>
                        {task.name}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          height: 24,
                          background: COLORS.bg,
                          borderRadius: 4,
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            left: `${(task.start / 24) * 100}%`,
                            width: `${((task.end - task.start) / 24) * 100}%`,
                            height: '100%',
                            background: ganttColors[i % ganttColors.length],
                            borderRadius: 4,
                            opacity: 0.8,
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            left: 8,
                            top: 4,
                            fontSize: 10,
                            color: '#fff',
                          }}
                        >
                          {task.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </Col>
        {view === 'gantt' && (
          <Col span={8}>
            <Card title="进度对比" style={{ borderRadius: 12 }}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={WEEKLY_PROGRESS}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="planned"
                    stroke={COLORS.primary}
                    strokeDasharray="5 5"
                    name="计划"
                  />
                  <Line type="monotone" dataKey="actual" stroke={COLORS.success} name="实际" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}
      </Row>

      <Card title="任务列表" style={{ borderRadius: 12 }}>
        <Table columns={columns} dataSource={tasks} rowKey="id" pagination={false} size="small" />
      </Card>

      <Modal
        title="新建任务"
        open={modalVisible}
        onOk={handleCreateTask}
        onCancel={() => setModalVisible(false)}
        width={600}
        confirmLoading={loading}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="wbs" label="WBS编码">
                <Input placeholder="如 1.1.1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="title"
                label="任务名称"
                rules={[{ required: true, message: '请输入任务名称' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phase" label="所属阶段">
                <Select placeholder="选择阶段">
                  <Select.Option value="方案设计">方案设计</Select.Option>
                  <Select.Option value="设备采购">设备采购</Select.Option>
                  <Select.Option value="安装施工">安装施工</Select.Option>
                  <Select.Option value="调试验收">调试验收</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assignee"
                label="负责人"
                rules={[{ required: true, message: '请输入负责人' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="计划时间"
                rules={[{ required: true, message: '请选择时间' }]}
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="优先级" initialValue="medium">
                <Select>
                  <Select.Option value="high">高</Select.Option>
                  <Select.Option value="medium">中</Select.Option>
                  <Select.Option value="low">低</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
