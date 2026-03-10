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
  totalEnergy: {
    type: Number,
    default: 0
  },
  totalDiscipline: {
    type: Number,
    default: 0
  },
  hp: {
    type: Number,
    default: 100
  },
  level: {
    type: Number,
    default: 1
  },
  totalActivitiesLogged: {
    type: Number,
    default: 0
  },
  totalCaloriesBurned: {
    type: Number,
    default: 0
  },
  totalDistance: {
    type: Number,
    default: 0
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
