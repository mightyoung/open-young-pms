import React, { useState, useEffect } from 'react'
import {
  Table,
  Tag,
  Button,
  Select,
  Modal,
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  message,
} from 'antd'
import {
  AppstoreOutlined,
  PlusOutlined,
  ToolOutlined,
  InboxOutlined,
  CarOutlined,
} from '@ant-design/icons'
import { PageHeader, StatusBadge } from '../../../components/PMSComponents'
import { useResources, STATUS_MAP as SM } from '../hooks/useResources'

const CAT_MAP = {
  equipment: { label: '设备', icon: <ToolOutlined />, bg: '#dbeafe', color: '#1e40af' },
  material: { label: '材料', icon: <InboxOutlined />, bg: '#fef3c7', color: '#92400e' },
  vehicle: { label: '车辆', icon: <CarOutlined />, bg: '#dcfce7', color: '#166534' },
  labor: { label: '人力', bg: '#f3f4f6', color: '#6b7280' },
  finance: { label: '资金', bg: '#fef3c7', color: '#92400e' },
  other: { label: '其他', bg: '#f3f4f6', color: '#6b7280' },
}

export default function ResourcesPage() {
  const { data, loading, load, create } = useResources()
  const [filters, setFilters] = useState({})
  const [form] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    load(filters)
  }, [filters, load])

  const handleCreate = async () => {
    try {
      const vals = await form.validateFields()
      await create(vals)
      message.success('资源登记成功')
      form.resetFields()
      setModalVisible(false)
      load(filters)
    } catch {
      message.error('登记失败')
    }
  }

  const stats = {
    total: data.length,
    available: data.filter(d => d.status === 'available' || d.status === 'idle').length,
    inUse: data.filter(d => ['in_use', 'ordered', 'delivered'].includes(d.status)).length,
    maintenance: data.filter(d => ['maintenance', 'testing'].includes(d.status)).length,
  }

  const catStats = Object.entries(CAT_MAP).map(([k, v]) => ({
    key: k,
    ...v,
    count: data.filter(d => d.category === k).length,
  }))

  const columns = [
    {
      title: '资源信息',
      key: 'info',
      render: (_, r) => (
        <div style={styles.resourceInfo}>
          <div style={styles.resourceHeader}>
            <Tag
              style={{
                ...styles.catTag,
                background: CAT_MAP[r.category]?.bg || '#f3f4f6',
                color: CAT_MAP[r.category]?.color || '#6b7280',
              }}
            >
              {CAT_MAP[r.category]?.icon} {CAT_MAP[r.category]?.label || r.category}
            </Tag>
          </div>
          <div style={styles.resourceName}>{r.name || '-'}</div>
          <div style={styles.resourceSpec}>{r.spec || '-'}</div>
        </div>
      ),
    },
    {
      title: '数量',
      key: 'quantity',
      render: (_, r) => (
        <div style={styles.quantityCell}>
          <span style={styles.quantityValue}>{r.quantity || 0}</span>
          <span style={styles.quantityUnit}>{r.unit || ''}</span>
        </div>
      ),
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      render: t => <span style={styles.supplierText}>{t || '-'}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: s => <StatusBadge status={s} />,
    },
    {
      title: '检测结果',
      dataIndex: 'test_result',
      key: 'test_result',
      render: t =>
        t ? (
          <Tag
            style={{
              background: t === 'pass' ? '#dcfce7' : '#fee2e2',
              color: t === 'pass' ? '#166534' : '#991b1b',
              border: 'none',
            }}
          >
            {t === 'pass' ? '合格' : '不合格'}
          </Tag>
        ) : (
          <span style={styles.noneText}>-</span>
        ),
    },
    {
      title: '订购日期',
      dataIndex: 'order_date',
      key: 'order_date',
      render: t => <span style={styles.dateText}>{t || '-'}</span>,
    },
  ]

  return (
    <div style={styles.page}>
      <PageHeader
        title="资源调度"
        subtitle="设备、材料、车辆等资源管理"
        icon={<AppstoreOutlined style={{ color: 'var(--color-primary)' }} />}
      />

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          {
            label: '资源总数',
            value: stats.total,
            color: 'var(--color-primary)',
            borderColor: '#115cb9',
          },
          { label: '可用', value: stats.available, color: '#166534', borderColor: '#dcfce7' },
          { label: '使用中', value: stats.inUse, color: '#1e40af', borderColor: '#dbeafe' },
          {
            label: '维修/检测',
            value: stats.maintenance,
            color: '#92400e',
            borderColor: '#fef3c7',
          },
        ].map(s => (
          <Col xs={12} sm={6} key={s.label}>
            <div style={{ ...styles.statCard, borderLeft: `3px solid ${s.borderColor}` }}>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
            </div>
          </Col>
        ))}
      </Row>

      <div style={styles.catTags}>
        {catStats.map(cat => (
          <div
            key={cat.key}
            style={{
              ...styles.catTagCard,
              background:
                filters.category === cat.key ? cat.bg : 'var(--color-surface-container-lowest)',
              cursor: 'pointer',
            }}
            onClick={() =>
              setFilters(f => ({
                ...f,
                category: filters.category === cat.key ? undefined : cat.key,
              }))
            }
          >
            <span style={{ ...styles.catIcon, color: cat.color }}>{cat.icon}</span>
            <span
              style={{
                ...styles.catLabel,
                color: filters.category === cat.key ? cat.color : 'var(--color-on-surface)',
              }}
            >
              {cat.label}
            </span>
            <span style={{ ...styles.catCount, color: cat.color }}>{cat.count}</span>
          </div>
        ))}
      </div>

      <div style={styles.filterBar}>
        <div style={styles.filterLeft}>
          <Select
            allowClear
            placeholder="状态"
            style={{ width: 120 }}
            onChange={v => setFilters(f => ({ ...f, status: v }))}
            options={Object.entries(SM).map(([k, v]) => ({ value: k, label: v.label }))}
          />
        </div>
        <div style={styles.filterRight}>
          <Button onClick={() => load(filters)}>刷新</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields()
              setModalVisible(true)
            }}
            style={styles.addBtn}
          >
            登记资源
          </Button>
        </div>
      </div>

      <div style={styles.tableCard}>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title={<span style={styles.modalTitle}>登记资源</span>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleCreate}
        okText="登记"
        cancelText="取消"
        width={520}
        styles={{ body: { padding: 24 } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="资源名称" rules={[{ required: true }]}>
            <Input placeholder="请输入资源名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="类别" rules={[{ required: true }]}>
                <Select placeholder="请选择类别">
                  {Object.entries(CAT_MAP).map(([k, v]) => (
                    <Select.Option key={k} value={k}>
                      {v.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="spec" label="规格型号">
                <Input placeholder="请输入规格型号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="quantity" label="数量" initialValue={1}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unit" label="单位">
                <Input placeholder="如：台、吨、辆" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="supplier" label="供应商">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

const styles = {
  page: {
    padding: 24,
    background: 'var(--color-background)',
    minHeight: '100vh',
  },
  statCard: {
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    padding: 16,
    boxShadow: 'var(--shadow-soft)',
  },
  statLabel: {
    fontSize: 13,
    color: 'var(--color-on-surface-variant)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    fontFamily: 'var(--font-headline)',
    color: 'var(--color-on-surface)',
  },
  catTags: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  catTagCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-soft)',
    transition: 'all 0.2s',
  },
  catIcon: { fontSize: 16 },
  catLabel: { fontSize: 14, fontWeight: 500 },
  catCount: { fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: 'center' },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  filterLeft: { display: 'flex', gap: 8 },
  filterRight: { display: 'flex', gap: 8 },
  addBtn: { background: 'var(--color-primary)', borderColor: 'var(--color-primary)' },
  tableCard: {
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    padding: 16,
    boxShadow: 'var(--shadow-soft)',
  },
  resourceInfo: { display: 'flex', flexDirection: 'column', gap: 2 },
  resourceHeader: { marginBottom: 4 },
  catTag: { border: 'none', fontSize: 12, padding: '2px 8px' },
  resourceName: { fontWeight: 600, color: 'var(--color-on-surface)' },
  resourceSpec: { fontSize: 12, color: 'var(--color-on-surface-variant)' },
  quantityCell: { display: 'flex', alignItems: 'baseline', gap: 4 },
  quantityValue: { fontSize: 18, fontWeight: 700, color: 'var(--color-on-surface)' },
  quantityUnit: { fontSize: 12, color: 'var(--color-on-surface-variant)' },
  supplierText: { fontSize: 13, color: 'var(--color-on-surface-variant)' },
  noneText: { color: 'var(--color-on-surface-variant)' },
  dateText: { fontSize: 12, color: 'var(--color-on-surface-variant)' },
  modalTitle: { fontSize: 18, fontWeight: 600, color: 'var(--color-on-surface)' },
}
