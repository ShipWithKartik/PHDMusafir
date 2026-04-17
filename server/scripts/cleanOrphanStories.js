/**
 * One-time script to handle existing stories that don't have a user attached.
 *
 * Options (set MODE below):
 *   "delete"  → Remove all orphan stories from the database
 *   "assign"  → Assign all orphan stories to a specific user (set TARGET_USER_ID)
 *   "report"  → Just list orphan stories without modifying anything
 *
 * Usage:
 *   node scripts/cleanOrphanStories.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Story = require('../models/Story');

// ── Configuration ─────────────────────────────────────
const MODE = 'delete'; // Change to 'assign' or 'report' as needed
const TARGET_USER_ID = ''; // Only needed for 'assign' mode
// ──────────────────────────────────────────────────────

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find stories with no user field (null, undefined, or missing)
    const orphans = await Story.find({
      $or: [{ user: null }, { user: { $exists: false } }],
    });

    console.log(`Found ${orphans.length} orphan stories (no user attached).\n`);

    if (orphans.length === 0) {
      console.log('Nothing to do. All stories have a user assigned.');
      process.exit(0);
    }

    // Report
    orphans.forEach((s, i) => {
      console.log(`  ${i + 1}. [${s._id}] "${s.title}" — ${s.placeVisited} (${s.category})`);
    });
    console.log('');

    if (MODE === 'report') {
      console.log('Mode: REPORT — no changes made.');
    } else if (MODE === 'delete') {
      const result = await Story.deleteMany({
        $or: [{ user: null }, { user: { $exists: false } }],
      });
      console.log(`Mode: DELETE — removed ${result.deletedCount} orphan stories.`);
    } else if (MODE === 'assign') {
      if (!TARGET_USER_ID) {
        console.error('ERROR: Set TARGET_USER_ID before running in "assign" mode.');
        process.exit(1);
      }
      const result = await Story.updateMany(
        { $or: [{ user: null }, { user: { $exists: false } }] },
        { $set: { user: new mongoose.Types.ObjectId(TARGET_USER_ID) } }
      );
      console.log(`Mode: ASSIGN — assigned ${result.modifiedCount} stories to user ${TARGET_USER_ID}.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Script failed:', error.message);
    process.exit(1);
  }
}

run();
