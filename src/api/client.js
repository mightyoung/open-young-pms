import { getToken } from '../app/auth-session'
import { normalizeApiResponse } from './adapters'
import { BusinessError, ForbiddenError, NetworkError, ServerError, UnauthorizedError } from './errors'

const BASE_URL = '/api/v1'
let unauthorizedHandler = null
let unauthorizedTriggered = false

function buildUrl(path, params) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return
      url.searchParams.set(key, value)
    })
  }
  return `${url.pathname}${url.search}`
}

async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  if (contentType.includes('text/')) {
    return response.text()
  }
  return null
}

function toBody(body, headers) {
  if (body == null) return undefined
  if (body instanceof FormData) {
    delete headers['Content-Type']
    return body
  }
  return JSON.stringify(body)
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
  unauthorizedTriggered = false
}

export async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(buildUrl(path, options.params), {
      method: options.method || 'GET',
      headers,
      body: toBody(options.body, headers),
    })
  } catch (error) {
    throw new NetworkError(error.message)
  }

  const payload = await parseResponseBody(response)

  if (response.status === 401) {
    if (!unauthorizedTriggered && unauthorizedHandler) {
      unauthorizedTriggered = true
      unauthorizedHandler()
    }
    throw new UnauthorizedError('登录状态已失效，请重新登录', { payload })
  }

  if (response.status === 403) {
    throw new ForbiddenError('无权限访问', { payload, code: payload?.code })
  }

  if (response.status >= 500) {
    throw new ServerError('服务器错误，请稍后重试', { status: response.status, payload })
  }

  const normalized = normalizeApiResponse(payload)

  if (!response.ok || !normalized.ok) {
    throw new BusinessError(normalized.message || payload?.detail || '请求失败', {
      status: response.status,
      code: normalized.code,
      payload,
    })
  }

  return normalized.data
}

export function get(path, options = {}) {
  return request(path, { ...options, method: 'GET' })
}

export function post(path, body, options = {}) {
  return request(path, { ...options, method: 'POST', body })
}

export function put(path, body, options = {}) {
  return request(path, { ...options, method: 'PUT', body })
}

export function patch(path, body, options = {}) {
  return request(path, { ...options, method: 'PATCH', body })
}

export function del(path, options = {}) {
  return request(path, { ...options, method: 'DELETE' })
}

export function upload(path, formData, options = {}) {
  return request(path, {
    ...options,
    method: 'POST',
    body: formData,
    headers: options.headers,
  })
}
