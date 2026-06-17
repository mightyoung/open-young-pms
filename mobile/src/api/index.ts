import { offlineQueue } from '@/utils/offline'
import { API_BASE_URL } from '@/config/api'

const BASE_URL = API_BASE_URL

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

export function request<T = any>(options: RequestOptions): Promise<T> {
  const token = uni.getStorageSync('token')
  const method = options.method || 'GET'
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: method as any,
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.header
      },
      success: (res: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data.data || res.data)
        } else {
          uni.showToast({ title: res.data.message || '请求失败', icon: 'none' })
          reject(res.data)
        }
      },
      fail: (err) => {
        // 如果是写操作请求失败且网络断开，加入离线队列
        if (method !== 'GET') {
          offlineQueue.add({
            url: BASE_URL + options.url,
            method: method,
            data: options.data
          })
          // 乐观成功：返回一个 Mock 或 Null，不阻塞 UI
          resolve({ offline: true } as any)
        } else {
          uni.showToast({ title: '网络错误', icon: 'none' })
          reject(err)
        }
      }
    })
  })
}

export const api = {
  capture: {
    create: (data: any) => request({ url: '/issues', method: 'POST', data }),
    list: (params: any) => request({ url: '/issues', data: params }),
    detail: (id: string) => request({ url: `/issues/${id}` }),
  },
  ai: {
    parseIntent: (text: string) => request({ url: '/ai/parse-intent', method: 'POST', data: { text } }),
    analyzeImage: (imageUrl: string) => request({ url: '/ai/analyze-image', method: 'POST', data: { image_url: imageUrl } }),
  },
  tasks: {
    list: (params: any) => request({ url: '/tasks/my', data: params }),
    update: (id: string, data: any) => request({ url: `/tasks/${id}`, method: 'PUT', data }),
  },
  projects: {
    list: () => request({ url: '/projects' }),
    detail: (id: string) => request({ url: `/projects/${id}` }),
  },
  approvals: {
    list: () => request({ url: '/approval/my-pending' }),
    approve: (id: string, data: any) => request({ url: `/approval/instances/${id}/approve`, method: 'POST', data }),
    reject: (id: string, data: any) => request({ url: `/approval/instances/${id}/reject`, method: 'POST', data }),
  },
  user: {
    info: () => request({ url: '/users/me' }),
    login: (data: any) => request({ url: '/auth/login', method: 'POST', data }),
  }
}
