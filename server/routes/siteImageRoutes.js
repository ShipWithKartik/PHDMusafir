const express = require('express');
const router = express.Router();
const { getSiteImages } = require('../controllers/siteImageController');

// ── Public ─────────────────────────────────────────────────
// GET  /api/site-images  → { key: imageUrl } for every admin-replaced site image
router.get('/', getSiteImages);

module.exports = router;
