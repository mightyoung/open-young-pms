import { api } from '../../api'

export const notificationsFeatureApi = {
  list: (params = {}) => api.notifications.list(params),
  unreadCount: () => api.notifications.unreadCount(),
  markRead: id => api.notifications.markRead(id),
  markAllRead: () => api.notifications.markAllRead(),
  remove: id => api.notifications.remove(id),
  settings: {
    get: () => api.notifications.settings.get(),
    update: data => api.notifications.settings.update(data),
  },
}

export default notificationsFeatureApi
