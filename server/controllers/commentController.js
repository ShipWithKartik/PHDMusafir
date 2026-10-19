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
 * Delete a comment together with every reply beneath it (any depth).
 * Returns the number of comments removed.
 */
const deleteCommentTree = async (rootId) => {
  const ids = [rootId];
  let frontier = [rootId];
  while (frontier.length) {
    const children = await Comment.find({ parentCommentId: { $in: frontier } }).select('_id');
    frontier = children.map((c) => c._id);
    ids.push(...frontier);
  }
  const result = await Comment.deleteMany({ _id: { $in: ids } });
  return result.deletedCount || 0;
};

/**
 * @desc    Delete a comment (by its author, or by an admin for moderation)
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // The author can delete their own comment; admins can delete any comment
    const isOwner = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    // Also delete all replies in the thread
    await deleteCommentTree(comment._id);

    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('deleteComment error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/* ─────────────────────────────────────────
   ADMIN-ONLY HANDLERS
───────────────────────────────────────── */

/**
 * @desc    Get all comments across stories and posts (moderation queue),
 *          newest first, each annotated with the title of the post it is on
 * @route   GET /api/admin/comments
 * @access  Admin
 * @query   targetModel? ('Story' | 'Blog'), limit? (default 500)
 */
const adminGetAllComments = async (req, res) => {
  try {
    const Story = require('../models/Story');
    const Blog = require('../models/Blog');

    const filter = {};
    if (req.query.targetModel === 'Story' || req.query.targetModel === 'Blog') {
      filter.targetModel = req.query.targetModel;
    }
    const limit = Math.min(parseInt(req.query.limit, 10) || 500, 2000);

    const comments = await Comment.find(filter)
      .populate('author', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Resolve the title of each comment's target post
    const storyIds = comments.filter((c) => c.targetModel === 'Story').map((c) => c.targetId);
    const blogIds = comments.filter((c) => c.targetModel === 'Blog').map((c) => c.targetId);

    const [stories, blogs] = await Promise.all([
      storyIds.length ? Story.find({ _id: { $in: storyIds } }).select('title placeVisited').lean() : [],
      blogIds.length ? Blog.find({ _id: { $in: blogIds } }).select('title city status').lean() : [],
    ]);

    const targets = {};
    stories.forEach((s) => { targets[String(s._id)] = { title: s.title, city: s.placeVisited }; });
    blogs.forEach((b) => { targets[String(b._id)] = { title: b.title, city: b.city, status: b.status }; });

    const data = comments.map((c) => ({
      ...c,
      target: targets[String(c.targetId)] || null, // null → post no longer exists
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('adminGetAllComments error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete any comment (and its replies) as a moderator
 * @route   DELETE /api/admin/comments/:id
 * @access  Admin
 */
const adminDeleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const deleted = await deleteCommentTree(comment._id);

    res.status(200).json({ success: true, message: 'Comment deleted', deleted });
  } catch (error) {
    console.error('adminDeleteComment error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createComment,
  getComments,
  deleteComment,
  // Admin
  adminGetAllComments,
  adminDeleteComment,
};
