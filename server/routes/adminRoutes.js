const express = require('express');
const router = express.Router();
const {
  adminGetAllBlogs,
  adminAcceptBlog,
  adminRejectBlog,
  adminEditBlog,
  adminDeleteBlog,
} = require('../controllers/blogController');
const {
  adminGetAllComments,
  adminDeleteComment,
} = require('../controllers/commentController');
const {
  adminUpsertCategoryCover,
  adminDeleteCategoryCover,
} = require('../controllers/coverController');
const {
  adminSetSiteImage,
  adminResetSiteImage,
} = require('../controllers/siteImageController');
const { protect, adminProtect } = require('../middlewares/authMiddleware');
const { uploadBlog, uploadCover } = require('../middlewares/upload');

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

// ── Comment moderation ─────────────────────────────────────
// GET    /api/admin/comments           → all comments (optional ?targetModel=Story|Blog)
router.get('/comments', adminGetAllComments);

// DELETE /api/admin/comments/:id       → delete a comment and all its replies
router.delete('/comments/:id', adminDeleteComment);

// ── Category cover images ──────────────────────────────────
// PUT    /api/admin/category-covers    → create/replace a cover (multipart: image, category, city?)
router.put('/category-covers', uploadCover.single('image'), adminUpsertCategoryCover);

// DELETE /api/admin/category-covers/:id → remove a custom cover (reverts to default)
router.delete('/category-covers/:id', adminDeleteCategoryCover);

// ── Site images (edited in place across the website) ──────
// PUT    /api/admin/site-images/:key   → replace the image for a key (multipart: image)
router.put('/site-images/:key', uploadCover.single('image'), adminSetSiteImage);

// DELETE /api/admin/site-images/:key   → revert a key to its built-in default image
router.delete('/site-images/:key', adminResetSiteImage);

module.exports = router;
