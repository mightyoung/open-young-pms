import { api } from '../../api'

export const usersFeatureApi = {
  listUsers: (params = {}) => api.users.list(params),
}

export default usersFeatureApi
