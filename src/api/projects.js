import { get, post, patch, del } from './client'

// Layer 1 — auto-generated CRUD router at /api/v1/projects
export const projectsApi = {
  list: (params = {}) => get('/projects', { params }),
  create: payload => post('/projects', payload),
  get: id => get(`/projects/${id}`),
  update: (id, payload) => patch(`/projects/${id}`, payload),
  remove: id => del(`/projects/${id}`),

  // Phases
  createPhase: (projectId, payload) => post(`/projects/${projectId}/phases`, payload),

  // Gantt
  gantt: projectId => get(`/projects/${projectId}/gantt`),
}

export default projectsApi
