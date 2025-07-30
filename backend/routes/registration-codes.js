const express = require('express');
const crypto = require('crypto');
const { Pool } = require('pg');
const winston = require('winston');
const { authenticateToken, requireRole } = require('../middleware/auth');

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
    new winston.transports.File({ filename: './logs/registration-codes-api.log' }),
    new winston.transports.Console()
  ]
});

// Generate registration code in format ARC-XXXX-XXXX-XXXX
function generateRegistrationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ARC';
  
  for (let i = 0; i < 3; i++) {
    code += '-';
    for (let j = 0; j < 4; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return code;
}

// Generate username in format arcClientAA<15-19 hex characters>
function generateUsername() {
  const basePrefix = 'arcClientAA';
  const minSuffixLength = 15;
  const maxSuffixLength = 19;
  
  // Generate 15-19 hex characters AFTER arcClientAA
  const suffixLength = Math.floor(Math.random() * (maxSuffixLength - minSuffixLength + 1)) + minSuffixLength;
  
  const hexChars = '0123456789abcdef';
  let suffix = '';
  
  for (let i = 0; i < suffixLength; i++) {
    suffix += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
  }
  
  return `${basePrefix}${suffix}`;
}

// POST /api/registration-codes - Generate new registration code (SA/A only)
router.post('/', authenticateToken, requireRole(['SA', 'A']), async (req, res) => {
  const { role = 'ifUser', access_days = 7, max_uses = 1, notes } = req.body;

  const validRoles = ['SA', 'A', 'ifUser', 'ROP', 'RUser', 'LO'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  // Only SA can create codes for SA/A roles
  if (['SA', 'A'].includes(role) && req.user.role !== 'SA') {
    return res.status(403).json({ error: 'Only super admins can create admin codes' });
  }

  if (access_days < 1 || access_days > 365) {
    return res.status(400).json({ error: 'Access days must be between 1 and 365' });
  }

  if (max_uses < 1 || max_uses > 100) {
    return res.status(400).json({ error: 'Max uses must be between 1 and 100' });
  }

  const client = await pool.connect();
  
  try {
    let code;
    let attempts = 0;
    const maxAttempts = 10;

    // Generate unique code and username
    let username;
    do {
      code = generateRegistrationCode();
      username = generateUsername();
      attempts++;
      
      logger.info(`Generated code: ${code}, username: ${username}`);
      
      const existingCodeResult = await client.query(
        'SELECT id FROM registration_codes WHERE code = $1',
        [code]
      );
      
      const existingUsernameResult = await client.query(
        'SELECT id FROM registration_codes WHERE username = $1',
        [username]
      );
      
      if (existingCodeResult.rows.length === 0 && existingUsernameResult.rows.length === 0) break;
      
      if (attempts >= maxAttempts) {
        return res.status(500).json({ error: 'Failed to generate unique code and username' });
      }
    } while (true);

    // Set service type based on role
    const serviceTypeMap = {
      'ifUser': 'infostealer',
      'ROP': 'rat',
      'LO': 'loader',
      'SA': 'admin',
      'A': 'admin'
    };

    const serviceType = serviceTypeMap[role];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Codes expire in 30 days

    // Insert registration code with username
    logger.info(`Inserting code: ${code}, username: ${username}, role: ${role}`);
    const codeResult = await client.query(
      `INSERT INTO registration_codes 
       (code, username, created_by, expires_at, service_type, role, access_days, max_uses, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, code, username, created_at, expires_at, service_type, role, access_days, max_uses, notes`,
      [code, username, req.user.id, expiresAt, serviceType, role, access_days, max_uses, notes]
    );

    const newCode = codeResult.rows[0];

    logger.info(`Registration code created: ${code} (${role}) by ${req.user.username}`);

    res.status(201).json({
      code: newCode.code,
      username: newCode.username,
      role: newCode.role,
      service_type: newCode.service_type,
      access_days: newCode.access_days,
      max_uses: newCode.max_uses,
      created_at: newCode.created_at,
      expires_at: newCode.expires_at,
      notes: newCode.notes
    });

  } catch (error) {
    logger.error('Create registration code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// GET /api/registration-codes - List registration codes (SA/A only)
router.get('/', authenticateToken, requireRole(['SA', 'A']), async (req, res) => {
  const { used, role, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const client = await pool.connect();
  
  try {
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (used !== undefined) {
      paramCount++;
      if (used === 'true') {
        whereClause += ` AND used_at IS NOT NULL`;
      } else {
        whereClause += ` AND used_at IS NULL`;
      }
    }

    if (role) {
      paramCount++;
      whereClause += ` AND role = $${paramCount}`;
      params.push(role);
    }

    // Get total count
    const countResult = await client.query(
      `SELECT COUNT(*) FROM registration_codes ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get codes with user info
    const codesResult = await client.query(
      `SELECT rc.id, rc.code, rc.role, rc.service_type, rc.access_days, rc.max_uses,
              rc.created_at, rc.expires_at, rc.used_at, rc.is_revoked, rc.notes,
              creator.username as created_by_username,
              user_used.username as used_by_username
       FROM registration_codes rc
       LEFT JOIN users creator ON rc.created_by = creator.id
       LEFT JOIN users user_used ON rc.used_by = user_used.id
       ${whereClause}
       ORDER BY rc.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    const codes = codesResult.rows.map(code => ({
      code: code.code,
      role: code.role,
      service_type: code.service_type,
      access_days: code.access_days,
      max_uses: code.max_uses,
      created_at: code.created_at,
      expires_at: code.expires_at,
      used_at: code.used_at,
      used_by: code.used_by_username,
      created_by: code.created_by_username,
      is_revoked: code.is_revoked,
      notes: code.notes,
      status: code.is_revoked ? 'revoked' : 
              code.used_at ? 'used' : 
              new Date(code.expires_at) < new Date() ? 'expired' : 'active'
    }));

    const pages = Math.ceil(total / limit);

    res.json({
      codes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages
      }
    });

  } catch (error) {
    logger.error('Get registration codes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// DELETE /api/registration-codes/:code - Revoke registration code (SA/A only)
router.delete('/:code', authenticateToken, requireRole(['SA', 'A']), async (req, res) => {
  const { code } = req.params;

  const client = await pool.connect();
  
  try {
    // Check if code exists and is not already used
    const codeResult = await client.query(
      'SELECT id, used_at, is_revoked FROM registration_codes WHERE code = $1',
      [code]
    );

    if (codeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Registration code not found' });
    }

    const codeData = codeResult.rows[0];

    if (codeData.used_at) {
      return res.status(400).json({ error: 'Cannot revoke used registration code' });
    }

    if (codeData.is_revoked) {
      return res.status(400).json({ error: 'Registration code already revoked' });
    }

    // Revoke the code
    await client.query(
      'UPDATE registration_codes SET is_revoked = TRUE WHERE code = $1',
      [code]
    );

    logger.info(`Registration code revoked: ${code} by ${req.user.username}`);

    res.json({
      success: true,
      message: 'Registration code revoked'
    });

  } catch (error) {
    logger.error('Revoke registration code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// GET /api/registration-codes/stats - Get registration code statistics (SA/A only)
router.get('/stats', authenticateToken, requireRole(['SA', 'A']), async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Get overall stats
    const statsResult = await client.query(`
      SELECT 
        COUNT(*) as total_codes,
        COUNT(*) FILTER (WHERE used_at IS NOT NULL) as used_codes,
        COUNT(*) FILTER (WHERE used_at IS NULL AND expires_at > CURRENT_TIMESTAMP AND is_revoked = FALSE) as active_codes,
        COUNT(*) FILTER (WHERE expires_at <= CURRENT_TIMESTAMP) as expired_codes,
        COUNT(*) FILTER (WHERE is_revoked = TRUE) as revoked_codes
      FROM registration_codes
    `);

    // Get stats by role
    const roleStatsResult = await client.query(`
      SELECT 
        role,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE used_at IS NOT NULL) as used,
        COUNT(*) FILTER (WHERE used_at IS NULL AND expires_at > CURRENT_TIMESTAMP AND is_revoked = FALSE) as active
      FROM registration_codes
      GROUP BY role
      ORDER BY role
    `);

    const stats = statsResult.rows[0];
    const roleStats = roleStatsResult.rows;

    res.json({
      overall: {
        total: parseInt(stats.total_codes),
        used: parseInt(stats.used_codes),
        active: parseInt(stats.active_codes),
        expired: parseInt(stats.expired_codes),
        revoked: parseInt(stats.revoked_codes)
      },
      by_role: roleStats.map(stat => ({
        role: stat.role,
        total: parseInt(stat.total),
        used: parseInt(stat.used),
        active: parseInt(stat.active)
      }))
    });

  } catch (error) {
    logger.error('Get registration code stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
