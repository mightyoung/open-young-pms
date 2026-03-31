import { get } from './client'

export const dashboardApi = {
  summary: () => get('/dashboard/summary'),
  hazardTrend: () => get('/dashboard/hazard-trend'),
  hazardByType: () => get('/dashboard/hazard-by-type'),
  hazardByStatus: () => get('/dashboard/hazard-by-status'),
}

export default dashboardApi
