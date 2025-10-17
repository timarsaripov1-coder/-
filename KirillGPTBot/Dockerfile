FROM python:3.11-slim

LABEL maintainer="KirillGPT Bot"
LABEL description="Telegram bot with unique Kirill personality"

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Рабочая директория
WORKDIR /app

# Копируем requirements
COPY requirements.txt .

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код бота
COPY bot.py .
COPY admin ./admin
COPY .env .env

# Создаем директорию для логов
RUN mkdir -p /app/logs

# Запуск бота
CMD ["python3", "-u", "bot.py"]
