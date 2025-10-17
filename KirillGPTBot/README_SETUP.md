# Кирилл GPT Bot - Инструкция по установке

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Google AI Configuration (получите на https://ai.google.dev)
GOOGLE_API_KEY=your_google_api_key_here

# Optional: Bot Configuration
MAX_HISTORY=20
MAX_USER_MSG_LEN=2000
RATE_WINDOW=1.0

# Database (опционально, для админской панели)
DATABASE_URL=sqlite+aiosqlite:///./dev_database.db
# Или для PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/kirillgpt

# Redis (опционально)
REDIS_URL=redis://localhost:6379/0
```

### 3. Получение токенов

#### Telegram Bot Token
1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Скопируйте токен вида: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

#### Google AI API Key
1. Перейдите на [ai.google.dev](https://ai.google.dev)
2. Войдите через Google аккаунт
3. Нажмите "Get API key" → "Create API key"
4. Скопируйте ключ

### 4. Запуск бота

```bash
python3 bot.py
```

## 📋 Возможности

### Команды бота
- `/start` - Начать общение с Кириллом
- `/help` - Справка по командам
- `/clear` - Очистить историю диалога
- `/картинка <описание>` - Генерация изображения в стиле Дали
- `/image <описание>` - То же самое (English)
- `/img <описание>` - Краткая версия

### Админская панель (опционально)

Для использования админской панели:

1. Настройте базу данных (PostgreSQL или SQLite)
2. Запустите backend:
```bash
cd admin/backend
uvicorn app.main:app --reload
```

3. Запустите frontend:
```bash
cd admin/frontend
npm install
npm run dev
```

## 🔧 Решение проблем

### ModuleNotFoundError
```bash
pip install -r requirements.txt
```

### База данных не подключается
Проверьте `DATABASE_URL` в `.env`. Для разработки используйте SQLite:
```
DATABASE_URL=sqlite+aiosqlite:///./dev_database.db
```

### Google API ошибки
- Проверьте правильность `GOOGLE_API_KEY`
- Убедитесь, что включён Gemini API на ai.google.dev
- Для генерации изображений может потребоваться биллинг

## 📚 Структура проекта

```
KirillGPTBot/
├── bot.py                    # Основной файл бота
├── requirements.txt          # Зависимости
├── .env                      # Конфигурация (создайте сами)
├── admin/
│   ├── backend/              # FastAPI админка
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── models.py
│   │   │   ├── database.py
│   │   │   └── bot_integration.py
│   │   └── requirements.txt
│   └── frontend/             # React админка
│       ├── src/
│       └── package.json
└── keepalive/                # Скрипты keepalive
```

## 🎭 О боте

Кирилл GPT - это уникальный персонаж с характерными чертами:
- Грубоватая речь с самоиронией
- Короткие фразы типа "ну ты понял", "всё сказал?"
- Переменчивое настроение
- Попытки философствовать с путаницей в идеях

## 🛠️ Технологии

- **Python 3.11+**
- **Telegram Bot API** (pyTelegramBotAPI)
- **Google Gemini 2.0** (генерация текста)
- **Google Imagen 3.0** (генерация изображений)
- **SQLAlchemy** (база данных)
- **FastAPI** (админка)
- **React + TypeScript** (UI админки)
