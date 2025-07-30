const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const winston = require('winston');

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
    new winston.transports.File({ filename: './logs/auth.log' }),
    new winston.transports.Console()
  ]
});

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'arc-default-secret');
    
    // Get user from database to ensure they still exist and are active
    const result = await pool.query(
      'SELECT id, username, role, is_active, access_end FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account deactivated' });
    }

    // Check if user access has expired (except for SA and A)
    if (!['SA', 'A'].includes(user.role) && user.access_end && new Date(user.access_end) < new Date()) {
      return res.status(401).json({ error: 'Access expired' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Role-based authorization middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Permission check middleware
const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const result = await pool.query(
        'SELECT has_permission($1, $2) as has_perm',
        [req.user.role, permission]
      );

      if (!result.rows[0].has_perm) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      next();
    } catch (error) {
      logger.error('Permission check failed:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Self or admin access middleware (user can access their own data or admin can access any)
const requireSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const targetUserId = parseInt(req.params.id);
  const isAdmin = ['SA', 'A'].includes(req.user.role);
  const isSelf = req.user.id === targetUserId;

  if (!isAdmin && !isSelf) {
    return res.status(403).json({ error: 'Access denied' });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  requireSelfOrAdmin
};
