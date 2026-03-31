import { useEffect, useState } from 'react'
import { dashboardFeatureApi } from '../api'

export function useDashboardData() {
  const [summary, setSummary] = useState(null)
  const [hazardTrend, setHazardTrend] = useState([])
  const [hazardByType, setHazardByType] = useState([])
  const [hazardByStatus, setHazardByStatus] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [summaryResult, trendResult, typeResult, statusResult] = await Promise.all([
          dashboardFeatureApi.getSummary().catch(() => null),
          dashboardFeatureApi.getHazardTrend().catch(() => []),
          dashboardFeatureApi.getHazardByType().catch(() => []),
          dashboardFeatureApi.getHazardByStatus().catch(() => []),
        ])

        setSummary(summaryResult || null)
        setHazardTrend(Array.isArray(trendResult) ? trendResult : trendResult?.items || [])
        setHazardByType(Array.isArray(typeResult) ? typeResult : typeResult?.items || [])
        setHazardByStatus(Array.isArray(statusResult) ? statusResult : statusResult?.items || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return {
    loading,
    summary,
    hazardTrend,
    hazardByType,
    hazardByStatus,
  }
}

export default useDashboardData
