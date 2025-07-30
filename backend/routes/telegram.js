const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Pool } = require('pg');
const winston = require('winston');

const router = express.Router();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: './logs/telegram-api.log' }),
    new winston.transports.Console()
  ]
});

// Generate username based on service type
function generateUsername() {
  // Generate arcClientAA<stringhexcharacters> format
  // Total length: 15-19 characters, all lowercase if alphabetic
  const basePrefix = 'arcClientAA'; // 11 characters
  const minLength = 15;
  const maxLength = 19;
  
  const randomLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  const suffixLength = randomLength - basePrefix.length; // 4-8 characters
  
  // Use hex characters (0-9, a-f) for the suffix
  const hexChars = '0123456789abcdef';
  let suffix = '';
  
  for (let i = 0; i < suffixLength; i++) {
    suffix += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
  }
  
  return `${basePrefix}${suffix}`;
}

// Generate registration token
function generateRegistrationToken(telegramId, username, serviceType) {
  const payload = {
    telegramId: telegramId,
    username: username,
    serviceType: serviceType,
    type: 'registration',
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET || 'arc-default-secret');
}

// POST /api/telegram/redeem
router.post('/redeem', async (req, res) => {
  const { code, telegramId, telegramUsername } = req.body;

  if (!code || !telegramId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Validate access code
    const codeResult = await client.query(
      `SELECT id, service_type, expires_at, used_at, is_revoked 
       FROM registration_codes 
       WHERE code = $1`,
      [code]
    );

    if (codeResult.rows.length === 0) {
      await client.query('ROLLBACK');
      logger.warn(`Invalid code attempt: ${code} from Telegram ID: ${telegramId}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid access code.'
      });
    }

    const codeData = codeResult.rows[0];

    // Check if code is already used
    if (codeData.used_at) {
      await client.query('ROLLBACK');
      logger.warn(`Already used code attempt: ${code} from Telegram ID: ${telegramId}`);
      return res.status(400).json({
        success: false,
        error: 'Access code has already been used.'
      });
    }

    // Check if code is revoked
    if (codeData.is_revoked) {
      await client.query('ROLLBACK');
      logger.warn(`Revoked code attempt: ${code} from Telegram ID: ${telegramId}`);
      return res.status(400).json({
        success: false,
        error: 'Access code has been revoked.'
      });
    }

    // Check if code is expired
    if (new Date() > new Date(codeData.expires_at)) {
      await client.query('ROLLBACK');
      logger.warn(`Expired code attempt: ${code} from Telegram ID: ${telegramId}`);
      return res.status(400).json({
        success: false,
        error: 'Access code has expired.'
      });
    }

    // Check if user already has a pending registration
    const existingResult = await client.query(
      'SELECT id FROM pending_registrations WHERE telegram_id = $1',
      [telegramId]
    );

    if (existingResult.rows.length > 0) {
      await client.query('ROLLBACK');
      logger.warn(`Duplicate registration attempt from Telegram ID: ${telegramId}`);
      return res.status(400).json({
        success: false,
        error: 'You already have a pending registration.'
      });
    }

    // Generate username and token
    const username = generateUsername(codeData.service_type);
    const registrationToken = generateRegistrationToken(telegramId, username, codeData.service_type);
    
    // Create pending registration
    await client.query(
      `INSERT INTO pending_registrations 
       (telegram_id, username, temp_token, temp_token_expires, code_used, service_type, telegram_username) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        telegramId,
        username,
        registrationToken,
        new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        code,
        codeData.service_type,
        telegramUsername || null
      ]
    );

    await client.query('COMMIT');

    logger.info(`Successful code redemption: ${code} -> ${username} for Telegram ID: ${telegramId}`);

    // Return success response
    return res.json({
      success: true,
      username: username,
      registrationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?token=${encodeURIComponent(registrationToken)}`
    });

  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error during code redemption:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    client.release();
  }
});

module.exports = router;
