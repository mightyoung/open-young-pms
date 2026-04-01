"""WebSocket 连接管理器"""

from fastapi import WebSocket
from typing import Dict


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}  # user_id -> websocket

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
                return True
            except Exception:
                self.disconnect(user_id)
        return False

    async def broadcast(self, message: dict):
        disconnected = []
        for user_id, ws in self.active_connections.items():
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(user_id)
        for uid in disconnected:
            self.disconnect(uid)


manager = ConnectionManager()
