const express = require('express');
const router = express.Router();
const {
  adminGetAllBlogs,
  adminAcceptBlog,
  adminRejectBlog,
  adminEditBlog,
  adminDeleteBlog,
} = require('../controllers/blogController');
const { protect, adminProtect } = require('../middlewares/authMiddleware');
const { uploadBlog } = require('../middlewares/upload');

// All routes in this file require both a valid JWT AND admin role
router.use(protect, adminProtect);

// GET    /api/admin/blogs              → all blogs (optional ?status= filter)
router.get('/blogs', adminGetAllBlogs);

// PUT    /api/admin/blogs/:id/accept   → approve a blog
router.put('/blogs/:id/accept', adminAcceptBlog);

// PUT    /api/admin/blogs/:id/reject   → reject with optional adminNote (JSON body)
router.put('/blogs/:id/reject', adminRejectBlog);

// PUT    /api/admin/blogs/:id/edit     → admin edits + optionally replaces cover image + auto-accepts
router.put('/blogs/:id/edit', uploadBlog.array('images', 1), adminEditBlog);

// DELETE /api/admin/blogs/:id          → purge Cloudinary assets + soft-delete
router.delete('/blogs/:id', adminDeleteBlog);

module.exports = router;
