const express = require('express');
const router = express.Router();

const {
  uploadStory,
  getAllStories,
  getMyStories,
  updateStory,
  deleteStory,
  getStoriesMeta,
  getJourneyPins,
  getRecentContent,
  getCityStats,
} = require('../controllers/storyController');

const upload = require('../middlewares/upload');
const { protect } = require('../middlewares/authMiddleware');

// ── Public routes ──────────────────────────────────────
// GET  /api/stories/meta        → unique cities + categories
router.get('/meta', getStoriesMeta);

// GET  /api/stories/map-pins    → pin data for journey atlas (stories + blogs)
router.get('/map-pins', getJourneyPins);

// GET  /api/stories/recent      → 5 most recent items (stories + blogs)
router.get('/recent', getRecentContent);

// GET  /api/stories/city-stats  → per-city story + blog counts
router.get('/city-stats', getCityStats);

// GET  /api/stories              → all stories (flat or ?grouped=true)
router.get('/', getAllStories);

// ── Protected routes (require JWT) ─────────────────────
// GET  /api/stories/my-stories   → stories by the logged-in user
router.get('/my-stories', protect, getMyStories);

// POST /api/stories              → create a story (auth + image upload)
router.post('/', protect, upload.single('image'), uploadStory);

// PATCH /api/stories/:id         → update a story (owner only, optional new image)
router.patch('/:id', protect, upload.single('image'), updateStory);

// DELETE /api/stories/:id        → delete a story (owner only, removes Cloudinary image)
router.delete('/:id', protect, deleteStory);

module.exports = router;
