import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'

interface AuthState {
  token: string | null
  loggedIn: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: uni.getStorageSync('token') || null,
    loggedIn: !!uni.getStorageSync('token')
  }),
  actions: {
    setToken(token: string) {
      this.token = token
      this.loggedIn = true
      uni.setStorageSync('token', token)
    },
    logout() {
      this.token = null
      this.loggedIn = false
      uni.removeStorageSync('token')
    }
  }
})
