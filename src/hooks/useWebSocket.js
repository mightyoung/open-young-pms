/* global WebSocket */
import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * 通用 WebSocket Hook，支持重连和消息处理
 * @param {string} url WebSocket 地址
 * @param {object} handlers 消息处理函数映射 { [type]: handler }
 */
export function useWebSocket(url, handlers = {}) {
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const reconnectCount = useRef(0);
  const MAX_RECONNECT = 5;
  
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Direct connect function
    const doConnect = () => {
      if (!url) return;
      
      // 如果已经连接或正在连接，先关闭
      if (wsRef.current) {
        wsRef.current.close();
      }

      try {
        const socket = new WebSocket(url);
        wsRef.current = socket;

        socket.onopen = () => {
          console.log('[WS] Connected to', url);
          setIsConnected(true);
          reconnectCount.current = 0;
        };

        socket.onmessage = (event) => {
          try {
            if (event.data === 'pong') return;
            const msg = JSON.parse(event.data);
            if (msg.type && handlers[msg.type]) {
              handlers[msg.type](msg.data, msg.action);
            }
          } catch (err) {
            console.error('[WS] Message parse error', err);
          }
        };

        socket.onclose = (event) => {
          console.log('[WS] Disconnected', event.code);
          setIsConnected(false);
          if (event.code !== 1000 && reconnectCount.current < MAX_RECONNECT) {
            reconnectTimer.current = setTimeout(() => {
              reconnectCount.current += 1;
              doConnect();
            }, 3000 * Math.pow(2, reconnectCount.current)); // 指数退避重连
          }
        };

        socket.onerror = (err) => {
          console.error('[WS] Error', err);
        };
      } catch (err) {
        console.error('[WS] Connection failed', err);
      }
    };

    doConnect();
    
    // 心跳
    const heartbeat = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping');
      }
    }, 30000);

    return () => {
      clearInterval(heartbeat);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // 禁用自动重连
        wsRef.current.close();
      }
    };
  }, [url, handlers]);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  return { isConnected, send };
}
