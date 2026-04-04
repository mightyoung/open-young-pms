import { ref, onUnmounted } from 'vue'

export function useWebSocket(url: string, handlers: Record<string, (data: any, action?: string) => void>) {
  const socket = ref<UniApp.SocketTask | null>(null)
  const isConnected = ref(false)
  let reconnectTimer: any = null

  const connect = () => {
    if (socket.current) return

    const task = uni.connectSocket({
      url,
      success: () => {
        console.log('[WS] Connecting...')
      }
    })

    task.onOpen(() => {
      console.log('[WS] Connected')
      isConnected.value = true
      // 心跳
      setInterval(() => {
        uni.sendSocketMessage({ data: 'ping' })
      }, 30000)
    })

    task.onMessage((res) => {
      if (res.data === 'pong') return
      try {
        const msg = JSON.parse(res.data as string)
        if (msg.type && handlers[msg.type]) {
          handlers[msg.type](msg.data, msg.action)
        }
      } catch (e) {
        console.error('[WS] Parse error:', e)
      }
    })

    task.onClose(() => {
      console.log('[WS] Closed')
      isConnected.value = false
      socket.value = null
      // 自动重连
      reconnectTimer = setTimeout(connect, 5000)
    })

    task.onError((err) => {
      console.error('[WS] Error:', err)
    })

    socket.value = task
  }

  const send = (data: any) => {
    if (isConnected.value) {
      uni.sendSocketMessage({
        data: typeof data === 'string' ? data : JSON.stringify(data)
      })
    }
  }

  onUnmounted(() => {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (socket.value) {
      socket.value.close({})
    }
  })

  return { isConnected, send, connect }
}
