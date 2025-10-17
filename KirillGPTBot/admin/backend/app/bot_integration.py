"""
Модуль для интеграции существующего бота с базой данных админ-панели
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import select
from typing import Optional
import os
import asyncio
from datetime import datetime

from .models import Chat, User, Message, ChatSettings, Preset
from .database import AsyncSessionLocal
import logging

logger = logging.getLogger(__name__)

class BotDatabaseIntegration:
    def __init__(self):
        self.session = AsyncSessionLocal
    
    async def get_or_create_chat(self, telegram_chat_id: int, chat_type: str = "private", 
                                title: Optional[str] = None, username: Optional[str] = None) -> Chat:
        """Получить или создать чат в базе данных"""
        async with self.session() as db:
            # Ищем существующий чат
            result = await db.execute(
                select(Chat).filter(Chat.telegram_chat_id == telegram_chat_id)
            )
            chat = result.scalar_one_or_none()
            
            if not chat:
                # Создаем новый чат
                chat = Chat(
                    telegram_chat_id=telegram_chat_id,
                    chat_type=chat_type,
                    title=title,
                    username=username
                )
                db.add(chat)
                await db.commit()
                await db.refresh(chat)
                
                # Создаем настройки по умолчанию
                settings = ChatSettings(
                    chat_id=chat.id,
                    auto_reply_enabled=True,
                    reply_on_mention_enabled=True
                )
                db.add(settings)
                await db.commit()
                
                logger.info(f"Created new chat: {telegram_chat_id}")
            
            return chat
    
    async def get_or_create_user(self, telegram_user_id: int, username: Optional[str] = None,
                               first_name: Optional[str] = None, last_name: Optional[str] = None,
                               is_bot: bool = False) -> User:
        """Получить или создать пользователя в базе данных"""
        async with self.session() as db:
            # Ищем существующего пользователя
            result = await db.execute(
                select(User).filter(User.telegram_user_id == telegram_user_id)
            )
            user = result.scalar_one_or_none()
            
            if not user:
                # Создаем нового пользователя
                user = User(
                    telegram_user_id=telegram_user_id,
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    is_bot=is_bot
                )
                db.add(user)
                await db.commit()
                await db.refresh(user)
                logger.info(f"Created new user: {telegram_user_id}")
            else:
                # Обновляем информацию о пользователе если изменилась
                updated = False
                if user.username != username:
                    user.username = username
                    updated = True
                if user.first_name != first_name:
                    user.first_name = first_name
                    updated = True
                if user.last_name != last_name:
                    user.last_name = last_name
                    updated = True
                
                if updated:
                    await db.commit()
            
            return user
    
    async def save_message(self, telegram_message_id: int, chat_id, user_id,
                          content: str, message_type: str = "text", is_from_bot: bool = False,
                          message_hash: Optional[str] = None) -> Message:
        """Сохранить сообщение в базе данных"""
        async with self.session() as db:
            message = Message(
                telegram_message_id=telegram_message_id,
                chat_id=chat_id,
                user_id=user_id,
                content=content,
                message_type=message_type,
                is_from_bot=is_from_bot,
                message_hash=message_hash
            )
            db.add(message)
            await db.commit()
            await db.refresh(message)
            
            logger.info(f"Saved message: {message_hash}")
            return message
    
    async def get_chat_settings(self, telegram_chat_id: int) -> Optional[ChatSettings]:
        """Получить настройки чата"""
        async with self.session() as db:
            result = await db.execute(
                select(ChatSettings)
                .join(Chat)
                .filter(Chat.telegram_chat_id == telegram_chat_id)
            )
            return result.scalar_one_or_none()
    
    async def get_active_preset(self, telegram_chat_id: int) -> Optional[Preset]:
        """Получить активный пресет для чата"""
        async with self.session() as db:
            result = await db.execute(
                select(Preset)
                .join(ChatSettings)
                .join(Chat)
                .filter(Chat.telegram_chat_id == telegram_chat_id)
            )
            preset = result.scalar_one_or_none()
            
            if not preset:
                # Возвращаем пресет по умолчанию
                result = await db.execute(
                    select(Preset).filter(Preset.is_default == True)
                )
                preset = result.scalar_one_or_none()
            
            return preset

# Глобальный экземпляр для использования в боте
bot_db = BotDatabaseIntegration()

# Вспомогательные функции для синхронного использования в боте
def run_async(coro):
    """Запустить асинхронную функцию в синхронном контексте"""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Если уже есть запущенный цикл, создаем новую задачу
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, coro)
                return future.result()
        else:
            return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)