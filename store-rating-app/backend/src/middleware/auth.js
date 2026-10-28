const jwt = require('jsonwebtoken');
const { query } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'store_rating_jwt_secret_key_2026';

/**
 * Authentication Middleware:
 * Verifies JWT token and attaches authenticated user to req.user.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
    }

    // Verify user exists in the database
    const users = await query('SELECT id, name, email, address, role FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'User account not found.' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    res.status(500).json({ message: 'Internal authentication error.' });
  }
}

/**
 * Role-Based Authorization Middleware:
 * Restricts access to specific user roles (e.g. 'ADMIN', 'STORE_OWNER', 'USER').
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize,
  JWT_SECRET,
};
