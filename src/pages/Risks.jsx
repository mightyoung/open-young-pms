import React, { useState } from 'react'
import {
  Card,
  Table,
  Tag,
  Button,
  Select,
  Form,
  Input,
  Modal,
  Space,
  message,
  Row,
  Col,
  Typography,
  Divider,
  Tabs,
  Progress,
  Slider,
  Timeline,
} from 'antd'
import {
  PlusOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  AlertTriangleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Text } = Typography

const D = {
  primary: '#115cb9',
  bg: '#f5f7fa',
  card: '#ffffff',
  border: '#e5e7eb',
  text: '#323235',
  textSec: '#5f5f61',
  textMuted: '#8c8c8c',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
}

const LEVEL_MAP = {
  high: { label: '高风险', bg: '#fee2e2', color: '#991b1b' },
  medium: { label: '中风险', bg: '#fef3c7', color: '#92400e' },
  low: { label: '低风险', bg: '#dcfce7', color: '#166534' },
}
const STATUS_MAP = {
  identified: { label: '已识别', bg: '#dbeafe', color: '#1e40af' },
  monitoring: { label: '监控中', bg: '#fef3c7', color: '#92400e' },
  resolved: { label: '已解决', bg: '#dcfce7', color: '#166534' },
  accepted: { label: '已接受', bg: '#f3f4f6', color: '#6b7280' },
}
const CAT_MAP = {
  safety: { label: '安全', bg: '#fee2e2', color: '#991b1b' },
  quality: { label: '质量', bg: '#fef3c7', color: '#92400e' },
  schedule: { label: '进度', bg: '#dbeafe', color: '#1e40af' },
  cost: { label: '成本', bg: '#fce7f3', color: '#be185d' },
  compliance: { label: '合规', bg: '#f3f4f6', color: '#6b7280' },
  other: { label: '其他', bg: '#f3f4f6', color: '#6b7280' },
}

const MOCK_RISKS = [
  {
    id: 1,
    code: 'RSK-2026-001',
    title: '关键设备交货延期',
    category: 'schedule',
    level: 'high',
    status: 'monitoring',
    project: 'J-2X高精线联调项目',
    probability: 70,
    impact: 80,
    score: 56,
    owner: '张经理',
    dueDate: '2026-04-10',
    desc: '高精度数控设备供应商产能紧张，存在延期交货风险，可能影响整体工期。',
    measures: ['与供应商签订延期违约条款', '备选供应商方案准备中', '调整安装计划至4月15日'],
  },
  {
    id: 2,
    code: 'RSK-2026-002',
    title: '设计变更导致返工',
    category: 'quality',
    level: 'high',
    status: 'monitoring',
    project: 'J-2X高精线联调项目',
    probability: 60,
    impact: 85,
    score: 51,
    owner: '李工',
    dueDate: '2026-04-05',
    desc: '设计院图纸与现场尺寸存在偏差，返工风险较高。',
    measures: ['联系设计院确认尺寸', '现场复核测量', '提前采购替代材料'],
  },
  {
    id: 3,
    code: 'RSK-2026-003',
    title: '施工人员安全风险',
    category: 'safety',
    level: 'medium',
    status: 'monitoring',
    project: '高压管路安装工程',
    probability: 40,
    impact: 90,
    score: 36,
    owner: '王经理',
    dueDate: '2026-05-31',
    desc: '高空作业和密闭空间作业存在安全风险。',
    measures: ['每日安全交底', '配备安全监护人员', '特种作业持证上岗'],
  },
  {
    id: 4,
    code: 'RSK-2026-004',
    title: '预算超支风险',
    category: 'cost',
    level: 'medium',
    status: 'identified',
    project: 'J-2X高精线联调项目',
    probability: 50,
    impact: 70,
    score: 35,
    owner: '张经理',
    dueDate: '2026-06-30',
    desc: '因设计变更和材料涨价，项目预算可能超支10%~15%。',
    measures: ['建立预算预警机制', '变更管控流程', '定期成本分析'],
  },
  {
    id: 5,
    code: 'RSK-2026-005',
    title: '供应商资金链断裂',
    category: 'cost',
    level: 'high',
    status: 'monitoring',
    project: 'J-2X高精线联调项目',
    probability: 30,
    impact: 95,
    score: 28.5,
    owner: '张经理',
    dueDate: '2026-03-31',
    desc: '主供应商资金状况不佳，存在履约风险。',
    measures: ['已预付30%款项', '增加履约保证金', '监控供应商经营状况'],
  },
  {
    id: 6,
    code: 'RSK-2026-006',
    title: '环保合规风险',
    category: 'compliance',
    level: 'low',
    status: 'resolved',
    project: 'O3厂区建设项目',
    probability: 20,
    impact: 60,
    score: 12,
    owner: '李经理',
    dueDate: '2026-02-28',
    desc: '部分环保审批文件尚未齐全。',
    measures: ['已补充环评批复', '加强环境监测', '合规培训'],
  },
  {
    id: 7,
    code: 'RSK-2026-007',
    title: '雨季施工影响进度',
    category: 'schedule',
    level: 'medium',
    status: 'accepted',
    project: 'O3厂区建设项目',
    probability: 80,
    impact: 50,
    score: 40,
    owner: '李经理',
    dueDate: '2026-06-30',
    desc: '雨季（6-7月）可能影响室外施工进度。',
    measures: ['调整施工计划', '搭建雨棚', '制定赶工方案'],
  },
]

function va(i = 0) {
  return {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { delay: i * 0.06 } },
  }
}

function RiskMatrix({ risks }) {
  const grid = Array(5)
    .fill(null)
    .map(() => Array(5).fill(null))
  risks.forEach(r => {
    const x = Math.min(4, Math.floor((r.probability - 1) / 20))
    const y = Math.min(4, Math.floor((r.impact - 1) / 20))
    grid[y][x] = r
  })
  const getBg = (y, x) => {
    if (y < 2 && x >= 3) return '#fee2e2'
    if (y < 2 || x >= 4) return '#fef3c7'
    return '#dcfce7'
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        <div
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 4px',
            color: D.textMuted,
            fontSize: 11,
            width: 20,
          }}
        >
          影响程度
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex' }}>
            {[20, 40, 60, 80, 100].map(v => (
              <div
                key={v}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '4px 0',
                  fontSize: 10,
                  color: D.textMuted,
                }}
              >
                {v}%
              </div>
            ))}
          </div>
          {grid.map((row, y) => (
            <div key={y} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 20, fontSize: 10, color: D.textMuted, textAlign: 'center' }}>
                {100 - y * 20}%
              </div>
              {row.map((cell, x) => {
                const bg = getBg(y, x)
                return (
                  <div
                    key={x}
                    style={{
                      flex: 1,
                      height: 50,
                      background: bg,
                      border: `1px solid ${D.border}`,
                      borderRadius: 4,
                      margin: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      minWidth: 40,
                    }}
                  >
                    {cell && (
                      <WarningOutlined
                        style={{ color: y < 2 && x >= 3 ? '#991b1b' : '#92400e', fontSize: 12 }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
          <div style={{ display: 'flex', paddingLeft: 20 }}>
            {[20, 40, 60, 80, 100].map(v => (
              <div
                key={v}
                style={{ flex: 1, textAlign: 'center', fontSize: 10, color: D.textMuted }}
              >
                {v}%
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 4, fontSize: 11, color: D.textMuted }}>
            概率
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 16, height: 16, background: '#dcfce7', borderRadius: 4 }} />
          <Text style={{ fontSize: 11, color: D.textMuted }}>低风险</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 16, height: 16, background: '#fef3c7', borderRadius: 4 }} />
          <Text style={{ fontSize: 11, color: D.textMuted }}>中风险</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 16, height: 16, background: '#fee2e2', borderRadius: 4 }} />
          <Text style={{ fontSize: 11, color: D.textMuted }}>高风险</Text>
        </div>
      </div>
    </div>
  )
}

export default function Risks() {
  const [tab, setTab] = useState('list')
  const [data] = useState(MOCK_RISKS)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [filterLevel, setFilterLevel] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [form] = Form.useForm()

  const filtered = data.filter(r => {
    if (filterLevel && r.level !== filterLevel) return false
    if (filterStatus && r.status !== filterStatus) return false
    return true
  })

  const stats = {
    total: data.length,
    high: data.filter(r => r.level === 'high').length,
    medium: data.filter(r => r.level === 'medium').length,
    monitoring: data.filter(r => r.status === 'monitoring').length,
  }

  const handleCreate = async () => {
    try {
      await form.validateFields()
      message.success('风险登记成功')
      setModalOpen(false)
      form.resetFields()
    } catch {}
  }

  const columns = [
    {
      title: '风险编号',
      dataIndex: 'code',
      key: 'code',
      render: v => (
        <Text style={{ fontFamily: 'monospace', color: D.primary, fontWeight: 600, fontSize: 12 }}>
          {v}
        </Text>
      ),
    },
    {
      title: '风险描述',
      dataIndex: 'title',
      key: 'title',
      render: (v, r) => (
        <div>
          <Text style={{ fontWeight: 600 }}>{v}</Text>
          <div>
            <Text style={{ color: D.textMuted, fontSize: 11 }}>{r.project}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: v => {
        const c = CAT_MAP[v]
        return (
          <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600 }}>
            {c.label}
          </Tag>
        )
      },
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      render: v => {
        const c = LEVEL_MAP[v]
        return (
          <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 700 }}>
            {c.label}
          </Tag>
        )
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: v => {
        const c = STATUS_MAP[v]
        return (
          <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600 }}>
            {c.label}
          </Tag>
        )
      },
    },
    {
      title: '风险值',
      dataIndex: 'score',
      key: 'score',
      render: v => (
        <Text
          style={{ fontWeight: 700, color: v >= 50 ? D.danger : v >= 30 ? D.warning : D.success }}
        >
          {v}
        </Text>
      ),
    },
    {
      title: '责任人',
      dataIndex: 'owner',
      key: 'owner',
      render: v => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, r) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            onClick={() => {
              setSelected(r)
              setDetailOpen(true)
            }}
            style={{ color: D.primary }}
          >
            详情
          </Button>
          <Button type="text" size="small" icon={<EditOutlined />} style={{ color: D.textMuted }} />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <motion.div variants={va(0)} initial="hidden" animate="visible" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: D.text, margin: 0 }}>
          风险管理
        </Title>
        <Text style={{ color: D.textMuted, fontSize: 13 }}>
          风险识别 · 影响评估 · 监控跟踪 · 应对措施
        </Text>
      </motion.div>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { title: '风险总数', value: stats.total, color: D.text },
          { title: '高风险', value: stats.high, color: D.danger },
          { title: '中风险', value: stats.medium, color: D.warning },
          { title: '监控中', value: stats.monitoring, color: D.warning },
        ].map((s, i) => (
          <Col xs={12} sm={6} key={s.title}>
            <motion.div
              variants={va(i)}
              initial="hidden"
              animate="visible"
              style={{
                background: D.card,
                border: `1px solid ${D.border}`,
                borderRadius: 12,
                padding: '14px 18px',
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: D.textMuted, marginTop: 4 }}>{s.title}</div>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: 'list', label: '风险列表' },
          { key: 'matrix', label: '风险矩阵' },
        ]}
        style={{ marginBottom: 16 }}
      />

      {tab === 'list' && (
        <Card
          style={{ border: `1px solid ${D.border}`, borderRadius: 14 }}
          headStyle={{ borderBottom: `1px solid ${D.border}`, padding: '12px 20px' }}
          bodyStyle={{ padding: 0 }}
        >
          <div
            style={{
              padding: '16px 20px',
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Space size={12} wrap>
              <Select
                placeholder="等级筛选"
                allowClear
                style={{ width: 130 }}
                onChange={setFilterLevel}
                options={Object.entries(LEVEL_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
              />
              <Select
                placeholder="状态筛选"
                allowClear
                style={{ width: 130 }}
                onChange={setFilterStatus}
                options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
              />
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ borderRadius: 10, background: D.primary }}
              onClick={() => {
                form.resetFields()
                setModalOpen(true)
              }}
            >
              登记风险
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            pagination={{ pageSize: 8, showSizeChanger: false }}
          />
        </Card>
      )}

      {tab === 'matrix' && (
        <motion.div variants={va(0)} initial="hidden" animate="visible">
          <Card
            style={{ border: `1px solid ${D.border}`, borderRadius: 14 }}
            headStyle={{ borderBottom: `1px solid ${D.border}`, padding: '12px 20px' }}
            bodyStyle={{ padding: '20px' }}
          >
            <RiskMatrix risks={data} />
          </Card>
        </motion.div>
      )}

      <Modal
        title={<Text style={{ fontWeight: 700 }}>登记风险</Text>}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        onOk={handleCreate}
        okText="保存"
        okButtonProps={{ style: { background: D.primary, borderRadius: 10 } }}
        width={600}
        styles={{
          content: { borderRadius: 16, padding: 0 },
          header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 },
        }}
      >
        <Form form={form} layout="vertical" style={{ padding: '20px 24px' }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="title" label="风险描述" rules={[{ required: true }]}>
                <Input placeholder="简要描述风险" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="category" label="风险类别">
                <Select
                  options={Object.entries(CAT_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="level" label="风险等级">
                <Select
                  options={Object.entries(LEVEL_MAP).map(([k, v]) => ({
                    value: k,
                    label: v.label,
                  }))}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="风险状态">
                <Select
                  options={Object.entries(STATUS_MAP).map(([k, v]) => ({
                    value: k,
                    label: v.label,
                  }))}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="owner" label="责任人">
                <Input placeholder="责任人" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dueDate" label="应对期限">
                <Input placeholder="2026-04-01" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="desc" label="风险描述">
            <Input.TextArea rows={2} placeholder="详细描述风险..." style={{ borderRadius: 10 }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<Text style={{ fontWeight: 700 }}>风险详情</Text>}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={640}
        styles={{
          content: { borderRadius: 16, padding: 0 },
          header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 },
        }}
      >
        {selected && (
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Tag
                style={{
                  background: CAT_MAP[selected.category]?.bg,
                  color: CAT_MAP[selected.category]?.color,
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                {CAT_MAP[selected.category]?.label}
              </Tag>
              <Tag
                style={{
                  background: LEVEL_MAP[selected.level]?.bg,
                  color: LEVEL_MAP[selected.level]?.color,
                  border: 'none',
                  fontWeight: 700,
                }}
              >
                {LEVEL_MAP[selected.level]?.label}
              </Tag>
              <Tag
                style={{
                  background: STATUS_MAP[selected.status]?.bg,
                  color: STATUS_MAP[selected.status]?.color,
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                {STATUS_MAP[selected.status]?.label}
              </Tag>
            </div>
            <Title level={4} style={{ color: D.text, margin: '0 0 4px 0' }}>
              {selected.title}
            </Title>
            <Text style={{ fontFamily: 'monospace', color: D.primary, fontSize: 12 }}>
              {selected.code}
            </Text>
            <Row gutter={[12, 12]} style={{ margin: '16px 0' }}>
              {[
                { label: '发生概率', value: `${selected.probability}%` },
                { label: '影响程度', value: `${selected.impact}%` },
                {
                  label: '风险值',
                  value: selected.score,
                  color: selected.score >= 50 ? D.danger : D.warning,
                },
                { label: '责任人', value: selected.owner },
              ].map(({ label, value, color }) => (
                <Col span={6} key={label}>
                  <div style={{ background: D.bg, borderRadius: 10, padding: '10px 14px' }}>
                    <Text style={{ fontSize: 11, color: D.textMuted, display: 'block' }}>
                      {label}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: 800, color: color || D.text }}>
                      {value}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
            <div style={{ background: D.bg, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <Text style={{ color: D.textSec, lineHeight: 1.7 }}>{selected.desc}</Text>
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <Title level={5} style={{ color: D.text, marginBottom: 12 }}>
              应对措施
            </Title>
            <Timeline
              items={selected.measures.map((m, i) => ({
                color: i < selected.measures.length - 1 ? D.primary : D.success,
                children: <Text style={{ color: D.textSec, fontSize: 13 }}>{m}</Text>,
              }))}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
