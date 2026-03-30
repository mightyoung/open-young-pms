/**
 * 用户管理页 - 基于 Stitch Azure Ethos 设计系统
 * 更新时间: 2026-03-30
 */
import React, { useState, useEffect } from 'react'
import { Card, Table, Input, Button, message, Space, Tag, Avatar, Row, Col } from 'antd'
import { SearchOutlined, UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { api } from '../api'
import { PageHeader, RoleBadge, StatusBadge, SearchInput } from '../components/PMSComponents'

export default function Users() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)

  const loadUsers = async (p = 1) => {
    setLoading(true)
    try {
      const res = await api.get('/users', { params: { keyword, page: p, page_size: 20 } })
      const items = res?.items || res?.data?.items || []
      const totalNum = res?.total || res?.data?.total || 0
      setData(items)
      setTotal(totalNum)
      setPage(p)
    } catch (e) {
      message.error('加载用户失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  // 统计数据
  const stats = {
    total: data.length,
    active: data.filter(d => d.is_active !== false).length,
  }

  const columns = [
    {
      title: '用户信息',
      key: 'user',
      render: (_, r) => (
        <div style={styles.userCell}>
          <Avatar 
            style={{ background: 'var(--color-primary)', flexShrink: 0 }} 
            icon={<UserOutlined />}
          />
          <div style={styles.userInfo}>
            <div style={styles.userName}>{r.full_name || r.username}</div>
            <div style={styles.userId}>@{r.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: r => r ? <RoleBadge role={r} /> : <span style={styles.noneText}>-</span>,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      render: t => <span style={styles.deptText}>{t || '-'}</span>,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: t => (
        t ? (
          <div style={styles.contactCell}>
            <MailOutlined style={{ color: 'var(--color-on-surface-variant)', marginRight: 6 }} />
            <span style={styles.contactText}>{t}</span>
          </div>
        ) : <span style={styles.noneText}>-</span>
      ),
    },
    {
      title: '手机',
      dataIndex: 'phone',
      key: 'phone',
      render: t => (
        t ? (
          <div style={styles.contactCell}>
            <PhoneOutlined style={{ color: 'var(--color-on-surface-variant)', marginRight: 6 }} />
            <span style={styles.contactText}>{t}</span>
          </div>
        ) : <span style={styles.noneText}>-</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: v => (
        <StatusBadge status={v === false ? 'disabled' : 'active'} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, r) => (
        <div style={styles.actions}>
          <Button type="link" size="small" style={styles.editBtn}>编辑</Button>
          <Button type="link" size="small" style={styles.viewBtn}>详情</Button>
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

      {/* 统计卡片 */}
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

      {/* 搜索栏 */}
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
          <Button type="primary" style={styles.addBtn}>新增用户</Button>
        </div>
      </div>

      {/* 用户列表 */}
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
            showTotal: t => `共 ${t} 条`,
          }}
          rowClassName={() => 'animate-fade-in-up'}
        />
      </div>
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
    borderLeft: '3px solid var(--color-primary)',
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
  searchBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  searchLeft: {
    flex: 1,
    maxWidth: 400,
  },
  searchRight: {
    display: 'flex',
    gap: 8,
  },
  addBtn: {
    background: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
  },
  tableCard: {
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    padding: 16,
    boxShadow: 'var(--shadow-soft)',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  userName: {
    fontWeight: 600,
    color: 'var(--color-on-surface)',
    fontSize: 14,
  },
  userId: {
    fontSize: 12,
    color: 'var(--color-on-surface-variant)',
  },
  noneText: {
    color: 'var(--color-on-surface-variant)',
  },
  deptText: {
    fontSize: 13,
    color: 'var(--color-on-surface-variant)',
  },
  contactCell: {
    display: 'flex',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 13,
    color: 'var(--color-on-surface-variant)',
  },
  actions: {
    display: 'flex',
    gap: 4,
  },
  editBtn: {
    color: 'var(--color-primary)',
    padding: '4px 8px',
  },
  viewBtn: {
    color: 'var(--color-on-surface-variant)',
    padding: '4px 8px',
  },
}
