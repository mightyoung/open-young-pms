import { api } from '../../api'

export const hazardsFeatureApi = {
  list: (params = {}) => api.get('/hazards', { params }),
  get: (id) => api.get(`/hazards/${id}`),
  create: (data) => api.post('/hazards', data),
}
