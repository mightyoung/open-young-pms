const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000/api/v1' 
  : '/api/v1'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

export function request<T = any>(options: RequestOptions): Promise<T> {
  const token = uni.getStorageSync('token')
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.header
      },
      success: (res: any) => {
        if (res.statusCode === 200) {
          resolve(res.data.data)
        } else {
          uni.showToast({ title: res.data.message || '请求失败', icon: 'none' })
          reject(res.data)
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
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
