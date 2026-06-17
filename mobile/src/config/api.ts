export const API_BASE_URL =
  process.env.NODE_ENV === 'development' ? 'http://localhost:8001/api/v1' : '/api/v1'

export const WS_BASE_URL =
  process.env.NODE_ENV === 'development' ? 'ws://localhost:8001/ws' : '/ws'
