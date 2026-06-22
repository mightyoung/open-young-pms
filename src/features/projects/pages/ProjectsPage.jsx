import React, { useState } from 'react'
import {
  Alert,
  Card,
  Table,
  Tag,
  Button,
  Select,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  Row,
  Col,
  Avatar,
  Tooltip,
  Typography,
  Progress,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  BuildOutlined,
  SafetyOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useProjects, PROJ_STATUS } from '../hooks/useProjects'
import { PageHeader } from '../../../components/PMSComponents'

const { Text } = Typography
const { TextArea } = Input

const D = {
  primary: '#115cb9',
  primaryLight: '#d7e2ff',
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

function va(i = 0) {
  return {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } },
  }
}

function AvatarChip({ name, size = 28 }) {
  const colors = ['#115cb9', '#52c41a', '#faad14', '#ec4899', '#06b6d4']
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  return (
    <Avatar size={size} style={{ background: colors[idx], fontSize: size * 0.35, fontWeight: 600 }}>
      {name?.[0] || '?'}
    </Avatar>
  )
}

function StatCard({ title, value, color, icon }) {
  return (
    <motion.div
      variants={va()}
      initial="hidden"
      animate="visible"
      style={{
        background: D.card,
        border: `1px solid ${D.border}`,
        borderRadius: 14,
        padding: '16px 20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text style={{ color: D.textMuted, fontSize: 12, display: 'block', marginBottom: 6 }}>
            {title}
          </Text>
          <span style={{ fontSize: 26, fontWeight: 800, color: D.text }}>{value}</span>
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
          }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const {
    filtered,
    loading,
    error,
    search,
    setSearch,
    setFilterStatus,
    stats,
    createProject,
    updateProject,
    deleteProject,
    members,
  } = useProjects()

  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form] = Form.useForm()

  const handleCreate = async () => {
    try {
      const vals = await form.validateFields()
      if (selected?.id) {
        await updateProject(selected.id, vals)
      } else {
        await createProject(vals)
      }
      setModalOpen(false)
      setSelected(null)
      form.resetFields()
    } catch (err) {
      if (err?.errorFields) return
      message.error(err?.message || (selected ? '项目更新失败' : '项目创建失败'))
    }
  }

  const handleDelete = id => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后不可恢复，是否继续？',
      onOk: async () => {
        try {
          await deleteProject(id)
        } catch (err) {
          message.error(err?.message || '项目删除失败')
        }
      },
    })
  }

  const openDetail = p => {
    setSelected(p)
    setDetailOpen(true)
  }

  const openMembers = p => {
    setSelected(p)
    setMembersOpen(true)
  }

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (v, r) => (
        <a onClick={() => openDetail(r)} style={{ fontWeight: 600, color: D.primary }}>
          {v}
        </a>
      ),
    },
    {
      title: '编号',
      dataIndex: 'code',
      key: 'code',
      render: v => <Text style={{ color: D.textMuted, fontSize: 12 }}>{v}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: v => {
        const c = PROJ_STATUS[v]
        return (
          <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600 }}>
            {c.label}
          </Tag>
        )
      },
    },
    {
      title: '甲方',
      dataIndex: 'party_a',
      key: 'party_a',
      render: v => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: '负责人',
      dataIndex: 'leader',
      key: 'leader',
      render: v => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <AvatarChip name={v} size={24} />
          <Text style={{ fontSize: 13 }}>{v}</Text>
        </div>
      ),
    },
    {
      title: '预算（万）',
      dataIndex: 'budget',
      key: 'budget',
      render: (v, r) => (
        <div>
          <Text style={{ fontSize: 13, fontWeight: 600 }}>{v}</Text>
          <div>
            <Text style={{ fontSize: 11, color: D.textMuted }}>已用 {r.spent}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: v => <Progress percent={v} size="small" strokeColor={D.primary} />,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/projects/${r.id}`)}
              style={{ color: D.primary }}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelected(r)
                form.setFieldsValue(r)
                setModalOpen(true)
              }}
              style={{ color: D.textMuted }}
            />
          </Tooltip>
          <Tooltip title="成员">
            <Button
              type="text"
              size="small"
              icon={<TeamOutlined />}
              onClick={() => openMembers(r)}
              style={{ color: D.textMuted }}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(r.id)}
              style={{ color: D.danger }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="项目管理"
        subtitle="管理所有项目，含甲方/乙方属性和成员配置"
        icon={<BuildOutlined style={{ color: 'var(--color-primary)' }} />}
      />

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { title: '项目总数', value: stats.total, color: D.primary, icon: <BuildOutlined /> },
          { title: '执行中', value: stats.executing, color: D.success, icon: <BuildOutlined /> },
          { title: '规划中', value: stats.planning, color: D.warning, icon: <BuildOutlined /> },
          {
            title: '总预算（万）',
            value: stats.budgetTotal,
            color: D.primary,
            icon: <SafetyOutlined />,
          },
        ].map(c => (
          <Col xs={12} sm={6} key={c.title}>
            <StatCard {...c} />
          </Col>
        ))}
      </Row>

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
            <Input
              prefix={<SearchOutlined style={{ color: D.textMuted }} />}
              placeholder="搜索项目名称或编号"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 220, borderRadius: 10 }}
              allowClear
            />
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: 130 }}
              onChange={setFilterStatus}
              options={Object.entries(PROJ_STATUS).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ borderRadius: 10, background: D.primary }}
            onClick={() => {
              form.resetFields()
              setSelected(null)
              setModalOpen(true)
            }}
          >
            新建项目
          </Button>
        </div>
        {error && (
          <Alert
            type="error"
            showIcon
            message="项目列表加载失败"
            description={error}
            style={{ margin: '0 20px 16px' }}
          />
        )}
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          style={{ borderRadius: 0 }}
        />
      </Card>

      <Modal
        title={
          <Text style={{ fontWeight: 700, fontSize: 16 }}>
            {selected ? '编辑项目' : '新建项目'}
          </Text>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setSelected(null)
          form.resetFields()
        }}
        onOk={handleCreate}
        okText="保存"
        cancelText="取消"
        okButtonProps={{ style: { background: D.primary, borderRadius: 10 } }}
        width={640}
        styles={{
          content: { borderRadius: 16, padding: 0 },
          header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 },
        }}
      >
        <Form form={form} layout="vertical" style={{ padding: '20px 24px' }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label={<Text style={{ fontSize: 13 }}>项目名称</Text>}
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="请输入项目名称" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="leader"
                label={<Text style={{ fontSize: 13 }}>项目经理</Text>}
                rules={[{ required: true }]}
              >
                <Input placeholder="负责人姓名" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="party_a" label={<Text style={{ fontSize: 13 }}>甲方单位</Text>}>
                <Input placeholder="甲方单位名称" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="party_b" label={<Text style={{ fontSize: 13 }}>乙方单位</Text>}>
                <Input placeholder="乙方单位名称" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dept" label={<Text style={{ fontSize: 13 }}>所属部门</Text>}>
                <Input placeholder="所属部门" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label={<Text style={{ fontSize: 13 }}>项目状态</Text>}>
                <Select
                  placeholder="选择状态"
                  options={Object.entries(PROJ_STATUS).map(([k, v]) => ({
                    value: k,
                    label: v.label,
                  }))}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="budget" label={<Text style={{ fontSize: 13 }}>预算（万元）</Text>}>
                <InputNumber min={0} placeholder="0" style={{ width: '100%', borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="start" label={<Text style={{ fontSize: 13 }}>开始日期</Text>}>
                <Input placeholder="2026-01-01" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="end" label={<Text style={{ fontSize: 13 }}>结束日期</Text>}>
                <Input placeholder="2026-12-31" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label={<Text style={{ fontSize: 13 }}>项目描述</Text>}>
            <TextArea rows={2} placeholder="简要描述项目内容..." style={{ borderRadius: 10 }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<Text style={{ fontWeight: 700 }}>项目详情</Text>}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={680}
        styles={{
          content: { borderRadius: 16, padding: 0 },
          header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 },
        }}
      >
        {selected && (
          <div style={{ padding: '20px 24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 20,
              }}
            >
              <div>
                <Text strong style={{ fontSize: 16, color: D.text, display: 'block' }}>
                  {selected.name}
                </Text>
                <Text style={{ color: D.textMuted, fontSize: 12 }}>{selected.code}</Text>
              </div>
              <Tag
                style={{
                  background: PROJ_STATUS[selected.status]?.bg,
                  color: PROJ_STATUS[selected.status]?.color,
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {PROJ_STATUS[selected.status]?.label}
              </Tag>
            </div>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
              {[
                { label: '甲方单位', value: selected.party_a },
                { label: '乙方单位', value: selected.party_b },
                { label: '项目经理', value: selected.leader },
                { label: '所属部门', value: selected.dept },
                { label: '项目周期', value: `${selected.start} ~ ${selected.end}` },
                { label: '项目预算', value: `${selected.budget} 万元` },
              ].map(({ label, value }) => (
                <Col span={12} key={label}>
                  <div style={{ background: D.bg, borderRadius: 10, padding: '10px 14px' }}>
                    <Text
                      style={{
                        color: D.textMuted,
                        fontSize: 11,
                        display: 'block',
                        marginBottom: 4,
                      }}
                    >
                      {label}
                    </Text>
                    <Text style={{ color: D.text, fontSize: 14, fontWeight: 600 }}>{value}</Text>
                  </div>
                </Col>
              ))}
            </Row>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: D.textSec, fontSize: 13 }}>项目进度</Text>
                <Text style={{ color: D.primary, fontWeight: 700 }}>{selected.progress}%</Text>
              </div>
              <Progress
                percent={selected.progress}
                strokeColor={D.primary}
                trailColor={`${D.primary}20`}
              />
            </div>
            <Row gutter={[12, 12]}>
              {[
                { label: '隐患数', value: selected.hazards, color: D.danger },
                { label: '风险数', value: selected.risks, color: D.warning },
                { label: '成员数', value: selected.members, color: D.primary },
                {
                  label: '预算执行',
                  value: `${Math.round((selected.spent / selected.budget) * 100)}%`,
                  color: D.success,
                },
              ].map(({ label, value, color }) => (
                <Col span={6} key={label}>
                  <div
                    style={{
                      textAlign: 'center',
                      background: D.bg,
                      borderRadius: 10,
                      padding: '12px 8px',
                    }}
                  >
                    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
                    <Text style={{ fontSize: 11, color: D.textMuted }}>{label}</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Modal>

      <Modal
        title={<Text style={{ fontWeight: 700 }}>项目成员</Text>}
        open={membersOpen}
        onCancel={() => setMembersOpen(false)}
        footer={null}
        width={500}
        styles={{
          content: { borderRadius: 16, padding: 0 },
          header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 },
        }}
      >
        <div style={{ padding: '16px 24px' }}>
            {members.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 0',
                    borderBottom: i < members.length - 1 ? `1px solid ${D.border}` : 'none',
              }}
            >
              <AvatarChip name={m.name} size={38} />
              <div style={{ flex: 1 }}>
                <Text style={{ fontWeight: 600, color: D.text, fontSize: 14 }}>{m.name}</Text>
                <div>
                  <Text style={{ color: D.textMuted, fontSize: 12 }}>
                    {m.role} · {m.dept}
                  </Text>
                </div>
              </div>
              <Button
                type="primary"
                ghost
                size="small"
                style={{ borderRadius: 8, color: D.primary, borderColor: D.primary }}
              >
                移除
              </Button>
            </motion.div>
          ))}
          <Button
            type="dashed"
            block
            style={{ marginTop: 16, borderRadius: 10, color: D.primary, borderColor: D.primary }}
            icon={<PlusOutlined />}
          >
            添加成员
          </Button>
        </div>
      </Modal>
    </div>
  )
}
