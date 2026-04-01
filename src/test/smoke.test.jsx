/**
 * Smoke tests — verify key modules load and exports are correct.
 * These catch import/compile errors, not business logic.
 */

import { describe, expect, it, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// API errors
// ---------------------------------------------------------------------------
describe('API errors', () => {
  it('ApiError hierarchy — status and code properties', async () => {
    const {
      ApiError,
      UnauthorizedError,
      ForbiddenError,
      ServerError,
      NetworkError,
      BusinessError,
    } = await import('../api/errors')

    const apiErr = new ApiError('test', { status: 500, code: 'E999' })
    expect(apiErr.message).toBe('test')
    expect(apiErr.status).toBe(500)
    expect(apiErr.code).toBe('E999')
    expect(apiErr.name).toBe('ApiError')

    const unauth = new UnauthorizedError()
    expect(unauth.status).toBe(401)
    expect(unauth.message).toBe('登录状态已失效')

    const forbidden = new ForbiddenError()
    expect(forbidden.status).toBe(403)

    const server = new ServerError()
    expect(server.status).toBe(undefined) // ServerError does not set explicit status
    expect(server.message).toBe('服务器错误，请稍后重试')

    const network = new NetworkError()
    expect(network.name).toBe('NetworkError')

    const biz = new BusinessError('自定义错误')
    expect(biz.message).toBe('自定义错误')
    expect(biz.name).toBe('BusinessError')
  })
})

// ---------------------------------------------------------------------------
// API adapters
// ---------------------------------------------------------------------------
describe('API adapters', () => {
  it('normalizeApiResponse handles all response shapes', async () => {
    const { normalizeApiResponse } = await import('../api/adapters')

    // Backend canonical shape (success)
    expect(normalizeApiResponse({ code: 'A0000', data: { id: 1 } })).toMatchObject({
      ok: true,
      data: { id: 1 },
    })

    // Backend canonical shape (error)
    expect(normalizeApiResponse({ code: 'B0001', message: '资源不存在' })).toMatchObject({
      ok: false,
      code: 'B0001',
      message: '资源不存在',
    })

    // Alternative success shape
    expect(normalizeApiResponse({ success: true, data: [1, 2, 3] })).toMatchObject({
      ok: true,
      data: [1, 2, 3],
    })

    // Error object is treated as data (ok: true)
    expect(normalizeApiResponse(new Error('network'))).toMatchObject({ ok: true })

    // Raw null/undefined
    expect(normalizeApiResponse(null)).toMatchObject({ ok: true, data: null })
    expect(normalizeApiResponse(undefined)).toMatchObject({ ok: true })
  })
})

// ---------------------------------------------------------------------------
// Route config
// ---------------------------------------------------------------------------
describe('Route config', () => {
  it('route-map exports and getMenuKeyByPath', async () => {
    const routeMap = await import('../app/route-map')
    expect(routeMap.ROUTE_META).toBeDefined()
    expect(routeMap.ROUTE_META.dashboard.path).toBe('/dashboard')
    expect(routeMap.DEFAULT_AUTH_ROUTE).toBe('/dashboard')
    expect(typeof routeMap.getMenuKeyByPath).toBe('function')

    // Exact matches
    expect(routeMap.getMenuKeyByPath('/dashboard')).toBe('dashboard')
    expect(routeMap.getMenuKeyByPath('/users')).toBe('users')

    // Nested routes
    expect(routeMap.getMenuKeyByPath('/dashboard/settings')).toBe('dashboard')

    // Unknown routes fall back to dashboard
    expect(routeMap.getMenuKeyByPath('/unknown')).toBe('dashboard')
    expect(routeMap.getMenuKeyByPath('/')).toBe('dashboard')
  })

  it('menu.config.js exports MENU_ITEMS as pure data', async () => {
    const menu = await import('../app/menu.config')
    expect(Array.isArray(menu.MENU_ITEMS)).toBe(true)
    expect(menu.MENU_ITEMS.length).toBeGreaterThan(0)

    // iconKey is a string (not a component), confirming pure data design
    for (const item of menu.MENU_ITEMS) {
      expect(typeof item.iconKey).toBe('string')
      expect(typeof item.key).toBe('string')
      expect(typeof item.label).toBe('string')
      expect(typeof item.path).toBe('string')
    }
  })

  it('icon-map.js resolves iconKey strings to components', async () => {
    const { resolveIcon } = await import('../app/icon-map')
    const { DashboardOutlined, TeamOutlined } = await import('@ant-design/icons')

    expect(resolveIcon('DashboardOutlined')).toBe(DashboardOutlined)
    expect(resolveIcon('TeamOutlined')).toBe(TeamOutlined)
    expect(resolveIcon('NonExistent')).toBe(null)
  })
})

// ---------------------------------------------------------------------------
// Auth session (localStorage)
// ---------------------------------------------------------------------------
describe('Auth session', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('getToken / setToken round-trip', async () => {
    const { getToken, setToken } = await import('../app/auth-session')
    expect(getToken()).toBe(null)
    setToken('tok_abc123')
    expect(getToken()).toBe('tok_abc123')
    setToken(null)
    expect(getToken()).toBe(null)
  })

  it('saveSession / loadSession round-trip', async () => {
    const { saveSession, loadSession, clearSession } = await import('../app/auth-session')

    saveSession({ token: 'tok_xyz', user: { id: '1', username: 'alice', full_name: 'Alice' } })
    const loaded = loadSession()
    expect(loaded.token).toBe('tok_xyz')
    expect(loaded.user.username).toBe('alice')

    clearSession()
    expect(loadSession().token).toBe(null)
  })

  it('getStoredUser / setStoredUser handle invalid JSON gracefully', async () => {
    const { getStoredUser, setStoredUser } = await import('../app/auth-session')
    localStorage.setItem('user', 'not-json')
    expect(getStoredUser()).toBe(null)
    setStoredUser({ username: 'bob' })
    expect(getStoredUser().username).toBe('bob')
  })

  it('getRememberedUser / saveRememberedUser / clearRememberedUser', async () => {
    const { getRememberedUser, saveRememberedUser, clearRememberedUser } =
      await import('../app/auth-session')
    expect(getRememberedUser()).toBe('')
    saveRememberedUser('admin')
    expect(getRememberedUser()).toBe('admin')
    clearRememberedUser()
    expect(getRememberedUser()).toBe('')
  })
})

// ---------------------------------------------------------------------------
// API client
// ---------------------------------------------------------------------------
describe('API client', () => {
  it('client.js exports request methods', async () => {
    const client = await import('../api/client')
    expect(typeof client.get).toBe('function')
    expect(typeof client.post).toBe('function')
    expect(typeof client.put).toBe('function')
    expect(typeof client.patch).toBe('function')
    expect(typeof client.del).toBe('function')
  })

  it('client.js exports setUnauthorizedHandler', async () => {
    const { setUnauthorizedHandler } = await import('../api/client')
    expect(typeof setUnauthorizedHandler).toBe('function')
  })

  it('errors.js exports all error classes', async () => {
    const errors = await import('../api/errors')
    expect(errors.ApiError).toBeDefined()
    expect(errors.UnauthorizedError).toBeDefined()
    expect(errors.BusinessError).toBeDefined()
    expect(errors.ServerError).toBeDefined()
    expect(errors.NetworkError).toBeDefined()
    expect(errors.ForbiddenError).toBeDefined()
  })

  it('projects.js exports all domain methods', async () => {
    const { projectsApi } = await import('../api/projects')
    expect(typeof projectsApi.list).toBe('function')
    expect(typeof projectsApi.create).toBe('function')
    expect(typeof projectsApi.get).toBe('function')
    expect(typeof projectsApi.update).toBe('function')
    expect(typeof projectsApi.remove).toBe('function')
    expect(typeof projectsApi.createPhase).toBe('function')
    expect(typeof projectsApi.gantt).toBe('function')
  })

  it('api.hazards covers all backend router action endpoints', async () => {
    const { api } = await import('../api')
    expect(typeof api.hazards.list).toBe('function')
    expect(typeof api.hazards.create).toBe('function')
    expect(typeof api.hazards.assign).toBe('function')
    expect(typeof api.hazards.transfer).toBe('function')
    expect(typeof api.hazards.confirm).toBe('function')
    expect(typeof api.hazards.push).toBe('function')
    expect(typeof api.hazards.rectify).toBe('function')
    expect(typeof api.hazards.accept).toBe('function')
    expect(typeof api.hazards.reject).toBe('function')
    expect(typeof api.hazards.rejectRectification).toBe('function')
    expect(typeof api.hazards.stats).toBe('function')
    expect(typeof api.hazards.drafts).toBe('function')
    expect(typeof api.hazards.saveDraft).toBe('function')
    expect(typeof api.hazards.deleteDraft).toBe('function')
  })

  it('tasks.js exports all domain methods', async () => {
    const { tasksApi } = await import('../api/tasks')
    expect(typeof tasksApi.create).toBe('function')
    expect(typeof tasksApi.get).toBe('function')
    expect(typeof tasksApi.update).toBe('function')
    expect(typeof tasksApi.remove).toBe('function')
    expect(typeof tasksApi.assign).toBe('function')
    expect(typeof tasksApi.updateProgress).toBe('function')
    expect(typeof tasksApi.addComment).toBe('function')
    expect(typeof tasksApi.tree).toBe('function')
    expect(typeof tasksApi.gantt).toBe('function')
    expect(typeof tasksApi.kanban).toBe('function')
    expect(typeof tasksApi.stats).toBe('function')
    expect(typeof tasksApi.criticalPath).toBe('function')
  })

  it('api.notifications covers all backend router endpoints', async () => {
    const { api } = await import('../api')
    expect(typeof api.notifications.list).toBe('function')
    expect(typeof api.notifications.unreadCount).toBe('function')
    expect(typeof api.notifications.markRead).toBe('function')
    expect(typeof api.notifications.markAllRead).toBe('function')
    expect(typeof api.notifications.remove).toBe('function')
    expect(typeof api.notifications.settings.get).toBe('function')
    expect(typeof api.notifications.settings.update).toBe('function')
  })
})
