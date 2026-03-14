const mongoose = require('mongoose');
const { activityDB } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const goalSchema = new mongoose.Schema({
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
    required: [true, 'Goal title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: null
  },
  goalType: {
    type: String,
    required: [true, 'Goal type is required'],
    enum: ['fitness', 'nutrition', 'weight', 'sleep', 'hydration', 'custom']
  },
  programType: {
    type: String,
    default: 'general',
    enum: ['general', 'weight-loss', 'muscle-gain', 'endurance', 'sleep', 'stress', 'custom']
  },
  targetValue: {
    type: Number,
    required: [true, 'Target value is required']
  },
  currentValue: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Unit is required']
    // e.g. 'kg', 'km', 'hours', 'kcal', 'ml', 'steps'
  },
  deadline: {
    type: Date,
    default: null
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
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

goalSchema.index({ userId: 1, goalType: 1 });
goalSchema.index({ userId: 1, isCompleted: 1 });
goalSchema.index({ userId: 1, programType: 1 });

module.exports = activityDB.model('Goal', goalSchema);
