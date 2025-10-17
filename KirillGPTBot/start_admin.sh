#!/bin/bash

# Скрипт для запуска админской панели

echo "================================"
echo "Запуск Admin Panel для KirillGPT"
echo "================================"
echo ""

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    echo "❌ Файл .env не найден!"
    echo "📝 Создайте .env файл с настройками"
    exit 1
fi

# Инициализируем базу данных если нужно
if [ ! -f dev_database.db ]; then
    echo "🗄️  База данных не найдена. Инициализирую..."
    python3 init_db.py
    echo ""
fi

# Проверяем FastAPI
if ! python3 -c "import fastapi" &> /dev/null; then
    echo "📦 Устанавливаю зависимости для админки..."
    pip3 install -r requirements.txt
fi

echo "✅ Запускаю Backend..."
echo "🌐 API будет доступен на: http://localhost:8000"
echo "📖 Документация API: http://localhost:8000/docs"
echo "⏹️  Для остановки нажмите Ctrl+C"
echo ""
echo "================================"
echo ""

# Запускаем FastAPI с uvicorn
cd admin/backend && python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
