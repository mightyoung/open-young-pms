import { api } from '../../api'

export const risksFeatureApi = {
  list: (params = {}) => api.get('/risks', { params }),
  create: (data) => api.post('/risks', data),
  update: (id, data) => api.patch(`/risks/${id}`, data),
}
