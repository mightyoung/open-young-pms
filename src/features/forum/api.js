import { api } from '../../api'

export const forumFeatureApi = {
  listPosts: (params = {}) => api.get('/forum/posts', { params }),
  getPost: (postId) => api.get(`/forum/posts/${postId}`),
  createPost: (data) => api.post('/forum/posts', data),
  createReply: (postId, data) => api.post(`/forum/posts/${postId}/replies`, data),
  toggleLike: (targetType, targetId) => api.post('/forum/like', { target_type: targetType, target_id: targetId }),
}
