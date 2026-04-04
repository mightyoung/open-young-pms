import React, { useState } from 'react'
import { List, Tag, Button, Input, Modal, Form, message, Avatar, Typography } from 'antd'
import { PlusOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons'
import { useForum } from '../hooks/useForum'
import { forumFeatureApi } from '../api'
import SkeletonContent from '../../../components/SkeletonContent'
import { PageHeader } from '../../../components/PMSComponents'

const { TextArea } = Input
const { Text } = Typography

const D = {
  primary: '#115cb9',
  bg: '#f5f7fa',
  card: '#ffffff',
  border: '#e5e7eb',
  text: '#1a1a2e',
  textSec: '#5f5f61',
  textMuted: '#8c8c8c',
  accent: '#115cb9',
}

function timeAgo(t) {
  if (!t) return ''
  const diff = (Date.now() - new Date(t)) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${Math.floor(diff / 86400)}天前`
}

export default function ForumPage() {
  const { posts, loading, tab, setTab, createPost, toggleLike } = useForum()
  const [postModalOpen, setPostModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [form] = Form.useForm()

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'pinned', label: '置顶' },
    { key: 'featured', label: '精华' },
  ]

  const handlePost = async () => {
    try {
      const vals = await form.validateFields()
      await createPost(vals)
      message.success('发布成功')
      setPostModalOpen(false)
      form.resetFields()
    } catch {
      message.error('发布失败')
    }
  }

  const handleLike = async post => {
    try {
      await toggleLike(post.id)
    } catch {
      message.error('操作失败')
    }
  }

  const openDetail = async post => {
    setSelectedPost(post)
    try {
      const res = await forumFeatureApi.getPost(post.id)
      setSelectedPost(res?.data || res)
    } catch {}
    setDetailModalOpen(true)
  }

  const handleReply = async () => {
    if (!replyContent.trim()) return
    try {
      await forumFeatureApi.createReply(selectedPost.id, { content: replyContent })
      message.success('回帖成功')
      setReplyContent('')
      const res = await forumFeatureApi.getPost(selectedPost.id)
      setSelectedPost(res?.data || res)
    } catch {
      message.error('回帖失败')
    }
  }

  return (
    <div style={{ padding: 24, background: D.bg, minHeight: '100vh' }}>
      <PageHeader
        title="论坛"
        icon={<MessageOutlined style={{ color: 'var(--color-primary)' }} />}
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ borderRadius: 10, background: D.primary }}
            onClick={() => setPostModalOpen(true)}
          >
            发帖
          </Button>
        }
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {tabItems.map(t => (
          <Button
            key={t.key}
            onClick={() => setTab(t.key)}
            type={tab === t.key ? 'primary' : 'default'}
            style={
              tab === t.key
                ? { background: D.primary, border: 'none', borderRadius: 8 }
                : { borderRadius: 8 }
            }
          >
            {t.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <SkeletonContent type="table" />
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: D.card, borderRadius: 12 }}>
          <Text style={{ color: D.textMuted }}>暂无帖子</Text>
        </div>
      ) : (
        <List
          dataSource={posts}
          renderItem={post => (
            <List.Item
              style={{
                background: D.card,
                border: `1px solid ${D.border}`,
                borderRadius: 8,
                padding: 16,
                marginBottom: 8,
              }}
              actions={[
                <Button
                  key="like"
                  size="small"
                  icon={<LikeOutlined />}
                  onClick={() => handleLike(post)}
                  style={{ color: post.liked ? D.primary : D.textMuted }}
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
                    <a onClick={() => openDetail(post)} style={{ color: D.primary }}>
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
                    <span style={{ color: D.textMuted, fontSize: 12, marginLeft: 'auto' }}>
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
        onCancel={() => {
          setPostModalOpen(false)
          form.resetFields()
        }}
        footer={null}
        width={560}
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
          <Button
            type="primary"
            style={{ background: D.primary, borderRadius: 10 }}
            onClick={handlePost}
          >
            发布
          </Button>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Avatar style={{ background: D.accent }}>{selectedPost.author_id?.[0] || 'U'}</Avatar>
              <div>
                <Text style={{ color: D.text, fontWeight: 600 }}>
                  {selectedPost.author_id || '匿名用户'}
                </Text>
                <Text style={{ color: D.textMuted, fontSize: 12, display: 'block' }}>
                  {selectedPost.created_at
                    ? new Date(selectedPost.created_at).toLocaleString()
                    : ''}
                </Text>
              </div>
            </div>
            <div style={{ color: D.textSec, marginBottom: 16, lineHeight: 1.8 }}>
              {selectedPost.content}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {(selectedPost.tags || []).map(tag => (
                <Tag key={tag} color="blue">
                  {tag}
                </Tag>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${D.border}`, paddingTop: 12 }}>
              <Text style={{ color: D.textSec, fontSize: 13 }}>
                👁 {selectedPost.view_count || 0} 浏览 · {selectedPost.like_count || 0} 赞 ·{' '}
                {selectedPost.reply_count || 0} 回复
              </Text>
            </div>
            <div style={{ marginTop: 16 }}>
              <Text strong style={{ color: D.text }}>
                回帖 ({selectedPost.replies?.length || 0})
              </Text>
              {(selectedPost.replies || []).map(reply => (
                <div
                  key={reply.id}
                  style={{ background: D.bg, borderRadius: 6, padding: 12, marginTop: 8 }}
                >
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}
                  >
                    <Text style={{ color: D.textMuted, fontSize: 12 }}>
                      #{reply.floor_number}楼
                    </Text>
                    <Text style={{ color: D.textMuted, fontSize: 12 }}>
                      {timeAgo(reply.created_at)}
                    </Text>
                  </div>
                  <Text style={{ color: D.text }}>{reply.content}</Text>
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
                <Button
                  type="primary"
                  style={{ background: D.primary, height: 'auto' }}
                  onClick={handleReply}
                >
                  发送
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
