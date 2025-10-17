from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, or_
from typing import List, Optional, Dict, Any
import json
import logging
import httpx
import os
from datetime import datetime, timedelta
from uuid import UUID
# Optional Redis import
try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    redis = None
    REDIS_AVAILABLE = False
    logging.warning("Redis not available. Real-time features will be limited.")

from . import models, schemas
from .database import get_db, async_engine, Base
from .websocket import ConnectionManager
from .services.message_service import MessageService
from .services.preset_service import PresetService
from .services.chat_service import ChatService
from .auth import verify_token, verify_websocket_token
from .bot_integration import BotDatabaseIntegration

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Kirill GPT Admin Panel", version="1.0.0")

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
manager = ConnectionManager()

# Redis для real-time updates
redis_client = None

@app.on_event("startup")
async def startup():
    global redis_client
    try:
        # Создаем таблицы если их нет
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created/verified")
        
        # Подключаемся к Redis (если доступен)
        if REDIS_AVAILABLE and redis is not None:
            try:
                redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)
                await redis_client.ping()
                logger.info("Connected to Redis")
            except Exception as e:
                logger.warning(f"Redis connection failed: {e}")
                redis_client = None
        else:
            logger.info("Redis not available, skipping Redis setup")
            redis_client = None
            
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

@app.on_event("shutdown")
async def shutdown():
    if redis_client:
        await redis_client.close()

# WebSocket endpoint для real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: Optional[str] = None):
    # Аутентификация через query параметр или в первом сообщении
    if token and not verify_websocket_token(token):
        await websocket.close(code=1008, reason="Invalid auth token")
        return
        
    await manager.connect(websocket)
    authenticated = bool(token and verify_websocket_token(token))
    
    try:
        while True:
            data = await websocket.receive_text()
            # Обрабатываем команды от frontend
            try:
                message = json.loads(data)
                # Аутентификация через первое сообщение, если не была передана через query
                if not authenticated and message.get("type") == "auth":
                    auth_token = message.get("token")
                    if verify_websocket_token(auth_token):
                        authenticated = True
                        await websocket.send_text(json.dumps({"type": "auth_success"}))
                    else:
                        await websocket.send_text(json.dumps({"type": "auth_failed"}))
                        await websocket.close(code=1008, reason="Authentication failed")
                        return
                elif message.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
                elif not authenticated:
                    await websocket.send_text(json.dumps({"type": "auth_required"}))
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# API Routes

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/api/auth/info")
async def auth_info():
    """Получить информацию об аутентификации"""
    return {
        "auth_required": True,
        "auth_method": "Bearer token",
        "websocket_auth": "Query parameter 'token' or auth message",
        "default_token_warning": "Change ADMIN_TOKEN environment variable in production"
    }

@app.post("/api/auth/verify")
async def verify_auth(token: str = Depends(verify_token)):
    """Проверить валидность токена"""
    return {"valid": True, "message": "Token is valid"}

# Messages API
@app.get("/api/messages", response_model=schemas.MessageListResponse)
async def get_messages(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    chat_id: Optional[UUID] = None,
    user_id: Optional[UUID] = None,
    search: Optional[str] = None,
    is_from_bot: Optional[bool] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db)
):
    return await MessageService.get_messages(
        db, page, per_page, chat_id, user_id, search, 
        is_from_bot, start_date, end_date
    )

@app.post("/api/messages", response_model=schemas.Message)
async def create_message(
    message: schemas.MessageCreate,
    db: AsyncSession = Depends(get_db)
):
    db_message = await MessageService.create_message(db, message)
    
    # Отправляем real-time update
    await manager.broadcast(json.dumps({
        "type": "new_message",
        "message": {
            "id": str(db_message.id),
            "chat_id": str(db_message.chat_id),
            "content": db_message.content,
            "is_from_bot": db_message.is_from_bot,
            "created_at": db_message.created_at.isoformat()
        }
    }))
    
    return db_message

# Chats API
@app.get("/api/chats", response_model=schemas.ChatListResponse)
async def get_chats(
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    return await ChatService.get_chats(db, search)

@app.get("/api/chats/{chat_id}", response_model=schemas.Chat)
async def get_chat(chat_id: UUID, db: AsyncSession = Depends(get_db)):
    chat = await ChatService.get_chat_by_id(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

@app.get("/api/chats/{chat_id}/settings", response_model=schemas.ChatSettings)
async def get_chat_settings(chat_id: UUID, db: AsyncSession = Depends(get_db)):
    settings = await ChatService.get_chat_settings(db, chat_id)
    if not settings:
        raise HTTPException(status_code=404, detail="Chat settings not found")
    return settings

@app.put("/api/chats/{chat_id}/settings", response_model=schemas.ChatSettings)
async def update_chat_settings(
    chat_id: UUID,
    settings: schemas.ChatSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_token)
):
    updated_settings = await ChatService.update_chat_settings(db, chat_id, settings)
    
    # Broadcast settings change
    await manager.broadcast(json.dumps({
        "type": "chat_settings_changed",
        "chat_id": str(chat_id),
        "settings": {
            "auto_reply_enabled": updated_settings.auto_reply_enabled,
            "reply_on_mention_enabled": updated_settings.reply_on_mention_enabled,
            "preset_id": str(updated_settings.preset_id) if updated_settings.preset_id else None
        }
    }))
    
    return updated_settings

# Presets API
@app.get("/api/presets", response_model=List[schemas.Preset])
async def get_presets(db: AsyncSession = Depends(get_db)):
    return await PresetService.get_all_presets(db)

@app.post("/api/presets", response_model=schemas.Preset)
async def create_preset(
    preset: schemas.PresetCreate,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_token)
):
    return await PresetService.create_preset(db, preset)

@app.get("/api/presets/{preset_id}", response_model=schemas.Preset)
async def get_preset(preset_id: UUID, db: AsyncSession = Depends(get_db)):
    preset = await PresetService.get_preset_by_id(db, preset_id)
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")
    return preset

@app.put("/api/presets/{preset_id}", response_model=schemas.Preset)
async def update_preset(
    preset_id: UUID,
    preset: schemas.PresetUpdate,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_token)
):
    updated_preset = await PresetService.update_preset(db, preset_id, preset)
    if not updated_preset:
        raise HTTPException(status_code=404, detail="Preset not found")
    
    # Broadcast preset change
    await manager.broadcast(json.dumps({
        "type": "preset_changed",
        "preset_id": str(preset_id),
        "preset": {
            "name": updated_preset.name,
            "temperature": float(updated_preset.temperature),
            "max_tokens": updated_preset.max_tokens
        }
    }))
    
    return updated_preset

@app.delete("/api/presets/{preset_id}")
async def delete_preset(
    preset_id: UUID, 
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_token)
):
    success = await PresetService.delete_preset(db, preset_id)
    if not success:
        raise HTTPException(status_code=404, detail="Preset not found")
    
    await manager.broadcast(json.dumps({
        "type": "preset_deleted",
        "preset_id": str(preset_id)
    }))
    
    return {"message": "Preset deleted successfully"}

# Admin actions для отправки сообщений
@app.post("/api/admin/send-message")
async def send_admin_message(
    data: dict,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_token)
):
    """Отправка сообщения от имени администратора или бота"""
    chat_id = data.get("chat_id")
    content = data.get("content")
    as_bot = data.get("as_bot", False)
    
    if not chat_id or not content:
        raise HTTPException(status_code=400, detail="chat_id and content are required")
    
    try:
        # Получаем chat из базы для telegram_chat_id
        chat = await ChatService.get_chat_by_id(db, UUID(chat_id))
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        telegram_chat_id = chat.telegram_chat_id
        
        # Отправляем через Telegram Bot API
        bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
        if not bot_token:
            raise HTTPException(status_code=500, detail="TELEGRAM_BOT_TOKEN not configured")
        
        # Отправляем сообщение через Telegram API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://api.telegram.org/bot{bot_token}/sendMessage",
                json={
                    "chat_id": telegram_chat_id,
                    "text": content,
                    "parse_mode": "HTML"
                }
            )
            
            telegram_data = response.json()
            
            if not telegram_data.get("ok"):
                error_description = telegram_data.get("description", "Unknown error")
                raise HTTPException(
                    status_code=400, 
                    detail=f"Telegram API error: {error_description}"
                )
        
        # Сохраняем сообщение в базу
        if as_bot:
            # Сохраняем как сообщение от бота
            bot_integration = BotDatabaseIntegration()
            await bot_integration.save_message(
                telegram_message_id=telegram_data["result"]["message_id"],
                chat_id=chat.id,  # UUID объект
                user_id=None,  # Бот не имеет user_id
                content=content,
                message_type="text",
                is_from_bot=True,
                message_hash=None
            )
        else:
            # Сохраняем как админское сообщение
            await MessageService.create_admin_message(
                db, 
                chat_id=UUID(chat_id),
                content=content,
                telegram_message_id=telegram_data["result"]["message_id"]
            )
        
        # Broadcast админского действия
        await manager.broadcast(json.dumps({
            "type": "admin_message_sent",
            "chat_id": str(chat_id),
            "content": content,
            "as_bot": as_bot,
            "telegram_message_id": telegram_data["result"]["message_id"],
            "timestamp": datetime.now().isoformat()
        }))
        
        return {
            "message": "Message sent successfully", 
            "telegram_message_id": telegram_data["result"]["message_id"]
        }
        
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
    except Exception as e:
        logger.error(f"Error sending admin message: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)