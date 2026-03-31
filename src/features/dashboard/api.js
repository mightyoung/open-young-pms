import { api } from '../../api'

export const dashboardFeatureApi = {
  getSummary: () => api.dashboard.summary(),
  getHazardTrend: () => api.dashboard.hazardTrend(),
  getHazardByType: () => api.dashboard.hazardByType(),
  getHazardByStatus: () => api.dashboard.hazardByStatus(),
}

export default dashboardFeatureApi
