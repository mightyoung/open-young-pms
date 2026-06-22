import { api } from '../../api'

export const reportsFeatureApi = {
  list: (params = {}) => api.get('/reports', { params }),
  get: id => api.get(`/reports/${id}`),
  submit: data => api.post('/reports', data),
  stats: (params = {}) => api.get('/reports/stats', { params }),
}

export default reportsFeatureApi
