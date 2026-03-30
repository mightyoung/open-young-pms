import { defineStore } from 'pinia'

interface UserInfo {
  id: string
  name: string
  avatar?: string
  phone?: string
}

interface UserState {
  info: UserInfo | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    info: null
  }),
  actions: {
    setInfo(info: UserInfo) {
      this.info = info
    }
  }
})
