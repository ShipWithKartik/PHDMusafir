const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    content: {
      type: String,
      required: [true, 'Blog content is required'],
      // Stored as raw Markdown / rich-text string; rendering is handled on the client
      validate: {
        validator: function (v) {
          if (!v || !v.trim()) return true; // required validator handles empty case
          const wordCount = v.trim().split(/\s+/).length;
          return wordCount <= 2000;
        },
        message: 'Blog content cannot exceed 2 000 words',
      },
    },

    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      // The Indian city where the experience took place
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Picnic', 'Party', 'Family', 'Nature', 'Adventure', 'Culture', 'Food', 'Heritage', 'Spiritual', 'Other'],
        message: 'Category must be one of: Picnic, Party, Family, Nature, Adventure, Culture, Food, Heritage, Spiritual, Other',
      },
    },

    images: {
      type: [
        {
          url: { type: String, required: true },       // Cloudinary secure URL
          publicId: { type: String, required: true },  // Cloudinary public_id (for deletion)
        },
      ],
      validate: {
        validator: (arr) => arr.length === 1,
        message: 'A blog must have exactly 1 cover image',
      },
      default: undefined, // no default — validation forces exactly 1
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Blog must have an author'],
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'deleted'],
        message: 'Status must be one of: pending, accepted, rejected, deleted',
      },
      default: 'pending',
      // pending  → submitted by user, awaiting admin review
      // accepted → approved by admin, visible on Journal / public pages
      // rejected → rejected by admin (see adminNote for reason)
      // deleted  → previously accepted blog removed by admin
    },

    adminNote: {
      type: String,
      trim: true,
      default: '',
      // Optional rejection reason or editorial note from the admin
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Index for the most common queries
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ status: 1, createdAt: -1 });
// New compound indexes for city & category filtering (accepted posts)
blogSchema.index({ status: 1, city: 1 });
blogSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model('Blog', blogSchema);
