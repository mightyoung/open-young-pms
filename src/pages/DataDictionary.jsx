import React, { useState, useEffect } from 'react'
import { colors } from '../styles/theme'
import { Card, Typography, Table, Input, Space, Tag } from 'antd'
import { DatabaseOutlined, SearchOutlined } from '@ant-design/icons'
import { api } from '../api'

const { Title, Text } = Typography

export default function DataDictionary() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/data/dict')
      let items = res?.items || res || []
      if (keyword) {
        items = items.filter(i =>
          (i.name || '').includes(keyword) ||
          (i.code || '').includes(keyword) ||
          (i.description || '').includes(keyword)
        )
      }
      setData(items)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [keyword])

  const columns = [
    { title: '编码', dataIndex: 'code', render: t => <Text style={{ color: '#6366f1', fontFamily: 'monospace', fontSize: 12 }}>{t}</Text> },
    { title: '名称', dataIndex: 'name', render: t => <Text style={{ color: colors.text.primary }}>{t}</Text> },
    { title: '分类', dataIndex: 'category', render: t => <Tag>{t || '-'}</Tag> },
    { title: '类型', dataIndex: 'data_type', render: t => <Tag color="blue">{t || 'string'}</Tag> },
    { title: '说明', dataIndex: 'description', render: t => <Text style={{ color: colors.text.muted, fontSize: 12 }}>{t || '-'}</Text> },
    { title: '示例', dataIndex: 'example', render: t => <Text style={{ color: colors.text.disabled, fontSize: 11, fontFamily: 'monospace' }}>{t || '-'}</Text> },
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ color: colors.text.primary, margin: 0 }}>
          <DatabaseOutlined style={{ marginRight: 8 }} />数据字典
        </Title>
      </div>

      <Card style={{ background: colors.bg.page, border: '1px solid #27272a', marginBottom: 16 }}>
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索编码/名称/说明..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            style={{ width: 300, background: colors.bg.card, borderColor: colors.bg.elevated }}
          />
          <Text style={{ color: colors.text.muted, fontSize: 12 }}>共 {data.length} 条</Text>
        </Space>
      </Card>

      <Card style={{ background: colors.bg.page, border: '1px solid #27272a' }}>
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading} size="small"
          pagination={{ pageSize: 30, showTotal: t => `共 ${t} 条` }} />
      </Card>
    </div>
  )
}
