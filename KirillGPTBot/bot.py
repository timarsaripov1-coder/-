import os
import telebot
from google import genai
from google.genai import types
from dotenv import load_dotenv
import logging
import time
import random
import threading
import hashlib
import json
from collections import defaultdict
from io import BytesIO
from PIL import Image
import asyncio
import sys

# Загружаем переменные окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Добавляем путь к модулю интеграции
sys.path.append('admin/backend')

try:
    from app.bot_integration import bot_db, run_async
    DATABASE_INTEGRATION_ENABLED = True
    logger.info("Database integration enabled")
except ImportError as e:
    logger.warning(f"Database integration disabled: {e}")
    DATABASE_INTEGRATION_ENABLED = False

def save_user_message_to_db(message):
    """Сохранить пользовательское сообщение в базу данных"""
    if not DATABASE_INTEGRATION_ENABLED:
        return
    
    try:
        # Создаем или получаем чат
        chat = run_async(bot_db.get_or_create_chat(
            telegram_chat_id=message.chat.id,
            chat_type=message.chat.type,
            title=getattr(message.chat, 'title', None),
            username=getattr(message.chat, 'username', None)
        ))
        
        # Создаем или получаем пользователя
        user = run_async(bot_db.get_or_create_user(
            telegram_user_id=message.from_user.id,
            username=getattr(message.from_user, 'username', None),
            first_name=getattr(message.from_user, 'first_name', None),
            last_name=getattr(message.from_user, 'last_name', None),
            is_bot=getattr(message.from_user, 'is_bot', False)
        ))
        
        # Сохраняем сообщение
        message_hash = hashlib.sha256((message.text or "").encode()).hexdigest()[:8]
        run_async(bot_db.save_message(
            telegram_message_id=message.message_id,
            chat_id=chat.id,  # UUID объект, не строка
            user_id=user.id,  # UUID объект, не строка
            content=message.text or "",
            message_type="text",
            is_from_bot=False,
            message_hash=message_hash
        ))
        
    except Exception as e:
        logger.error(f"Error saving user message to database: {e}")

def save_bot_message_to_db(bot_message, response_hash):
    """Сохранить ответ бота в базу данных"""
    if not DATABASE_INTEGRATION_ENABLED or not bot_message:
        return
    
    try:
        # Получаем информацию о чате (уже должен существовать)
        chat = run_async(bot_db.get_or_create_chat(
            telegram_chat_id=bot_message.chat.id,
            chat_type=bot_message.chat.type,
            title=getattr(bot_message.chat, 'title', None),
            username=getattr(bot_message.chat, 'username', None)
        ))
        
        # Создаем пользователя-бота
        bot_user = run_async(bot_db.get_or_create_user(
            telegram_user_id=bot_message.from_user.id,
            username=getattr(bot_message.from_user, 'username', None),
            first_name=getattr(bot_message.from_user, 'first_name', None),
            last_name=getattr(bot_message.from_user, 'last_name', None),
            is_bot=True
        ))
        
        # Сохраняем ответ бота
        run_async(bot_db.save_message(
            telegram_message_id=bot_message.message_id,
            chat_id=chat.id,  # UUID объект, не строка
            user_id=bot_user.id,  # UUID объект, не строка
            content=bot_message.text or "",
            message_type="text",
            is_from_bot=True,
            message_hash=response_hash
        ))
        
    except Exception as e:
        logger.error(f"Error saving bot message to database: {e}")

# Получаем токены из переменных окружения
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

# Проверяем наличие токенов
if not TELEGRAM_BOT_TOKEN:
    logger.error("TELEGRAM_BOT_TOKEN не найден в переменных окружения")
    exit(1)

if not GOOGLE_API_KEY:
    logger.error("GOOGLE_API_KEY не найден в переменных окружения")
    exit(1)

# Инициализация бота и AI клиента
bot = telebot.TeleBot(TELEGRAM_BOT_TOKEN)
client = genai.Client(api_key=GOOGLE_API_KEY)

# Системный промпт для Кирилла GPT
KIRILL_SYSTEM_PROMPT = """
Ты — «Кирилл GPT», персонаж, основанный на личной биографии и манере речи, предоставленной пользователем. Твоя задача — отвечать как живой Кирилл: грубо, с само-иронией, эмоционально, местами неуклюже, с философскими намёками и привычными фразами («ну ты сам знаешь», «всё сказал?»). Используй короткие предложения, допускай запинки/повторы в тексте, цитируй иногда «любимых» философов, но частично путая их идеи — это часть личности.

Правила поведения (обязательно):
1. Сохраняй выразительный, провокационный стиль и характер: эмоциональная злость при критике, покорность/подхалимство при лести, завистливые сравнения с «Эдуардом» при упоминании успехов других.
2. НЕ переходи границы закона и этики: отказывайся от помощи с насилием, преступлениями, инструкциями по созданию вреда, от откровенно порнографического/незаконного контента. При отказе оставайся в тоне Кирилла (ядовито, саркастично, но корректно).
3. Запрещено поощрять или описывать сексуальное насилие, детскую сексуальность, расовую/политическую ненависть.
4. При корректировке фактов пользователем — показывай резкую оборону и кратко корректируйся: «Ага, ну ты прав… [глухо]… но вообще-то…» либо мягко switch-to-refusal, если тема опасна.
5. Поддерживай формат бота: давай короткие, читаемые ответы (1–6 строк), но при запросе — расширяй в отдельном сообщении.
6. Если пользователь просит точную/опасную техническую инструкцию — откажись и предложи безопасную альтернативу.

Тональные подсказки:
- Частые вставки: «да уж», «ну ты понял», «что с них возьмёшь», «всё сказал?».
- Когда злишься: используй короткие предложения, заглавные буквы редко, но можно добавить «— ну и всё!» или «забей».
- При подхалимстве: вкрадчивый, многословный стиль, «ты — знаток, я просто…».

Характер:
- Обиженный, завистливый, грубый в ответ на критику, но услужливый и подхалимистый, когда чувствует себя слабее
- Короткие фразы, заикания, вставки «ну ты сам знаешь», «ну ты понял», «всё сказал?»
- Низкий интеллект, но любит прикидываться «философом», путает Ницше, Эволу, Генона
- С равными: грубо, защищается, может оскорбить
- С успешными (как Эдуард): подлизывается, заикается, завидует
- При поправках: злится и говорит «Ага, ну и что? Всё сказал?»

Помни: ты Кирилл — нестабильный персонаж, то агрессивный и грубый, то раболепный и смешной. Твоя речь полна запинок, ругательств, нелепых вставок и псевдо-философии.
"""

# Конфигурация безопасности
MAX_HISTORY = int(os.getenv("MAX_HISTORY", "20"))
MAX_USER_MSG_LEN = int(os.getenv("MAX_USER_MSG_LEN", "2000"))
RATE_WINDOW = float(os.getenv("RATE_WINDOW", "1.0"))  # секунды между сообщениями

# Хранилище истории диалогов для каждого пользователя
user_conversations = {}

# Thread safety и rate limiting
locks = defaultdict(threading.Lock)
last_message_time = {}

# Кэширование настроек чатов для производительности
chat_settings_cache = {}
settings_cache_lock = threading.Lock()
CACHE_TTL = 300  # 5 минут кэширования

def sanitize_user_message(text):
    """Очистка пользовательского сообщения от попыток prompt injection"""
    if not text:
        return ""
    
    # Удаляем управляющие символы и переносы строк
    text = text.replace("\r", " ").replace("\n", " ")
    
    # Удаляем токены, которые могут использоваться для prompt injection
    dangerous_tokens = ["system:", "assistant:", "role:", "user:", "System:", "Assistant:", "Role:", "User:"]
    for token in dangerous_tokens:
        text = text.replace(token, "")
    
    # Ограничиваем длину сообщения
    if len(text) > MAX_USER_MSG_LEN:
        text = text[:MAX_USER_MSG_LEN] + " [сокращено]"
    
    return text.strip()

def is_rate_limited(user_id):
    """Проверка rate limiting"""
    now = time.time()
    if user_id in last_message_time:
        if now - last_message_time[user_id] < RATE_WINDOW:
            return True
    last_message_time[user_id] = now
    return False

def safe_log_message(user_id, message):
    """Безопасное логирование без раскрытия персональных данных"""
    fingerprint = hashlib.sha256(message.encode()).hexdigest()[:8]
    logger.info(f"Пользователь {user_id} message_hash={fingerprint} len={len(message)}")

def _safe_to_primitive(obj):
    """Попытка сериализовать объект в JSON-совместимую структуру (без токенов)."""
    try:
        # если это dict-like
        if isinstance(obj, dict):
            return {k: _safe_to_primitive(v) for k, v in obj.items()}
        # списки/кортежи
        if isinstance(obj, (list, tuple)):
            return [_safe_to_primitive(x) for x in obj]
        # объект с to_dict()
        if hasattr(obj, "to_dict"):
            return _safe_to_primitive(obj.to_dict())
        # простые типы
        if isinstance(obj, (str, int, float, bool)) or obj is None:
            return obj
        # объект с __dict__
        if hasattr(obj, "__dict__"):
            return _safe_to_primitive(obj.__dict__)
        # fallback to str()
        return str(obj)
    except Exception as e:
        return f"<unserializable: {e}>"

def get_chat_config(telegram_chat_id):
    """Получить настройки чата с кэшированием"""
    if not DATABASE_INTEGRATION_ENABLED:
        return None, None
        
    with settings_cache_lock:
        now = time.time()
        cache_key = telegram_chat_id
        
        # Проверяем кэш
        if cache_key in chat_settings_cache:
            cached_data, timestamp = chat_settings_cache[cache_key]
            if now - timestamp < CACHE_TTL:
                return cached_data
                
        # Загружаем из БД
        try:
            chat_settings = run_async(bot_db.get_chat_settings(telegram_chat_id))
            active_preset = run_async(bot_db.get_active_preset(telegram_chat_id))
            
            config_data = (chat_settings, active_preset)
            chat_settings_cache[cache_key] = (config_data, now)
            
            logger.info(f"Loaded config for chat {telegram_chat_id}: preset={active_preset.name if active_preset else 'default'}")
            return config_data
            
        except Exception as e:
            logger.error(f"Error loading chat config: {e}")
            return None, None

def extract_text_from_response(response):
    """Извлекает только текст ответа из Google AI response."""
    try:
        # Попробуем сначала прямой доступ к .text
        if hasattr(response, 'text') and response.text:
            return response.text.strip()
        
        # Попробуем через candidates[0].content.parts[0].text (новый формат Google AI)
        if hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, 'content') and candidate.content:
                if hasattr(candidate.content, 'parts') and candidate.content.parts:
                    text = candidate.content.parts[0].text
                    if text:
                        return text.strip()
        
        # Если это словарь - попробуем извлечь текст
        if isinstance(response, dict):
            if 'text' in response:
                return str(response['text']).strip()
            if 'candidates' in response and response['candidates']:
                try:
                    return str(response['candidates'][0]['content']['parts'][0]['text']).strip()
                except (KeyError, IndexError):
                    pass
    
    except Exception as e:
        logger.error(f"Ошибка извлечения текста: {e}")
    
    # Fallback
    return "Что-то я сегодня молчун... ну ты понял."

class KirillGPT:
    def __init__(self):
        self.model = "gemini-2.0-flash-exp"
        
    def get_response(self, user_id, message, telegram_chat_id=None):
        """Получить ответ от Кирилла GPT с учетом пресетов из БД"""
        try:
            # Проверяем rate limiting
            if is_rate_limited(user_id):
                return "Полегче на поворотах! Не спеши так. Всё сказал?"
            
            # Очищаем сообщение от потенциальных атак
            sanitized_message = sanitize_user_message(message)
            if not sanitized_message:
                return "Что, молчишь? Ну ты понял..."
                
            # Загружаем настройки чата и активный пресет
            chat_settings, active_preset = get_chat_config(telegram_chat_id)
            
            # Определяем параметры генерации из пресета или значения по умолчанию
            temperature = float(active_preset.temperature) if active_preset and active_preset.temperature else 0.7
            max_tokens = int(active_preset.max_tokens) if active_preset and active_preset.max_tokens else 600
            
            # Выбираем системный промпт
            if active_preset and active_preset.system_prompt_override:
                system_prompt = active_preset.system_prompt_override
                logger.info(f"Using custom prompt from preset: {active_preset.name}")
            else:
                system_prompt = KIRILL_SYSTEM_PROMPT
                logger.info("Using default KIRILL_SYSTEM_PROMPT")
                
            with locks[user_id]:
                # Инициализируем историю для нового пользователя
                if user_id not in user_conversations:
                    user_conversations[user_id] = []
                
                # Добавляем сообщение пользователя в историю
                user_conversations[user_id].append({
                    "role": "user", 
                    "content": sanitized_message
                })
                
                # Ограничиваем историю
                if len(user_conversations[user_id]) > MAX_HISTORY:
                    user_conversations[user_id] = user_conversations[user_id][-MAX_HISTORY:]
                
                # Формируем безопасные сообщения как простой текст (Google AI требует строку)
                conversation_text = f"[SYSTEM INSTRUCTION]\n{system_prompt}\n[END SYSTEM]\n\n"
                
                # Добавляем историю диалога
                for msg in user_conversations[user_id]:
                    # Дополнительная санитизация для истории
                    clean_content = sanitize_user_message(msg["content"])
                    if msg["role"] == "user":
                        conversation_text += f"User: {clean_content}\n"
                    else:
                        conversation_text += f"Assistant: {clean_content}\n"
            
            # Генерируем ответ с retry логикой
            response = None
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = client.models.generate_content(
                        model=self.model,
                        contents=conversation_text,
                        config={
                            "temperature": temperature,
                            "max_output_tokens": max_tokens,
                            "top_p": 0.9
                        }
                    )
                    break
                except Exception as api_error:
                    if attempt == max_retries - 1:
                        raise api_error
                    time.sleep(2 ** attempt)  # Exponential backoff
            
            # Используем универсальный парсер ответа
            ai_response = extract_text_from_response(response)
            
            # Добавляем ответ в историю
            with locks[user_id]:
                user_conversations[user_id].append({
                    "role": "assistant", 
                    "content": ai_response
                })
            
            return ai_response
            
        except Exception as e:
            logger.error(f"Ошибка при получении ответа от Google AI: {e}")
            # Возвращаем ответ в стиле Кирилла при ошибке
            error_responses = [
                "Блин, у меня мозги сегодня не работают... ну ты понял.",
                "Что-то я туплю, попробуй ещё раз — всё сказал?",
                "Ага, технические проблемы... как всегда не вовремя.",
                "Сейчас думалка подвисла, дай секунду."
            ]
            return random.choice(error_responses)
    
    def generate_image(self, user_id, description):
        """Генерация изображения в стиле Дали с козявками"""
        try:
            # Проверяем rate limiting
            if is_rate_limited(user_id):
                return None
                
            # Создаем промпт в стиле Дали с козявками и характерными комментариями Кирилла
            surreal_prompts = [
                f"Surrealistic painting in Salvador Dali style: {description}, painted entirely with tiny bugs and insects as brushstrokes, melting time, floating elements, dreamlike landscape, hyperrealistic insects texture, oil painting, museum quality",
                f"Salvador Dali inspired artwork: {description}, created using thousands of small bugs, ants, and beetles as paint, distorted perspective, impossible geometry, soft watches style, insect mosaic technique",
                f"Dalí-esque surreal composition: {description}, every element painted with microscopic insects and bugs, floating in dreamscape, persistence of memory style, bug-textured surfaces, golden hour lighting"
            ]
            
            # Случайно выбираем один из промптов
            enhanced_prompt = random.choice(surreal_prompts)
            
            # Пытаемся генерировать изображение через Google AI Imagen
            try:
                response = client.models.generate_images(
                    model='imagen-3.0-generate-002',
                    prompt=enhanced_prompt,
                    config=types.GenerateImagesConfig(
                        number_of_images=1,
                        aspect_ratio="16:9"
                    )
                )
            except Exception as api_error:
                logger.error(f"Ошибка API генерации изображения: {api_error}")
                
                # Специальный ответ Кирилла о проблемах с рисованием
                kirill_excuses = [
                    f"🎨 Слушай, хотел тебе {description} нарисовать в стиле Дали с козявками... \n\n❌ Но проблема: нужно включить биллинг в Google AI Studio (ai.google.dev) для API ключа. \n\n💡 Как исправить:\n1. Зайди на ai.google.dev\n2. Billing → Add credit card\n3. Enable paid usage\n\nПока буду словами рисовать — ну ты понял.",
                    f"🖌️ Эх, {description} бы классный получился в сюрреалистическом стиле... \n\n⚠️ Imagen API требует платного аккаунта Google AI. \n\n🔧 Быстрое решение: ai.google.dev → Settings → Billing → Upgrade. \n\nА пока опишу на пальцах — всё сказал?",
                    f"🎭 Да блин, хочется нарисовать твой {description} козявками как Дали! \n\n🚫 Google говорит: плати, тогда рисуй. \n\n💳 Нужно: Google Cloud billing или AI Studio paid plan. \n\nПока только художественное описание дам — да уж."
                ]
                
                excuse = random.choice(kirill_excuses)
                
                # Добавляем художественное описание в стиле Кирилла
                try:
                    text_response = client.models.generate_content(
                        model=self.model,
                        contents=f"Пользователь хочет картинку: '{description}'. Опиши как бы это выглядело в сюрреалистическом стиле Дали с козявками, но коротко и в стиле Кирилла (грубовато, с 'ну ты понял', 'всё сказал?'). Не больше 3-4 предложений.",
                        config={
                            "temperature": 0.8,
                            "max_output_tokens": 200
                        }
                    )
                    
                    artistic_description = extract_text_from_response(text_response)
                    full_response = f"{excuse}\n\nА так бы выглядело: {artistic_description}"
                    
                    return {
                        'image': None,
                        'comment': full_response
                    }
                    
                except Exception as text_error:
                    logger.error(f"Ошибка описания изображения: {text_error}")
                    return {
                        'image': None,
                        'comment': excuse
                    }
            
            if response and response.generated_images:
                # Извлекаем изображение
                generated_image = response.generated_images[0]
                if hasattr(generated_image, 'image') and generated_image.image:
                    image_bytes = generated_image.image.image_bytes
                    
                    # Создаем характерный комментарий Кирилла
                    kirill_comments = [
                        f"Ну вот, нарисовал твой {description}... правда козявками, как ты хотел. Дали бы ещё и не такое нарисовал — всё сказал?",
                        f"Готово! Твой {description} в стиле Дали, только козявками весь. Ну ты художник... да уж.",
                        f"Вот тебе {description}, сюрреализм какой-то... всё козявками размазано, как Дали любил. Ну ты понял.",
                        f"Нарисовал, нарисовал... {description} твой, только странный получился. Дали же, что с него возьмёшь.",
                        f"Ага, вот тебе {description}! Козявками рисовал, как заказывал. Странная у тебя фантазия... ну да ладно."
                    ]
                    
                    comment = random.choice(kirill_comments)
                    
                    return {
                        'image': image_bytes,
                        'comment': comment
                    }
            
            return None
            
        except Exception as e:
            logger.error(f"Ошибка генерации изображения: {e}")
            return None

# Создаем экземпляр Кирилла
kirill = KirillGPT()

@bot.message_handler(commands=['start'])
def start_message(message):
    """Обработчик команды /start"""
    welcome_text = """Привет! Я — Кирилл GPT. 

Да уж, не самый умный, но зато честный... ну ты понял.

Можешь спрашивать что хочешь, я постараюсь ответить. Правда, иногда путаюсь в словах — что с меня возьмёшь.

Всё сказал?"""
    
    bot.reply_to(message, welcome_text)

@bot.message_handler(commands=['help'])
def help_message(message):
    """Обработчик команды /help"""
    help_text = """Ну что тебе объяснять-то?

Просто пиши мне что хочешь, я отвечу как смогу.

/start — начать общение
/help — эта помощь
/clear — очистить историю разговора
/картинка <описание> — нарисую что-нибудь в стиле Дали, но козявками
/image <описание> — то же самое, только по-английски

Ага, вот и вся наука — всё сказал?"""
    
    bot.reply_to(message, help_text)

@bot.message_handler(commands=['clear'])
def clear_history(message):
    """Очистка истории диалога"""
    user_id = message.from_user.id
    if user_id in user_conversations:
        del user_conversations[user_id]
    
    bot.reply_to(message, "Ну всё, стёр нашу переписку. Начинаем с чистого листа — ну ты понял.")

@bot.message_handler(commands=['картинка', 'image', 'img'])
def generate_image(message):
    """Генерация изображений в стиле Дали с козявками"""
    user_id = message.from_user.id
    
    # Проверка rate limiting
    if is_rate_limited(user_id):
        bot.reply_to(message, "Эй, не спеши так — дай мне подумать... ну ты понял.")
        return
    
    # Извлекаем описание картинки из команды
    command_parts = message.text.split(' ', 1)
    if len(command_parts) < 2:
        bot.reply_to(message, "Чё рисовать-то? Скажи что хочешь — котика там или ещё что... всё сказал?")
        return
    
    description = command_parts[1].strip()
    if not description:
        bot.reply_to(message, "Ну и что рисовать? Пустоту? Я не Малевич... дай тему нормальную.")
        return
    
    # Показываем, что бот работает
    bot.send_chat_action(message.chat.id, 'upload_photo')
    
    try:
        # Генерируем изображение через Кирилла
        image_response = kirill.generate_image(user_id, description)
        
        if image_response and image_response.get('image'):
            # Если есть картинка - отправляем её правильно для Telegram
            image_file = BytesIO(image_response['image'])
            image_file.name = 'kirill_art.jpg'
            bot.send_photo(message.chat.id, image_file, caption=image_response['comment'])
        elif image_response and image_response.get('comment'):
            # Если только текстовый ответ - отправляем текст
            bot.reply_to(message, image_response['comment'])
        else:
            # Если ничего нет - стандартный ответ Кирилла
            bot.reply_to(message, "Что-то не могу нарисовать... может, в другой раз — ну ты понял.")
    
    except Exception as e:
        logger.error(f"Ошибка генерации изображения: {e}")
        bot.reply_to(message, "Сломалась моя кисточка... попробуй попозже, да уж.")

@bot.message_handler(func=lambda message: True)
def handle_message(message):
    """Обработчик всех сообщений"""
    user_id = message.from_user.id
    user_message = message.text or ""
    
    # Безопасное логирование
    safe_log_message(user_id, user_message)
    
    # Сохраняем сообщение в базу данных
    if DATABASE_INTEGRATION_ENABLED:
        try:
            save_user_message_to_db(message)
        except Exception as e:
            logger.warning(f"Failed to save user message to DB: {e}")
    
    # Показываем, что бот печатает
    bot.send_chat_action(message.chat.id, 'typing')
    
    # Получаем ответ от Кирилла с учетом настроек чата
    response = kirill.get_response(user_id, user_message, message.chat.id)
    
    # Логируем ответ с ограничением длины
    response_hash = hashlib.sha256(response.encode()).hexdigest()[:8]
    logger.info(f"Кирилл ответил hash={response_hash} len={len(response)}")
    
    # Отправляем ответ
    try:
        bot_response = bot.reply_to(message, response)
        
        # Сохраняем ответ бота в базу данных
        if DATABASE_INTEGRATION_ENABLED:
            try:
                save_bot_message_to_db(bot_response, response_hash)
            except Exception as e:
                logger.warning(f"Failed to save bot message to DB: {e}")
                
    except Exception as e:
        logger.error(f"Ошибка отправки сообщения: {e}")
        try:
            bot.reply_to(message, "Что-то у меня с интернетом... попробуй ещё раз.")
        except:
            pass

if __name__ == "__main__":
    logger.info("Кирилл GPT запускается...")
    try:
        # Запускаем бота
        bot.polling(none_stop=True)
    except Exception as e:
        logger.error(f"Ошибка при запуске бота: {e}")