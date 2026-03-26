const mongoose = require('mongoose');
const { userDB } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const userStatsSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    unique: true
  },
  totalXp: {
    type: Number,
    default: 0
  },
  coins: {
    type: Number,
    default: 0
  },
  totalEnergy: {
    type: Number,
    default: 80
  },
  totalDiscipline: {
    type: Number,
    default: 70
  },
  hp: {
    type: Number,
    default: 80
  },
  level: {
    type: Number,
    default: 1
  },
  dayStreak: {
    type: Number,
    default: 0
  },
  bestStreak: {
    type: Number,
    default: 0
  },
  streakLastCompletedDate: {
    type: String,
    default: null
  },
  streakTodayDone: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = userDB.model('UserStats', userStatsSchema);
