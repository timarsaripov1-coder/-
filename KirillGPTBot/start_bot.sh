#!/bin/bash

# Скрипт для запуска бота KirillGPT

echo "================================"
echo "Запуск KirillGPT Telegram Bot"
echo "================================"
echo ""

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    echo "❌ Файл .env не найден!"
    echo "📝 Создайте .env файл с токенами:"
    echo "   - TELEGRAM_BOT_TOKEN"
    echo "   - GOOGLE_API_KEY"
    echo ""
    echo "Используйте .env.example как шаблон"
    exit 1
fi

# Проверяем Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не найден! Установите Python 3.11+"
    exit 1
fi

# Проверяем зависимости
echo "🔍 Проверка зависимостей..."
if ! python3 -c "import telebot" &> /dev/null; then
    echo "📦 Устанавливаю зависимости..."
    pip3 install -r requirements.txt
fi

echo ""
echo "✅ Всё готово! Запускаю бота..."
echo "⏹️  Для остановки нажмите Ctrl+C"
echo ""
echo "================================"
echo ""

# Запускаем бота
python3 bot.py
