export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.payload = options.payload
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = '登录状态已失效', options = {}) {
    super(message, { ...options, status: 401 })
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = '无权限访问', options = {}) {
    super(message, { ...options, status: 403 })
    this.name = 'ForbiddenError'
  }
}

export class ServerError extends ApiError {
  constructor(message = '服务器错误，请稍后重试', options = {}) {
    super(message, options)
    this.name = 'ServerError'
  }
}

export class NetworkError extends ApiError {
  constructor(message = '网络连接失败，请稍后重试', options = {}) {
    super(message, options)
    this.name = 'NetworkError'
  }
}

export class BusinessError extends ApiError {
  constructor(message = '操作失败', options = {}) {
    super(message, options)
    this.name = 'BusinessError'
  }
}
