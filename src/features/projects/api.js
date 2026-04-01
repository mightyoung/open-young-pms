import { api } from '../../api'

export const projectsFeatureApi = {
  list: (params = {}) => api.projects.list(params),
  get: id => api.projects.get(id),
  create: data => api.projects.create(data),
  update: (id, data) => api.projects.update(id, data),
  remove: id => api.projects.remove(id),
  gantt: id => api.projects.gantt(id),
  createPhase: (id, data) => api.projects.createPhase(id, data),
}

export default projectsFeatureApi
