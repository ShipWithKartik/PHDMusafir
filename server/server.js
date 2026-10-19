require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

const User = require('./models/User');

// Connect to MongoDB
connectDB().then(async () => {
  // Auto-seed admin user
  const adminExists = await User.findOne({ email: 'admin@journal.com' });
  if (!adminExists) {
    await User.create({
      name: 'journal_admin',
      email: 'admin@journal.com',
      password: 'JournalAdmin@2025',
      role: 'admin'
    });
    console.log('Admin user seeded on boot');
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'The Traveler\'s Vellum API is running' });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const storyRoutes = require('./routes/storyRoutes');
const userRoutes = require('./routes/userRoutes');
const journalRoutes = require('./routes/journalRoutes');
const blogRoutes = require('./routes/blogRoutes');
const adminRoutes = require('./routes/adminRoutes');
const commentRoutes = require('./routes/commentRoutes');
const coverRoutes = require('./routes/coverRoutes');
const siteImageRoutes = require('./routes/siteImageRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/covers', coverRoutes);
app.use('/api/site-images', siteImageRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
// Note: Cloudinary upload failures (from multer-storage-cloudinary) arrive as
// plain objects like { message, http_code } with no stack, so log the whole thing.
app.use((err, req, res, next) => {
  const detail = err?.message || err?.error?.message || (typeof err === 'string' ? err : 'Unknown error');
  console.error(`[${req.method} ${req.originalUrl}] error:`, err?.stack || err);

  // File too large / too many files, etc.
  if (err?.name === 'MulterError') {
    return res.status(400).json({ message: detail, error: detail });
  }
  // Rejected file type from our upload fileFilter
  if (/Only JPG, PNG, and WebP/.test(detail)) {
    return res.status(400).json({ message: detail, error: detail });
  }
  // The browser sent a 0-byte image (e.g. an online-only OneDrive photo)
  if (detail === 'Empty file') {
    const msg = 'The selected image is empty (0 bytes). If it is stored in OneDrive or another cloud folder, open it once so it downloads, then select it again.';
    return res.status(400).json({ message: msg, error: detail });
  }
  // Cloudinary rejected the upload (bad credentials, account limits, invalid params …)
  if (err && typeof err === 'object' && 'http_code' in err) {
    return res.status(502).json({ message: `Image upload failed: ${detail}`, error: detail });
  }

  res.status(500).json({ message: 'Internal server error', error: detail });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
