const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, execute } = require('../database/db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const { validateUserData, PASSWORD_REGEX } = require('../middleware/validators');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Sign up as a Normal User
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Validate request data
    const errors = validateUserData({ name, email, password, address });
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const result = await execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim(), 'USER']
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      role: 'USER',
    };

    // Issue JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Single login system for all users (Admin, Normal User, Store Owner)
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    // Find user by email
    const users = await query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user details
 * @access  Private
 */
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

/**
 * @route   PUT /api/auth/update-password
 * @desc    Update password after logging in
 * @access  Private
 */
router.put('/update-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current password and new password are required.' });
    }

    // Validate new password against criteria: 8-16 chars, 1 uppercase, 1 special char
    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        message: 'New password must be 8-16 characters long and include at least one uppercase letter and one special character.',
      });
    }

    // Retrieve user's current hashed password
    const users = await query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    // Hash and update new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await execute('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, req.user.id]);

    res.json({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Update Password Error:', error);
    res.status(500).json({ message: 'Server error updating password.' });
  }
});

module.exports = router;
