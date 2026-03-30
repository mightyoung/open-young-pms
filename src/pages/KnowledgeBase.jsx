/**
 * 知识库页 - 基于 Stitch Azure Ethos 设计系统
 * 更新时间: 2026-03-30
 */
import React, { useState, useEffect } from 'react'
import { Card, Button, Input, List, Space, Tag, Modal, Form, message } from 'antd'
import { BookOutlined, PlusOutlined, SearchOutlined, FileTextOutlined, SafetyOutlined, TrophyOutlined, ReadOutlined, FileExcelOutlined } from '@ant-design/icons'
import { api } from '../api'
import { PageHeader, EmptyState, SearchInput } from '../components/PMSComponents'

const CATEGORY_MAP = {
  safety: { label: '安全规程', icon: <SafetyOutlined />, bg: '#fee2e2', color: '#991b1b' },
  quality: { label: '质量标准', icon: <TrophyOutlined />, bg: '#fef3c7', color: '#92400e' },
  process: { label: '流程规范', icon: <ReadOutlined />, bg: '#dbeafe', color: '#1e40af' },
  template: { label: '文档模板', icon: <FileExcelOutlined />, bg: '#dcfce7', color: '#166534' },
  other: { label: '其他', icon: <FileTextOutlined />, bg: '#f3f4f6', color: '#6b7280' },
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

  // 分类筛选
  const categories = [
    { key: null, label: '全部' },
    ...Object.entries(CATEGORY_MAP).map(([k, v]) => ({ key: k, ...v })),
  ]

  // 统计数据
  const stats = Object.entries(CATEGORY_MAP).reduce((acc, [k, v]) => {
    acc[k] = docs.filter(d => d.category === k).length
    return acc
  }, {})

  return (
    <div style={styles.page}>
      <PageHeader
        title="知识库"
        subtitle="安全规程、质量标准、流程规范、文档模板"
        icon={<BookOutlined style={{ color: 'var(--color-primary)' }} />}
      />

      {/* 搜索栏 */}
      <div style={styles.searchBar}>
        <div style={styles.searchLeft}>
          <SearchInput 
            placeholder="搜索文档标题、内容..." 
            value={keyword}
            onChange={setKeyword}
          />
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setCreateOpen(true)}
          style={styles.createBtn}
        >
          新建文档
        </Button>
      </div>

      {/* 分类标签 */}
      <div style={styles.categoryBar}>
        {categories.map(cat => (
          <div
            key={cat.key || 'all'}
            style={{
              ...styles.categoryTag,
              background: (category === cat.key) ? (cat.bg || 'var(--color-primary-container)') : 'var(--color-surface-container-lowest)',
              color: (category === cat.key) ? (cat.color || 'var(--color-primary)') : 'var(--color-on-surface-variant)',
              cursor: 'pointer',
            }}
            onClick={() => setCategory(cat.key)}
          >
            {cat.icon && <span style={{ marginRight: 6 }}>{cat.icon}</span>}
            <span>{cat.label}</span>
            <span style={{ 
              ...styles.catCount,
              background: (category === cat.key) ? (cat.color || 'var(--color-primary)') : 'var(--color-surface-container)',
              color: (category === cat.key) ? 'white' : 'var(--color-on-surface-variant)'
            }}>
              {cat.key ? stats[cat.key] || 0 : docs.length}
            </span>
          </div>
        ))}
      </div>

      {/* 文档列表 */}
      <div style={styles.listCard}>
        {loading ? (
          <div style={styles.loading}>加载中...</div>
        ) : docs.length === 0 ? (
          <EmptyState 
            icon="📚"
            title="暂无文档"
            description={'点击上方"新建文档"创建第一篇知识文档'}
          />
        ) : (
          <List
            dataSource={docs}
            renderItem={doc => (
              <List.Item 
                style={styles.listItem}
                actions={[
                  <Button key="view" type="link" style={styles.viewBtn}>查看</Button>,
                  <Button key="edit" type="link" style={styles.editBtn}>编辑</Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ ...styles.docIcon, background: CATEGORY_MAP[doc.category]?.bg || '#f3f4f6' }}>
                      <span style={{ color: CATEGORY_MAP[doc.category]?.color || '#6b7280' }}>
                        {CATEGORY_MAP[doc.category]?.icon || <FileTextOutlined />}
                      </span>
                    </div>
                  }
                  title={<span style={styles.docTitle}>{doc.title}</span>}
                  description={
                    <Space size={12}>
                      <Tag style={{ 
                        ...styles.catTag, 
                        background: CATEGORY_MAP[doc.category]?.bg || '#f3f4f6', 
                        color: CATEGORY_MAP[doc.category]?.color || '#6b7280',
                        border: 'none',
                      }}>
                        {CATEGORY_MAP[doc.category]?.label || doc.category}
                      </Tag>
                      <span style={styles.docDate}>
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString('zh-CN') : ''}
                      </span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {/* 创建文档弹窗 */}
      <Modal
        title={<span style={styles.modalTitle}>新建文档</span>}
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        okText="创建"
        cancelText="取消"
        styles={{ body: { padding: 24 } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="文档标题" rules={[{ required: true }]}>
            <Input placeholder="请输入文档标题" />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Input placeholder="如：safety, quality, process, template, other" />
          </Form.Item>
          <Form.Item name="content" label="文档内容">
            <Input.TextArea rows={8} placeholder="请输入文档内容（支持富文本）" />
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
  createBtn: {
    background: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
  },
  categoryBar: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  categoryTag: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  catCount: {
    padding: '0 8px',
    borderRadius: 'var(--radius-full)',
    fontSize: 12,
    fontWeight: 600,
    marginLeft: 4,
  },
  listCard: {
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    padding: 16,
    boxShadow: 'var(--shadow-soft)',
  },
  loading: {
    textAlign: 'center',
    padding: 48,
    color: 'var(--color-on-surface-variant)',
  },
  listItem: {
    borderBottom: '1px solid var(--color-outline-variant)',
    padding: '16px 0',
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--color-on-surface)',
  },
  catTag: {
    fontSize: 12,
    padding: '0 8px',
  },
  docDate: {
    fontSize: 12,
    color: 'var(--color-on-surface-variant)',
  },
  viewBtn: {
    color: 'var(--color-primary)',
    padding: '4px 8px',
  },
  editBtn: {
    color: 'var(--color-on-surface-variant)',
    padding: '4px 8px',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--color-on-surface)',
  },
}
