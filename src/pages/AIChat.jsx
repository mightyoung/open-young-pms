/**
 * AI 助手页 - 基于 Stitch Azure Ethos 设计系统
 * 更新时间: 2026-03-30
 */
import React, { useState, useRef, useEffect } from 'react'
import { Input, Button, Avatar, Spin, List } from 'antd'
import {
  RobotOutlined,
  UserOutlined,
  SendOutlined,
  BulbOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { api } from '../api'
import { PageHeader } from '../components/PMSComponents'

const { TextArea } = Input

export default function AIChat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const res = await api.post('/ai/chat', {
        message: userMsg,
        session_id: sessionId,
        use_rag: true,
      })
      const data = res.data || res
      if (!sessionId && data.session_id) setSessionId(data.session_id)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || data,
          sources: data.sources || [],
        },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '抱歉，AI 服务暂时不可用，请稍后再试。',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { icon: '📋', text: '如何创建随手拍隐患上报？' },
    { icon: '📊', text: '项目甘特图怎么使用？' },
    { icon: '✅', text: '报告审批流程是什么？' },
    { icon: '📈', text: '帮我分析最近的安全隐患趋势' },
  ]

  const handleQuickAction = text => {
    setInput(text)
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)
    api
      .post('/ai/chat', { message: text, use_rag: true })
      .then(r => {
        const d = r.data || r
        setSessionId(d.session_id || sessionId)
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: d.answer || d, sources: d.sources || [] },
        ])
      })
      .catch(() =>
        setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，AI 服务暂时不可用。' }])
      )
      .finally(() => setLoading(false))
  }

  return (
    <div style={styles.page}>
      <PageHeader
        title="AI 智能助手"
        subtitle="基于 RAG 的智能问答助手"
        icon={<StarOutlined style={{ color: 'var(--color-primary)' }} />}
      />

      {/* 聊天区域 */}
      <div style={styles.chatContainer}>
        {/* 消息列表 */}
        <div style={styles.messageList}>
          {messages.length === 0 ? (
            /* 欢迎界面 */
            <div style={styles.welcome}>
              <div style={styles.welcomeIcon}>
                <RobotOutlined style={{ fontSize: 48, color: 'var(--color-primary)' }} />
              </div>
              <h2 style={styles.welcomeTitle}>你好，我是 AI 助手</h2>
              <p style={styles.welcomeDesc}>我可以帮你分析数据、解答问题、提供建议</p>

              {/* 快捷问题 */}
              <div style={styles.quickActions}>
                <div style={styles.quickTitle}>试试这样问我：</div>
                <div style={styles.quickGrid}>
                  {quickActions.map((q, i) => (
                    <button
                      key={i}
                      style={styles.quickBtn}
                      onClick={() => handleQuickAction(q.text)}
                    >
                      <span style={styles.quickIcon}>{q.icon}</span>
                      <span style={styles.quickText}>{q.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <List
              dataSource={messages}
              renderItem={msg => (
                <List.Item
                  style={{
                    ...styles.messageItem,
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      ...styles.messageRow,
                      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    }}
                  >
                    <Avatar
                      icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                      style={{
                        ...styles.avatar,
                        background:
                          msg.role === 'user'
                            ? 'var(--color-primary)'
                            : 'var(--color-secondary-container)',
                        color:
                          msg.role === 'user' ? 'white' : 'var(--color-on-secondary-container)',
                      }}
                    />
                    <div
                      style={{
                        ...styles.messageBubble,
                        background:
                          msg.role === 'user'
                            ? 'var(--color-primary)'
                            : 'var(--color-surface-container-lowest)',
                        color: msg.role === 'user' ? 'white' : 'var(--color-on-surface)',
                        ...(msg.role === 'user' ? styles.userBubble : styles.assistantBubble),
                      }}
                    >
                      {msg.content}
                      {msg.sources?.length > 0 && (
                        <div style={styles.sources}>📚 参考：{msg.sources.join(', ')}</div>
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
          {loading && (
            <div style={styles.loading}>
              <Spin size="small" />
              <span>AI 思考中...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* 输入框 */}
        <div style={styles.inputArea}>
          <div style={styles.inputWrapper}>
            <TextArea
              value={input}
              onChange={e => setInput(e.target.value)}
              onPressEnter={e => {
                if (!e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="输入问题，按 Enter 发送，Shift+Enter 换行..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={styles.input}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={send}
              loading={loading}
              style={styles.sendBtn}
            >
              发送
            </Button>
          </div>
          <div style={styles.inputHint}>AI 可能产生不准确的信息，请以实际为准</div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    padding: 24,
    background: 'var(--color-background)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 900,
    margin: '0 auto',
    width: '100%',
  },
  messageList: {
    flex: 1,
    overflow: 'auto',
    padding: 16,
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-soft)',
    marginBottom: 16,
  },
  welcome: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    textAlign: 'center',
    minHeight: 300,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'var(--color-primary-container)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 700,
    fontFamily: 'var(--font-headline)',
    color: 'var(--color-on-surface)',
    margin: '0 0 8px',
  },
  welcomeDesc: {
    fontSize: 14,
    color: 'var(--color-on-surface-variant)',
    margin: '0 0 32px',
  },
  quickActions: {
    width: '100%',
    maxWidth: 600,
  },
  quickTitle: {
    fontSize: 13,
    color: 'var(--color-on-surface-variant)',
    marginBottom: 12,
    textAlign: 'left',
  },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
  },
  quickBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    background: 'var(--color-surface-container)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    fontFamily: 'var(--font-body)',
  },
  quickIcon: {
    fontSize: 18,
  },
  quickText: {
    fontSize: 13,
    color: 'var(--color-on-surface)',
    lineHeight: 1.4,
  },
  messageItem: {
    border: 'none',
    padding: '8px 0',
    display: 'flex',
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    maxWidth: '80%',
  },
  avatar: {
    flexShrink: 0,
  },
  messageBubble: {
    borderRadius: 16,
    padding: '12px 16px',
    lineHeight: 1.6,
    fontSize: 14,
    whiteSpace: 'pre-wrap',
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  sources: {
    fontSize: 12,
    color: 'var(--color-on-surface-variant)',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px solid var(--color-outline-variant)',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    color: 'var(--color-on-surface-variant)',
    fontSize: 13,
  },
  inputArea: {
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    padding: 16,
    boxShadow: 'var(--shadow-soft)',
  },
  inputWrapper: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-surface-container-high)',
    border: 'none',
    padding: '12px 14px',
    fontSize: 14,
    fontFamily: 'var(--font-body)',
  },
  sendBtn: {
    height: 40,
    background: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
  },
  inputHint: {
    fontSize: 12,
    color: 'var(--color-on-surface-variant)',
    textAlign: 'center',
    marginTop: 8,
  },
}
