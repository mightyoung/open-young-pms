export const storage = {
  get<T = any>(key: string): T | null {
    const value = uni.getStorageSync(key)
    return value ? JSON.parse(value) : null
  },
  set(key: string, value: any): void {
    uni.setStorageSync(key, JSON.stringify(value))
  },
  remove(key: string): void {
    uni.removeStorageSync(key)
  },
  clear(): void {
    uni.clearStorageSync()
  }
}
