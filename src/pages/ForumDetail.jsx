import React, { useState, useEffect, useCallback } from 'react'
import EmptyState from '../components/EmptyState'
import { colors } from '../styles/theme'
import { Card, Typography, Button, Avatar, Space, Input, Divider, Tag, message, Spin } from 'antd'
import { ArrowLeftOutlined, LikeOutlined, LikeFilled, CommentOutlined } from '@ant-design/icons'
import { api } from '../api'

const { Title, Text } = Typography

const _TYPE_MAP = { safety: '安全生产', quality: '质量缺陷', environment: '环境问题' }
const _STATUS_MAP = {
  pending: '待处理',
  assigned: '已指派',
  rectifying: '整改中',
  pending_verify: '待验收',
  verified: '已验收',
  closed: '已关闭',
}

export default function ForumDetail() {
  // 通过 URL 参数获取 postId: ?postId=xxx
  const postId = sessionStorage.getItem('forum_post_id')

  const [post, setPost] = useState(null)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    if (!postId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await api.get(`/forum/posts/${postId}`)
      setPost(res)
      setReplies(res?.replies || [])
    } catch {
      setPost(null)
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    load()
  }, [load])

  const handleLike = async () => {
    try {
      await api.post('/forum/like', { target_type: 'post', target_id: postId })
      setPost(p => (p ? { ...p, like_count: (p.like_count || 0) + 1, is_liked: true } : p))
    } catch {
      message.error('点赞失败')
    }
  }

  const handleReply = async () => {
    if (!replyContent.trim()) {
      message.warning('请输入回复内容')
      return
    }
    setSubmitting(true)
    try {
      await api.post(`/forum/posts/${postId}/replies`, { content: replyContent })
      message.success('回复成功')
      setReplyContent('')
      load() // 刷新
    } catch {
      message.error('回复失败')
    } finally {
      setSubmitting(false)
    }
  }

  const goBack = () => window.dispatchEvent(new CustomEvent('__navigate', { detail: 'forum' }))

  if (loading)
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    )
  if (!post)
    return (
      <div style={{ padding: 40 }}>
        <EmptyState type="error" title="帖子不存在" />
      </div>
    )

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      {/* 返回 */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={goBack}
        style={{
          marginBottom: 16,
          background: colors.bg.page,
          borderColor: colors.bg.card,
          color: colors.text.primary,
        }}
      >
        返回论坛
      </Button>

      {/* 帖子主体 */}
      <Card style={{ background: colors.bg.page, border: '1px solid #e5e7eb', marginBottom: 16 }}>
        {/* 头部 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Avatar style={{ background: colors.accent }}>{post.author_name?.[0] || 'U'}</Avatar>
          <div>
            <Text style={{ color: colors.text.primary, fontWeight: 600, display: 'block' }}>
              {post.author_name || '匿名用户'}
            </Text>
            <Text style={{ color: colors.text.muted, fontSize: 12 }}>
              {post.created_at ? new Date(post.created_at).toLocaleString() : ''}
            </Text>
          </div>
          {post.tags?.map(tag => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
        </div>

        {/* 标题 */}
        <Title level={4} style={{ color: colors.text.primary, marginBottom: 12 }}>
          {post.title}
        </Title>

        {/* 内容 */}
        <div
          style={{
            color: colors.text.secondary,
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            marginBottom: 16,
          }}
        >
          {post.content}
        </div>

        {/* 底部操作 */}
        <Divider style={{ borderColor: colors.bg.card }} />
        <Space>
          <Button
            icon={post.is_liked ? <LikeFilled /> : <LikeOutlined />}
            onClick={handleLike}
            style={{
              color: post.is_liked ? colors.danger : colors.text.muted,
              background: 'transparent',
              border: 'none',
            }}
          >
            {post.like_count || 0}
          </Button>
          <Text style={{ color: colors.text.muted }}>
            <CommentOutlined /> {post.reply_count || 0} 回复
          </Text>
          <Text style={{ color: colors.text.muted }}>👁 {post.view_count || 0} 浏览</Text>
        </Space>
      </Card>

      {/* 回复列表 */}
      <Title level={5} style={{ color: colors.text.primary, marginBottom: 12 }}>
        回复 ({replies.length})
      </Title>

      {replies.length === 0 && (
        <Card style={{ background: colors.bg.page, border: '1px solid #e5e7eb', marginBottom: 16 }}>
          <Text style={{ color: colors.text.muted }}>暂无回复，来说点什么吧</Text>
        </Card>
      )}

      {replies.map(reply => (
        <Card
          key={reply.id}
          style={{ background: colors.bg.base, border: '1px solid #e5e7eb', marginBottom: 12 }}
        >
          <div style={{ display: 'flex', gap: 10 }}>
            <Avatar style={{ background: colors.accent, flexShrink: 0 }}>
              {reply.author_name?.[0] || 'U'}
            </Avatar>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: colors.text.primary, fontWeight: 500 }}>
                  {reply.author_name || '匿名'}
                </Text>
                <Text style={{ color: colors.text.disabled, fontSize: 11 }}>
                  {reply.created_at ? new Date(reply.created_at).toLocaleString() : ''}
                </Text>
              </div>
              <div style={{ color: colors.text.secondary, lineHeight: 1.6 }}>{reply.content}</div>
            </div>
          </div>
        </Card>
      ))}

      {/* 回复输入 */}
      <Card style={{ background: colors.bg.page, border: '1px solid #e5e7eb' }}>
        <Text style={{ color: colors.text.secondary, marginBottom: 8, display: 'block' }}>
          发表回复
        </Text>
        <Input.TextArea
          value={replyContent}
          onChange={e => setReplyContent(e.target.value)}
          rows={3}
          placeholder="写下你的回复..."
          style={{
            background: colors.bg.card,
            borderColor: colors.bg.elevated,
            color: colors.text.primary,
            marginBottom: 12,
          }}
        />
        <Button type="primary" onClick={handleReply} loading={submitting}>
          发表评论
        </Button>
      </Card>
    </div>
  )
}
