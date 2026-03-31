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
      files.forEach((file) => formData.append('files', file))
      return upload('/upload/images', formData)
    },
  },
  hazards: {
    list: (params = {}) => get('/hazards', { params }),
    create: (data) => post('/hazards', data),
    get: (id) => get(`/hazards/${id}`),
    assign: (id, data) => post(`/hazards/${id}/assign`, data),
    transfer: (id, data) => post(`/hazards/${id}/transfer`, data),
    confirm: (id, data) => post(`/hazards/${id}/confirm`, data),
    push: (id, data) => post(`/hazards/${id}/push`, data),
    rectify: (id, data) => post(`/hazards/${id}/rectify`, data),
    accept: (id, comment) => post(`/hazards/${id}/accept`, { comment }),
    reject: (id, reason) => post(`/hazards/${id}/reject`, { reason }),
    stats: () => get('/hazards/stats/summary'),
    drafts: () => get('/hazards/drafts'),
    saveDraft: (data) => post('/hazards/drafts', data),
    deleteDraft: (id) => del(`/hazards/drafts/${id}`),
  },
  projects: {
    list: (params = {}) => get('/projects', { params }),
    get: (id) => get(`/projects/${id}`),
    gantt: (id) => get(`/projects/${id}/gantt`),
    create: (data) => post('/projects', data),
    update: (id, data) => patch(`/projects/${id}`, data),
  },
  tasks: {
    listByPhase: (phaseId) => get(`/tasks/by-phase/${phaseId}`),
    create: (data) => post('/tasks', data),
    update: (id, data) => patch(`/tasks/${id}`, data),
    delete: (id) => del(`/tasks/${id}`),
  },
  notifications: {
    list: (params = {}) => get('/notifications', { params }),
    markRead: (id) => post(`/notifications/${id}/read`),
    markAllRead: () => post('/notifications/read-all'),
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
