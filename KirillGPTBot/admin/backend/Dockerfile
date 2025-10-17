FROM python:3.11-slim

LABEL maintainer="KirillGPT Admin"
LABEL description="Admin panel for KirillGPT Bot"

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

# Копируем код админки
COPY app ./app

# Expose port
EXPOSE 8000

# Запуск FastAPI с uvicorn
CMD ["python3", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
