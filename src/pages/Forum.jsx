import React, { useState, useEffect } from 'react'
import EmptyState from '../components/EmptyState'
import { Card, List, Tag, Button, Input, Modal, Form, message, Empty } from 'antd'
import { PlusOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons'
import { api } from '../api'
import SkeletonContent from '../components/SkeletonContent'

const { TextArea } = Input

export default function Forum() {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [postModalOpen, setPostModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [form] = Form.useForm()

  const loadPosts = async () => {
    setLoading(true)
    try {
      const res = await api.get('/forum/posts', { params: { tab, page: 1, page_size: 20 } })
      const items = res?.items || res?.data?.items || []
      setPosts(items)
      setTotal(res?.total || res?.data?.total || 0)
    } catch (e) {
      message.error('加载帖子失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [tab])

  const handlePost = async () => {
    try {
      const vals = await form.validateFields()
      await api.post('/forum/posts', vals)
      message.success('发布成功')
      setPostModalOpen(false)
      form.resetFields()
      loadPosts()
    } catch (e) {
      message.error('发布失败')
    }
  }

  const handleLike = async postId => {
    try {
      const res = await api.post('/forum/like', { target_type: 'post', target_id: postId })
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? {
                ...p,
                liked: res?.liked,
                like_count: res?.like_count,
              }
            : p
        )
      )
    } catch (e) {
      message.error('操作失败')
    }
  }

  const openDetail = async post => {
    setSelectedPost(post)
    try {
      const res = await api.get(`/forum/posts/${post.id}`)
      setSelectedPost(res?.data || res)
    } catch (e) {}
    setDetailModalOpen(true)
  }

  const handleReply = async () => {
    if (!replyContent.trim()) return
    try {
      await api.post(`/forum/posts/${selectedPost.id}/replies`, { content: replyContent })
      message.success('回帖成功')
      setReplyContent('')
      openDetail({ ...selectedPost, id: selectedPost.id })
    } catch (e) {
      message.error('回帖失败')
    }
  }

  const timeAgo = t => {
    if (!t) return ''
    const diff = (Date.now() - new Date(t)) / 1000
    if (diff < 60) return '刚刚'
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
    return `${Math.floor(diff / 86400)}天前`
  }

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'pinned', label: '置顶' },
    { key: 'featured', label: '精华' },
  ]

  return (
    <div style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ color: '#1a1a2e', margin: 0 }}>论坛</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setPostModalOpen(true)}>
          发帖
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {tabItems.map(t => (
          <Button
            key={t.key}
            type={tab === t.key ? 'primary' : 'default'}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <SkeletonContent type="table" />
      ) : posts.length === 0 ? (
        <EmptyState type="list" title="暂无帖子" style={{ marginTop: 80 }} />
      ) : (
        <List
          dataSource={posts}
          renderItem={post => (
            <List.Item
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 16,
                marginBottom: 8,
              }}
              actions={[
                <Button
                  key="like"
                  size="small"
                  icon={<LikeOutlined />}
                  onClick={() => handleLike(post.id)}
                >
                  {post.like_count || 0}
                </Button>,
                <Button
                  key="reply"
                  size="small"
                  icon={<MessageOutlined />}
                  onClick={() => openDetail(post)}
                >
                  {post.reply_count || 0}
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <>
                    {post.is_pinned && (
                      <Tag color="red" style={{ marginRight: 4 }}>
                        置顶
                      </Tag>
                    )}
                    {post.is_featured && (
                      <Tag color="gold" style={{ marginRight: 4 }}>
                        精
                      </Tag>
                    )}
                    <a
                      href={`?postId=${post.id}`}
                      onClick={e => {
                        e.preventDefault()
                        sessionStorage.setItem('forum_post_id', post.id)
                        window.dispatchEvent(
                          new CustomEvent('__navigate', { detail: 'forumDetail' })
                        )
                      }}
                      style={{ color: '#115cb9' }}
                    >
                      {post.title}
                    </a>
                  </>
                }
                description={
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                    {(post.tags || []).map(tag => (
                      <Tag key={tag} color="blue">
                        {tag}
                      </Tag>
                    ))}
                    <span style={{ color: '#8c8c8c', fontSize: 12, marginLeft: 'auto' }}>
                      {timeAgo(post.created_at)}
                    </span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}

      {/* 发帖弹窗 */}
      <Modal
        title="发布帖子"
        open={postModalOpen}
        onOk={handlePost}
        onCancel={() => setPostModalOpen(false)}
        okText="发布"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="请输入帖子标题" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <TextArea rows={6} placeholder="请输入帖子内容" />
          </Form.Item>
          <Form.Item name="tags" label="标签（逗号分隔）">
            <Input placeholder="例如：安全,质量,经验" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 帖子详情弹窗 */}
      <Modal
        title={selectedPost?.title}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedPost && (
          <div style={{ marginTop: 16 }}>
            <div style={{ color: '#5f5f61', marginBottom: 16, lineHeight: 1.8 }}>
              {selectedPost.content}
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '16px 0' }} />
            <h4 style={{ color: '#1a1a2e' }}>回帖 ({selectedPost.replies?.length || 0})</h4>
            {(selectedPost.replies || []).map(reply => (
              <div
                key={reply.id}
                style={{ background: '#f5f7fa', borderRadius: 6, padding: 12, marginBottom: 8 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#8c8c8c', fontSize: 12 }}>#{reply.floor_number}楼</span>
                  <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                    {timeAgo(reply.created_at)}
                  </span>
                </div>
                <div style={{ color: '#1a1a2e' }}>{reply.content}</div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <TextArea
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder="写下你的回复..."
                rows={3}
                style={{ flex: 1 }}
              />
              <Button type="primary" onClick={handleReply}>
                发送
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
