import React, { useMemo } from 'react'
import { Table, Button, Avatar, Row, Col } from 'antd'
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { PageHeader, RoleBadge, StatusBadge, SearchInput } from '../../../components/PMSComponents'
import { useUsers } from '../hooks/useUsers'

export default function UsersPage() {
  const { data, total, loading, keyword, setKeyword, page, loadUsers } = useUsers()

  const stats = useMemo(
    () => ({
      total: data.length,
      active: data.filter(item => item.is_active !== false).length,
    }),
    [data]
  )

  const columns = [
    {
      title: '用户信息',
      key: 'user',
      render: (_, record) => (
        <div style={styles.userCell}>
          <Avatar
            style={{ background: 'var(--color-primary)', flexShrink: 0 }}
            icon={<UserOutlined />}
          />
          <div style={styles.userInfo}>
            <div style={styles.userName}>{record.full_name || record.username}</div>
            <div style={styles.userId}>@{record.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: role => (role ? <RoleBadge role={role} /> : <span style={styles.noneText}>-</span>),
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      render: department => <span style={styles.deptText}>{department || '-'}</span>,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: email =>
        email ? (
          <div style={styles.contactCell}>
            <MailOutlined style={{ color: 'var(--color-on-surface-variant)', marginRight: 6 }} />
            <span style={styles.contactText}>{email}</span>
          </div>
        ) : (
          <span style={styles.noneText}>-</span>
        ),
    },
    {
      title: '手机',
      dataIndex: 'phone',
      key: 'phone',
      render: phone =>
        phone ? (
          <div style={styles.contactCell}>
            <PhoneOutlined style={{ color: 'var(--color-on-surface-variant)', marginRight: 6 }} />
            <span style={styles.contactText}>{phone}</span>
          </div>
        ) : (
          <span style={styles.noneText}>-</span>
        ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: isActive => <StatusBadge status={isActive === false ? 'disabled' : 'active'} />,
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <div style={styles.actions}>
          <Button type="link" size="small" style={styles.editBtn}>
            编辑
          </Button>
          <Button type="link" size="small" style={styles.viewBtn}>
            详情
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div style={styles.page}>
      <PageHeader
        title="用户管理"
        subtitle="管理系统用户、角色和权限"
        icon={<UserOutlined style={{ color: 'var(--color-primary)' }} />}
      />

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>用户总数</div>
            <div style={styles.statValue}>{total}</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div style={{ ...styles.statCard, borderLeft: '3px solid #52c41a' }}>
            <div style={styles.statLabel}>活跃用户</div>
            <div style={{ ...styles.statValue, color: '#52c41a' }}>{stats.active}</div>
          </div>
        </Col>
      </Row>

      <div style={styles.searchBar}>
        <div style={styles.searchLeft}>
          <SearchInput
            placeholder="搜索用户名、姓名、邮箱..."
            value={keyword}
            onChange={setKeyword}
          />
        </div>
        <div style={styles.searchRight}>
          <Button onClick={() => loadUsers(1)}>搜索</Button>
          <Button type="primary" style={styles.addBtn}>
            新增用户
          </Button>
        </div>
      </div>

      <div style={styles.tableCard}>
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{
            current: page,
            total,
            onChange: loadUsers,
            pageSize: 20,
            showTotal: count => `共 ${count} 条`,
          }}
          rowClassName={() => 'animate-fade-in-up'}
        />
      </div>
    </div>
  )
}

const styles = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100vh' },
  statCard: {
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    padding: 16,
    boxShadow: 'var(--shadow-soft)',
    borderLeft: '3px solid var(--color-primary)',
  },
  statLabel: { fontSize: 13, color: 'var(--color-on-surface-variant)', marginBottom: 4 },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    fontFamily: 'var(--font-headline)',
    color: 'var(--color-on-surface)',
  },
  searchBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  searchLeft: { flex: 1, maxWidth: 400 },
  searchRight: { display: 'flex', gap: 8 },
  addBtn: { background: 'var(--color-primary)', borderColor: 'var(--color-primary)' },
  tableCard: {
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    padding: 16,
    boxShadow: 'var(--shadow-soft)',
  },
  userCell: { display: 'flex', alignItems: 'center', gap: 12 },
  userInfo: { display: 'flex', flexDirection: 'column', gap: 2 },
  userName: { fontWeight: 600, color: 'var(--color-on-surface)', fontSize: 14 },
  userId: { fontSize: 12, color: 'var(--color-on-surface-variant)' },
  noneText: { color: 'var(--color-on-surface-variant)' },
  deptText: { fontSize: 13, color: 'var(--color-on-surface-variant)' },
  contactCell: { display: 'flex', alignItems: 'center' },
  contactText: { fontSize: 13, color: 'var(--color-on-surface-variant)' },
  actions: { display: 'flex', gap: 8 },
  editBtn: { paddingInline: 0 },
  viewBtn: { paddingInline: 0 },
}
