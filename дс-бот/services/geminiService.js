const { GoogleGenerativeAI } = require('@google/generative-ai');
const { kirillPersona } = require('../config/persona');
const logger = require('../utils/logger');

class GeminiService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.conversationHistory = new Map(); // Store per-user conversation history
  }

  async generateResponse(message, userId, usePersona = true) {
    try {
      logger.info(`Generating response for user ${userId}`, { message: message.substring(0, 100) });

      // Safety check for crisis situations
      if (usePersona && kirillPersona.safetyCheck(message)) {
        logger.warn(`Crisis keywords detected for user ${userId}`);
        return kirillPersona.crisisResponse;
      }

      // Prepare the prompt
      let prompt = message;
      if (usePersona) {
        prompt = `${kirillPersona.systemPrompt}\n\nПользователь: ${message}\n\nОтветь в характере Кирилла Мирончева:`;
      }

      // Get conversation history for context
      const history = this.getConversationHistory(userId);
      
      // Generate response
      const result = await this.model.generateContent({
        contents: [
          ...history,
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      });

      const response = result.response;
      let responseText = response.text();

      // Add disclaimer if using persona
      if (usePersona && !responseText.includes('имитация')) {
        responseText += `\n\n${kirillPersona.disclaimer}`;
      }

      // Update conversation history
      this.updateConversationHistory(userId, message, responseText);

      logger.info(`Response generated successfully for user ${userId}`);
      return responseText;

    } catch (error) {
      logger.error('Error generating response with Gemini API', { 
        error: error.message,
        userId,
        stack: error.stack 
      });
      
      if (error.message.includes('API_KEY')) {
        return 'Ошибка: неверный API ключ Gemini. Проверьте настройки.';
      } else if (error.message.includes('QUOTA')) {
        return 'Ошибка: превышена квота API. Попробуйте позже.';
      } else if (error.message.includes('SAFETY')) {
        return 'Сообщение заблокировано системой безопасности. Попробуйте переформулировать вопрос.';
      }
      
      return 'Произошла ошибка при генерации ответа. Попробуйте еще раз.';
    }
  }

  getConversationHistory(userId) {
    if (!this.conversationHistory.has(userId)) {
      return [];
    }
    
    // Return last 10 messages for context
    const history = this.conversationHistory.get(userId);
    return history.slice(-10);
  }

  updateConversationHistory(userId, userMessage, botResponse) {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    
    const history = this.conversationHistory.get(userId);
    
    // Add user message and bot response
    history.push(
      {
        role: 'user',
        parts: [{ text: userMessage }]
      },
      {
        role: 'model',
        parts: [{ text: botResponse }]
      }
    );
    
    // Keep only last 20 messages (10 exchanges)
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
    
    this.conversationHistory.set(userId, history);
  }

  clearConversationHistory(userId) {
    if (this.conversationHistory.has(userId)) {
      this.conversationHistory.delete(userId);
      logger.info(`Cleared conversation history for user ${userId}`);
      return true;
    }
    return false;
  }

  // Get conversation stats
  getStats() {
    return {
      activeConversations: this.conversationHistory.size,
      totalMessages: Array.from(this.conversationHistory.values())
        .reduce((total, history) => total + history.length, 0)
    };
  }
}

module.exports = GeminiService;