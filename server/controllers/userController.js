const User = require('../models/User');

// POST /api/users/bookmark/:storyId
exports.toggleBookmark = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isBookmarked = user.bookmarks.includes(storyId);

    if (isBookmarked) {
      // Remove bookmark
      user.bookmarks = user.bookmarks.filter((id) => id.toString() !== storyId);
    } else {
      // Add bookmark
      user.bookmarks.push(storyId);
    }

    await user.save();

    res.status(200).json({ 
      success: true, 
      message: isBookmarked ? 'Bookmark removed' : 'Bookmark added',
      bookmarks: user.bookmarks 
    });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/users/bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate('bookmarks');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      bookmarks: user.bookmarks
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
