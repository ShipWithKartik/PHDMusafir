const Journal = require('../models/Journal');

// GET all journals (public)
exports.getJournals = async (req, res) => {
  try {
    const journals = await Journal.find().populate('author', 'name profilePicture').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: journals.length, data: journals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET single journal (public)
exports.getJournal = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id).populate('author', 'name profilePicture');
    if (!journal) return res.status(404).json({ success: false, message: 'Journal not found' });
    res.status(200).json({ success: true, data: journal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// POST new journal (admin only)
exports.createJournal = async (req, res) => {
  try {
    const { title, content } = req.body;
    const journal = await Journal.create({ title, content, author: req.user._id });
    res.status(201).json({ success: true, data: journal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PUT update journal (admin only)
exports.updateJournal = async (req, res) => {
  try {
    const { title, content } = req.body;
    const journal = await Journal.findByIdAndUpdate(req.params.id, { title, content }, { new: true, runValidators: true });
    if (!journal) return res.status(404).json({ success: false, message: 'Journal not found' });
    res.status(200).json({ success: true, data: journal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE journal (admin only)
exports.deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findByIdAndDelete(req.params.id);
    if (!journal) return res.status(404).json({ success: false, message: 'Journal not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
