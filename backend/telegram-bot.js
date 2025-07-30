const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: './logs/telegram-bot.log' }),
    new winston.transports.Console()
  ]
});

class ArcTelegramBot {
  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    this.setupHandlers();
  }

  setupHandlers() {
    // Start command
    this.bot.start((ctx) => {
      logger.info(`Start command from user ${ctx.from.id}`);
      return ctx.reply(
        'Welcome to ARC MaaS Registration Bot.\n\n' +
        'To redeem your access code, use:\n' +
        '/redeem YOUR_CODE_HERE'
      );
    });

    // Help command
    this.bot.help((ctx) => {
      return ctx.reply(
        'ARC MaaS Registration Bot Commands:\n\n' +
        '/start - Show welcome message\n' +
        '/redeem <code> - Redeem your access code\n' +
        '/help - Show this help message'
      );
    });

    // Redeem command
    this.bot.command('redeem', async (ctx) => {
      const telegramId = ctx.from.id;
      const username = ctx.from.username || 'unknown';
      const code = ctx.message.text.split(' ')[1];

      logger.info(`Redeem attempt from ${telegramId} (${username}) with code: ${code}`);

      if (!code) {
        return ctx.reply('❌ Please provide an access code.\n\nUsage: /redeem YOUR_CODE_HERE');
      }

      try {
        // Call backend to process code redemption
        const response = await this.redeemCode(code, telegramId, username);
        
        if (response.success) {
          // Send success message with button
          return ctx.replyWithMarkdown(
            `✅ Accepted.\n\n` +
            `Your ARC Panel account has been created with the following details:\n\n` +
            `👤*Username:* \`${response.username}\`\n \n` +
            `Click the button below to set your password and complete registration.`,
            Markup.inlineKeyboard([
              Markup.button.url(
                '🔐 Set Password & Complete Registration',
                response.registrationUrl
              )
            ])
          );
        } else {
          logger.warn(`Code redemption failed for ${telegramId}: ${response.error}`);
          return ctx.reply(`❌ ${response.error}`);
        }
      } catch (error) {
        logger.error(`Error processing redemption for ${telegramId}:`, error);
        return ctx.reply('❌ An error occurred. Please try again later.');
      }
    });

    // Handle unknown commands
    this.bot.on('message', (ctx) => {
      if (ctx.message.text && ctx.message.text.startsWith('/')) {
        return ctx.reply('❌ Unknown command. Use /help to see available commands.');
      }
    });

    // Error handling
    this.bot.catch((err, ctx) => {
      logger.error(`Bot error for ${ctx.updateType}:`, err);
    });
  }

  async redeemCode(code, telegramId, username) {
    try {
      const response = await axios.post(`${this.backendUrl}/api/telegram/redeem`, {
        code: code,
        telegramId: telegramId,
        telegramUsername: username
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ARC-Telegram-Bot/1.0'
        }
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        // Backend returned an error response
        return {
          success: false,
          error: error.response.data.error || 'Invalid or expired code.'
        };
      } else if (error.code === 'ECONNREFUSED') {
        logger.error('Backend connection refused');
        return {
          success: false,
          error: 'Service temporarily unavailable.'
        };
      } else {
        logger.error('Unexpected error during code redemption:', error);
        return {
          success: false,
          error: 'An unexpected error occurred.'
        };
      }
    }
  }

  start() {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      logger.error('TELEGRAM_BOT_TOKEN environment variable is required');
      process.exit(1);
    }

    logger.info('Starting ARC Telegram Bot...');
    
    this.bot.launch()
      .then(() => {
        logger.info('ARC Telegram Bot started successfully');
      })
      .catch((error) => {
        logger.error('Failed to start bot:', error);
        process.exit(1);
      });

    // Graceful shutdown
    process.once('SIGINT', () => {
      logger.info('Received SIGINT, stopping bot...');
      this.bot.stop('SIGINT');
    });

    process.once('SIGTERM', () => {
      logger.info('Received SIGTERM, stopping bot...');
      this.bot.stop('SIGTERM');
    });
  }
}

module.exports = ArcTelegramBot;

// Start bot if this file is run directly
if (require.main === module) {
  const bot = new ArcTelegramBot();
  bot.start();
}
