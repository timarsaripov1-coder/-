#!/bin/bash

echo "=========================================="
echo "Установка KirillGPT как системного сервиса"
echo "=========================================="
echo ""

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Пожалуйста, запустите с правами root:"
    echo "   sudo bash install_service.sh"
    exit 1
fi

# Получаем текущего пользователя (не root)
REAL_USER=${SUDO_USER:-$USER}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📂 Рабочая директория: $SCRIPT_DIR"
echo "👤 Пользователь: $REAL_USER"
echo ""

# Обновляем пути в service файлах
sed -i "s|User=ubuntu|User=$REAL_USER|g" kirillgpt.service
sed -i "s|WorkingDirectory=/workspace/KirillGPTBot|WorkingDirectory=$SCRIPT_DIR|g" kirillgpt.service
sed -i "s|ExecStart=/usr/bin/python3 /workspace/KirillGPTBot/bot.py|ExecStart=/usr/bin/python3 $SCRIPT_DIR/bot.py|g" kirillgpt.service

sed -i "s|User=ubuntu|User=$REAL_USER|g" kirillgpt-admin.service
sed -i "s|WorkingDirectory=/workspace/KirillGPTBot/admin/backend|WorkingDirectory=$SCRIPT_DIR/admin/backend|g" kirillgpt-admin.service

# Создаем директорию для логов
echo "📁 Создание директории для логов..."
mkdir -p /var/log/kirillgpt
chown $REAL_USER:$REAL_USER /var/log/kirillgpt

# Копируем service файлы
echo "📋 Копирование service файлов..."
cp kirillgpt.service /etc/systemd/system/
cp kirillgpt-admin.service /etc/systemd/system/

# Перезагружаем systemd
echo "🔄 Перезагрузка systemd..."
systemctl daemon-reload

# Включаем автозапуск
echo "✅ Включение автозапуска..."
systemctl enable kirillgpt.service
systemctl enable kirillgpt-admin.service

echo ""
echo "=========================================="
echo "✅ Установка завершена!"
echo "=========================================="
echo ""
echo "📝 Доступные команды:"
echo ""
echo "   Запустить бота:"
echo "   sudo systemctl start kirillgpt"
echo ""
echo "   Остановить бота:"
echo "   sudo systemctl stop kirillgpt"
echo ""
echo "   Перезапустить бота:"
echo "   sudo systemctl restart kirillgpt"
echo ""
echo "   Посмотреть статус:"
echo "   sudo systemctl status kirillgpt"
echo ""
echo "   Посмотреть логи:"
echo "   sudo journalctl -u kirillgpt -f"
echo "   или: tail -f /var/log/kirillgpt/bot.log"
echo ""
echo "   Запустить админку:"
echo "   sudo systemctl start kirillgpt-admin"
echo ""
echo "=========================================="
echo ""
echo "🚀 Хотите запустить сейчас? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo "🚀 Запуск сервисов..."
    systemctl start kirillgpt
    systemctl start kirillgpt-admin
    sleep 2
    echo ""
    echo "📊 Статус бота:"
    systemctl status kirillgpt --no-pager
    echo ""
    echo "📊 Статус админки:"
    systemctl status kirillgpt-admin --no-pager
    echo ""
    echo "✅ Готово! Бот работает в фоновом режиме."
fi

echo ""
echo "=========================================="
