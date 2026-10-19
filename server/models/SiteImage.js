const mongoose = require('mongoose');

/**
 * Admin-replaceable site image, identified by a stable key.
 *
 * Examples of keys used by the client:
 *   home.hero, home.about.1, home.featured.places, journal.hero,
 *   discover.hero, city:jaipur
 *
 * When no document exists for a key, the client shows its built-in default.
 */
const siteImageSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Image key is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [120, 'Image key cannot exceed 120 characters'],
      match: [/^[a-z0-9][a-z0-9 ._:@-]*$/, 'Invalid image key'],
    },
    imageUrl: {
      type: String, // Cloudinary secure URL
      required: [true, 'Image is required'],
    },
    publicId: {
      type: String, // Cloudinary public_id (for deletion)
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SiteImage', siteImageSchema);
