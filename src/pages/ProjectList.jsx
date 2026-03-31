import React, { useState } from 'react'
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Typography,
  Progress,
  Badge,
  Tooltip,
  Popconfirm,
  message,
} from 'antd'
import { Plus, Edit2, Trash2, UserPlus, Eye, Filter, Download, ProjectIcon } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

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

// 模拟数据
const MOCK_PROJECTS = [
  {
    id: 1,
    name: '产线自动化改造项目',
    code: 'PRJ-2026-001',
    type: '产线改造',
    identity: '甲方',
    dept: '技术研发部',
    manager: '张经理',
    status: '进行中',
    progress: 78,
    budget: 2800,
    spent: 2380,
    startDate: '2026-01-15',
    endDate: '2027-06-30',
    members: 18,
    issues: 12,
    priority: 'high',
  },
  {
    id: 2,
    name: '新厂房建设项目',
    code: 'PRJ-2026-002',
    type: '厂房建设',
    identity: '甲方',
    dept: '工程建设部',
    manager: '李经理',
    status: '进行中',
    progress: 95,
    budget: 4500,
    spent: 3915,
    startDate: '2025-06-01',
    endDate: '2026-12-31',
    members: 25,
    issues: 5,
    priority: 'high',
  },
  {
    id: 3,
    name: 'XX集团设备安装工程',
    code: 'PRJ-2026-003',
    type: '设备安装',
    identity: '乙方',
    dept: '技术研发部',
    manager: '王经理',
    status: '进行中',
    progress: 62,
    budget: 1200,
    spent: 840,
    startDate: '2026-02-01',
    endDate: '2026-08-31',
    members: 12,
    issues: 8,
    priority: 'medium',
  },
  {
    id: 4,
    name: '检测设备采购项目',
    code: 'PRJ-2026-004',
    type: '设备采购',
    identity: '甲方',
    dept: '采购部',
    manager: '刘经理',
    status: '风险',
    progress: 35,
    budget: 800,
    spent: 360,
    startDate: '2026-03-01',
    endDate: '2026-10-31',
    members: 8,
    issues: 15,
    priority: 'critical',
  },
  {
    id: 5,
    name: '研发中心升级项目',
    code: 'PRJ-2026-005',
    type: '技术研发',
    identity: '甲方',
    dept: '技术研发部',
    manager: '陈经理',
    status: '进行中',
    progress: 88,
    budget: 600,
    spent: 492,
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    members: 10,
    issues: 3,
    priority: 'medium',
  },
]

const PROJECT_TYPES = ['产线改造', '设备采购安装', '厂房建设', '技术研发', '其他']
const PROJECT_IDENTITY = ['甲方', '乙方']
const PROJECT_STATUS = ['筹备中', '进行中', '暂停', '已完成', '已取消']
const DEPARTMENTS = ['技术研发部', '工程建设部', '采购部', '质量安全部', '财务部', '综合部']
const PRIORITIES = { high: '高', medium: '中', critical: '紧急' }

// 预算执行趋势
const BUDGET_TREND = [
  { month: '1月', budget: 1200, spent: 980 },
  { month: '2月', budget: 1800, spent: 1500 },
  { month: '3月', budget: 2400, spent: 2100 },
  { month: '4月', budget: 3000, spent: 2650 },
  { month: '5月', budget: 3600, spent: 3200 },
  { month: '6月', budget: 4200, spent: 3800 },
]

export default function ProjectList() {
  const [projects, setProjects] = useState(MOCK_PROJECTS)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingProject(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = record => {
    setEditingProject(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = id => {
    setProjects(projects.filter(p => p.id !== id))
    message.success('删除成功')
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (editingProject) {
        setProjects(
          projects.map(p => (p.id === editingProject.id ? { ...values, id: editingProject.id } : p))
        )
        message.success('更新成功')
      } else {
        setProjects([
          ...projects,
          { ...values, id: Date.now(), status: '筹备中', progress: 0, members: 0, issues: 0 },
        ])
        message.success('创建成功')
      }
      setModalVisible(false)
    })
  }

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 200,
      render: (text, record) => (
        <Space>
          <Badge
            status={
              record.status === '进行中'
                ? 'processing'
                : record.status === '风险'
                  ? 'error'
                  : 'default'
            }
          />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    { title: '项目编码', dataIndex: 'code', key: 'code', width: 130 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
    {
      title: '我方身份',
      dataIndex: 'identity',
      key: 'identity',
      width: 80,
      render: v => <Tag color={v === '甲方' ? 'blue' : 'green'}>{v}</Tag>,
    },
    { title: '部门', dataIndex: 'dept', key: 'dept', width: 110 },
    { title: '负责人', dataIndex: 'manager', key: 'manager', width: 90 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: v => {
        const color =
          v === '进行中'
            ? 'processing'
            : v === '风险'
              ? 'error'
              : v === '已完成'
                ? 'success'
                : 'default'
        return <Badge status={color} text={v} />
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (v, record) => (
        <div style={{ width: 120 }}>
          <Progress
            percent={v}
            size="small"
            strokeColor={record.status === '风险' ? COLORS.danger : COLORS.primary}
          />
        </div>
      ),
    },
    {
      title: '预算(万)',
      dataIndex: 'budget',
      key: 'budget',
      width: 100,
      render: v => v?.toLocaleString(),
    },
    {
      title: '执行率',
      key: 'budgetRate',
      width: 100,
      render: (_, record) => {
        const rate = Math.round((record.spent / record.budget) * 100)
        const color = rate > 95 ? COLORS.danger : rate > 80 ? COLORS.warning : COLORS.success
        return <span style={{ color }}>{rate}%</span>
      },
    },
    { title: '成员', dataIndex: 'members', key: 'members', width: 60 },
    {
      title: '问题',
      dataIndex: 'issues',
      key: 'issues',
      width: 70,
      render: v =>
        v > 10 ? (
          <Tag color="red">{v}</Tag>
        ) : v > 5 ? (
          <Tag color="orange">{v}</Tag>
        ) : (
          <Tag color="green">{v}</Tag>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button type="text" size="small" icon={<Eye size={14} />} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<Edit2 size={14} />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Tooltip title="删除">
              <Button type="text" size="small" danger icon={<Trash2 size={14} />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

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
            项目管理
          </Title>
          <Text style={{ color: COLORS.textMuted }}>共 {projects.length} 个项目</Text>
        </div>
        <Space>
          <Button icon={<Download size={14} />}>导出</Button>
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>
            新建项目
          </Button>
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: COLORS.primary }}>
                {projects.filter(p => p.status === '进行中').length}
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>进行中项目</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: COLORS.success }}>
                {projects.filter(p => p.status === '已完成').length}
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>已完成项目</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: COLORS.danger }}>
                {projects.filter(p => p.status === '风险').length}
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>风险项目</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: COLORS.warning }}>
                {projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>总预算(万元)</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="预算执行趋势" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={BUDGET_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: COLORS.textMuted }} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.textMuted }} />
                <Area
                  type="monotone"
                  dataKey="budget"
                  stroke={COLORS.primary}
                  fill={`${COLORS.primary}20`}
                  name="预算"
                />
                <Area
                  type="monotone"
                  dataKey="spent"
                  stroke={COLORS.warning}
                  fill={`${COLORS.warning}20`}
                  name="执行"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="项目类型分布" style={{ borderRadius: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {PROJECT_TYPES.map((type, i) => {
                const count = projects.filter(p => p.type === type).length
                return (
                  <div
                    key={i}
                    style={{
                      padding: '12px 20px',
                      background: COLORS.bg,
                      borderRadius: 8,
                      minWidth: 100,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.primary }}>
                      {count}
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{type}</div>
                  </div>
                )
              })}
            </div>
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={projects}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1500 }}
        />
      </Card>

      <Modal
        title={editingProject ? '编辑项目' : '新建项目'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="项目名称" rules={[{ required: true }]}>
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="code" label="项目编码" rules={[{ required: true }]}>
                <Input placeholder="PRJ-YYYY-XXX" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="type" label="项目类型" rules={[{ required: true }]}>
                <Select placeholder="选择类型">
                  {PROJECT_TYPES.map(t => (
                    <Select.Option key={t} value={t}>
                      {t}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="identity" label="我方身份" rules={[{ required: true }]}>
                <Select placeholder="甲方/乙方">
                  {PROJECT_IDENTITY.map(v => (
                    <Select.Option key={v} value={v}>
                      {v}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dept" label="所属部门" rules={[{ required: true }]}>
                <Select placeholder="选择部门">
                  {DEPARTMENTS.map(d => (
                    <Select.Option key={d} value={d}>
                      {d}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="manager" label="项目负责人">
                <Input placeholder="请输入负责人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="budget" label="总预算(万元)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入预算" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="progress" label="项目进度(%)">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
