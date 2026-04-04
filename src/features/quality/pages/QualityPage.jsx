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
  Tabs,
} from 'antd'
import {
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  CheckOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useQuality, CATEGORY_MAP, RESULT_MAP } from '../hooks/useQuality'
import { PageHeader } from '../../../components/PMSComponents'

const { Text } = Typography

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

function va(i = 0) {
  return {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { delay: i * 0.06 } },
  }
}

export default function QualityPage() {
  const { tab, setTab, standards, inspections } = useQuality()
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form] = Form.useForm()

  const handleCreate = async () => {
    try {
      await form.validateFields()
      message.success('质量标准创建成功')
      setModalOpen(false)
      form.resetFields()
    } catch {}
  }

  const stats = {
    total: inspections.length,
    passed: inspections.filter(i => i.result === 'passed').length,
    failed: inspections.filter(i => i.result === 'failed').length,
  }

  const stdColumns = [
    {
      title: '标准编号',
      dataIndex: 'code',
      key: 'code',
      render: v => (
        <Text style={{ fontFamily: 'monospace', color: D.primary, fontWeight: 600, fontSize: 12 }}>
          {v}
        </Text>
      ),
    },
    {
      title: '标准名称',
      dataIndex: 'name',
      key: 'name',
      render: v => <Text style={{ fontWeight: 600 }}>{v}</Text>,
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: v => (
        <Tag
          style={{
            background: CATEGORY_MAP[v]?.bg,
            color: CATEGORY_MAP[v]?.color,
            border: 'none',
            fontWeight: 600,
          }}
        >
          {CATEGORY_MAP[v]?.label}
        </Tag>
      ),
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      render: v => <Text style={{ color: D.textMuted, fontSize: 12 }}>{v}</Text>,
    },
    {
      title: '检查项',
      dataIndex: 'items',
      key: 'items',
      render: v => <Text style={{ fontWeight: 600, color: D.primary }}>{v} 项</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: v => (
        <Tag
          style={{
            background: v === 'active' ? '#dcfce7' : '#f3f4f6',
            color: v === 'active' ? '#166534' : '#6b7280',
            border: 'none',
            fontWeight: 600,
          }}
        >
          {v === 'active' ? '现行' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, r) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => {
              setSelected(r)
              setDetailOpen(true)
            }}
            style={{ color: D.primary }}
          >
            查看
          </Button>
          <Button type="text" size="small" icon={<EditOutlined />} style={{ color: D.textMuted }} />
        </Space>
      ),
    },
  ]

  const insColumns = [
    {
      title: '检查单编号',
      dataIndex: 'code',
      key: 'code',
      render: v => (
        <Text style={{ fontFamily: 'monospace', color: D.primary, fontWeight: 600, fontSize: 12 }}>
          {v}
        </Text>
      ),
    },
    {
      title: '检查名称',
      dataIndex: 'name',
      key: 'name',
      render: (v, r) => (
        <div>
          <Text style={{ fontWeight: 600 }}>{v}</Text>
          <div>
            <Text style={{ color: D.textMuted, fontSize: 12 }}>{r.project}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: v => (
        <Tag
          style={{
            background: CATEGORY_MAP[v]?.bg,
            color: CATEGORY_MAP[v]?.color,
            border: 'none',
            fontWeight: 600,
          }}
        >
          {CATEGORY_MAP[v]?.label}
        </Tag>
      ),
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      render: v => {
        const c = RESULT_MAP[v]
        return (
          <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600 }}>
            {v === 'passed' ? (
              <CheckCircleOutlined />
            ) : v === 'failed' ? (
              <CloseCircleOutlined />
            ) : null}
            {c.label}
          </Tag>
        )
      },
    },
    {
      title: '检查人',
      dataIndex: 'inspector',
      key: 'inspector',
      render: v => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: '检查日期',
      dataIndex: 'checkDate',
      key: 'checkDate',
      render: v => <Text style={{ color: D.textMuted, fontSize: 12 }}>{v}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, r) =>
        r.result === 'pending' ? (
          <Space size={4}>
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              style={{ background: D.success, border: 'none', borderRadius: 8 }}
            >
              合格
            </Button>
            <Button
              size="small"
              icon={<CloseCircleOutlined />}
              style={{ borderRadius: 8, color: D.danger }}
            >
              不合格
            </Button>
          </Space>
        ) : (
          <Text style={{ color: D.textMuted, fontSize: 12 }}>—</Text>
        ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="质量管理"
        subtitle="质量标准库 · 检查验收 · 整改闭环"
        icon={<CheckCircleOutlined style={{ color: 'var(--color-primary)' }} />}
      />

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          {
            title: '检查标准',
            value: standards.filter(s => s.status === 'active').length,
            color: D.primary,
          },
          { title: '本月检查', value: stats.total, color: D.text },
          { title: '合格', value: stats.passed, color: D.success },
          { title: '不合格', value: stats.failed, color: D.danger },
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
          { key: 'standards', label: '质量标准库' },
          { key: 'inspections', label: '检查记录' },
        ]}
        style={{ marginBottom: 16 }}
      />

      {tab === 'standards' && (
        <Card
          style={{ border: `1px solid ${D.border}`, borderRadius: 14 }}
          headStyle={{ borderBottom: `1px solid ${D.border}`, padding: '12px 20px' }}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ borderRadius: 10, background: D.primary }}
              onClick={() => {
                form.resetFields()
                setModalOpen(true)
              }}
            >
              新建标准
            </Button>
          </div>
          <Table
            columns={stdColumns}
            dataSource={standards}
            rowKey="id"
            pagination={{ pageSize: 8, showSizeChanger: false }}
          />
        </Card>
      )}

      {tab === 'inspections' && (
        <Card
          style={{ border: `1px solid ${D.border}`, borderRadius: 14 }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            columns={insColumns}
            dataSource={inspections}
            rowKey="id"
            pagination={{ pageSize: 8, showSizeChanger: false }}
          />
        </Card>
      )}

      <Modal
        title={<Text style={{ fontWeight: 700 }}>新建质量标准</Text>}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        onOk={handleCreate}
        okText="保存"
        okButtonProps={{ style: { background: D.primary, borderRadius: 10 } }}
        width={580}
        styles={{
          content: { borderRadius: 16, padding: 0 },
          header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 },
        }}
      >
        <Form form={form} layout="vertical" style={{ padding: '20px 24px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="标准名称" rules={[{ required: true }]}>
                <Input placeholder="标准名称" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="专业类别" rules={[{ required: true }]}>
                <Select
                  options={Object.entries(CATEGORY_MAP).map(([k, v]) => ({
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
              <Form.Item name="code" label="标准编号" rules={[{ required: true }]}>
                <Input placeholder="如 STD-STR-001" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="version" label="版本号">
                <Input placeholder="v1.0" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="desc" label="标准说明">
            <Input.TextArea rows={3} placeholder="请输入标准说明..." style={{ borderRadius: 10 }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<Text style={{ fontWeight: 700 }}>标准详情</Text>}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={580}
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
                  background: CATEGORY_MAP[selected.category]?.bg,
                  color: CATEGORY_MAP[selected.category]?.color,
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                {CATEGORY_MAP[selected.category]?.label}
              </Tag>
              <Tag
                style={{
                  background: selected.status === 'active' ? '#dcfce7' : '#f3f4f6',
                  color: selected.status === 'active' ? '#166534' : '#6b7280',
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                {selected.status === 'active' ? '现行' : '停用'}
              </Tag>
            </div>
            <Text strong style={{ fontSize: 16, color: D.text, display: 'block', marginBottom: 4 }}>
              {selected.name}
            </Text>
            <Text style={{ fontFamily: 'monospace', color: D.primary, fontSize: 12 }}>
              {selected.code}
            </Text>
            <Row gutter={[12, 12]} style={{ margin: '16px 0' }}>
              {[
                { label: '版本', value: selected.version },
                { label: '生效日期', value: selected.effective },
                { label: '检查项', value: `${selected.items} 项` },
              ].map(({ label, value }) => (
                <Col span={8} key={label}>
                  <div style={{ background: D.bg, borderRadius: 10, padding: '10px 14px' }}>
                    <Text style={{ fontSize: 11, color: D.textMuted, display: 'block' }}>
                      {label}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: 700, color: D.text }}>{value}</Text>
                  </div>
                </Col>
              ))}
            </Row>
            <div style={{ background: D.bg, borderRadius: 12, padding: 14 }}>
              <Text style={{ color: D.textSec, lineHeight: 1.7 }}>{selected.desc}</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
