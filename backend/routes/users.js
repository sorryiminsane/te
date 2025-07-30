const express = require('express');
const argon2 = require('argon2');
const { Pool } = require('pg');
const winston = require('winston');
const { authenticateToken, requireRole, requireSelfOrAdmin } = require('../middleware/auth');

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
    new winston.transports.File({ filename: './logs/users-api.log' }),
    new winston.transports.Console()
  ]
});

// Username generation function
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

// GET /api/users - List all users (SA/A only)
router.get('/', authenticateToken, requireRole(['SA', 'A']), async (req, res) => {
  const { role, active, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const client = await pool.connect();
  
  try {
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      whereClause += ` AND role = $${paramCount}`;
      params.push(role);
    }

    if (active !== undefined) {
      paramCount++;
      whereClause += ` AND is_active = $${paramCount}`;
      params.push(active === 'true');
    }

    // Get total count
    const countResult = await client.query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get users
    const usersResult = await client.query(
      `SELECT id, username, role, access_start, access_end, is_active, 
              created_at, last_login, registration_completed_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    const users = usersResult.rows;
    const pages = Math.ceil(total / limit);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages
      }
    });

  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// POST /api/users - Create new user (SA/A only)
router.post('/', authenticateToken, requireRole(['SA', 'A']), async (req, res) => {
  const { username, password, role = 'ifUser', access_days = 7 } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password.length < 12) {
    return res.status(400).json({ error: 'Password must be at least 12 characters' });
  }

  const validRoles = ['SA', 'A', 'ifUser', 'ROP', 'RUser', 'LO'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  // Only SA can create SA/A users
  if (['SA', 'A'].includes(role) && req.user.role !== 'SA') {
    return res.status(403).json({ error: 'Only super admins can create admin users' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Generate username if not provided
    const finalUsername = username || generateUsername(role);

    // Check if username already exists
    const existingResult = await client.query(
      'SELECT id FROM users WHERE username = $1',
      [finalUsername]
    );

    if (existingResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Calculate access dates
    const accessStart = new Date();
    const accessEnd = new Date();
    
    // Admins don't have expiration
    if (['SA', 'A'].includes(role)) {
      accessEnd.setFullYear(accessEnd.getFullYear() + 10); // 10 years
    } else {
      accessEnd.setDate(accessEnd.getDate() + access_days);
    }

    // Create user
    const userResult = await client.query(
      `INSERT INTO users (username, password_hash, role, access_start, access_end, registration_completed_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING id, username, role, access_start, access_end, is_active, created_at`,
      [finalUsername, passwordHash, role, accessStart, accessEnd]
    );

    const newUser = userResult.rows[0];

    await client.query('COMMIT');

    logger.info(`User created: ${newUser.username} (${newUser.role}) by ${req.user.username}`);

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      access_start: newUser.access_start,
      access_end: newUser.access_end,
      is_active: newUser.is_active,
      created_at: newUser.created_at
    });

  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// GET /api/users/:id - Get specific user
router.get('/:id', authenticateToken, requireSelfOrAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);

  const client = await pool.connect();
  
  try {
    const userResult = await client.query(
      `SELECT id, username, role, access_start, access_end, is_active, 
              created_at, last_login, registration_completed_at, telegram_id, telegram_username
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    res.json(user);

  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// PATCH /api/users/:id - Update user
router.patch('/:id', authenticateToken, requireSelfOrAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { password, is_active, access_end } = req.body;

  // Users can only change their own password
  if (req.user.id === userId && Object.keys(req.body).length > 1 && !req.body.password) {
    return res.status(403).json({ error: 'You can only change your own password' });
  }

  // Only admins can change other fields
  if (req.user.id !== userId && !['SA', 'A'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if user exists
    const existingResult = await client.query(
      'SELECT id, role FROM users WHERE id = $1',
      [userId]
    );

    if (existingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    const existingUser = existingResult.rows[0];

    // Only SA can modify other admins
    if (['SA', 'A'].includes(existingUser.role) && req.user.role !== 'SA') {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Only super admins can modify admin users' });
    }

    const updates = [];
    const params = [];
    let paramCount = 0;

    if (password) {
      if (password.length < 12) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Password must be at least 12 characters' });
      }
      paramCount++;
      updates.push(`password_hash = $${paramCount}`);
      params.push(await argon2.hash(password));
    }

    if (is_active !== undefined) {
      paramCount++;
      updates.push(`is_active = $${paramCount}`);
      params.push(is_active);
    }

    if (access_end) {
      paramCount++;
      updates.push(`access_end = $${paramCount}`);
      params.push(new Date(access_end));
    }

    if (updates.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    paramCount++;
    params.push(userId);

    const updateResult = await client.query(
      `UPDATE users SET ${updates.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING id, username, role, access_start, access_end, is_active`,
      params
    );

    const updatedUser = updateResult.rows[0];

    await client.query('COMMIT');

    logger.info(`User updated: ${updatedUser.username} by ${req.user.username}`);

    res.json(updatedUser);

  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// DELETE /api/users/:id - Delete user (SA only)
router.delete('/:id', authenticateToken, requireRole(['SA']), async (req, res) => {
  const userId = parseInt(req.params.id);

  if (userId === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  const client = await pool.connect();
  
  try {
    const deleteResult = await client.query(
      'DELETE FROM users WHERE id = $1 RETURNING username',
      [userId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const deletedUsername = deleteResult.rows[0].username;

    logger.info(`User deleted: ${deletedUsername} by ${req.user.username}`);

    res.json({
      success: true,
      message: 'User deleted'
    });

  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
