import { get, post } from '../../../api/client'

const BASE_PATH = '/project-lifecycle'

export const projectLifecycleApi = {
  listProjectTypes: () => get(`${BASE_PATH}/project-types`),
  listTemplates: (projectType) =>
    get(`${BASE_PATH}/process-templates`, {
      params: projectType ? { project_type: projectType } : {},
    }),
  previewFromTemplate: (data) => post(`${BASE_PATH}/projects/from-template`, data),
  getLifecycle: (projectId, params = {}) =>
    get(`${BASE_PATH}/projects/${projectId}/lifecycle`, { params }),
  listStageGates: (projectId, params = {}) =>
    get(`${BASE_PATH}/projects/${projectId}/stage-gates`, { params }),
  listWorkItems: (projectId, params = {}) =>
    get(`${BASE_PATH}/projects/${projectId}/work-items`, { params }),
  createWorkItem: (projectId, data, params = {}) =>
    post(`${BASE_PATH}/projects/${projectId}/work-items`, data, { params }),
  transitionWorkItem: (workItemId, data, params = {}) =>
    post(`${BASE_PATH}/work-items/${workItemId}/transition`, data, { params }),
}

export default projectLifecycleApi
