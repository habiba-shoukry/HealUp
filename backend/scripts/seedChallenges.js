// Load environment variables (so it can find your database URL)
require('dotenv').config({ path: '../.env' }); 
const mongoose = require('mongoose');

// Import your Quest/Challenge model (adjust the path/name if yours is different)
const Quest = require('../models/Quest'); 
const UserQuest = require('../models/Challenges');

const assignChallengesToUser = async (userId) => {
    const quests = await Quest.find();

    const userChallenges = quests.map(q => ({
        userId,
        questId: q._id,
        currentProgress: 0,
        isCompleted: false
    }));

    await UserQuest.insertMany(userChallenges);
};

// The array we built
const challenges = [
// -- fitness --
  {
    title: "The 10k Club",
    category: "fitness",
    description: "Walk 10,000 steps in a single day.",
    trackingType: "auto",
    metricToTrack: "steps",
    targetValue: 10000,
    xpReward: 50
  },
  {
    title: "Cardio King",
    category: "fitness",
    description: "Log a running or cycling activity lasting at least 30 minutes.",
    trackingType: "auto",
    metricToTrack: "activity_duration",
    targetValue: 30,
    xpReward: 75
  },
  {
    title: "Core Strength",
    category: "fitness",
    description: "Complete 30 sit-ups and a 1-minute plank.",
    trackingType: "manual",
    metricToTrack: "none",
    targetValue: 1,
    xpReward: 30
  },

//   -- wellbeing --
  {
    title: "Sleep Master",
    category: "wellbeing",
    description: "Get at least 8 hours of sleep.",
    trackingType: "auto",
    metricToTrack: "sleep_hours",
    targetValue: 8,
    xpReward: 60
  },
  {
    title: "Zen Mode",
    category: "wellbeing",
    description: "Keep your stress levels low for the day.",
    trackingType: "auto",
    metricToTrack: "stress_level",
    targetValue: 50,
    xpReward: 40
  },
  {
    title: "Mindful Minutes",
    category: "wellbeing",
    description: "Meditate or practice deep breathing for 10 minutes.",
    trackingType: "manual",
    metricToTrack: "none",
    targetValue: 1,
    xpReward: 25
  }
];


const seedDB = async () => {
  try {
    // 1. Connect to your MongoDB (Make sure your MONGO_URI is correct in .env)
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healup_users');
    console.log('✅ Connected to Database');

    // 2. (Optional) Clear out any old challenges so you don't get duplicates
    await Quest.deleteMany({});
    console.log('🧹 Cleared old challenges');

    // 3. Insert the new ones!
    await Quest.insertMany(challenges);
    console.log('🌱 Successfully seeded challenges!');

    // 4. Disconnect so the script finishes and exits
    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('🔥 Error seeding database:', error);
    process.exit(1);
  }
};

// Run the function
seedDB();