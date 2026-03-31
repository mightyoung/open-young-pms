import { get, post, patch, del } from './client'

export const usersApi = {
  me: () => get('/users/me'),
  list: (params = {}) => get('/users', { params }),
  create: (payload) => post('/users', payload),
  update: (id, payload) => patch(`/users/${id}`, payload),
  remove: (id) => del(`/users/${id}`),
}

export default usersApi
