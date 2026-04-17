const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const adminExists = await User.findOne({ name: 'journal_admin' });
    if (adminExists) {
      console.log('Admin already exists');
      process.exit(0);
    }

    await User.create({
      name: 'journal_admin',
      email: 'admin@journal.com', // fake email to pass validation
      password: 'JournalAdmin@2025',
      role: 'admin'
    });

    console.log('Admin seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin', error);
    process.exit(1);
  }
};
seed();
