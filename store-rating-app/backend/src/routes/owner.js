const express = require('express');
const { query } = require('../database/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Enforce STORE_OWNER role for all routes in this router
router.use(authenticate, authorize('STORE_OWNER'));

/**
 * @route   GET /api/owner/dashboard
 * @desc    Get store owner's dashboard: store details, average rating, and user ratings list
 * @access  Private (Role: STORE_OWNER)
 */
router.get('/dashboard', async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { sortBy = 'date', sortOrder = 'DESC', search } = req.query;

    // 1. Find store(s) owned by this user
    const stores = await query('SELECT * FROM stores WHERE owner_id = ?', [ownerId]);
    if (stores.length === 0) {
      return res.json({
        hasStore: false,
        store: null,
        averageRating: 0,
        totalRatings: 0,
        ratings: [],
      });
    }

    const store = stores[0];

    // 2. Compute store average rating & total counts
    const statResult = await query(
      'SELECT ROUND(AVG(rating), 1) as average_rating, COUNT(id) as total_ratings FROM ratings WHERE store_id = ?',
      [store.id]
    );

    const averageRating = Number(statResult[0]?.average_rating || 0);
    const totalRatings = Number(statResult[0]?.total_ratings || 0);

    // 3. Get list of users who submitted ratings for this store with sorting
    let ratingQuery = `
      SELECT 
        r.id as rating_id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.address as user_address
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id = ?
    `;
    const params = [store.id];

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      ratingQuery += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)';
      params.push(term, term);
    }

    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      rating: 'r.rating',
      date: 'r.created_at',
      updated: 'r.updated_at',
    };

    const sortField = allowedSortFields[sortBy.toLowerCase()] || 'r.created_at';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    ratingQuery += ` ORDER BY ${sortField} ${direction}`;

    const ratings = await query(ratingQuery, params);

    res.json({
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      averageRating,
      totalRatings,
      ratings,
    });
  } catch (error) {
    console.error('Owner Dashboard Error:', error);
    res.status(500).json({ message: 'Error retrieving owner dashboard data.' });
  }
});

module.exports = router;
