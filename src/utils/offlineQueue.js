const QUEUE_KEY = 'pms_offline_queue'

export function getQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function enqueue(item) {
  const queue = getQueue()
  const entry = { ...item, id: Date.now(), timestamp: new Date().toISOString(), status: 'pending' }
  queue.push(entry)
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  return entry
}

export function dequeue(id) {
  const queue = getQueue().filter(item => item.id !== id)
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function updateStatus(id, status) {
  const queue = getQueue().map(item => (item.id === id ? { ...item, status } : item))
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function getPendingItems() {
  return getQueue().filter(item => item.status === 'pending')
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY)
}

export async function flushQueue(apiCall) {
  const pending = getPendingItems()
  const results = []
  for (const item of pending) {
    try {
      await apiCall(item)
      updateStatus(item.id, 'synced')
      results.push({ id: item.id, ok: true })
    } catch {
      updateStatus(item.id, 'failed')
      results.push({ id: item.id, ok: false })
    }
  }
  return results
}
