const Comment = require('../models/Comment');

/**
 * @desc    Create a new comment or reply
 * @route   POST /api/comments
 * @access  Private (requires JWT)
 * @body    { content, targetId, targetModel, parentCommentId? }
 */
const createComment = async (req, res) => {
  try {
    const { content, targetId, targetModel, parentCommentId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }
    if (!targetId || !targetModel) {
      return res.status(400).json({ success: false, message: 'targetId and targetModel are required' });
    }

    // If this is a reply, verify the parent comment exists
    if (parentCommentId) {
      const parentExists = await Comment.findById(parentCommentId);
      if (!parentExists) {
        return res.status(404).json({ success: false, message: 'Parent comment not found' });
      }
    }

    const comment = await Comment.create({
      content: content.trim(),
      author: req.user._id,
      targetId,
      targetModel,
      parentCommentId: parentCommentId || null,
    });

    // Populate author fields before returning
    await comment.populate('author', 'name profilePicture');

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('createComment error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get all comments for a specific post (flat list — nesting handled client-side)
 * @route   GET /api/comments/:targetId
 * @access  Public
 */
const getComments = async (req, res) => {
  try {
    const { targetId } = req.params;

    const comments = await Comment.find({ targetId })
      .populate('author', 'name profilePicture')
      .sort({ createdAt: 1 }); // oldest first for natural reading order

    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    console.error('getComments error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete a comment (only by its author)
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Only the author can delete their own comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    // Also delete all child replies
    await Comment.deleteMany({ parentCommentId: comment._id });
    await comment.deleteOne();

    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('deleteComment error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { createComment, getComments, deleteComment };
