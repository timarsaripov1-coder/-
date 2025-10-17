from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, or_
from sqlalchemy.orm import selectinload
from typing import Optional, List
from datetime import datetime
from uuid import UUID

from .. import models, schemas

class MessageService:
    @staticmethod
    async def get_messages(
        db: AsyncSession,
        page: int = 1,
        per_page: int = 50,
        chat_id: Optional[UUID] = None,
        user_id: Optional[UUID] = None,
        search: Optional[str] = None,
        is_from_bot: Optional[bool] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> schemas.MessageListResponse:
        """Получение списка сообщений с фильтрацией и пагинацией"""
        
        # Базовый запрос
        query = select(models.Message).options(
            selectinload(models.Message.chat),
            selectinload(models.Message.user)
        )
        count_query = select(func.count(models.Message.id))
        
        # Применяем фильтры
        filters = []
        
        if chat_id:
            filters.append(models.Message.chat_id == chat_id)
        
        if user_id:
            filters.append(models.Message.user_id == user_id)
        
        if search:
            filters.append(models.Message.content.ilike(f"%{search}%"))
        
        if is_from_bot is not None:
            filters.append(models.Message.is_from_bot == is_from_bot)
        
        if start_date:
            filters.append(models.Message.created_at >= start_date)
        
        if end_date:
            filters.append(models.Message.created_at <= end_date)
        
        if filters:
            query = query.filter(and_(*filters))
            count_query = count_query.filter(and_(*filters))
        
        # Подсчет общего количества
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Применяем сортировку и пагинацию
        query = query.order_by(desc(models.Message.created_at))
        query = query.offset((page - 1) * per_page).limit(per_page)
        
        # Выполняем запрос
        result = await db.execute(query)
        messages = result.scalars().all()
        
        has_next = (page * per_page) < total
        
        return schemas.MessageListResponse(
            messages=messages,
            total=total,
            page=page,
            per_page=per_page,
            has_next=has_next
        )
    
    @staticmethod
    async def create_message(
        db: AsyncSession,
        message: schemas.MessageCreate
    ) -> models.Message:
        """Создание нового сообщения"""
        db_message = models.Message(**message.dict())
        db.add(db_message)
        await db.commit()
        await db.refresh(db_message)
        return db_message
    
    @staticmethod
    async def get_message_by_id(
        db: AsyncSession,
        message_id: UUID
    ) -> Optional[models.Message]:
        """Получение сообщения по ID"""
        result = await db.execute(
            select(models.Message).filter(models.Message.id == message_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_chat_history(
        db: AsyncSession,
        chat_id: UUID,
        limit: int = 20
    ) -> List[models.Message]:
        """Получение истории чата (последние сообщения)"""
        result = await db.execute(
            select(models.Message)
            .filter(models.Message.chat_id == chat_id)
            .order_by(desc(models.Message.created_at))
            .limit(limit)
        )
        return list(reversed(result.scalars().all()))
    
    @staticmethod
    async def create_admin_message(
        db: AsyncSession,
        chat_id: UUID,
        content: str,
        telegram_message_id: int,
        reply_to_message_id: Optional[int] = None
    ) -> models.Message:
        """Создание сообщения от администратора"""
        import hashlib
        
        # Создаем хэш сообщения
        message_hash = hashlib.md5(f"{content}{telegram_message_id}".encode()).hexdigest()[:8]
        
        db_message = models.Message(
            chat_id=chat_id,
            user_id=None,  # Админские сообщения без пользователя
            telegram_message_id=telegram_message_id,
            message_type="text",
            content=content,
            is_from_bot=False,  # Это админское сообщение, не от бота
            is_reply=reply_to_message_id is not None,
            reply_to_message_id=reply_to_message_id,
            message_hash=message_hash
        )
        
        db.add(db_message)
        await db.commit()
        await db.refresh(db_message)
        return db_message