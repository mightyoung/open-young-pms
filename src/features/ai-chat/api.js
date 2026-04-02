import { api } from '../../api'

export const aiChatFeatureApi = {
  chat: (data) => api.post('/ai/chat', data),
  getHistory: (sessionId) => api.get(`/ai/chat/history/${sessionId}`),
}
