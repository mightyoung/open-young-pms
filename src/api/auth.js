import { post } from './client'

export const authApi = {
  login(username, password) {
    return post('/auth/login', { username, password })
  },
}

export default authApi
