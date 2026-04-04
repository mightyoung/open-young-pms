import { useState, useCallback } from 'react'
import { resourcesFeatureApi } from '../api'

const STATUS_MAP = {
  available: { label: '可用', bg: '#dcfce7', color: '#166534' },
  ordered: { label: '已订购', bg: '#dbeafe', color: '#1e40af' },
  delivered: { label: '已到货', bg: '#dbeafe', color: '#1e40af' },
  testing: { label: '检测中', bg: '#fef3c7', color: '#92400e' },
  accepted: { label: '已验收', bg: '#dcfce7', color: '#166534' },
  rejected: { label: '不合格', bg: '#fee2e2', color: '#991b1b' },
  idle: { label: '空闲', bg: '#dcfce7', color: '#166534' },
  in_use: { label: '使用中', bg: '#dbeafe', color: '#1e40af' },
  maintenance: { label: '维修中', bg: '#fef3c7', color: '#92400e' },
}

export { STATUS_MAP }

export function useResources() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (filters = {}) => {
    setLoading(true)
    try {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.category) params.category = filters.category
      const res = await resourcesFeatureApi.list(params)
      const payload = res?.data?.data || res?.data || {}
      setData(payload.items || [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (values) => {
    await resourcesFeatureApi.create(values)
  }, [])

  return { data, loading, load, create, STATUS_MAP }
}
