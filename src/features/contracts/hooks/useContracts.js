import { useState, useCallback } from 'react'
import { contractsFeatureApi } from '../api'

const TYPE_MAP = {
  supply: { label: '供货合同', bg: '#dbeafe', color: '#1e40af' },
  install: { label: '安装合同', bg: '#dcfce7', color: '#166534' },
  service: { label: '服务合同', bg: '#fef3c7', color: '#92400e' },
  consulting: { label: '咨询合同', bg: '#fce7f3', color: '#be185d' },
  other: { label: '其他', bg: '#f3f4f6', color: '#6b7280' },
}

const STATUS_MAP = {
  draft: { label: '草稿', bg: '#f3f4f6', color: '#6b7280' },
  signing: { label: '签订中', bg: '#dbeafe', color: '#1e40af' },
  executing: { label: '执行中', bg: '#dcfce7', color: '#166534' },
  completed: { label: '已完成', bg: '#dcfce7', color: '#166534' },
  terminated: { label: '已终止', bg: '#fee2e2', color: '#991b1b' },
}

// Backend status values: draft/signed/executed/terminated
const BACKEND_STATUS_MAP = {
  draft: 'draft',
  signed: 'signing',
  executed: 'executing',
  terminated: 'terminated',
}

export { TYPE_MAP, STATUS_MAP }

export function useContracts() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const loadContracts = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const res = await contractsFeatureApi.list(params)
      const data = res?.data?.data || res?.data || {}
      const items = (data.items || []).map(item => ({
        ...item,
        type: item.contract_type || 'other',
        signedDate: item.signed_date || item.sign_date,
        startDate: item.start_date,
        endDate: item.end_date,
        // Backend doesn't have these — they come from real data or defaults
        progress: item.progress || 0,
        payment: item.payment || 0,
        leader: item.leader || '—',
        // Map backend status to frontend status
        status: BACKEND_STATUS_MAP[item.status] || item.status || 'draft',
      }))
      setContracts(items)
      setTotal(data.total || items.length)
    } catch {
      // silently fail — UI stays empty
    } finally {
      setLoading(false)
    }
  }, [])

  const createContract = useCallback(async (values) => {
    const payload = {
      name: values.name,
      party_a: values.party_a,
      party_b: values.party_b,
      amount: values.amount ? Number(values.amount) : undefined,
      sign_date: values.signedDate || values.sign_date,
      start_date: values.startDate,
      end_date: values.endDate,
      status: values.status || 'draft',
    }
    const res = await contractsFeatureApi.create(payload)
    return res?.data
  }, [])

  return {
    contracts,
    loading,
    total,
    loadContracts,
    createContract,
    TYPE_MAP,
    STATUS_MAP,
  }
}
