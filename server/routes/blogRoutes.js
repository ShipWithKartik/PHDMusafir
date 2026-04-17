const express = require('express');
const router = express.Router();
const {
  createBlog,
  getMyBlogs,
  editBlog,
  getAcceptedBlogs,
  getAcceptedBlogById,
} = require('../controllers/blogController');
const { protect } = require('../middlewares/authMiddleware');
const { uploadBlog } = require('../middlewares/upload');

// Multer middleware: field name "images", max 1 file (exactly one cover image)
const uploadImages = uploadBlog.array('images', 1);

// ── Public ─────────────────────────────────────────────────
// GET  /api/blogs        → all accepted blogs (public feed)
router.get('/', getAcceptedBlogs);

// NOTE: /my must be registered before /:id so Express never
// tries to cast the literal string "my" as a MongoDB ObjectId
// GET  /api/blogs/my     → all blogs by the logged-in user
router.get('/my', protect, getMyBlogs);

// GET  /api/blogs/:id    → single accepted blog
router.get('/:id', getAcceptedBlogById);

// ── Authenticated users ────────────────────────────────────
// POST /api/blogs        → submit a new blog (images required, min 1, max 10)
router.post('/', protect, uploadImages, createBlog);

// PUT  /api/blogs/:id    → revise a rejected or accepted blog (new images optional)
router.put('/:id', protect, uploadImages, editBlog);

module.exports = router;
