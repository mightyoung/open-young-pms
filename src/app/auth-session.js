const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
  rememberedUser: 'rememberedUser',
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.token)
}

export function setToken(token) {
  if (!token) {
    localStorage.removeItem(STORAGE_KEYS.token)
    return
  }
  localStorage.setItem(STORAGE_KEYS.token, token)
}

export function getStoredUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.user)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(STORAGE_KEYS.user)
    return null
  }
}

export function setStoredUser(user) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.user)
    return
  }
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
}

export function saveRememberedUser(username) {
  if (!username) {
    localStorage.removeItem(STORAGE_KEYS.rememberedUser)
    return
  }
  localStorage.setItem(STORAGE_KEYS.rememberedUser, username)
}

export function clearRememberedUser() {
  localStorage.removeItem(STORAGE_KEYS.rememberedUser)
}

export function getRememberedUser() {
  return localStorage.getItem(STORAGE_KEYS.rememberedUser) || ''
}

export function loadSession() {
  return {
    token: getToken(),
    user: getStoredUser(),
  }
}

export function saveSession({ token, user }) {
  setToken(token)
  setStoredUser(user)
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.token)
  localStorage.removeItem(STORAGE_KEYS.user)
}

export function hasToken() {
  return Boolean(getToken())
}
