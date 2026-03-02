const mongoose = require('mongoose');
const { activityDB } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const challengeSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Challenge description is required']
  },
  challengeType: {
    type: String,
    required: [true, 'Challenge type is required'],
    enum: ['daily', 'weekly', 'milestone', 'special']
  },
  rewardXp: {
    type: Number,
    default: 0
  },
  rewardEnergy: {
    type: Number,
    default: 0
  },
  rewardDiscipline: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0, // 0-100
    min: 0,
    max: 100
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

challengeSchema.index({ userId: 1, challengeType: 1 });
challengeSchema.index({ userId: 1, isCompleted: 1 });

module.exports = activityDB.model('Challenge', challengeSchema);
