import { storage } from './storage'

const OFFLINE_QUEUE_KEY = 'offline_queue'

interface OfflineTask {
  id: string
  url: string
  method: string
  data: any
  timestamp: number
}

export const offlineQueue = {
  add(task: Omit<OfflineTask, 'id' | 'timestamp'>): void {
    const queue = this.getAll()
    queue.push({
      ...task,
      id: Date.now().toString(),
      timestamp: Date.now()
    })
    storage.set(OFFLINE_QUEUE_KEY, queue)
  },
  getAll(): OfflineTask[] {
    return storage.get<OfflineTask[]>(OFFLINE_QUEUE_KEY) || []
  },
  remove(id: string): void {
    const queue = this.getAll().filter(t => t.id !== id)
    storage.set(OFFLINE_QUEUE_KEY, queue)
  },
  async flush(): Promise<void> {
    const queue = this.getAll()
    for (const task of queue) {
      try {
        await uni.request({
          url: task.url,
          method: task.method as any,
          data: task.data
        })
        this.remove(task.id)
      } catch (e) {
        console.error('Offline task failed:', e)
      }
    }
  }
}
