const path = require('path');
// This tells dotenv to look one folder UP from 'scripts' to find the .env file
require('dotenv').config({ path: path.join(__dirname, '../.env') }); 
const mongoose = require('mongoose');
const Goal = require('../models/Goals'); 

// Ensure you are using the exact key from your .env file 
mongoose.connect(process.env.MONGO_USER_DB_URL) 
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ Connection Error:", err));
// Log this to be 100% sure it's working
console.log("Connecting to:", process.env.MONGODB_URI); 

const FALLBACK_GOALS = [
  { id: 'g1', goalType: 'fitness', title: 'Run 50km this month', targetValue: 50, currentValue: 34, unit: 'km', programType: 'endurance' },
  { id: 'g2', goalType: 'hydration', title: 'Drink 2L water daily', targetValue: 30, currentValue: 30, unit: 'days', programType: 'general' },
  { id: 'g3', goalType: 'sleep', title: 'Sleep 8hrs for 21 nights', targetValue: 21, currentValue: 9, unit: 'nights', programType: 'sleep' },
  { id: 'g4', goalType: 'nutrition', title: 'Log meals for 30 days', targetValue: 30, currentValue: 6, unit: 'days', programType: 'weight-loss' },
  { id: 'g5', goalType: 'fitness', title: 'Complete 20 workouts', targetValue: 20, currentValue: 20, unit: 'sessions', programType: 'muscle-gain' },
  { id: 'g6', goalType: 'custom', title: 'Meditate 15 days', targetValue: 15, currentValue: 11, unit: 'days', programType: 'stress' },
];

const seedDB = async () => {
  try {

await mongoose.connect(process.env.MONGO_USER_DB_URL);
    console.log("Connected to MongoDB...");

    // Change this to your test user ID from your DB example
    const testUserId = "740404ca-9b8d-4876-b115-5eaa75371249";

    const goalsToInsert = FALLBACK_GOALS.map(g => ({
      ...g,
      userId: testUserId,
      isCompleted: g.currentValue >= g.targetValue,
      isClaimed: false
    }));

    await Goal.deleteMany({ userId: testUserId }); // Clear old ones first
    await Goal.insertMany(goalsToInsert);

    console.log("Successfully seeded goals for u-test-1!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();