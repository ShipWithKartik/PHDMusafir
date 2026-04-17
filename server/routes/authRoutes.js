const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// POST /api/auth/register — create a new account
router.post('/register', register);

// POST /api/auth/login    — login & receive JWT
router.post('/login', login);

// GET  /api/auth/me       — get current user profile (protected)
router.get('/me', protect, getMe);

module.exports = router;
