const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    image: {
      type: String, // Cloudinary secure URL
      required: [true, 'Image is required'],
    },
    imagePublicId: {
      type: String, // Cloudinary public_id for future deletion/updates
    },
    placeVisited: {
      type: String,
      required: [true, 'Place visited is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // false for now so old stories without user still work
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient grouping queries (by city → by category)
storySchema.index({ placeVisited: 1, category: 1 });
storySchema.index({ user: 1 });

module.exports = mongoose.model('Story', storySchema);
