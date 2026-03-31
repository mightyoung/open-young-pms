import { useCallback, useEffect, useState } from 'react'
import { message } from 'antd'
import { usersFeatureApi } from '../api'

export function useUsers() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)

  const loadUsers = useCallback(
    async (nextPage = 1) => {
      setLoading(true)
      try {
        const response = await usersFeatureApi.listUsers({ keyword, page: nextPage, page_size: 20 })
        const items = response?.items || response?.data?.items || response || []
        const totalCount =
          response?.total || response?.data?.total || (Array.isArray(items) ? items.length : 0)
        setData(Array.isArray(items) ? items : [])
        setTotal(totalCount)
        setPage(nextPage)
      } catch {
        message.error('加载用户失败')
      } finally {
        setLoading(false)
      }
    },
    [keyword]
  )

  useEffect(() => {
    loadUsers(1)
  }, [loadUsers])

  return {
    data,
    total,
    loading,
    keyword,
    setKeyword,
    page,
    loadUsers,
  }
}

export default useUsers
