/**
 * 隐患管理页 - 基于 Stitch Azure Ethos 设计系统
 * 更新时间: 2026-03-30
 */
import React, { useState, useEffect } from 'react'
import { Row, Col, Button, Select, Space, Table, Tag, message, Drawer, Descriptions, Divider, Avatar } from 'antd'
import { WarningOutlined, CheckCircleOutlined, ClockCircleOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons'
import { api } from '../api'
import { PageHeader, StatusBadge, Tabs, SearchInput } from '../components/PMSComponents'

const STATUS_MAP = {
  pending: { label: '待处理', bg: '#fef3c7', color: '#92400e' },
  assigned: { label: '已指派', bg: '#dbeafe', color: '#1e40af' },
  rectifying: { label: '整改中', bg: '#dbeafe', color: '#1e40af' },
  pending_verify: { label: '待验收', bg: '#fef3c7', color: '#92400e' },
  verified: { label: '已验收', bg: '#dcfce7', color: '#166534' },
  closed: { label: '已关闭', bg: '#f3f4f6', color: '#6b7280' },
}

const URGENCY_MAP = {
  urgent: { label: '紧急', bg: '#fee2e2', color: '#991b1b' },
  important: { label: '重要', bg: '#fef3c7', color: '#92400e' },
  normal: { label: '一般', bg: '#f3f4f6', color: '#6b7280' },
}

const TYPE_MAP = {
  safety: { label: '安全生产', bg: '#fee2e2', color: '#991b1b', icon: '🚨' },
  quality: { label: '质量缺陷', bg: '#fef3c7', color: '#92400e', icon: '🔧' },
  environment: { label: '环境问题', bg: '#dcfce7', color: '#166534', icon: '🌿' },
  other: { label: '其他', bg: '#f3f4f6', color: '#6b7280', icon: '📋' },
}

export default function HazardManagement() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({ status: undefined, type: undefined, urgency: undefined })
  const [detail, setDetail] = useState(null)
  const [page, setPage] = useState(1)
  const [searchText, setSearchText] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = { page, page_size: 20 }
      if (filters.status) params.status = filters.status
      if (filters.type) params.type = filters.type
      if (filters.urgency) params.urgency = filters.urgency
      const res = await api.get('/hazards', { params })
      const items = res?.items || res?.data?.items || []
      setData(items)
      setTotal(res?.total || res?.data?.total || 0)
    } catch (e) {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filters, page])

  const handleVerify = async (id) => {
    try {
      await api.post(`/hazards/${id}/verify`)
      message.success('验收成功')
      load()
      setDetail(null)
    } catch (e) {
      message.error('验收失败')
    }
  }

  // 统计各状态数量
  const statusCounts = Object.entries(STATUS_MAP).reduce((acc, [k, v]) => {
    acc[k] = data.filter(d => d.status === k).length
    return acc
  }, {})

  // 筛选后的数据
  const filteredData = searchText
    ? data.filter(d => 
        d.description?.includes(searchText) || 
        d.hazard_no?.includes(searchText) ||
        d.location?.includes(searchText)
      )
    : data

  const columns = [
    {
      title: '隐患信息',
      key: 'info',
      render: (_, r) => (
        <div style={styles.hazardInfo}>
          <div style={styles.hazardHeader}>
            <Tag style={{ ...styles.typeTag, background: TYPE_MAP[r.type]?.bg || '#f3f4f6', color: TYPE_MAP[r.type]?.color || '#6b7280' }}>
              {TYPE_MAP[r.type]?.icon} {TYPE_MAP[r.type]?.label || r.type}
            </Tag>
            <Tag style={{ ...styles.urgencyTag, background: URGENCY_MAP[r.urgency]?.bg || '#f3f4f6', color: URGENCY_MAP[r.urgency]?.color || '#6b7280' }}>
              {URGENCY_MAP[r.urgency]?.label || r.urgency}
            </Tag>
          </div>
          <div style={styles.hazardDesc}>{r.description || '-'}</div>
          <div style={styles.hazardNo}>编号: {r.hazard_no || '-'}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: s => (
        <StatusBadge status={s} />
      ),
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      render: t => (
        <div style={styles.locationCell}>
          <EnvironmentOutlined style={{ color: 'var(--color-on-surface-variant)', marginRight: 4 }} />
          {t || '-'}
        </div>
      ),
    },
    {
      title: '上报人',
      dataIndex: 'reporter_name',
      key: 'reporter_name',
      render: t => (
        <div style={styles.reporterCell}>
          <Avatar size="small" icon={<UserOutlined />} style={{ background: 'var(--color-primary)' }} />
          <span>{t || '-'}</span>
        </div>
      ),
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: t => (
        <span style={styles.timeCell}>
          {t ? new Date(t).toLocaleString('zh-CN') : '-'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, r) => (
        <Button type="link" onClick={() => setDetail(r)} style={{ padding: 0 }}>
          查看详情
        </Button>
      ),
    },
  ]

  return (
    <div style={styles.page}>
      <PageHeader
        title="隐患管理"
        subtitle={`共 ${total} 条隐患记录`}
        icon={<WarningOutlined style={{ color: 'var(--color-primary)' }} />}
      />

      {/* 状态统计卡片 */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {Object.entries(STATUS_MAP).slice(0, 4).map(([k, v]) => (
          <Col xs={12} sm={6} key={k}>
            <div 
              style={{ 
                ...styles.statCard,
                background: filters.status === k ? v.bg : 'var(--color-surface-container-lowest)',
                cursor: 'pointer',
              }}
              onClick={() => setFilters(f => ({ ...f, status: filters.status === k ? undefined : k }))}
            >
              <div style={{ ...styles.statCount, color: filters.status === k ? v.color : 'var(--color-on-surface)' }}>
                {statusCounts[k]}
              </div>
              <div style={{ ...styles.statLabel, color: filters.status === k ? v.color : 'var(--color-on-surface-variant)' }}>
                {v.label}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 筛选栏 */}
      <div style={styles.filterBar}>
        <div style={styles.filterLeft}>
          <Select
            allowClear
            placeholder="隐患类型"
            style={{ width: 140 }}
            onChange={v => setFilters(f => ({ ...f, type: v }))}
            options={Object.entries(TYPE_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Select
            allowClear
            placeholder="紧急程度"
            style={{ width: 120 }}
            onChange={v => setFilters(f => ({ ...f, urgency: v }))}
            options={Object.entries(URGENCY_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
          />
        </div>
        <div style={styles.filterRight}>
          <SearchInput 
            placeholder="搜索隐患描述、编号..." 
            value={searchText}
            onChange={setSearchText}
          />
          <Button onClick={load} style={{ marginLeft: 8 }}>刷新</Button>
        </div>
      </div>

      {/* 隐患列表 */}
      <div style={styles.tableCard}>
        <Table 
          dataSource={filteredData} 
          columns={columns} 
          rowKey="id" 
          loading={loading} 
          pagination={{
            current: page,
            pageSize: 20,
            total,
            onChange: p => setPage(p),
            showTotal: t => `共 ${t} 条`,
          }}
          rowClassName={() => 'animate-fade-in-up'}
        />
      </div>

      {/* 详情抽屉 */}
      <Drawer
        title={<span style={styles.drawerTitle}>隐患详情</span>}
        width={560}
        open={!!detail}
        onClose={() => setDetail(null)}
        styles={{ body: { padding: 24, background: 'var(--color-background)' } }}
      >
        {detail && (
          <div>
            {/* 头部信息 */}
            <div style={styles.detailHeader}>
              <div style={styles.detailTypeRow}>
                <Tag style={{ ...styles.detailTag, background: TYPE_MAP[detail.type]?.bg, color: TYPE_MAP[detail.type]?.color }}>
                  {TYPE_MAP[detail.type]?.icon} {TYPE_MAP[detail.type]?.label}
                </Tag>
                <Tag style={{ ...styles.detailTag, background: URGENCY_MAP[detail.urgency]?.bg, color: URGENCY_MAP[detail.urgency]?.color }}>
                  {URGENCY_MAP[detail.urgency]?.label}
                </Tag>
                <StatusBadge status={detail.status} />
              </div>
              <div style={styles.detailNo}>编号: {detail.hazard_no || '-'}</div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* 详情描述 */}
            <Descriptions column={1} size="small">
              <Descriptions.Item label={<span style={styles.detailLabel}>位置</span>}>
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {detail.location || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={<span style={styles.detailLabel}>描述</span>}>
                {detail.description || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={<span style={styles.detailLabel}>上报人</span>}>
                <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8, background: 'var(--color-primary)' }} />
                {detail.reporter_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={<span style={styles.detailLabel}>上报时间</span>}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {detail.created_at ? new Date(detail.created_at).toLocaleString('zh-CN') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            {/* 验收按钮 */}
            {detail.status === 'pending_verify' && (
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />} 
                block 
                size="large"
                onClick={() => handleVerify(detail.id)}
                style={styles.verifyBtn}
              >
                确认验收
              </Button>
            )}
          </div>
        )}
      </Drawer>
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
    borderRadius: 'var(--radius-lg)',
    padding: 16,
    textAlign: 'center',
    boxShadow: 'var(--shadow-soft)',
    transition: 'all 0.2s',
  },
  statCount: {
    fontSize: 28,
    fontWeight: 700,
    fontFamily: 'var(--font-headline)',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
    flexWrap: 'wrap',
  },
  filterLeft: {
    display: 'flex',
    gap: 8,
  },
  filterRight: {
    display: 'flex',
    alignItems: 'center',
  },
  tableCard: {
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    padding: 16,
    boxShadow: 'var(--shadow-soft)',
  },
  hazardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  hazardHeader: {
    display: 'flex',
    gap: 6,
  },
  typeTag: {
    border: 'none',
    fontSize: 12,
    padding: '2px 8px',
  },
  urgencyTag: {
    border: 'none',
    fontSize: 12,
    padding: '2px 8px',
  },
  hazardDesc: {
    fontSize: 14,
    color: 'var(--color-on-surface)',
    maxWidth: 280,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  hazardNo: {
    fontSize: 12,
    color: 'var(--color-on-surface-variant)',
  },
  locationCell: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    color: 'var(--color-on-surface-variant)',
  },
  reporterCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
  },
  timeCell: {
    fontSize: 12,
    color: 'var(--color-on-surface-variant)',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--color-on-surface)',
  },
  detailHeader: {
    marginBottom: 8,
  },
  detailTypeRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 8,
  },
  detailTag: {
    border: 'none',
    fontSize: 13,
    padding: '4px 10px',
  },
  detailNo: {
    fontSize: 13,
    color: 'var(--color-on-surface-variant)',
  },
  detailLabel: {
    color: 'var(--color-on-surface-variant)',
    fontSize: 13,
  },
  verifyBtn: {
    height: 48,
    fontSize: 16,
    background: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
  },
}
