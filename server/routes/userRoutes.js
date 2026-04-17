const express = require('express');
const router = express.Router();
const { toggleBookmark, getBookmarks } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// POST /api/users/bookmark/:storyId
router.post('/bookmark/:storyId', protect, toggleBookmark);

// GET /api/users/bookmarks
router.get('/bookmarks', protect, getBookmarks);

module.exports = router;
