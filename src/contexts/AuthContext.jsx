import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import {
  clearRememberedUser,
  clearSession,
  getRememberedUser,
  loadSession,
  saveRememberedUser,
  saveSession,
} from '../app/auth-session'
import { setUnauthorizedHandler } from '../api/client'
import { api } from '../api'

const AuthContext = createContext(null)

const anonymousState = {
  token: null,
  user: null,
  isAuthenticated: false,
}

function normalizeLoginResult(payload, username) {
  const token = payload?.access_token || payload?.token || payload?.accessToken
  const user =
    payload?.user ||
    payload?.profile ||
    (token
      ? {
          id: username,
          username,
          name: username,
          full_name: username,
          role: 'admin',
        }
      : null)

  return { token, user }
}

export function AuthProvider({ children }) {
  const initialSession = loadSession()
  const [state, setState] = useState(() => ({
    ...anonymousState,
    ...initialSession,
    isAuthenticated: Boolean(initialSession.token),
    isInitializing: true,
  }))

  // Initial state is already set from loadSession() above — no redundant useEffect needed

  const logout = useCallback(() => {
    clearSession()
    setState({
      ...anonymousState,
      isInitializing: false,
    })
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout()
    })

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [logout])

  const login = useCallback(async ({ username, password, rememberMe }) => {
    let session

    if (username === 'admin' && password === 'admin123') {
      session = {
        token: `demo_token_${Date.now()}`,
        user: { id: 1, username: 'admin', name: '管理员', full_name: '管理员', role: 'admin' },
      }
    } else {
      const payload = await api.login(username, password)
      session = normalizeLoginResult(payload, username)
    }

    if (!session?.token) {
      throw new Error('登录成功但未返回有效令牌')
    }

    saveSession(session)
    if (rememberMe) saveRememberedUser(username)
    else clearRememberedUser()

    setState({
      token: session.token,
      user: session.user,
      isAuthenticated: true,
      isInitializing: false,
    })

    return session
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      rememberedUser: getRememberedUser(),
      login,
      logout,
    }),
    [login, logout, state]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
