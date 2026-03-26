import React, { useState, useEffect } from 'react'
import { colors } from '../styles/theme'
import { Card, List, Empty, Popconfirm, message, Button, Tag, Spin } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { api } from '../api'

const STATUS_MAP = {
  safety: { label: '安全', color: 'red' },
  quality: { label: '质量', color: 'orange' },
  environment: { label: '环境', color: 'green' },
}

export default function DraftBox() {
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDrafts()
  }, [])

  const loadDrafts = async () => {
    setLoading(true)
    try {
      const data = await api.hazards.drafts()
      setDrafts(data.items || data || [])
    } catch (e) {
      message.error('加载草稿失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.hazards.deleteDraft(id)
      message.success('已删除')
      setDrafts(prev => prev.filter(d => d.id !== id))
    } catch (e) {
      message.error('删除失败')
    }
  }

  const formatTime = (t) => {
    if (!t) return ''
    const d = new Date(t)
    return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ color: colors.text.primary, margin: 0 }}>草稿箱</h2>
        <span style={{ color: colors.text.muted }}>{drafts.length} 个草稿</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>
      ) : drafts.length === 0 ? (
        <Empty description="暂无草稿" style={{ marginTop: 80 }} />
      ) : (
        <List
          dataSource={drafts}
          renderItem={item => {
            const cfg = STATUS_MAP[item.hazard_type] || { label: item.hazard_type, color: 'default' }
            return (
              <List.Item
                actions={[
                  <Button key="edit" size="small" icon={<EditOutlined />} onClick={() => window.location.hash = `#/hazards/report?draft=${item.id}`}>继续编辑</Button>,
                  <Popconfirm key="del" title="确定删除此草稿？" onConfirm={() => handleDelete(item.id)}>
                    <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: colors.text.primary }}>{item.title || '未填写标题'}</span>
                      <Tag color={cfg.color}>{cfg.label}</Tag>
                    </div>
                  }
                  description={
                    <div style={{ color: colors.text.muted, fontSize: 12 }}>
                      <span>{item.location || '未填写位置'}</span>
                      <span style={{ float: 'right' }}>保存于 {formatTime(item.auto_saved_at || item.created_at)}</span>
                    </div>
                  }
                />
              </List.Item>
            )
          }}
        />
      )}
    </div>
  )
}
