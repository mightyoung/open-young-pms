import React, { useEffect, useRef } from 'react'
import { Input, Button, Avatar, Spin, List } from 'antd'
import { RobotOutlined, UserOutlined, SendOutlined, StarOutlined } from '@ant-design/icons'
import { useAIChat, QUICK_ACTIONS } from '../hooks/useAIChat'
import { PageHeader } from '../../../components/PMSComponents'

const { TextArea } = Input

const D = {
  primary: '#115cb9',
  primaryContainer: '#dbeafe',
  surfaceContainerLowest: '#ffffff',
  surfaceContainer: '#f5f7fa',
  surfaceContainerHigh: '#e8eaf0',
  onSurface: '#1a1a2e',
  onSurfaceVariant: '#5f5f61',
  onSecondaryContainer: '#1e40af',
  secondaryContainer: '#dbeafe',
  outlineVariant: '#e5e7eb',
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 20,
  shadowSoft: '0 2px 8px rgba(0,0,0,0.08)',
}

export default function AIChatPage() {
  const { messages, loading, sendMessage, setMessages } = useAIChat()
  const [input, setInput] = React.useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    sendMessage(text)
  }

  const handleQuickAction = text => {
    setMessages(prev => [...prev, { role: 'user', content: text }])
    sendMessage(text)
  }

  return (
    <div
      style={{
        padding: 24,
        background: D.surfaceContainer,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <PageHeader
        title="AI 智能助手"
        subtitle="基于 RAG 的智能问答助手"
        icon={<StarOutlined style={{ color: D.primary }} />}
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 900,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Chat area */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 16,
            background: D.surfaceContainerLowest,
            borderRadius: D.radiusXl,
            boxShadow: D.shadowSoft,
            marginBottom: 16,
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 48,
                textAlign: 'center',
                minHeight: 300,
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: D.primaryContainer,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <RobotOutlined style={{ fontSize: 40, color: D.primary }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: D.onSurface, margin: '0 0 8px' }}>
                你好，我是 AI 助手
              </h2>
              <p style={{ fontSize: 14, color: D.onSurfaceVariant, margin: '0 0 32px' }}>
                我可以帮你分析数据、解答问题、提供建议
              </p>
              <div style={{ width: '100%', maxWidth: 600 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: D.onSurfaceVariant,
                    marginBottom: 12,
                    textAlign: 'left',
                  }}
                >
                  试试这样问我：
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {QUICK_ACTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickAction(q.text)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 16px',
                        background: D.surfaceContainer,
                        border: 'none',
                        borderRadius: D.radiusMd,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{q.icon}</span>
                      <span style={{ fontSize: 13, color: D.onSurface, lineHeight: 1.4 }}>
                        {q.text}
                      </span>
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
                    border: 'none',
                    padding: '8px 0',
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      gap: 12,
                      maxWidth: '80%',
                    }}
                  >
                    <Avatar
                      icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                      style={{
                        background: msg.role === 'user' ? D.primary : D.secondaryContainer,
                        color: msg.role === 'user' ? 'white' : D.onSecondaryContainer,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        background: msg.role === 'user' ? D.primary : D.surfaceContainerLowest,
                        color: msg.role === 'user' ? 'white' : D.onSurface,
                        borderRadius:
                          msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        padding: '12px 16px',
                        lineHeight: 1.6,
                        fontSize: 14,
                        whiteSpace: 'pre-wrap',
                        boxShadow: D.shadowSoft,
                      }}
                    >
                      {msg.content}
                      {msg.sources?.length > 0 && (
                        <div
                          style={{
                            fontSize: 12,
                            color:
                              msg.role === 'user' ? 'rgba(255,255,255,0.8)' : D.onSurfaceVariant,
                            marginTop: 8,
                            paddingTop: 8,
                            borderTop: `1px solid ${msg.role === 'user' ? 'rgba(255,255,255,0.2)' : D.outlineVariant}`,
                          }}
                        >
                          📚 参考：
                          {msg.sources
                            .map((s, i) =>
                              typeof s === 'string' ? s : s?.source || s?.title || `来源${i + 1}`
                            )
                            .join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
          {loading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 16,
                color: D.onSurfaceVariant,
                fontSize: 13,
              }}
            >
              <Spin size="small" /> <span>AI 思考中...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          style={{
            background: D.surfaceContainerLowest,
            borderRadius: D.radiusLg,
            padding: 16,
            boxShadow: D.shadowSoft,
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <TextArea
              value={input}
              onChange={e => setInput(e.target.value)}
              onPressEnter={e => {
                if (!e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="输入问题，按 Enter 发送，Shift+Enter 换行..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{
                flex: 1,
                borderRadius: D.radiusMd,
                background: D.surfaceContainerHigh,
                border: 'none',
                padding: '12px 14px',
                fontSize: 14,
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={loading}
              style={{
                height: 40,
                background: D.primary,
                borderColor: D.primary,
                borderRadius: D.radiusMd,
              }}
            >
              发送
            </Button>
          </div>
          <div
            style={{ fontSize: 12, color: D.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}
          >
            AI 可能产生不准确的信息，请以实际为准
          </div>
        </div>
      </div>
    </div>
  )
}
