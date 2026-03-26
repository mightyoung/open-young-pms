import React, { useState, useEffect } from 'react'
import { Card, Table, Input, Button, message, Space, Tag } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { api } from '../api'

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

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username', render: t => <span style={{ color: '#e4e4e7' }}>{t}</span> },
    { title: '姓名', dataIndex: 'full_name', key: 'full_name', render: t => <span style={{ color: '#a1a1aa' }}>{t || '-'}</span> },
    { title: '邮箱', dataIndex: 'email', key: 'email', render: t => <span style={{ color: '#71717a' }}>{t || '-'}</span> },
    { title: '手机', dataIndex: 'phone', key: 'phone', render: t => <span style={{ color: '#71717a' }}>{t || '-'}</span> },
  ]

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#e4e4e7', marginBottom: 16 }}>用户管理</h2>
      <Card style={{ background: '#27272a', border: '1px solid #3f3f46' }}>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索用户名/姓名/邮箱"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onPressEnter={() => loadUsers(1)}
            style={{ width: 260 }}
          />
          <Button type="primary" onClick={() => loadUsers(1)}>搜索</Button>
        </Space>
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{
            current: page, total,
            onChange: loadUsers,
            pageSize: 20,
            showTotal: t => `共 ${t} 条`,
          }}
        />
      </Card>
    </div>
  )
}
