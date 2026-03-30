import React, { useState, useRef, useEffect } from 'react'
import SkeletonContent from "../components/SkeletonContent";
import { colors } from '../styles/theme'
import { Card, Input, Button, Avatar, Spin, List } from 'antd'
import { RobotOutlined, UserOutlined, SendOutlined, BulbOutlined } from '@ant-design/icons'
import { api } from '../api'

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
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || data,
        sources: data.sources || [],
      }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，AI 服务暂时不可用，请稍后再试。',
      }])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    "如何创建随手拍隐患上报？",
    "项目甘特图怎么使用？",
    "报告审批流程是什么？",
    "帮我分析最近的安全隐患趋势",
  ]

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <h2 style={{ color: colors.text.primary, marginBottom: 16 }}>
        <RobotOutlined style={{ marginRight: 8 }} />AI 智能助手
      </h2>

      {/* 快捷问题 */}
      {messages.length === 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: colors.text.muted, fontSize: 13, marginBottom: 8 }}>快捷问题：</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {quickActions.map((q, i) => (
              <Button key={i} size="small" icon={<BulbOutlined />} onClick={() => {
                setInput(q)
                setMessages(prev => [...prev, { role: 'user', content: q }])
                setLoading(true)
                api.post('/ai/chat', { message: q, use_rag: true }).then(r => {
                  const d = r.data || r
                  setSessionId(d.session_id || sessionId)
                  setMessages(prev => [...prev, { role: 'assistant', content: d.answer || d, sources: d.sources || [] }])
                }).catch(() => setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，AI 服务暂时不可用。' }])).finally(() => setLoading(false))
              }}>{q}</Button>
            ))}
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <Card style={{ flex: 1, background: colors.bg.page, border: '1px solid #3f3f46', overflow: 'auto', marginBottom: 16 }}>
        <List
          dataSource={messages}
          renderItem={msg => (
            <List.Item style={{ border: 'none', padding: '8px 0', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, maxWidth: '80%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <Avatar icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />} />
                <div style={{ background: msg.role === 'user' ? colors.accent : colors.bg.card, color: msg.role === 'user' ? '#fff' : colors.text.primary, borderRadius: 12, padding: '10px 14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                  {msg.sources?.length > 0 && (
                    <div style={{ fontSize: 11, color: colors.text.muted, marginTop: 6 }}>
                      📚 参考：{msg.sources.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </List.Item>
          )}
        />
        {loading && <div style={{ textAlign: 'center', padding: 12 }}><Spin size="small" /> AI 思考中...</div>}
        <div ref={bottomRef} />
      </Card>

      {/* 输入框 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <TextArea
          value={input}
          onChange={e => setInput(e.target.value)}
          onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="输入问题，按 Enter 发送，Shift+Enter 换行..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{ flex: 1, background: colors.bg.card, border: '1px solid #3f3f46', color: colors.text.primary }}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={send} loading={loading}>发送</Button>
      </div>
    </div>
  )
}
