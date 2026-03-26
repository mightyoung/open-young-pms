import React, { useState, useEffect } from 'react'
import { colors } from '../styles/theme'
import { Card, Typography, Button, Input, List, Space, Tag, Modal, Form, message, Empty, Spin } from 'antd'
import { BookOutlined, PlusOutlined, SearchOutlined, FileTextOutlined } from '@ant-design/icons'
import { api } from '../api'

const { Title, Text } = Typography

const CATEGORY_MAP = {
  safety: { label: '安全规程', color: 'red' },
  quality: { label: '质量标准', color: 'orange' },
  process: { label: '流程规范', color: 'blue' },
  template: { label: '文档模板', color: 'green' },
  other: { label: '其他', color: 'default' },
}

export default function KnowledgeBase() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (keyword) params.keyword = keyword
      if (category) params.category = category
      const res = await api.get('/knowledge/documents', { params })
      setDocs(res?.items || res || [])
    } catch {
      setDocs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [keyword, category])

  const handleCreate = async () => {
    try {
      const vals = await form.validateFields()
      await api.post('/knowledge/documents', vals)
      message.success('文档创建成功')
      form.resetFields()
      setCreateOpen(false)
      load()
    } catch (e) { message.error('创建失败') }
  }

  const searchTypes = [
    { key: 'all', label: '全部' },
    { key: 'safety', label: '安全规程' },
    { key: 'quality', label: '质量标准' },
    { key: 'process', label: '流程规范' },
    { key: 'template', label: '文档模板' },
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ color: colors.text.primary, margin: 0 }}>
          <BookOutlined style={{ marginRight: 8 }} />知识库
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          新建文档
        </Button>
      </div>

      {/* 搜索 + 分类筛选 */}
      <Card style={{ background: colors.bg.page, border: '1px solid #27272a', marginBottom: 16 }}>
        <Space wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索文档标题/内容..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            style={{ width: 240, background: colors.bg.card, borderColor: colors.bg.elevated }}
          />
          <Space wrap>
            {searchTypes.map(t => (
              <Tag
                key={t.key}
                color={(!category && t.key === 'all') || category === t.key ? '#6366f1' : colors.bg.card}
                style={{ cursor: 'pointer', borderColor: (!category && t.key === 'all') || category === t.key ? '#6366f1' : colors.bg.elevated, color: (!category && t.key === 'all') || category === t.key ? 'white' : colors.text.muted }}
                onClick={() => setCategory(t.key === 'all' ? null : t.key)}
              >
                {t.label}
              </Tag>
            ))}
          </Space>
        </Space>
      </Card>

      {/* 文档列表 */}
      <Card style={{ background: colors.bg.page, border: '1px solid #27272a' }}>
        {loading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> : docs.length === 0 ? (
          <Empty description="暂无文档" />
        ) : (
          <List
            dataSource={docs}
            renderItem={doc => (
              <List.Item
                style={{ borderBottom: '1px solid #27272a', padding: '16px 0' }}
                actions={[
                  <Button key="view" type="link" style={{ color: '#6366f1' }}>查看</Button>,
                  <Button key="edit" type="link" style={{ color: colors.text.muted }}>编辑</Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<div style={{ width: 40, height: 40, background: colors.bg.card, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileTextOutlined style={{ color: '#6366f1', fontSize: 20 }} />
                  </div>}
                  title={<Text style={{ color: colors.text.primary }}>{doc.title}</Text>}
                  description={
                    <Space>
                      <Tag color={CATEGORY_MAP[doc.category]?.color}>{CATEGORY_MAP[doc.category]?.label || doc.category}</Tag>
                      <Text style={{ color: colors.text.muted, fontSize: 12 }}>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ''}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 创建文档弹窗 */}
      <Modal title={<Text style={{ color: colors.text.primary }}>新建文档</Text>} open={createOpen} onCancel={() => setCreateOpen(false)}
        onOk={handleCreate} okText="创建" cancelText="取消"
        styles={{ body: { background: colors.bg.page } }}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="文档标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="文档内容">
            <Input.TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
