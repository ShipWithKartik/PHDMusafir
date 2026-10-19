const mongoose = require('mongoose');

/**
 * Admin-managed cover image for a Journal category.
 *
 * - city === ''  → global cover, used for this category in every city
 * - city !== ''  → city-specific override (e.g. "Food" in "Jaipur")
 *
 * categoryKey / cityKey are lower-cased copies used for matching so that
 * "food" and "Food" resolve to the same cover.
 */
const categoryCoverSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    categoryKey: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    cityKey: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
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

// One cover per (category, city) pair — city '' is the global cover
categoryCoverSchema.index({ categoryKey: 1, cityKey: 1 }, { unique: true });

module.exports = mongoose.model('CategoryCover', categoryCoverSchema);
