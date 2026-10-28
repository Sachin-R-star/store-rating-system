const express = require('express');
const { query, execute } = require('../database/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Only authenticated NORMAL USERS (and ADMIN) can submit/modify ratings
router.use(authenticate);

/**
 * @route   POST /api/ratings
 * @desc    Submit or modify a rating for a store (between 1 and 5)
 * @access  Private (Role: USER or ADMIN)
 */
router.post('/', async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    // Validate rating value
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
    }

    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required.' });
    }

    // Verify store exists
    const stores = await query('SELECT id, name FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    // Check if user already submitted a rating for this store
    const existing = await query('SELECT id, rating FROM ratings WHERE user_id = ? AND store_id = ?', [userId, storeId]);

    let action = 'submitted';
    if (existing.length > 0) {
      // Modify existing rating
      await execute(
        'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [numericRating, existing[0].id]
      );
      action = 'modified';
    } else {
      // Insert new rating
      await execute(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, numericRating]
      );
    }

    // Fetch updated overall rating for the store
    const statResult = await query(
      'SELECT ROUND(AVG(rating), 1) as overall_rating, COUNT(id) as total_ratings FROM ratings WHERE store_id = ?',
      [storeId]
    );

    res.json({
      message: `Rating ${action} successfully!`,
      rating: numericRating,
      overallRating: Number(statResult[0]?.overall_rating || numericRating),
      totalRatings: Number(statResult[0]?.total_ratings || 1),
    });
  } catch (error) {
    console.error('Submit Rating Error:', error);
    res.status(500).json({ message: 'Error submitting rating.' });
  }
});

module.exports = router;
