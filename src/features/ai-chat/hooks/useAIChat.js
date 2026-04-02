import { useState, useCallback } from 'react'
import { aiChatFeatureApi } from '../api'

export const QUICK_ACTIONS = [
  { icon: '📋', text: '如何创建随手拍隐患上报？' },
  { icon: '📊', text: '项目甘特图怎么使用？' },
  { icon: '✅', text: '报告审批流程是什么？' },
  { icon: '📈', text: '帮我分析最近的安全隐患趋势' },
]

export function useAIChat() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)

  const sendMessage = useCallback(
    async (text, options = {}) => {
      if (!text.trim() || loading) return
      const userMsg = text.trim()
      setMessages(prev => [...prev, { role: 'user', content: userMsg }])
      setLoading(true)
      try {
        const res = await aiChatFeatureApi.chat({
          message: userMsg,
          session_id: sessionId,
          use_rag: options.useRag ?? true,
        })
        const data = res?.data || res
        if (!sessionId && data?.session_id) setSessionId(data.session_id)
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data?.answer || data,
            sources: data?.sources || [],
          },
        ])
        return data
      } catch {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: '抱歉，AI 服务暂时不可用，请稍后再试。' },
        ])
      } finally {
        setLoading(false)
      }
    },
    [loading, sessionId]
  )

  return { messages, loading, sessionId, sendMessage, setMessages }
}
