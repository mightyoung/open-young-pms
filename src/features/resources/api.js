import { api } from '../../api'

export const resourcesFeatureApi = {
  list: (params) => api.get('/resources', { params }),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.patch(`/resources/${id}`, data),
}
