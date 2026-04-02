import { useState, useCallback } from 'react'
import { organizationFeatureApi } from '../api'

export function useOrganization() {
  const [treeData, setTreeData] = useState([])
  const [loading, setLoading] = useState(false)

  const loadTree = useCallback(async () => {
    setLoading(true)
    try {
      const res = await organizationFeatureApi.getTree()
      const data = res?.data || res?.items || []
      const convert = nodes =>
        nodes.map(n => ({
          key: n.id,
          title: n.name,
          isLeaf: !n.children || n.children.length === 0,
          children: n.children ? convert(n.children) : undefined,
          type: n.type,
        }))
      setTreeData(convert(data))
    } catch {
      setTreeData([])
    } finally {
      setLoading(false)
    }
  }, [])

  const create = async (data) => {
    await organizationFeatureApi.create(data)
    await loadTree()
  }

  const update = async (id, data) => {
    await organizationFeatureApi.update(id, data)
    await loadTree()
  }

  const remove = async (id) => {
    await organizationFeatureApi.remove(id)
    await loadTree()
  }

  return { treeData, loading, loadTree, create, update, remove }
}
