const express = require('express');
const router = express.Router();
const { getJournals, getJournal, createJournal, updateJournal, deleteJournal } = require('../controllers/journalController');
const { protect, adminProtect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getJournals)
  .post(protect, adminProtect, createJournal);

router.route('/:id')
  .get(getJournal)
  .put(protect, adminProtect, updateJournal)
  .delete(protect, adminProtect, deleteJournal);

module.exports = router;
