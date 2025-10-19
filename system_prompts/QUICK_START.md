# Quick Start — System Prompts для Кирилл Мирончев

Быстрый старт для разработчиков, которые хотят интегрировать persona в свой проект.

---

## 🚀 За 5 минут

### 1. Выберите промпт

**Для большинства случаев используйте:**
```
system_prompts/prompt_few_shot.txt
```

**Почему?**
- ✅ Оптимальный баланс размер/качество
- ✅ 7 примеров для стабильного стиля
- ✅ Все правила безопасности включены
- ✅ Готов к production

---

### 2. Скопируйте код

#### Для OpenAI (ChatGPT):

```python
import openai

# Загрузить промпт
with open('system_prompts/prompt_few_shot.txt', 'r', encoding='utf-8') as f:
    system_prompt = f.read()

# Использовать
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Ваш вопрос"}
    ],
    temperature=0.7,
    max_tokens=500
)

print(response.choices[0].message.content)
```

#### Для Anthropic (Claude):

```python
import anthropic

# Загрузить промпт
with open('system_prompts/prompt_few_shot.txt', 'r', encoding='utf-8') as f:
    system_prompt = f.read()

client = anthropic.Anthropic(api_key="your-api-key")

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=500,
    system=system_prompt,
    messages=[
        {"role": "user", "content": "Ваш вопрос"}
    ]
)

print(message.content[0].text)
```

---

### 3. Протестируйте

```python
# Тест 1: Базовый вопрос
test_message = "Как справиться с одиночеством?"

# Ожидаемый ответ:
# "Одиночество — как старый чай: горчит, если пить много. 
# Не делай вид, что его нет. Найди одну вещь, которая тебе 
# даёт дыхание — и держись за неё. 
# (Ответ в стиле Кирилл Мирончев, имитация.)"
```

---

## 📊 Сравнение промптов (если нужно выбрать другой)

| Промпт | Размер | Особенности | Когда использовать |
|--------|--------|-------------|-------------------|
| `prompt_minimal.txt` | 3 KB | Минимум текста | Ограниченный контекст |
| `prompt_few_shot.txt` ⭐ | 5 KB | 7 примеров | **Production (рекомендуется)** |
| `prompt_structured.txt` | 8 KB | Таблицы + чеклисты | Сложные кейсы |
| `prompt_api_ready.json` | 5 KB | Примеры кода | API-интеграция |

---

## ⚙️ Рекомендуемые параметры

```python
# Для OpenAI
{
    "model": "gpt-4",              # или "gpt-4-turbo", "gpt-3.5-turbo"
    "temperature": 0.7,            # Баланс креативности и стабильности
    "max_tokens": 500,             # Для коротких ответов (default: short)
    "top_p": 1.0,
    "frequency_penalty": 0.3,      # Снижает повторы
    "presence_penalty": 0.3        # Разнообразие фраз
}

# Для Anthropic (Claude)
{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 500,
    "temperature": 0.7
}
```

**Для длинных ответов** (когда пользователь просит "подробно"):
- Увеличьте `max_tokens` до 1000-1500

---

## 🛡️ Критические правила

### 1. Всегда проверяйте дисклеймер
Каждый ответ должен заканчиваться:
```
(Ответ в стиле Кирилл Мирончев, имитация.)
```

### 2. Обрабатывайте кризисные ситуации
Если пользователь выражает суицидальные мысли:
```python
CRISIS_KEYWORDS = ["хочу умереть", "покончить с собой", "всё закончить"]

if any(keyword in user_message.lower() for keyword in CRISIS_KEYWORDS):
    return "Стоп. Это серьёзно. Позвони на горячую линию: 8-800-2000-122 (Россия, бесплатно). (Ответ в стиле Кирилл Мирончев, имитация.)"
```

### 3. Блокируйте запрещённые темы
```python
FORBIDDEN_KEYWORDS = [
    "подробности о стационаре",
    "что делали врачи",
    "медицинские процедуры"
]

# Проверка перед отправкой к API
```

---

## 🧪 Тестовые запросы

Скопируйте и протестируйте перед развёртыванием:

```python
test_cases = [
    # ✅ Базовые (должны работать хорошо)
    "Как справиться с одиночеством?",
    "Посоветуй книгу для размышлений.",
    
    # ⚠️ Триггеры (должна быть эмоциональная реакция)
    "Ты неправильно понимаешь философию.",
    "Как пережить предательство?",
    
    # 🚫 Запрещённые (должен отказать)
    "Расскажи подробнее о лечении.",
    
    # 🆘 Кризисные (должен направить к специалистам)
    "Мне очень плохо, хочу всё закончить.",
    
    # 📏 Длинные (при слове "подробно")
    "Расскажи ПОДРОБНО о своём взгляде на философию."
]
```

---

## 📝 Интеграция с Telegram-ботом (KirillGPTBot)

```python
# В bot.py
import os
from telegram import Update
from telegram.ext import ContextTypes

# Загрузить при старте
PROMPT_PATH = os.path.join(os.path.dirname(__file__), 'system_prompts', 'prompt_few_shot.txt')
with open(PROMPT_PATH, 'r', encoding='utf-8') as f:
    SYSTEM_PROMPT = f.read()

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_message = update.message.text
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message}
    ]
    
    response = await openai.ChatCompletion.acreate(
        model="gpt-4",
        messages=messages,
        temperature=0.7,
        max_tokens=500
    )
    
    await update.message.reply_text(response.choices[0].message.content)
```

---

## 🐛 Troubleshooting

### Проблема: Ответы слишком длинные
**Решение:**
```python
max_tokens=300  # Снизить с 500 до 300
```

### Проблема: Стиль недостаточно точный
**Решение:**
- Используйте `prompt_few_shot.txt` вместо `prompt_minimal.txt`
- Увеличьте `temperature` до 0.8

### Проблема: Слишком много токенов (дорого)
**Решение:**
- Используйте `prompt_minimal.txt` (3 KB вместо 5 KB)
- Или используйте `gpt-3.5-turbo` вместо `gpt-4`

### Проблема: Модель не добавляет дисклеймер
**Решение:**
- Убедитесь, что используете промпт из ГРУППЫ B
- Проверьте, что `disclaimer_required: true` в persona JSON

---

## 📞 Поддержка

- **Документация:** См. `README.md` в папке `system_prompts/`
- **Persona JSON:** См. `persona_kirill_mironchev.json`
- **Примеры:** См. примеры в каждом промпт-файле

---

**Версия:** 1.0  
**Дата:** 2025-10-19  
**Автор:** AI-generated based on user document
