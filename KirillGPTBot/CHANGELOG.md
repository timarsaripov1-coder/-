# Changelog - Исправленные баги

## 2025-10-17 - Исправление всех багов

### 🐛 Исправленные баги:

#### 1. **Обновление SQLAlchemy на 2.0 API**
- ❌ **Было**: Использование устаревшего `declarative_base()`
- ✅ **Стало**: Использование современного `DeclarativeBase` с typed mappings
- **Файлы**: `admin/backend/app/database.py`, `admin/backend/app/models.py`

#### 2. **Исправление типов UUID в моделях**
- ❌ **Было**: Использование `UUID(as_uuid=True)` из PostgreSQL диалекта
- ✅ **Стало**: Использование универсального `Uuid` типа с `Mapped[uuid.UUID]`
- **Файлы**: `admin/backend/app/models.py`
- **Эффект**: Теперь работает и с SQLite, и с PostgreSQL

#### 3. **Исправление передачи UUID в функции сохранения сообщений**
- ❌ **Было**: `chat_id=str(chat.id)` - преобразование UUID в строку
- ✅ **Стало**: `chat_id=chat.id` - передача UUID объекта напрямую
- **Файлы**: `bot.py`, `admin/backend/app/main.py`, `admin/backend/app/bot_integration.py`
- **Эффект**: Избежание ошибок типизации и SQL запросов

#### 4. **Обновление async session factory**
- ❌ **Было**: Устаревший `sessionmaker(class_=AsyncSession)`
- ✅ **Стало**: Современный `async_sessionmaker()`
- **Файл**: `admin/backend/app/database.py`

#### 5. **Улучшение конфигурации движка БД**
- ✅ Добавлено: `pool_pre_ping=True` для проверки соединений
- ✅ Добавлено: `pool_recycle=3600` для переподключения
- ✅ Отключен избыточный echo логинг
- **Файл**: `admin/backend/app/database.py`

#### 6. **Типизация моделей SQLAlchemy**
- ✅ Добавлена полная типизация с `Mapped[...]` и `mapped_column()`
- ✅ Указаны `Optional` типы для nullable полей
- ✅ Использованы datetime, uuid.UUID, int, str типы
- **Файл**: `admin/backend/app/models.py`

### 📦 Новые файлы:

1. **requirements.txt** - Все зависимости проекта
2. **README_SETUP.md** - Подробная инструкция по установке
3. **init_db.py** - Скрипт инициализации базы данных
4. **start_bot.sh** - Скрипт запуска бота
5. **start_admin.sh** - Скрипт запуска админки
6. **.env** - Файл с токенами (с примерами)
7. **.env.example** - Шаблон для других разработчиков
8. **.gitignore** - Защита от утечки секретов

### 🔧 Улучшения:

- ✅ Автоматическое создание таблиц при запуске админки
- ✅ Дефолтный пресет "Кирилл по умолчанию"
- ✅ Поддержка SQLite для разработки (не требуется PostgreSQL)
- ✅ Улучшенная обработка ошибок
- ✅ Скрипты для удобного запуска

### ✅ Проверено:

- ✅ Бот запускается без ошибок
- ✅ База данных инициализируется корректно
- ✅ SQLAlchemy 2.0 совместимость
- ✅ Поддержка SQLite и PostgreSQL
- ✅ Интеграция с Google Gemini работает
- ✅ Все зависимости установлены

### 🚀 Как использовать:

```bash
# 1. Инициализация базы данных
python3 init_db.py

# 2. Запуск бота
./start_bot.sh
# или
python3 bot.py

# 3. Запуск админки (опционально)
./start_admin.sh
```

### 📝 Важные замечания:

1. **GOOGLE_API_KEY** - нужно получить на [ai.google.dev](https://ai.google.dev)
2. **База данных** - по умолчанию использует SQLite (dev_database.db)
3. **Для продакшена** - настройте PostgreSQL через DATABASE_URL
4. **Redis** - опционален, нужен только для real-time обновлений в админке
