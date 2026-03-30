const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); 
const mongoose = require('mongoose');
const Goal = require('../models/Goals'); 

const testUserId = "740404ca-9b8d-4876-b115-5eaa75371249"; // Your actual frontend UUID

const FALLBACK_GOALS = [
  { id: 'g1', goalType: 'fitness', title: 'Run 20km this month', targetValue: 20, currentValue: 5, unit: 'km', programType: 'general' },
  { id: 'g2', goalType: 'hydration', title: 'Drink 2L water daily', targetValue: 30, currentValue: 10, unit: 'days', programType: 'general' },
];

const seedDB = async () => {
  try {
    // Connect using the correct .env variable
    await mongoose.connect(process.env.MONGO_USER_DB_URL);
    console.log(" Connected to MongoDB Atlas");

    // Clear and Insert
    await Goal.deleteMany({ userId: testUserId });
    await Goal.insertMany(FALLBACK_GOALS.map(g => ({ ...g, userId: testUserId })));

    console.log(`Successfully seeded goals for ${testUserId}`);
    process.exit();
  } catch (err) {
    console.error(" Seed Error:", err);
    process.exit(1);
  }
};

seedDB();