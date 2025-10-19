from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from typing import Optional, List
from uuid import UUID

from .. import models, schemas

class ChatService:
    @staticmethod
    async def get_chats(
        db: AsyncSession, 
        search: Optional[str] = None
    ) -> schemas.ChatListResponse:
        """Получение списка чатов с поиском"""
        query = select(models.Chat).options(
            selectinload(models.Chat.settings)
        )
        
        if search:
            query = query.filter(
                or_(
                    models.Chat.title.ilike(f"%{search}%"),
                    models.Chat.username.ilike(f"%{search}%")
                )
            )
        
        query = query.order_by(models.Chat.updated_at.desc())
        
        result = await db.execute(query)
        chats = result.scalars().all()
        
        return schemas.ChatListResponse(
            chats=chats,
            total=len(chats)
        )
    
    @staticmethod
    async def get_chat_by_id(db: AsyncSession, chat_id: UUID) -> Optional[models.Chat]:
        """Получение чата по ID"""
        result = await db.execute(
            select(models.Chat)
            .options(selectinload(models.Chat.settings))
            .filter(models.Chat.id == chat_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_chat_by_telegram_id(
        db: AsyncSession, 
        telegram_chat_id: int
    ) -> Optional[models.Chat]:
        """Получение чата по Telegram chat_id"""
        result = await db.execute(
            select(models.Chat)
            .options(selectinload(models.Chat.settings))
            .filter(models.Chat.telegram_chat_id == telegram_chat_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_or_update_chat(
        db: AsyncSession, 
        chat_data: schemas.ChatCreate
    ) -> models.Chat:
        """Создание или обновление чата"""
        # Проверяем, существует ли чат
        existing_chat = await ChatService.get_chat_by_telegram_id(
            db, chat_data.telegram_chat_id
        )
        
        if existing_chat:
            # Обновляем существующий чат
            for field, value in chat_data.dict().items():
                setattr(existing_chat, field, value)
            await db.commit()
            await db.refresh(existing_chat)
            return existing_chat
        else:
            # Создаем новый чат
            db_chat = models.Chat(**chat_data.dict())
            db.add(db_chat)
            await db.commit()
            await db.refresh(db_chat)
            
            # Создаем настройки по умолчанию для нового чата
            default_settings = models.ChatSettings(
                chat_id=db_chat.id,
                auto_reply_enabled=True,
                reply_on_mention_enabled=True
            )
            db.add(default_settings)
            await db.commit()
            
            return db_chat
    
    @staticmethod
    async def get_chat_settings(
        db: AsyncSession, 
        chat_id: UUID
    ) -> Optional[models.ChatSettings]:
        """Получение настроек чата"""
        result = await db.execute(
            select(models.ChatSettings)
            .options(selectinload(models.ChatSettings.preset))
            .filter(models.ChatSettings.chat_id == chat_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_chat_settings(
        db: AsyncSession,
        chat_id: UUID,
        settings_update: schemas.ChatSettingsUpdate
    ) -> models.ChatSettings:
        """Обновление настроек чата"""
        # Получаем существующие настройки или создаем новые
        db_settings = await ChatService.get_chat_settings(db, chat_id)
        
        if not db_settings:
            # Создаем новые настройки
            settings_data = settings_update.dict(exclude_unset=True)
            settings_data['chat_id'] = chat_id
            db_settings = models.ChatSettings(**settings_data)
            db.add(db_settings)
        else:
            # Обновляем существующие
            update_data = settings_update.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_settings, field, value)
        
        await db.commit()
        await db.refresh(db_settings)
        return db_settings