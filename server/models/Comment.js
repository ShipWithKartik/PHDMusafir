const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment must have an author'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Comment must reference a target post'],
    },
    targetModel: {
      type: String,
      required: true,
      enum: {
        values: ['Story', 'Blog'],
        message: 'targetModel must be either Story or Blog',
      },
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null, // null = top-level comment
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
commentSchema.index({ targetId: 1, targetModel: 1, createdAt: 1 });
commentSchema.index({ parentCommentId: 1 });

module.exports = mongoose.model('Comment', commentSchema);
