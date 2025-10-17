# 🚀 Руководство по установке KirillGPTBot

## 📥 Способы скачивания

### Способ 1: Скачать архив (рекомендуется)

1. **Скачайте архив проекта:**
   ```bash
   # Архив уже создан: KirillGPTBot.tar.gz (28MB)
   # Распакуйте архив:
   tar -xzf KirillGPTBot.tar.gz
   cd KirillGPTBot
   ```

### Способ 2: Git клонирование

1. **Если у вас есть доступ к Git репозиторию:**
   ```bash
   git clone <your-repo-url>
   cd KirillGPTBot
   ```

### Способ 3: Ручное копирование

1. **Скопируйте все файлы проекта в папку на вашем сервере**

---

## 🛠️ Установка на сервер

### Требования к системе

- **ОС**: Linux (Ubuntu 20.04+ рекомендуется)
- **Python**: 3.11+ 
- **Node.js**: 16+ (для frontend)
- **RAM**: минимум 512MB
- **Диск**: минимум 1GB свободного места

### Шаг 1: Подготовка системы

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка необходимых пакетов
sudo apt install python3 python3-pip python3-venv git curl -y

# Установка Node.js (если нужен frontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
```

### Шаг 2: Настройка проекта

```bash
# Переход в папку проекта
cd KirillGPTBot

# Создание виртуального окружения (рекомендуется)
python3 -m venv venv
source venv/bin/activate

# Установка Python зависимостей
pip install -r requirements.txt

# Установка frontend зависимостей (если нужен)
cd admin/frontend
npm install
cd ../..
```

### Шаг 3: Настройка конфигурации

```bash
# Создание .env файла
cp .env.example .env  # если есть пример
# или создайте .env вручную:

cat > .env << 'EOF'
# Telegram Bot Token (получите у @BotFather)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Google AI API Key (получите на ai.google.dev)
GOOGLE_API_KEY=your_google_api_key_here

# Admin Panel Token (придумайте сложный пароль)
ADMIN_TOKEN=your_secure_admin_token_here

# Database Configuration
DATABASE_URL=sqlite+aiosqlite:///./dev_database.db

# Bot Configuration
MAX_HISTORY=20
MAX_USER_MSG_LEN=2000
RATE_WINDOW=1.0

# Logging
LOG_LEVEL=INFO
