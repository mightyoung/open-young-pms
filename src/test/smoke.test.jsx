/**
 * Smoke tests — verify key modules load and exports are correct.
 * These catch import/compile errors, not business logic.
 */

import { describe, expect, it } from 'vitest'

describe('API client', () => {
  it('client.js exports request methods', async () => {
    const client = await import('../api/client')
    expect(typeof client.get).toBe('function')
    expect(typeof client.post).toBe('function')
    expect(typeof client.put).toBe('function')
    expect(typeof client.patch).toBe('function')
    expect(typeof client.del).toBe('function')
  })

  it('errors.js exports error classes', async () => {
    const errors = await import('../api/errors')
    expect(errors.ApiError).toBeDefined()
    expect(errors.UnauthorizedError).toBeDefined()
    expect(errors.BusinessError).toBeDefined()
  })

  it('adapters.js normalizeApiResponse works', async () => {
    const { normalizeApiResponse } = await import('../api/adapters')
    expect(normalizeApiResponse({ code: 'A0000', data: {} })).toMatchObject({ ok: true })
    expect(normalizeApiResponse({ code: 'B0001', data: {} })).toMatchObject({ ok: false })
    expect(normalizeApiResponse({ success: true, data: {} })).toMatchObject({ ok: true })
  })
})

describe('Route config', () => {
  it('route-map.js exports ROUTE_META and DEFAULT_AUTH_ROUTE', async () => {
    const routeMap = await import('../app/route-map')
    expect(routeMap.ROUTE_META).toBeDefined()
    expect(routeMap.DEFAULT_AUTH_ROUTE).toBe('/dashboard')
    expect(typeof routeMap.getMenuKeyByPath).toBe('function')
  })

  it('menu.config.js exports MENU_ITEMS array', async () => {
    const menu = await import('../app/menu.config')
    expect(Array.isArray(menu.MENU_ITEMS)).toBe(true)
    expect(menu.MENU_ITEMS.length).toBeGreaterThan(0)
  })
})

describe('Auth session', () => {
  it('auth-session.js exports session functions', async () => {
    const session = await import('../app/auth-session')
    expect(typeof session.getToken).toBe('function')
    expect(typeof session.saveSession).toBe('function')
    expect(typeof session.clearSession).toBe('function')
    expect(typeof session.loadSession).toBe('function')
  })
})
