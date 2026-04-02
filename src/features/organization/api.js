import { api } from '../../api'

export const organizationFeatureApi = {
  getTree: () => api.get('/departments/tree'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  remove: (id) => api.delete(`/departments/${id}`),
}
