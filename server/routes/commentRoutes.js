const express = require('express');
const router = express.Router();
const {
  createComment,
  getComments,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

// ── Public ─────────────────────────────────────────────────
// GET  /api/comments/:targetId  → all comments for a post
router.get('/:targetId', getComments);

// ── Authenticated ──────────────────────────────────────────
// POST /api/comments            → create a comment or reply
router.post('/', protect, createComment);

// DELETE /api/comments/:id      → delete a comment (owner only)
router.delete('/:id', protect, deleteComment);

module.exports = router;
