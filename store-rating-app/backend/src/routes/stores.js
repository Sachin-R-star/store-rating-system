const express = require('express');
const { query } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/stores
 * @desc    Get all stores with overall rating and the current user's submitted rating
 * @access  Private (Authenticated users)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const currentUserId = req.user.id;

    let sql = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        ROUND(AVG(all_ratings.rating), 1) as overall_rating,
        COUNT(all_ratings.id) as total_ratings,
        MAX(my_ratings.rating) as user_rating
      FROM stores s
      LEFT JOIN ratings all_ratings ON all_ratings.store_id = s.id
      LEFT JOIN ratings my_ratings ON my_ratings.store_id = s.id AND my_ratings.user_id = ?
      WHERE 1=1
    `;
    const params = [currentUserId];

    // Search by Name and Address (as specified in PDF)
    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(s.name) LIKE ? OR LOWER(s.address) LIKE ?)';
      params.push(term, term);
    }
    if (name && name.trim()) {
      sql += ' AND LOWER(s.name) LIKE ?';
      params.push(`%${name.trim().toLowerCase()}%`);
    }
    if (address && address.trim()) {
      sql += ' AND LOWER(s.address) LIKE ?';
      params.push(`%${address.trim().toLowerCase()}%`);
    }

    sql += ' GROUP BY s.id, s.name, s.email, s.address';

    // Safe sorting
    const allowedSortFields = {
      name: 's.name',
      address: 's.address',
      email: 's.email',
      overall_rating: 'overall_rating',
      user_rating: 'user_rating',
      total_ratings: 'total_ratings',
    };

    const sortField = allowedSortFields[sortBy.toLowerCase()] || 's.name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    sql += ` ORDER BY ${sortField} ${direction}`;

    const stores = await query(sql, params);
    res.json(stores);
  } catch (error) {
    console.error('Get Stores Error:', error);
    res.status(500).json({ message: 'Error retrieving store listings.' });
  }
});

/**
 * @route   GET /api/stores/:id
 * @desc    Get detailed store info
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const storeId = req.params.id;
    const currentUserId = req.user.id;

    const sql = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        ROUND(AVG(all_ratings.rating), 1) as overall_rating,
        COUNT(all_ratings.id) as total_ratings,
        MAX(my_ratings.rating) as user_rating
      FROM stores s
      LEFT JOIN ratings all_ratings ON all_ratings.store_id = s.id
      LEFT JOIN ratings my_ratings ON my_ratings.store_id = s.id AND my_ratings.user_id = ?
      WHERE s.id = ?
      GROUP BY s.id, s.name, s.email, s.address
    `;

    const stores = await query(sql, [currentUserId, storeId]);
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    res.json(stores[0]);
  } catch (error) {
    console.error('Get Store By ID Error:', error);
    res.status(500).json({ message: 'Error retrieving store details.' });
  }
});

module.exports = router;
