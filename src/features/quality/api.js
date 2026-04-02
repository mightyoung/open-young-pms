import { api } from '../../api'

export const qualityFeatureApi = {
  listStandards: (params = {}) => api.get('/quality/standards', { params }),
  createStandard: (data) => api.post('/quality/standards', data),
  listInspections: (params = {}) => api.get('/quality/inspections', { params }),
  createInspection: (data) => api.post('/quality/inspections', data),
}
