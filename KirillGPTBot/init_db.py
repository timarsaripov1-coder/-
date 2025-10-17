#!/usr/bin/env python3
"""
Скрипт для инициализации базы данных
"""
import asyncio
import sys
import os

# Добавляем путь к модулю админки
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'admin', 'backend'))

from app.database import async_engine, Base
from app.models import Chat, User, Message, Preset, ChatSettings, AdminAction
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_database():
    """Создание всех таблиц в базе данных"""
    try:
        logger.info("Создание таблиц базы данных...")
        
        async with async_engine.begin() as conn:
            # Создаем все таблицы
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("✅ Таблицы успешно созданы!")
        logger.info("Созданные таблицы:")
        logger.info("  - chats (чаты)")
        logger.info("  - users (пользователи)")
        logger.info("  - messages (сообщения)")
        logger.info("  - presets (пресеты)")
        logger.info("  - chat_settings (настройки чатов)")
        logger.info("  - admin_actions (действия админа)")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Ошибка при создании таблиц: {e}")
        return False

async def create_default_preset():
    """Создание дефолтного пресета"""
    from app.database import AsyncSessionLocal
    from app.models import Preset
    from sqlalchemy import select
    
    try:
        async with AsyncSessionLocal() as session:
            # Проверяем, есть ли уже дефолтный пресет
            result = await session.execute(
                select(Preset).filter(Preset.is_default == True)
            )
            existing_preset = result.scalar_one_or_none()
            
            if existing_preset:
                logger.info("✅ Дефолтный пресет уже существует")
                return True
            
            # Создаем новый дефолтный пресет
            default_preset = Preset(
                name="Кирилл по умолчанию",
                description="Стандартная личность Кирилла GPT с грубоватым стилем",
                temperature=0.7,
                max_tokens=600,
                tone="грубоватый",
                verbosity="короткий",
                emotional_intensity=70,
                is_default=True,
                system_prompt_override=None  # Используем системный промпт из bot.py
            )
            
            session.add(default_preset)
            await session.commit()
            
            logger.info("✅ Создан дефолтный пресет 'Кирилл по умолчанию'")
            return True
            
    except Exception as e:
        logger.error(f"❌ Ошибка при создании дефолтного пресета: {e}")
        return False

async def main():
    """Главная функция"""
    logger.info("=" * 60)
    logger.info("Инициализация базы данных KirillGPTBot")
    logger.info("=" * 60)
    
    # Создаем таблицы
    db_success = await init_database()
    
    if db_success:
        # Создаем дефолтный пресет
        await create_default_preset()
        
        logger.info("=" * 60)
        logger.info("✅ Инициализация завершена успешно!")
        logger.info("=" * 60)
        logger.info("\nТеперь вы можете:")
        logger.info("1. Запустить бота: python3 bot.py")
        logger.info("2. Запустить админку: cd admin/backend && uvicorn app.main:app --reload")
        logger.info("=" * 60)
    else:
        logger.error("=" * 60)
        logger.error("❌ Инициализация не удалась")
        logger.error("=" * 60)
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
