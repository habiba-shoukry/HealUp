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
    trim: true,
    default: null
  },
  challengeType: {
    type: String,
    required: [true, 'Challenge type is required'],
    enum: ['daily', 'weekly'] // Added standard options based on your 'daily' example
  },
  programType: {
    type: String,
    default: 'general',
    enum: ['general', 'weight-loss', 'muscle-gain', 'endurance', 'sleep', 'stress']
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

// Indexes to make looking up user challenges much faster
challengeSchema.index({ userId: 1, challengeType: 1 });
challengeSchema.index({ userId: 1, isCompleted: 1 });
challengeSchema.index({ userId: 1, programType: 1 });


// Check if the model already exists in the database. If yes, use it. If no, create it!
module.exports = activityDB.models.Challenge || activityDB.model('Challenge', challengeSchema);