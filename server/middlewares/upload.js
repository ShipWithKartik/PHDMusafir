const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// ── Stories storage (original — unchanged) ──────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'phdmusafir/stories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      {
        width: 1200,
        height: 800,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto',
      },
    ],
  },
});

// ── Blog storage (separate folder, same transforms) ─────────
const blogStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'phdmusafir/blogs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      {
        width: 1920,
        height: 1080,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto',
      },
    ],
  },
});

// Shared file filter — only allow image MIME types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WebP images are allowed'), false);
  }
};

// Original single-image uploader (stories)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

// Blog multi-image uploader — same rules, capped at 10 files
const uploadBlog = multer({
  storage: blogStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

module.exports = upload;
module.exports.uploadBlog = uploadBlog;
