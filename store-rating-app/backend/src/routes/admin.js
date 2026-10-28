const express = require('express');
const bcrypt = require('bcryptjs');
const { query, execute } = require('../database/db');
const { authenticate, authorize } = require('../middleware/auth');
const { validateUserData, validateStoreData } = require('../middleware/validators');

const router = express.Router();

// Enforce ADMIN role for all routes in this router
router.use(authenticate, authorize('ADMIN'));

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard metrics: total users, total stores, total ratings
 */
router.get('/dashboard', async (req, res) => {
  try {
    const userResult = await query('SELECT COUNT(*) as count FROM users');
    const storeResult = await query('SELECT COUNT(*) as count FROM stores');
    const ratingResult = await query('SELECT COUNT(*) as count FROM ratings');

    res.json({
      totalUsers: Number(userResult[0]?.count || 0),
      totalStores: Number(storeResult[0]?.count || 0),
      totalRatings: Number(ratingResult[0]?.count || 0),
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({ message: 'Error loading admin dashboard stats.' });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filtering, sorting, and store owner rating
 */
router.get('/users', async (req, res) => {
  try {
    const { name, email, address, role, search, sortBy = 'id', sortOrder = 'DESC' } = req.query;

    let baseQuery = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address, 
        u.role, 
        u.created_at,
        s.name as store_name,
        ROUND(AVG(r.rating), 1) as store_rating,
        COUNT(r.id) as store_rating_count
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    // Filters
    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      baseQuery += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(u.address) LIKE ?)';
      params.push(term, term, term);
    }
    if (name && name.trim()) {
      baseQuery += ' AND LOWER(u.name) LIKE ?';
      params.push(`%${name.trim().toLowerCase()}%`);
    }
    if (email && email.trim()) {
      baseQuery += ' AND LOWER(u.email) LIKE ?';
      params.push(`%${email.trim().toLowerCase()}%`);
    }
    if (address && address.trim()) {
      baseQuery += ' AND LOWER(u.address) LIKE ?';
      params.push(`%${address.trim().toLowerCase()}%`);
    }
    if (role && role.trim()) {
      baseQuery += ' AND u.role = ?';
      params.push(role.trim().toUpperCase());
    }

    baseQuery += ' GROUP BY u.id, u.name, u.email, u.address, u.role, u.created_at, s.name';

    // Safe sorting keys
    const allowedSortFields = {
      id: 'u.id',
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      created_at: 'u.created_at',
      rating: 'store_rating',
    };

    const sortField = allowedSortFields[sortBy.toLowerCase()] || 'u.id';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    baseQuery += ` ORDER BY ${sortField} ${direction}`;

    const users = await query(baseQuery, params);

    res.json(users);
  } catch (error) {
    console.error('Admin Get Users Error:', error);
    res.status(500).json({ message: 'Error retrieving users.' });
  }
});

/**
 * @route   POST /api/admin/users
 * @desc    Admin adds a new user (Normal User, Admin, or Store Owner)
 */
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const validRoles = ['ADMIN', 'USER', 'STORE_OWNER'];
    const assignedRole = role ? role.toUpperCase() : 'USER';
    if (!validRoles.includes(assignedRole)) {
      return res.status(400).json({ message: 'Invalid role specified. Must be ADMIN, USER, or STORE_OWNER.' });
    }

    const errors = validateUserData({ name, email, password, address });
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    // Check unique email
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email address is already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim(), assignedRole]
    );

    res.status(201).json({
      message: 'User created successfully!',
      user: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        role: assignedRole,
      },
    });
  } catch (error) {
    console.error('Admin Create User Error:', error);
    res.status(500).json({ message: 'Error creating user.' });
  }
});

/**
 * @route   GET /api/admin/stores
 * @desc    Get all stores with filtering, sorting, owner info and ratings
 */
router.get('/stores', async (req, res) => {
  try {
    const { name, email, address, search, sortBy = 'id', sortOrder = 'DESC' } = req.query;

    let baseQuery = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.owner_id,
        u.name as owner_name,
        u.email as owner_email,
        ROUND(AVG(r.rating), 1) as rating,
        COUNT(r.id) as rating_count
      FROM stores s
      LEFT JOIN users u ON u.id = s.owner_id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    // Filters
    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      baseQuery += ' AND (LOWER(s.name) LIKE ? OR LOWER(s.email) LIKE ? OR LOWER(s.address) LIKE ?)';
      params.push(term, term, term);
    }
    if (name && name.trim()) {
      baseQuery += ' AND LOWER(s.name) LIKE ?';
      params.push(`%${name.trim().toLowerCase()}%`);
    }
    if (email && email.trim()) {
      baseQuery += ' AND LOWER(s.email) LIKE ?';
      params.push(`%${email.trim().toLowerCase()}%`);
    }
    if (address && address.trim()) {
      baseQuery += ' AND LOWER(s.address) LIKE ?';
      params.push(`%${address.trim().toLowerCase()}%`);
    }

    baseQuery += ' GROUP BY s.id, s.name, s.email, s.address, s.owner_id, u.name, u.email';

    const allowedSortFields = {
      id: 's.id',
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'rating',
      rating_count: 'rating_count',
      created_at: 's.created_at',
    };

    const sortField = allowedSortFields[sortBy.toLowerCase()] || 's.id';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    baseQuery += ` ORDER BY ${sortField} ${direction}`;

    const stores = await query(baseQuery, params);
    res.json(stores);
  } catch (error) {
    console.error('Admin Get Stores Error:', error);
    res.status(500).json({ message: 'Error retrieving stores.' });
  }
});

/**
 * @route   POST /api/admin/stores
 * @desc    Admin adds a new store
 */
router.post('/stores', async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const errors = validateStoreData({ name, email, address });
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    // Optional owner validation
    let validOwnerId = null;
    if (ownerId) {
      const owner = await query('SELECT id, role FROM users WHERE id = ?', [ownerId]);
      if (owner.length === 0) {
        return res.status(400).json({ message: 'Assigned store owner does not exist.' });
      }
      validOwnerId = owner[0].id;
    }

    const result = await execute(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), address.trim(), validOwnerId]
    );

    res.status(201).json({
      message: 'Store created successfully!',
      store: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        owner_id: validOwnerId,
      },
    });
  } catch (error) {
    console.error('Admin Create Store Error:', error);
    res.status(500).json({ message: 'Error creating store.' });
  }
});

module.exports = router;
