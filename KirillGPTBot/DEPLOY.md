# 🚀 Деплой KirillGPT на сервер

## Способ 1: Systemd Service (Linux) - Рекомендуется

### Автоматическая установка:

```bash
cd /workspace/KirillGPTBot
sudo bash install_service.sh
```

Скрипт автоматически:
- ✅ Создаст systemd service файлы
- ✅ Настроит автозапуск при старте системы
- ✅ Создаст директорию для логов
- ✅ Установит правильные пути и пользователя

### Управление сервисом:

```bash
# Запустить бота
sudo systemctl start kirillgpt

# Остановить бота
sudo systemctl stop kirillgpt

# Перезапустить бота
sudo systemctl restart kirillgpt

# Статус бота
sudo systemctl status kirillgpt

# Логи в реальном времени
sudo journalctl -u kirillgpt -f

# Или через файл логов
tail -f /var/log/kirillgpt/bot.log

# Отключить автозапуск
sudo systemctl disable kirillgpt

# Включить автозапуск
sudo systemctl enable kirillgpt
```

### Управление админкой:

```bash
# Запустить админку
sudo systemctl start kirillgpt-admin

# Остановить админку
sudo systemctl stop kirillgpt-admin

# Статус админки
sudo systemctl status kirillgpt-admin

# Логи админки
tail -f /var/log/kirillgpt/admin.log
```

---

## Способ 2: Screen (для быстрого деплоя)

```bash
# Установка screen (если нет)
sudo apt install screen

# Создание screen сессии для бота
screen -S kirillbot
cd /workspace/KirillGPTBot
python3 bot.py

# Отсоединиться: Ctrl+A затем D

# Создание screen сессии для админки
screen -S kirilladmin
cd /workspace/KirillGPTBot/admin/backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Отсоединиться: Ctrl+A затем D

# Вернуться к сессии
screen -r kirillbot
screen -r kirilladmin

# Список всех сессий
screen -ls

# Завершить сессию
screen -X -S kirillbot quit
```

---

## Способ 3: Nohup (простой фоновый запуск)

```bash
cd /workspace/KirillGPTBot

# Запуск бота в фоне
nohup python3 bot.py > bot.log 2>&1 &

# Запуск админки в фоне
cd admin/backend
nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > admin.log 2>&1 &

# Найти процессы
ps aux | grep bot.py
ps aux | grep uvicorn

# Остановить процесс
kill <PID>

# Или остановить все процессы бота
pkill -f "python3 bot.py"
pkill -f "uvicorn app.main"

# Просмотр логов
tail -f bot.log
tail -f admin/backend/admin.log
```

---

## Способ 4: Docker (для контейнеризации)

### Создайте Dockerfile:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Копируем requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код
COPY . .

# Запуск бота
CMD ["python3", "bot.py"]
```

### Docker Compose:

```yaml
version: '3.8'

services:
  bot:
    build: .
    restart: always
    volumes:
      - ./.env:/app/.env
      - ./dev_database.db:/app/dev_database.db
    environment:
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}

  admin:
    build: ./admin/backend
    restart: always
    ports:
      - "8000:8000"
    volumes:
      - ./.env:/app/.env
      - ./dev_database.db:/app/dev_database.db
    depends_on:
      - bot
```

### Команды Docker:

```bash
# Собрать и запустить
docker-compose up -d

# Остановить
docker-compose down

# Логи
docker-compose logs -f bot
docker-compose logs -f admin

# Перезапуск
docker-compose restart
```

---

## 🌐 Деплой на VPS (Ubuntu/Debian)

### 1. Подключитесь к серверу:

```bash
ssh user@your-server-ip
```

### 2. Установите зависимости:

```bash
sudo apt update
sudo apt install python3 python3-pip git -y
```

### 3. Склонируйте проект:

```bash
cd ~
git clone <your-repo-url>
cd KirillGPTBot
```

### 4. Установите Python зависимости:

```bash
pip3 install -r requirements.txt
```

### 5. Настройте .env файл:

```bash
nano .env
# Добавьте ваши токены
```

### 6. Инициализируйте БД:

```bash
python3 init_db.py
```

### 7. Установите как сервис:

```bash
sudo bash install_service.sh
```

### 8. Готово!

```bash
sudo systemctl start kirillgpt
sudo systemctl status kirillgpt
```

---

## 🔒 Безопасность

### Firewall (UFW):

```bash
# Если используете админку
sudo ufw allow 8000/tcp

# SSH (обязательно!)
sudo ufw allow 22/tcp

# Включить firewall
sudo ufw enable
```

### Обновление токенов:

```bash
# Отредактируйте .env
nano /workspace/KirillGPTBot/.env

# Перезапустите сервис
sudo systemctl restart kirillgpt
```

---

## 📊 Мониторинг

### Проверка работы:

```bash
# Статус сервиса
sudo systemctl status kirillgpt

# Последние 50 строк логов
sudo journalctl -u kirillgpt -n 50

# Логи в реальном времени
sudo journalctl -u kirillgpt -f

# Использование ресурсов
htop  # найдите python3 bot.py
```

### Автоматический перезапуск при ошибке:

Service файлы уже настроены на автоматический перезапуск:
```
Restart=always
RestartSec=10
```

Бот автоматически перезапустится через 10 секунд после сбоя.

---

## 🔄 Обновление бота

```bash
cd /workspace/KirillGPTBot

# Остановить бота
sudo systemctl stop kirillgpt

# Получить обновления
git pull

# Установить новые зависимости (если есть)
pip3 install -r requirements.txt

# Запустить бота
sudo systemctl start kirillgpt

# Проверить статус
sudo systemctl status kirillgpt
```

---

## ❓ Решение проблем

### Бот не запускается:

```bash
# Проверьте логи
sudo journalctl -u kirillgpt -n 100

# Проверьте .env файл
cat .env

# Запустите вручную для отладки
cd /workspace/KirillGPTBot
python3 bot.py
```

### Порт 8000 занят:

```bash
# Найти процесс на порту 8000
sudo lsof -i :8000

# Убить процесс
sudo kill <PID>

# Или изменить порт в kirillgpt-admin.service
sudo nano /etc/systemd/system/kirillgpt-admin.service
# Измените --port 8000 на --port 8001
sudo systemctl daemon-reload
sudo systemctl restart kirillgpt-admin
```

### База данных не работает:

```bash
# Переинициализируйте БД
cd /workspace/KirillGPTBot
rm dev_database.db
python3 init_db.py
sudo systemctl restart kirillgpt
```

---

## ✅ Готово!

Теперь ваш бот работает как системный сервис:
- 🔄 Автоматический запуск при старте системы
- 🔁 Автоматический перезапуск при сбое
- 📝 Логирование всех событий
- 🛡️ Изоляция процесса для безопасности

**Рекомендуемый способ для продакшена: Systemd Service** ✨
