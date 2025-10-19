from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional, List
from uuid import UUID

from .. import models, schemas

class PresetService:
    @staticmethod
    async def get_all_presets(db: AsyncSession) -> List[models.Preset]:
        """Получение всех пресетов"""
        result = await db.execute(
            select(models.Preset).order_by(models.Preset.is_default.desc(), models.Preset.name)
        )
        return result.scalars().all()
    
    @staticmethod
    async def get_preset_by_id(db: AsyncSession, preset_id: UUID) -> Optional[models.Preset]:
        """Получение пресета по ID"""
        result = await db.execute(
            select(models.Preset).filter(models.Preset.id == preset_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_preset(db: AsyncSession, preset: schemas.PresetCreate) -> models.Preset:
        """Создание нового пресета"""
        # Если новый пресет должен быть по умолчанию, снимаем флаг с остальных
        if preset.is_default:
            await db.execute(
                update(models.Preset).values(is_default=False)
            )
        
        db_preset = models.Preset(**preset.dict())
        db.add(db_preset)
        await db.commit()
        await db.refresh(db_preset)
        return db_preset
    
    @staticmethod
    async def update_preset(
        db: AsyncSession, 
        preset_id: UUID, 
        preset: schemas.PresetUpdate
    ) -> Optional[models.Preset]:
        """Обновление пресета"""
        # Получаем существующий пресет
        db_preset = await PresetService.get_preset_by_id(db, preset_id)
        if not db_preset:
            return None
        
        # Если новый пресет должен быть по умолчанию, снимаем флаг с остальных
        if preset.is_default:
            await db.execute(
                update(models.Preset)
                .where(models.Preset.id != preset_id)
                .values(is_default=False)
            )
        
        # Обновляем поля
        update_data = preset.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_preset, field, value)
        
        await db.commit()
        await db.refresh(db_preset)
        return db_preset
    
    @staticmethod
    async def delete_preset(db: AsyncSession, preset_id: UUID) -> bool:
        """Удаление пресета"""
        db_preset = await PresetService.get_preset_by_id(db, preset_id)
        if not db_preset:
            return False
        
        # Нельзя удалить пресет по умолчанию
        if db_preset.is_default:
            return False
        
        await db.delete(db_preset)
        await db.commit()
        return True
    
    @staticmethod
    async def get_default_preset(db: AsyncSession) -> Optional[models.Preset]:
        """Получение пресета по умолчанию"""
        result = await db.execute(
            select(models.Preset).filter(models.Preset.is_default == True)
        )
        return result.scalar_one_or_none()