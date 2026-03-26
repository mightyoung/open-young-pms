// API 客户端，封装 fetch 调用

const BASE = '/api/v1'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  })
  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/'
    return null
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Request failed')
  return data
}

export const api = {
  // Auth
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  // Hazards (随手拍)
  hazards: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString()
      return request(`/hazards${qs ? '?' + qs : ''}`)
    },
    create: (data) => request('/hazards', { method: 'POST', body: JSON.stringify(data) }),
    get: (id) => request(`/hazards/${id}`),
    assign: (id, data) => request(`/hazards/${id}/assign`, { method: 'POST', body: JSON.stringify(data) }),
    transfer: (id, data) => request(`/hazards/${id}/transfer`, { method: 'POST', body: JSON.stringify(data) }),
    confirm: (id, data) => request(`/hazards/${id}/confirm`, { method: 'POST', body: JSON.stringify(data) }),
    push: (id, data) => request(`/hazards/${id}/push`, { method: 'POST', body: JSON.stringify(data) }),
    rectify: (id, data) => request(`/hazards/${id}/rectify`, { method: 'POST', body: JSON.stringify(data) }),
    accept: (id, comment) => request(`/hazards/${id}/accept`, { method: 'POST', body: JSON.stringify({ comment }) }),
    reject: (id, reason) => request(`/hazards/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
    stats: () => request('/hazards/stats/summary'),
  },

  // Projects
  projects: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString()
      return request(`/projects${qs ? '?' + qs : ''}`)
    },
    get: (id) => request(`/projects/${id}`),
    gantt: (id) => request(`/projects/${id}/gantt`),
    create: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  // Tasks
  tasks: {
    listByPhase: (phaseId) => request(`/tasks/by-phase/${phaseId}`),
    create: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  },

  // Notifications
  notifications: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString()
      return request(`/notifications${qs ? '?' + qs : ''}`)
    },
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () => request('/notifications/read-all', { method: 'POST' }),
  },

  // User
  user: {
    me: () => request('/users/me'),
    list: () => request('/users'),
  },
}
