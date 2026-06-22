import { api } from '../../api'

export const approvalCenterFeatureApi = {
  listFlows: (params) => api.get('/approval/flows', { params }),
  listTasks: () => api.get('/approval/my-pending'),
  approve: (instanceId, data = {}) =>
    api.post(`/approval/instances/${instanceId}/approve`, null, { params: { comment: data.comment } }),
  reject: (instanceId, data = {}) =>
    api.post(`/approval/instances/${instanceId}/reject`, null, { params: { comment: data.comment } }),
}
