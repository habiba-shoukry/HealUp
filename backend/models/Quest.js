const mongoose = require('mongoose');
const { activityDB } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const challengeSchema = new mongoose.Schema({
title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['fitness', 'wellbeing'], // Groups them on the frontend
    required: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],      // Controls the auto-renew timeframe
    required: true
  },
  trackingType: {
    type: String,
    enum: ['auto', 'manual'],       // Auto (reads health data) vs Manual (user clicks checkbox)
    required: true
  },
  metricToTrack: {
    type: String,
    default: 'none'                 // e.g., 'steps', 'calories', 'sleep_hours', 'water_glasses'
  },
  targetValue: {
    type: Number,
    required: true                  // e.g., 10000 (steps), 8 (hours of sleep)
  },
  xpReward: {
    type: Number,
    required: true,
    default: 50                     // How much XP the user gets for finishing it
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
