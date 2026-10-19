const express = require('express');
const router = express.Router();
const { getCategoryCovers } = require('../controllers/coverController');

// ── Public ─────────────────────────────────────────────────
// GET  /api/covers/categories  → admin-defined category cover images
router.get('/categories', getCategoryCovers);

module.exports = router;
