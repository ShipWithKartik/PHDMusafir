const Story = require('../models/Story');
const cloudinary = require('../config/cloudinary');

/**
 * @desc    Upload a new story (with image to Cloudinary)
 * @route   POST /api/stories
 * @access  Private (requires auth)
 */
const uploadStory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const { title, description, placeVisited, category, tags } = req.body;

    let parsedTags = [];
    if (tags) {
      parsedTags = Array.isArray(tags)
        ? tags
        : tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    const story = await Story.create({
      title,
      description,
      placeVisited,
      category,
      tags: parsedTags,
      image: req.file.path,
      imagePublicId: req.file.filename,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Story uploaded successfully',
      data: story,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('uploadStory error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get all stories (flat or grouped)
 * @route   GET /api/stories
 * @access  Public
 */
const getAllStories = async (req, res) => {
  try {
    const { city, category, grouped } = req.query;

    const filter = {};
    if (city) filter.placeVisited = { $regex: city, $options: 'i' };
    if (category) filter.category = { $regex: category, $options: 'i' };

    const stories = await Story.find(filter)
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 });

    if (grouped === 'true') {
      const hierarchy = {};
      stories.forEach((story) => {
        const cityKey = story.placeVisited;
        const catKey = story.category;
        if (!hierarchy[cityKey]) hierarchy[cityKey] = {};
        if (!hierarchy[cityKey][catKey]) hierarchy[cityKey][catKey] = [];
        hierarchy[cityKey][catKey].push(story);
      });
      return res.status(200).json({ success: true, count: stories.length, data: hierarchy });
    }

    res.status(200).json({ success: true, count: stories.length, data: stories });
  } catch (error) {
    console.error('getAllStories error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get stories by the logged-in user
 * @route   GET /api/stories/my-stories
 * @access  Private
 */
const getMyStories = async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user._id })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: stories.length, data: stories });
  } catch (error) {
    console.error('getMyStories error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update a story (only by owner)
 * @route   PATCH /api/stories/:id
 * @access  Private
 */
const updateStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // Only the owner can update
    if (!story.user || story.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this story' });
    }

    // Allowed fields to update
    const { title, description, placeVisited, category, tags } = req.body;
    if (title !== undefined) story.title = title;
    if (description !== undefined) story.description = description;
    if (placeVisited !== undefined) story.placeVisited = placeVisited;
    if (category !== undefined) story.category = category;
    if (tags !== undefined) {
      story.tags = Array.isArray(tags)
        ? tags
        : tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    // If a new image was uploaded, delete the old one from Cloudinary
    if (req.file) {
      if (story.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(story.imagePublicId);
        } catch (cloudErr) {
          console.warn('Failed to delete old Cloudinary image:', cloudErr.message);
        }
      }
      story.image = req.file.path;
      story.imagePublicId = req.file.filename;
    }

    await story.save();

    res.status(200).json({
      success: true,
      message: 'Story updated successfully',
      data: story,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('updateStory error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete a story (only by owner) + remove image from Cloudinary
 * @route   DELETE /api/stories/:id
 * @access  Private
 */
const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // Only the owner can delete
    if (story.user && story.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this story' });
    }

    // Delete image from Cloudinary
    if (story.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(story.imagePublicId);
        console.log(`Cloudinary image deleted: ${story.imagePublicId}`);
      } catch (cloudErr) {
        console.warn('Failed to delete Cloudinary image:', cloudErr.message);
        // Don't block story deletion if Cloudinary fails
      }
    }

    // Phase 4: Data Integrity - remove this story from all user bookmarks
    const User = require('../models/User'); // Required here to avoid circular dependencies if any
    await User.updateMany(
      { bookmarks: story._id },
      { $pull: { bookmarks: story._id } }
    );

    await story.deleteOne();

    res.status(200).json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    console.error('deleteStory error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get unique cities + categories (for nav/sidebar)
 * @route   GET /api/stories/meta
 * @access  Public
 */
const getStoriesMeta = async (req, res) => {
  try {
    const meta = await Story.aggregate([
      { $group: { _id: { city: '$placeVisited', category: '$category' }, count: { $sum: 1 } } },
      { $group: { _id: '$_id.city', categories: { $push: { category: '$_id.category', count: '$count' } }, totalStories: { $sum: '$count' } } },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json({ success: true, data: meta });
  } catch (error) {
    console.error('getStoriesMeta error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get map pin data — unified locations from Stories + accepted Blogs
 * @route   GET /api/stories/map-pins
 * @access  Public
 */
const CITY_COORDS = {
  // ─── India — Major Cities ──────────────────────────────────
  'Jaipur':            { lat: 26.9124, lng: 75.7873 },
  'Delhi':             { lat: 28.6139, lng: 77.2090 },
  'New Delhi':         { lat: 28.6139, lng: 77.2090 },
  'Mumbai':            { lat: 19.0760, lng: 72.8777 },
  'Goa':               { lat: 15.2993, lng: 74.1240 },
  'Agra':              { lat: 27.1767, lng: 78.0081 },
  'Varanasi':          { lat: 25.3176, lng: 82.9739 },
  'Rishikesh':         { lat: 30.0869, lng: 78.2676 },
  'Manali':            { lat: 32.2432, lng: 77.1892 },
  'Shimla':            { lat: 31.1048, lng: 77.1734 },
  'Darjeeling':        { lat: 27.0360, lng: 88.2627 },
  'Kolkata':           { lat: 22.5726, lng: 88.3639 },
  'Chennai':           { lat: 13.0827, lng: 80.2707 },
  'Hyderabad':         { lat: 17.3850, lng: 78.4867 },
  'Bangalore':         { lat: 12.9716, lng: 77.5946 },
  'Bengaluru':         { lat: 12.9716, lng: 77.5946 },
  'Mysuru':            { lat: 12.2958, lng: 76.6394 },
  'Mysore':            { lat: 12.2958, lng: 76.6394 },
  'Udaipur':           { lat: 24.5854, lng: 73.7125 },
  'Jodhpur':           { lat: 26.2389, lng: 73.0243 },
  'Pushkar':           { lat: 26.4899, lng: 74.5511 },
  'Amritsar':          { lat: 31.6340, lng: 74.8723 },
  'Leh':               { lat: 34.1526, lng: 77.5771 },
  'Ladakh':            { lat: 34.2996, lng: 78.2932 },
  'Kashmir':           { lat: 34.0837, lng: 74.7973 },
  'Srinagar':          { lat: 34.0837, lng: 74.7973 },
  'Coorg':             { lat: 12.3375, lng: 75.8069 },
  'Munnar':            { lat: 10.0889, lng: 77.0595 },
  'Alleppey':          { lat:  9.4981, lng: 76.3388 },
  'Alappuzha':         { lat:  9.4981, lng: 76.3388 },
  'Hampi':             { lat: 15.3350, lng: 76.4600 },
  'Ooty':              { lat: 11.4102, lng: 76.6950 },
  'Lucknow':           { lat: 26.8467, lng: 80.9462 },
  'Chandigarh':        { lat: 30.7333, lng: 76.7794 },
  'Dehradun':          { lat: 30.3165, lng: 78.0322 },
  'Haridwar':          { lat: 29.9457, lng: 78.1642 },
  'Spiti':             { lat: 32.2461, lng: 78.0338 },
  'Nainital':          { lat: 29.3803, lng: 79.4636 },
  'Mussoorie':         { lat: 30.4598, lng: 78.0664 },
  'Andaman':           { lat: 11.7401, lng: 92.6586 },
  'Pondicherry':       { lat: 11.9416, lng: 79.8083 },
  'Puducherry':        { lat: 11.9416, lng: 79.8083 },
  'Madurai':           { lat:  9.9252, lng: 78.1198 },
  'Kochi':             { lat:  9.9312, lng: 76.2673 },
  'Thiruvananthapuram':{ lat:  8.5241, lng: 76.9366 },
  // ─── India — Additional Cities ─────────────────────────────
  'Ahmedabad':         { lat: 23.0225, lng: 72.5714 },
  'Pune':              { lat: 18.5204, lng: 73.8567 },
  'Bhopal':            { lat: 23.2599, lng: 77.4126 },
  'Indore':            { lat: 22.7196, lng: 75.8577 },
  'Jaisalmer':         { lat: 26.9157, lng: 70.9083 },
  'Mount Abu':         { lat: 24.5926, lng: 72.7156 },
  'Ranthambore':       { lat: 26.0173, lng: 76.5026 },
  'Khajuraho':         { lat: 24.8318, lng: 79.9199 },
  'Ajanta':            { lat: 20.5519, lng: 75.7033 },
  'Ellora':            { lat: 20.0258, lng: 75.1780 },
  'Aurangabad':        { lat: 19.8762, lng: 75.3433 },
  'Nashik':            { lat: 20.0059, lng: 73.7898 },
  'Lonavala':          { lat: 18.7546, lng: 73.4062 },
  'Mahabaleshwar':     { lat: 17.9307, lng: 73.6477 },
  'Gangtok':           { lat: 27.3389, lng: 88.6065 },
  'Shillong':          { lat: 25.5788, lng: 91.8933 },
  'Guwahati':          { lat: 26.1445, lng: 91.7362 },
  'Kaziranga':         { lat: 26.5775, lng: 93.1711 },
  'Tawang':            { lat: 27.5860, lng: 91.8596 },
  'Puri':              { lat: 19.8135, lng: 85.8312 },
  'Bhubaneswar':       { lat: 20.2961, lng: 85.8245 },
  'Konark':            { lat: 19.8876, lng: 86.0945 },
  'Bikaner':           { lat: 28.0229, lng: 73.3119 },
  'Raipur':            { lat: 21.2514, lng: 81.6296 },
  'Patna':             { lat: 25.6093, lng: 85.1376 },
  'Ranchi':            { lat: 23.3441, lng: 85.3096 },
  'Visakhapatnam':     { lat: 17.6868, lng: 83.2185 },
  'Kodaikanal':        { lat: 10.2381, lng: 77.4892 },
  'Tirupati':          { lat: 13.6288, lng: 79.4192 },
  'Rameshwaram':       { lat:  9.2876, lng: 79.3129 },
  'Kanyakumari':       { lat:  8.0883, lng: 77.5385 },
  'Wayanad':           { lat: 11.6854, lng: 76.1320 },
  'Varkala':           { lat:  8.7379, lng: 76.7163 },
  'Auroville':         { lat: 12.0057, lng: 79.8107 },
  'Mathura':           { lat: 27.4924, lng: 77.6737 },
  'Vrindavan':         { lat: 27.5830, lng: 77.6992 },
  'Dwarka':            { lat: 22.2442, lng: 68.9685 },
  'Somnath':           { lat: 20.8880, lng: 70.4013 },
  'Kutch':             { lat: 23.7337, lng: 69.8597 },
  'Rann of Kutch':     { lat: 23.7337, lng: 69.8597 },
  'Surat':             { lat: 21.1702, lng: 72.8311 },
  'Vadodara':          { lat: 22.3072, lng: 73.1812 },
  'Dharamshala':       { lat: 32.2190, lng: 76.3234 },
  'McLeod Ganj':       { lat: 32.2426, lng: 76.3213 },
  'Kasol':             { lat: 32.0101, lng: 77.3134 },
  'Bir Billing':       { lat: 31.8808, lng: 76.7222 },
  'Auli':              { lat: 30.3962, lng: 79.5646 },
  'Jim Corbett':       { lat: 29.5300, lng: 78.7747 },
  'Almora':            { lat: 29.5971, lng: 79.6591 },
  'Lansdowne':         { lat: 29.8377, lng: 78.6871 },
  'Meghalaya':         { lat: 25.4670, lng: 91.3662 },
  'Cherrapunji':       { lat: 25.2700, lng: 91.7195 },
  'Imphal':            { lat: 24.8170, lng: 93.9368 },
  'Kohima':            { lat: 25.6751, lng: 94.1086 },
  'Agartala':          { lat: 23.8315, lng: 91.2868 },
  'Aizawl':            { lat: 23.7307, lng: 92.7173 },
  'Itanagar':          { lat: 27.0844, lng: 93.6053 },
  'Bodh Gaya':         { lat: 24.6961, lng: 84.9869 },
  'Ujjain':            { lat: 23.1765, lng: 75.7885 },
  'Orchha':            { lat: 25.3519, lng: 78.6409 },
  'Pachmarhi':         { lat: 22.4675, lng: 78.4339 },
  'Gokarna':           { lat: 14.5479, lng: 74.3188 },
  'Coimbatore':        { lat: 11.0168, lng: 76.9558 },
  'Thanjavur':         { lat: 10.7870, lng: 79.1378 },
  'Mamallapuram':      { lat: 12.6269, lng: 80.1927 },
  'Mahabalipuram':     { lat: 12.6269, lng: 80.1927 },
};

const getJourneyPins = async (req, res) => {
  try {
    const Blog = require('../models/Blog');

    // ── 1. Aggregate stories by city ──────────────────────────
    const storyAgg = await Story.aggregate([
      { $group: {
        _id: '$placeVisited',
        count: { $sum: 1 },
        categories: { $addToSet: '$category' },
      }},
    ]);

    // ── 2. Aggregate accepted blogs by city ───────────────────
    const blogAgg = await Blog.aggregate([
      { $match: { status: 'accepted' } },
      { $group: {
        _id: '$city',
        count: { $sum: 1 },
        categories: { $addToSet: '$category' },
        blogIds: { $push: '$_id' },
      }},
    ]);

    // ── 3. Merge into a unified map keyed by city name ────────
    const merged = {};

    for (const doc of storyAgg) {
      const city = doc._id;
      if (!city) continue;
      merged[city] = {
        location:    city,
        storyCount:  doc.count,
        blogCount:   0,
        categories:  new Set(doc.categories.filter(Boolean)),
        blogIds:     [],
      };
    }

    for (const doc of blogAgg) {
      const city = doc._id;
      if (!city) continue;
      if (merged[city]) {
        merged[city].blogCount  = doc.count;
        merged[city].blogIds    = doc.blogIds.map(String);
        doc.categories.filter(Boolean).forEach(c => merged[city].categories.add(c));
      } else {
        merged[city] = {
          location:    city,
          storyCount:  0,
          blogCount:   doc.count,
          categories:  new Set(doc.categories.filter(Boolean)),
          blogIds:     doc.blogIds.map(String),
        };
      }
    }

    // ── 4. Resolve coordinates and build response ─────────────
    const pins = Object.values(merged)
      .map(entry => {
        const coords = CITY_COORDS[entry.location];
        if (!coords) return null;
        const totalCount = entry.storyCount + entry.blogCount;
        let type = 'both';
        if (entry.storyCount > 0 && entry.blogCount === 0) type = 'story';
        else if (entry.storyCount === 0 && entry.blogCount > 0) type = 'blog';
        return {
          location:    entry.location,
          latitude:    coords.lat,
          longitude:   coords.lng,
          storyCount:  entry.storyCount,
          blogCount:   entry.blogCount,
          totalCount,
          categories:  [...entry.categories].sort(),
          type,
          blogIds:     entry.blogIds,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.totalCount - a.totalCount);

    res.status(200).json({ success: true, data: pins });
  } catch (error) {
    console.error('getJourneyPins error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get the 5 most recent content items (stories + accepted blogs)
 * @route   GET /api/stories/recent
 * @access  Public
 */
const getRecentContent = async (req, res) => {
  try {
    const Blog = require('../models/Blog');

    // Fetch latest 5 stories
    const recentStories = await Story.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title image placeVisited category createdAt')
      .lean();

    // Fetch latest 5 accepted blogs
    const recentBlogs = await Blog.find({ status: 'accepted' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title images city category createdAt')
      .lean();

    // Normalize and merge
    const merged = [
      ...recentStories.map((s) => ({
        _id: s._id,
        title: s.title,
        image: s.image,
        city: s.placeVisited,
        category: s.category,
        createdAt: s.createdAt,
        type: 'story',
      })),
      ...recentBlogs.map((b) => ({
        _id: b._id,
        title: b.title,
        image: b.images?.[0]?.url || '',
        city: b.city,
        category: b.category,
        createdAt: b.createdAt,
        type: 'blog',
      })),
    ];

    // Sort by newest first, take top 5
    merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const top5 = merged.slice(0, 5);

    res.status(200).json({ success: true, data: top5 });
  } catch (error) {
    console.error('getRecentContent error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get per-city stats: story count + accepted journal post count
 * @route   GET /api/stories/city-stats
 * @access  Public
 */
const getCityStats = async (req, res) => {
  try {
    const Blog = require('../models/Blog');

    // Story counts per city
    const storyAgg = await Story.aggregate([
      { $group: { _id: '$placeVisited', storyCount: { $sum: 1 } } },
    ]);

    // Accepted blog counts per city
    const blogAgg = await Blog.aggregate([
      { $match: { status: 'accepted' } },
      { $group: { _id: '$city', blogCount: { $sum: 1 } } },
    ]);

    // Merge
    const cityMap = {};
    for (const doc of storyAgg) {
      if (!doc._id) continue;
      cityMap[doc._id] = { city: doc._id, storyCount: doc.storyCount, blogCount: 0 };
    }
    for (const doc of blogAgg) {
      if (!doc._id) continue;
      if (cityMap[doc._id]) {
        cityMap[doc._id].blogCount = doc.blogCount;
      } else {
        cityMap[doc._id] = { city: doc._id, storyCount: 0, blogCount: doc.blogCount };
      }
    }

    const stats = Object.values(cityMap).sort((a, b) =>
      (b.storyCount + b.blogCount) - (a.storyCount + a.blogCount)
    );

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('getCityStats error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { uploadStory, getAllStories, getMyStories, updateStory, deleteStory, getStoriesMeta, getJourneyPins, getRecentContent, getCityStats };
