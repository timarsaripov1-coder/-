from fastapi import WebSocket
from typing import List
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        """Отправка сообщения всем подключенным клиентам"""
        if not self.active_connections:
            return
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.warning(f"Failed to send message to WebSocket: {e}")
                disconnected.append(connection)
        
        # Удаляем неактивные соединения
        for connection in disconnected:
            self.disconnect(connection)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Отправка личного сообщения конкретному клиенту"""
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.warning(f"Failed to send personal message: {e}")
            self.disconnect(websocket)