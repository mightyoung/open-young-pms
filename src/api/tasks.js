import { get, post, put, del } from './client'

// Layer 2 — legacy WBS task router at /api/v1/tasks
export const tasksApi = {
  list: params => get('/tasks', { params }),
  // CRUD
  create: payload => post('/tasks', payload),
  get: taskId => get(`/tasks/${taskId}`),
  update: (taskId, payload) => put(`/tasks/${taskId}`, payload),
  remove: taskId => del(`/tasks/${taskId}`),

  // Assignment
  assign: (taskId, payload) => post(`/tasks/${taskId}/assign`, payload),

  // Progress
  updateProgress: (taskId, payload) => put(`/tasks/${taskId}/progress`, payload),

  // Comments
  addComment: (taskId, payload) => post(`/tasks/${taskId}/comments`, payload),

  // Project-level views
  tree: projectId => get(`/projects/${projectId}/tasks/tree`),
  gantt: projectId => get(`/projects/${projectId}/tasks/gantt`),
  kanban: projectId => get(`/projects/${projectId}/tasks/kanban`),
  stats: projectId => get(`/projects/${projectId}/tasks/stats`),
  criticalPath: projectId => get(`/projects/${projectId}/tasks/critical-path`),
}

export default tasksApi
