// API 客户端 — 统一封装，支持新 ApiResponse 格式 { code, message, data }
// 旧格式兼容：直接返回 { data: {...} }

const BASE = '/api/v1'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  })

  // HTTP 401 → 跳转登录
  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/'
    return null
  }

  // HTTP 403 → 无权限提示
  if (res.status === 403) {
    const err = new Error('无权限访问')
    err.code = 'C0101'
    throw err
  }

  // HTTP 5xx → 服务器错误
  if (res.status >= 500) {
    throw new Error('服务器错误，请稍后重试')
  }

  const data = await res.json()

  // ── 新 ApiResponse 格式 { code, message, data } ──
  if (data && typeof data.code === 'string') {
    if (data.code !== 'A0000') {
      const err = new Error(data.message || '操作失败')
      err.code = data.code
      err.detail = data.data?.detail
      throw err
    }
    // 成功：返回 data 字段（兼容旧格式）
    return data.data !== undefined ? data.data : data
  }

  // ── 旧格式兼容（直接返回 data）──
  if (!res.ok) throw new Error(data.detail || 'Request failed')
  return data.data !== undefined ? data.data : data
}

// ── 文件上传（不走 JSON body）──
async function upload(path, formData) {
  const token = localStorage.getItem('token')
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  // 不要设置 Content-Type，让浏览器自动设置（multipart boundary）

  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/'
    return null
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Upload failed')

  // 新格式
  if (data && typeof data.code === 'string') {
    if (data.code !== 'A0000') throw new Error(data.message || '上传失败')
    return data.data !== undefined ? data.data : data
  }
  return data
}

export const api = {
  // Auth
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  // Upload
  upload: {
    images: (files) => {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      return upload('/upload/images', fd)
    },
  },

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
    // 草稿
    drafts: () => request('/hazards/drafts'),
    saveDraft: (data) => request('/hazards/drafts', { method: 'POST', body: JSON.stringify(data) }),
    deleteDraft: (id) => request(`/hazards/drafts/${id}`, { method: 'DELETE' }),
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

  // Roles
  roles: {
    list: () => request('/roles'),
  },

  // User
  user: {
    me: () => request('/users/me'),
    list: () => request('/users'),
  },
}
