import { storage } from './storage'

const OFFLINE_QUEUE_KEY = 'offline_queue'

interface OfflineTask {
  id: string
  url: string
  method: string
  data: any
  timestamp: number
  retryCount: number
}

export const offlineQueue = {
  add(task: Omit<OfflineTask, 'id' | 'timestamp' | 'retryCount'>): void {
    const queue = this.getAll()
    queue.push({
      ...task,
      id: Date.now().toString(),
      timestamp: Date.now(),
      retryCount: 0
    })
    storage.set(OFFLINE_QUEUE_KEY, queue)
    uni.showToast({ title: '已加入离线同步队列', icon: 'none' })
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
    if (queue.length === 0) return

    console.log(`[Offline] Flushing ${queue.length} tasks...`)
    for (const task of queue) {
      if (task.retryCount > 5) {
        console.error(`[Offline] Task ${task.id} exceeded max retries, removing.`)
        this.remove(task.id)
        continue
      }

      try {
        await uni.request({
          url: task.url,
          method: task.method as any,
          data: task.data,
          header: {
            'Authorization': `Bearer ${storage.get('token')}`
          }
        })
        this.remove(task.id)
        console.log(`[Offline] Task ${task.id} synced successfully.`)
      } catch (e) {
        task.retryCount++
        storage.set(OFFLINE_QUEUE_KEY, queue)
        console.error(`[Offline] Task ${task.id} sync failed:`, e)
      }
    }
  },

  startAutoSync() {
    // 监听网络变化
    uni.onNetworkStatusChange((res) => {
      if (res.isConnected) {
        this.flush()
      }
    })
    
    // 定期检查
    setInterval(() => {
      this.flush()
    }, 60000)
  }
}
