import { authApi } from './auth'
import { dashboardApi } from './dashboard'
import { usersApi } from './users'
import { del, get, patch, post, put, upload } from './client'

export const api = {
  get,
  post,
  put,
  patch,
  delete: del,
  login: authApi.login,
  auth: authApi,
  dashboard: dashboardApi,
  users: usersApi,
  upload: {
    images(files) {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      return upload('/upload/images', formData)
    },
  },
  hazards: {
    list: (params = {}) => get('/hazards', { params }),
    create: data => post('/hazards', data),
    get: id => get(`/hazards/${id}`),
    assign: (id, data) => post(`/hazards/${id}/assign`, data),
    transfer: (id, data) => post(`/hazards/${id}/transfer`, data),
    confirm: (id, data) => post(`/hazards/${id}/confirm`, data),
    push: (id, data) => post(`/hazards/${id}/push`, data),
    rectify: (id, data) => post(`/hazards/${id}/rectify`, data),
    accept: (id, comment) => post(`/hazards/${id}/accept`, { comment }),
    reject: (id, reason) => post(`/hazards/${id}/reject`, { reason }),
    stats: () => get('/hazards/stats/summary'),
    drafts: () => get('/hazards/drafts'),
    saveDraft: data => post('/hazards/drafts', data),
    deleteDraft: id => del(`/hazards/drafts/${id}`),
  },
  projects: {
    list: (params = {}) => get('/projects', { params }),
    get: id => get(`/projects/${id}`),
    gantt: id => get(`/projects/${id}/gantt`),
    create: data => post('/projects', data),
    update: (id, data) => patch(`/projects/${id}`, data),
    remove: id => del(`/projects/${id}`),
    createPhase: (id, data) => post(`/projects/${id}/phases`, data),
  },
  tasks: {
    create: data => post('/tasks', data),
    get: id => get(`/tasks/${id}`),
    update: (id, data) => put(`/tasks/${id}`, data), // router uses PUT
    delete: id => del(`/tasks/${id}`),
    assign: (id, data) => post(`/tasks/${id}/assign`, data),
    updateProgress: (id, data) => put(`/tasks/${id}/progress`, data),
    addComment: (id, data) => post(`/tasks/${id}/comments`, data),
    tree: projectId => get(`/projects/${projectId}/tasks/tree`),
    gantt: projectId => get(`/projects/${projectId}/tasks/gantt`),
    kanban: projectId => get(`/projects/${projectId}/tasks/kanban`),
    stats: projectId => get(`/projects/${projectId}/tasks/stats`),
    criticalPath: projectId => get(`/projects/${projectId}/tasks/critical-path`),
  },
  notifications: {
    list: (params = {}) => get('/notifications', { params }),
    unreadCount: () => get('/notifications/unread-count'),
    markRead: id => post(`/notifications/${id}/read`),
    markAllRead: () => post('/notifications/read-all'),
    remove: id => del(`/notifications/${id}`),
    settings: {
      get: () => get('/notifications/settings'),
      update: data => put('/notifications/settings', data),
    },
  },
  roles: {
    list: () => get('/roles'),
  },
  user: {
    me: usersApi.me,
    list: usersApi.list,
  },
}

export { authApi, dashboardApi, usersApi }
