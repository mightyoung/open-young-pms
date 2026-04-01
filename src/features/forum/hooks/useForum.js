import { useState, useCallback, useEffect } from 'react'
import { forumFeatureApi } from '../api'

export function useForum() {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('all')

  const loadPosts = useCallback(async (currentTab = tab) => {
    setLoading(true)
    try {
      const res = await forumFeatureApi.listPosts({ tab: currentTab, page: 1, page_size: 20 })
      const data = res?.data || res
      const items = data?.items || data?.data?.items || []
      setPosts(items)
      setTotal(data?.total || data?.data?.total || 0)
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    loadPosts(tab)
  }, [tab, loadPosts])

  const createPost = async (values) => {
    await forumFeatureApi.createPost(values)
    loadPosts(tab)
  }

  const toggleLike = async (postId) => {
    const res = await forumFeatureApi.toggleLike('post', postId)
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, like_count: res?.like_count ?? p.like_count, liked: res?.liked }
          : p
      )
    )
    return res
  }

  return { posts, total, loading, tab, setTab, loadPosts, createPost, toggleLike }
}
