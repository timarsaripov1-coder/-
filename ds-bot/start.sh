#!/bin/bash

# Discord Gemini Bot Startup Script

echo "🤖 Запуск Discord Gemini Bot..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js 16.0.0 или выше."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Требуется Node.js версии 16.0.0 или выше. Текущая версия: $(node -v)"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Файл .env не найден!"
    echo "📋 Скопируйте .env.example в .env и заполните настройки:"
    echo "   cp .env.example .env"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Ошибка установки зависимостей"
        exit 1
    fi
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Check environment variables
echo "🔍 Проверка конфигурации..."

source .env

if [ -z "$DISCORD_BOT_TOKEN" ]; then
    echo "❌ DISCORD_BOT_TOKEN не установлен в .env файле"
    exit 1
fi

if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ GEMINI_API_KEY не установлен в .env файле"
    exit 1
fi

echo "✅ Конфигурация проверена"

# Start the bot
echo "🚀 Запуск бота..."
echo "📝 Логи сохраняются в папку logs/"
echo "🛑 Для остановки нажмите Ctrl+C"
echo ""

# Run with automatic restart on crash
while true; do
    node bot.js
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo "✅ Бот завершил работу корректно"
        break
    else
        echo "❌ Бот завершился с ошибкой (код: $EXIT_CODE)"
        echo "🔄 Перезапуск через 5 секунд..."
        sleep 5
    fi
done