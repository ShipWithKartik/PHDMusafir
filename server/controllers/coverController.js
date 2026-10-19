const CategoryCover = require('../models/CategoryCover');
const cloudinary = require('../config/cloudinary');

/**
 * @desc    Get all admin-defined category covers (global + city overrides)
 * @route   GET /api/covers/categories
 * @access  Public
 */
const getCategoryCovers = async (req, res) => {
  try {
    const covers = await CategoryCover.find()
      .select('category city categoryKey cityKey imageUrl updatedAt')
      .sort({ categoryKey: 1, cityKey: 1 });

    res.status(200).json({ success: true, count: covers.length, data: covers });
  } catch (error) {
    console.error('getCategoryCovers error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Create or replace the cover image for a category (optionally per city)
 * @route   PUT /api/admin/category-covers
 * @access  Admin
 * @body    multipart: image (file), category (string), city? (string, '' = all cities)
 */
const adminUpsertCategoryCover = async (req, res) => {
  try {
    const category = (req.body.category || '').trim();
    const city = (req.body.city || '').trim();

    if (!category) {
      // Clean up the just-uploaded asset so it doesn't leak
      if (req.file?.filename) await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
      return res.status(400).json({ success: false, message: 'Category is required' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'A cover image is required' });
    }

    const categoryKey = category.toLowerCase();
    const cityKey = city.toLowerCase();

    const existing = await CategoryCover.findOne({ categoryKey, cityKey });

    if (existing) {
      // Remove the previous Cloudinary asset before swapping in the new one
      if (existing.publicId) {
        await cloudinary.uploader.destroy(existing.publicId).catch(() => {});
      }
      existing.category = category;
      existing.city = city;
      existing.imageUrl = req.file.path;
      existing.publicId = req.file.filename;
      existing.updatedBy = req.user._id;
      await existing.save();
      return res.status(200).json({ success: true, data: existing });
    }

    const cover = await CategoryCover.create({
      category,
      city,
      categoryKey,
      cityKey,
      imageUrl: req.file.path,
      publicId: req.file.filename,
      updatedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: cover });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('adminUpsertCategoryCover error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Remove a custom cover (category falls back to its default image)
 * @route   DELETE /api/admin/category-covers/:id
 * @access  Admin
 */
const adminDeleteCategoryCover = async (req, res) => {
  try {
    const cover = await CategoryCover.findById(req.params.id);
    if (!cover) {
      return res.status(404).json({ success: false, message: 'Cover not found' });
    }

    if (cover.publicId) {
      await cloudinary.uploader.destroy(cover.publicId).catch(() => {});
    }
    await cover.deleteOne();

    res.status(200).json({ success: true, message: 'Cover removed' });
  } catch (error) {
    console.error('adminDeleteCategoryCover error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getCategoryCovers, adminUpsertCategoryCover, adminDeleteCategoryCover };
