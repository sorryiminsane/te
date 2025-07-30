const express = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/auth');

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
    new winston.transports.File({ filename: './logs/auth-api.log' }),
    new winston.transports.Console()
  ]
});

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET || 'arc-default-secret',
    { expiresIn: '24h' }
  );
}

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const client = await pool.connect();
  
  try {
    // Get user by username
    const userResult = await client.query(
      'SELECT id, username, password_hash, role, is_active, access_end FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      logger.warn(`Login attempt with invalid username: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      logger.warn(`Login attempt for deactivated user: ${username}`);
      return res.status(401).json({ error: 'Account deactivated' });
    }

    // Check if user access has expired (except for SA and A)
    if (!['SA', 'A'].includes(user.role) && user.access_end && new Date(user.access_end) < new Date()) {
      logger.warn(`Login attempt for expired user: ${username}`);
      return res.status(401).json({ error: 'Access expired' });
    }

    // Verify password
    const validPassword = await argon2.verify(user.password_hash, password);
    if (!validPassword) {
      logger.warn(`Login attempt with invalid password for user: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await client.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate token
    const token = generateToken(user);

    logger.info(`Successful login for user: ${username} (${user.role})`);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        access_end: user.access_end
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Current and new password required' });
  }

  if (new_password.length < 12) {
    return res.status(400).json({ error: 'Password must be at least 12 characters' });
  }

  const client = await pool.connect();
  
  try {
    // Get current password hash
    const userResult = await client.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = userResult.rows[0];

    // Verify current password
    const validPassword = await argon2.verify(user.password_hash, current_password);
    if (!validPassword) {
      logger.warn(`Password change attempt with invalid current password for user: ${req.user.username}`);
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await argon2.hash(new_password);

    // Update password
    await client.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    logger.info(`Password changed for user: ${req.user.username}`);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    logger.error('Password change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// GET /api/me
router.get('/me', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userResult = await client.query(
      `SELECT id, username, role, access_start, access_end, is_active, 
              created_at, last_login, registration_completed_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    const user = userResult.rows[0];

    res.json(user);

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// POST /api/auth/register/complete (for completing registration from Telegram)
router.post('/register/complete', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password required' });
  }

  if (password.length < 12) {
    return res.status(400).json({ error: 'Password must be at least 12 characters' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Verify registration token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'arc-default-secret');
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Get pending registration
    const pendingResult = await client.query(
      'SELECT * FROM pending_registrations WHERE temp_token = $1 AND temp_token_expires > CURRENT_TIMESTAMP',
      [token]
    );

    if (pendingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid or expired registration token' });
    }

    const registration = pendingResult.rows[0];

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Calculate access end date
    const accessStart = new Date();
    const accessEnd = new Date();
    
    // Get access days from registration code
    const codeResult = await client.query(
      'SELECT access_days FROM registration_codes WHERE code = $1',
      [registration.code_used]
    );
    
    const accessDays = codeResult.rows[0]?.access_days || 7;
    accessEnd.setDate(accessEnd.getDate() + accessDays);

    // Create user
    const userResult = await client.query(
      `INSERT INTO users (username, password_hash, telegram_id, telegram_username, role, access_start, access_end, registration_completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       RETURNING id, username, role, access_start, access_end`,
      [
        registration.username,
        passwordHash,
        registration.telegram_id,
        registration.telegram_username,
        registration.role,
        accessStart,
        accessEnd
      ]
    );

    const newUser = userResult.rows[0];

    // Mark registration code as used
    await client.query(
      'UPDATE registration_codes SET used_at = CURRENT_TIMESTAMP, used_by = $1 WHERE code = $2',
      [newUser.id, registration.code_used]
    );

    // Delete pending registration
    await client.query(
      'DELETE FROM pending_registrations WHERE id = $1',
      [registration.id]
    );

    await client.query('COMMIT');

    logger.info(`Registration completed for user: ${newUser.username} (${newUser.role})`);

    res.json({
      success: true,
      message: 'Registration complete. You can now log in.',
      user: {
        username: newUser.username,
        role: newUser.role,
        access_end: newUser.access_end
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Registration completion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
