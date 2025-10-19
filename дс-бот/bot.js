require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const GeminiService = require('./services/geminiService');
const logger = require('./utils/logger');

class DiscordGeminiBot {
  constructor() {
    // Validate required environment variables
    this.validateConfig();
    
    // Initialize Discord client
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
      ]
    });

    // Initialize Gemini service
    this.geminiService = new GeminiService(process.env.GEMINI_API_KEY);
    
    // Bot configuration
    this.config = {
      prefix: process.env.BOT_PREFIX || '!',
      allowedChannels: process.env.ALLOWED_CHANNELS ? 
        process.env.ALLOWED_CHANNELS.split(',').map(c => c.trim()) : [],
      maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH) || 2000,
      useKirillPersona: process.env.USE_KIRILL_PERSONA === 'true',
      responseLength: process.env.RESPONSE_LENGTH || 'medium'
    };

    // Rate limiting
    this.userCooldowns = new Map();
    this.cooldownTime = 3000; // 3 seconds

    this.setupEventHandlers();
  }

  validateConfig() {
    const required = ['DISCORD_BOT_TOKEN', 'GEMINI_API_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  setupEventHandlers() {
    this.client.once('ready', () => {
      logger.info(`Bot logged in as ${this.client.user.tag}`);
      logger.info(`Serving ${this.client.guilds.cache.size} guilds`);
      
      // Set bot activity
      this.client.user.setActivity('с философией жизни', { type: ActivityType.Playing });
      
      logger.info('Bot is ready and operational');
    });

    this.client.on('messageCreate', async (message) => {
      await this.handleMessage(message);
    });

    this.client.on('error', (error) => {
      logger.error('Discord client error', { error: error.message, stack: error.stack });
    });

    this.client.on('warn', (warning) => {
      logger.warn('Discord client warning', { warning });
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Received SIGINT, shutting down gracefully');
      this.client.destroy();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, shutting down gracefully');
      this.client.destroy();
      process.exit(0);
    });
  }

  async handleMessage(message) {
    try {
      // Ignore bot messages
      if (message.author.bot) return;

      // Check if message is a command or mention
      const isCommand = message.content.startsWith(this.config.prefix);
      const isMention = message.mentions.has(this.client.user);
      const isDM = message.channel.type === 1; // DM channel type

      // Check if in allowed channel (if specified)
      if (!isDM && this.config.allowedChannels.length > 0) {
        if (!this.config.allowedChannels.includes(message.channel.name)) {
          return;
        }
      }

      // Handle commands
      if (isCommand) {
        await this.handleCommand(message);
        return;
      }

      // Handle mentions or DMs
      if (isMention || isDM) {
        await this.handleAIResponse(message);
        return;
      }

    } catch (error) {
      logger.error('Error handling message', { 
        error: error.message, 
        messageId: message.id,
        userId: message.author.id,
        stack: error.stack 
      });
      
      await this.sendErrorMessage(message, 'Произошла ошибка при обработке сообщения.');
    }
  }

  async handleCommand(message) {
    const args = message.content.slice(this.config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command) {
      case 'help':
      case 'помощь':
        await this.sendHelpMessage(message);
        break;
        
      case 'clear':
      case 'очистить':
        await this.handleClearHistory(message);
        break;
        
      case 'stats':
      case 'статистика':
        await this.sendStatsMessage(message);
        break;
        
      case 'persona':
      case 'персона':
        await this.handlePersonaToggle(message, args);
        break;
        
      default:
        // Treat unknown commands as AI requests
        const content = message.content.slice(this.config.prefix.length).trim();
        if (content) {
          await this.handleAIResponse(message, content);
        }
    }
  }

  async handleAIResponse(message, customContent = null) {
    // Rate limiting
    if (this.isOnCooldown(message.author.id)) {
      return;
    }

    // Show typing indicator
    await message.channel.sendTyping();

    try {
      // Extract content (remove mention if present)
      let content = customContent || message.content;
      if (message.mentions.has(this.client.user)) {
        content = content.replace(`<@${this.client.user.id}>`, '').trim();
      }

      if (!content) {
        await message.reply('Что ты хотел сказать? Задай вопрос или начни разговор.');
        return;
      }

      // Generate AI response
      const response = await this.geminiService.generateResponse(
        content, 
        message.author.id, 
        this.config.useKirillPersona
      );

      // Split long messages
      const messages = this.splitMessage(response);
      
      for (const msg of messages) {
        await message.reply(msg);
      }

      // Set cooldown
      this.setCooldown(message.author.id);

      logger.info('AI response sent successfully', { 
        userId: message.author.id,
        messageLength: response.length 
      });

    } catch (error) {
      logger.error('Error generating AI response', { 
        error: error.message,
        userId: message.author.id,
        stack: error.stack 
      });
      
      await this.sendErrorMessage(message, 'Не удалось сгенерировать ответ. Попробуйте еще раз.');
    }
  }

  async handleClearHistory(message) {
    const cleared = this.geminiService.clearConversationHistory(message.author.id);
    
    if (cleared) {
      await message.reply('✅ История разговора очищена.');
    } else {
      await message.reply('ℹ️ История разговора уже пуста.');
    }
  }

  async handlePersonaToggle(message, args) {
    if (args.length === 0) {
      const status = this.config.useKirillPersona ? 'включена' : 'отключена';
      await message.reply(`Персона Кирилла Мирончева сейчас **${status}**.`);
      return;
    }

    const action = args[0].toLowerCase();
    if (action === 'on' || action === 'вкл') {
      this.config.useKirillPersona = true;
      await message.reply('✅ Персона Кирилла Мирончева включена.');
    } else if (action === 'off' || action === 'выкл') {
      this.config.useKirillPersona = false;
      await message.reply('✅ Персона Кирилла Мирончева отключена. Бот будет отвечать в обычном режиме.');
    } else {
      await message.reply('Используйте: `!persona on/off` или `!персона вкл/выкл`');
    }
  }

  async sendHelpMessage(message) {
    const embed = new EmbedBuilder()
      .setTitle('🤖 Помощь по боту')
      .setDescription('Бот с интеграцией Gemini AI и персоной Кирилла Мирончева')
      .addFields(
        {
          name: '💬 Общение',
          value: `• Упомяните бота (@${this.client.user.username}) в сообщении\n• Напишите в личные сообщения\n• Используйте команды с префиксом \`${this.config.prefix}\``,
          inline: false
        },
        {
          name: '⚙️ Команды',
          value: `\`${this.config.prefix}help\` - показать эту справку\n\`${this.config.prefix}clear\` - очистить историю разговора\n\`${this.config.prefix}stats\` - статистика бота\n\`${this.config.prefix}persona on/off\` - включить/отключить персону`,
          inline: false
        },
        {
          name: '⚠️ Важно',
          value: 'Бот имитирует персонажа в образовательных целях. При серьезных проблемах обращайтесь к специалистам.',
          inline: false
        }
      )
      .setColor('#0099ff')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  async sendStatsMessage(message) {
    const stats = this.geminiService.getStats();
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    const embed = new EmbedBuilder()
      .setTitle('📊 Статистика бота')
      .addFields(
        { name: '🏃 Время работы', value: `${hours}ч ${minutes}м`, inline: true },
        { name: '💬 Активные разговоры', value: stats.activeConversations.toString(), inline: true },
        { name: '📝 Всего сообщений', value: stats.totalMessages.toString(), inline: true },
        { name: '🎭 Персона', value: this.config.useKirillPersona ? 'Включена' : 'Отключена', inline: true },
        { name: '🔧 Серверов', value: this.client.guilds.cache.size.toString(), inline: true },
        { name: '👥 Пользователей', value: this.client.users.cache.size.toString(), inline: true }
      )
      .setColor('#00ff99')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  async sendErrorMessage(message, errorText) {
    const embed = new EmbedBuilder()
      .setTitle('❌ Ошибка')
      .setDescription(errorText)
      .setColor('#ff0000')
      .setTimestamp();

    try {
      await message.reply({ embeds: [embed] });
    } catch (error) {
      // Fallback to plain text if embed fails
      await message.reply(`❌ ${errorText}`);
    }
  }

  splitMessage(text) {
    if (text.length <= this.config.maxMessageLength) {
      return [text];
    }

    const messages = [];
    let currentMessage = '';
    const sentences = text.split(/(?<=[.!?])\s+/);

    for (const sentence of sentences) {
      if ((currentMessage + sentence).length <= this.config.maxMessageLength) {
        currentMessage += (currentMessage ? ' ' : '') + sentence;
      } else {
        if (currentMessage) {
          messages.push(currentMessage);
        }
        currentMessage = sentence;
      }
    }

    if (currentMessage) {
      messages.push(currentMessage);
    }

    return messages;
  }

  isOnCooldown(userId) {
    if (!this.userCooldowns.has(userId)) {
      return false;
    }
    
    const lastUsed = this.userCooldowns.get(userId);
    return Date.now() - lastUsed < this.cooldownTime;
  }

  setCooldown(userId) {
    this.userCooldowns.set(userId, Date.now());
    
    // Clean up old cooldowns
    setTimeout(() => {
      this.userCooldowns.delete(userId);
    }, this.cooldownTime);
  }

  async start() {
    try {
      logger.info('Starting Discord bot...');
      await this.client.login(process.env.DISCORD_BOT_TOKEN);
    } catch (error) {
      logger.error('Failed to start bot', { error: error.message, stack: error.stack });
      process.exit(1);
    }
  }
}

// Start the bot
if (require.main === module) {
  const bot = new DiscordGeminiBot();
  bot.start().catch(error => {
    logger.error('Fatal error starting bot', { error: error.message, stack: error.stack });
    process.exit(1);
  });
}

module.exports = DiscordGeminiBot;