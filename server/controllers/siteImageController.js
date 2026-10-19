const SiteImage = require('../models/SiteImage');
const cloudinary = require('../config/cloudinary');

// Express already URL-decodes route params
const normaliseKey = (key = '') => String(key).trim().toLowerCase();

/**
 * @desc    Get every admin-replaced site image as a { key: url } map
 * @route   GET /api/site-images
 * @access  Public
 */
const getSiteImages = async (req, res) => {
  try {
    const images = await SiteImage.find().select('key imageUrl').lean();
    const data = {};
    images.forEach((img) => { data[img.key] = img.imageUrl; });
    res.status(200).json({ success: true, count: images.length, data });
  } catch (error) {
    console.error('getSiteImages error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Replace (or set for the first time) the image for a site key
 * @route   PUT /api/admin/site-images/:key
 * @access  Admin
 * @body    multipart: image (file)
 */
const adminSetSiteImage = async (req, res) => {
  try {
    const key = normaliseKey(req.params.key);
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'An image is required' });
    }

    const existing = await SiteImage.findOne({ key });
    if (existing) {
      if (existing.publicId) {
        await cloudinary.uploader.destroy(existing.publicId).catch(() => {});
      }
      existing.imageUrl = req.file.path;
      existing.publicId = req.file.filename;
      existing.updatedBy = req.user._id;
      await existing.save();
      return res.status(200).json({ success: true, data: existing });
    }

    const image = await SiteImage.create({
      key,
      imageUrl: req.file.path,
      publicId: req.file.filename,
      updatedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: image });
  } catch (error) {
    if (error.name === 'ValidationError') {
      // Don't leave the uploaded asset orphaned
      if (req.file?.filename) await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('adminSetSiteImage error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Remove a replaced site image (the site falls back to its default)
 * @route   DELETE /api/admin/site-images/:key
 * @access  Admin
 */
const adminResetSiteImage = async (req, res) => {
  try {
    const key = normaliseKey(req.params.key);
    const image = await SiteImage.findOne({ key });
    if (!image) {
      return res.status(404).json({ success: false, message: 'No custom image for this key' });
    }
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId).catch(() => {});
    }
    await image.deleteOne();
    res.status(200).json({ success: true, message: 'Image reset to default' });
  } catch (error) {
    console.error('adminResetSiteImage error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getSiteImages, adminSetSiteImage, adminResetSiteImage };
