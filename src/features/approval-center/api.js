import { api } from '../../api'

export const approvalCenterFeatureApi = {
  listFlows: (params) => api.get('/approval/flows', { params }),
  listTasks: (params) => api.get('/approval/tasks', { params }),
  approve: (taskId, data) => api.post(`/approval/tasks/${taskId}/approve`, data),
  reject: (taskId, data) => api.post(`/approval/tasks/${taskId}/reject`, data),
}
