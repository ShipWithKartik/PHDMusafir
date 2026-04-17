const Blog = require('../models/Blog');
const cloudinary = require('../config/cloudinary');

/* ─────────────────────────────────────────
   USER-FACING HANDLERS
───────────────────────────────────────── */

/**
 * @desc  Create a new blog post
 * @route POST /api/blogs
 * @access Private (authenticated users)
 */
const createBlog = async (req, res) => {
  try {
    const { title, content, city, category } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ success: false, message: 'Title and content are required' });
    }

    if (!city || !city.trim()) {
      return res
        .status(400)
        .json({ success: false, message: 'City is required' });
    }

    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: 'Category is required' });
    }

    // req.files is populated by uploadBlog.single / array middleware
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'A cover image is required' });
    }

    if (req.files.length > 1) {
      return res
        .status(400)
        .json({ success: false, message: 'Only 1 cover image is allowed' });
    }

    // Each file uploaded via multer-storage-cloudinary has:
    //   file.path       → secure Cloudinary URL
    //   file.filename   → Cloudinary public_id (used for deletion)
    const images = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    const blog = await Blog.create({
      title,
      content,
      city: city.trim(),
      category,
      images,
      author: req.user._id,
      status: 'pending',
    });

    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('createBlog error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc  Get all blogs belonging to the logged-in user (all statuses)
 * @route GET /api/blogs/my
 * @access Private
 */
const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .populate('author', 'name profilePicture');

    res.status(200).json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    console.error('getMyBlogs error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc  Edit a blog — allowed when status is "rejected" or "accepted".
 *        Resets status back to "pending" for re-review.
 * @route PUT /api/blogs/:id
 * @access Private (owner only)
 */
const editBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Ownership check
    if (blog.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to edit this blog' });
    }

    // Only rejected or accepted blogs can be edited and resubmitted
    if (blog.status !== 'rejected' && blog.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Blog cannot be edited because its status is "${blog.status}". Only rejected or accepted blogs can be revised.`,
      });
    }

    const { title, content, city, category } = req.body;
    if (title !== undefined) blog.title = title;
    if (content !== undefined) blog.content = content;
    if (city !== undefined) blog.city = city.trim();
    if (category !== undefined) blog.category = category;

    // If a new cover image was uploaded, swap it out and delete the old Cloudinary asset
    if (req.files && req.files.length > 0) {
      if (req.files.length > 1) {
        return res
          .status(400)
          .json({ success: false, message: 'Only 1 cover image is allowed' });
      }

      // Delete old Cloudinary assets
      const deleteOps = blog.images
        .filter((img) => img.publicId)
        .map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => {}));
      await Promise.all(deleteOps);

      blog.images = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
    }

    // Clear the admin rejection note and reset to pending for re-review
    blog.adminNote = '';
    blog.status = 'pending';

    await blog.save();

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('editBlog error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc  Get all accepted blogs (public feed)
 * @route GET /api/blogs
 * @access Public
 */
const getAcceptedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'accepted' })
      .populate('author', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    console.error('getAcceptedBlogs error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc  Get a single accepted blog by ID (public)
 * @route GET /api/blogs/:id
 * @access Public
 */
const getAcceptedBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, status: 'accepted' }).populate(
      'author',
      'name profilePicture'
    );

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: 'Blog not found or not yet published' });
    }

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error('getAcceptedBlogById error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/* ─────────────────────────────────────────
   ADMIN-ONLY HANDLERS
───────────────────────────────────────── */

/**
 * @desc  Get ALL blogs across all statuses (admin review queue)
 * @route GET /api/admin/blogs
 * @access Admin
 */
const adminGetAllBlogs = async (req, res) => {
  try {
    const { status } = req.query; // optional ?status=pending filter
    const filter = status ? { status } : {};

    const blogs = await Blog.find(filter)
      .populate('author', 'name profilePicture email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    console.error('adminGetAllBlogs error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc  Accept a blog (status → "accepted")
 * @route PUT /api/admin/blogs/:id/accept
 * @access Admin
 */
const adminAcceptBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { status: 'accepted', adminNote: '' },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error('adminAcceptBlog error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc  Reject a blog (status → "rejected") with an optional admin note
 * @route PUT /api/admin/blogs/:id/reject
 * @access Admin
 * @body  { adminNote?: string }
 */
const adminRejectBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        adminNote: req.body.adminNote || '',
      },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error('adminRejectBlog error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc  Admin edits blog content directly, then auto-accepts it
 * @route PUT /api/admin/blogs/:id/edit
 * @access Admin
 * @body  { title?, content?, images?, adminNote? }
 */
const adminEditBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const { title, content, city, category, adminNote } = req.body;
    if (title !== undefined) blog.title = title;
    if (content !== undefined) blog.content = content;
    if (city !== undefined) blog.city = city.trim();
    if (category !== undefined) blog.category = category;
    if (adminNote !== undefined) blog.adminNote = adminNote;

    // If admin uploaded a replacement cover image via multipart, swap it out
    // and remove the old Cloudinary asset to avoid storage leaks
    if (req.files && req.files.length > 0) {
      if (req.files.length > 1) {
        return res
          .status(400)
          .json({ success: false, message: 'Only 1 cover image is allowed' });
      }

      // Purge old Cloudinary assets in parallel
      const deleteOps = blog.images
        .filter((img) => img.publicId)
        .map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => {}));
      await Promise.all(deleteOps);

      blog.images = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
    }

    // After admin edits, the blog is automatically accepted
    blog.status = 'accepted';

    await blog.save();

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('adminEditBlog error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc  Soft-delete a blog (status → "deleted")
 * @route DELETE /api/admin/blogs/:id
 * @access Admin
 */
const adminDeleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Purge all associated Cloudinary images before soft-deleting
    const deleteOps = blog.images
      .filter((img) => img.publicId)
      .map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => {}));
    await Promise.all(deleteOps);

    blog.status = 'deleted';
    await blog.save();

    res.status(200).json({ success: true, message: 'Blog marked as deleted', data: blog });
  } catch (error) {
    console.error('adminDeleteBlog error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  // User-facing
  createBlog,
  getMyBlogs,
  editBlog,
  getAcceptedBlogs,
  getAcceptedBlogById,
  // Admin
  adminGetAllBlogs,
  adminAcceptBlog,
  adminRejectBlog,
  adminEditBlog,
  adminDeleteBlog,
};
