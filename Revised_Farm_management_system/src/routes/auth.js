const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { login, register, getProfile, testDatabase } = require('../controllers/authController');

// Public routes
router.post('/login', login);
router.get('/test/db', testDatabase);

// Protected routes
router.post('/register', authenticateToken, (req, res, next) => {
  // Only farm owner can register new users
  if (req.user.role !== 'farm_owner') {
    return res.status(403).json({ error: 'Only farm owner can register new users' });
  }
  next();
}, register);

router.get('/profile', authenticateToken, getProfile);

module.exports = router;