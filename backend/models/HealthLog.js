const mongoose = require('mongoose');
const { activityDB } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const activityLogSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  activityType: {
    type: String,
    required: [true, 'Activity type is required'],
    enum: ['running', 'cycling', 'swimming', 'gym', 'yoga', 'walking', 'sport', 'other']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required']
    // in minutes
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  distance: {
    type: Number,
    default: 0
    // in km
  },
  notes: {
    type: String,
    trim: true,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
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

activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ userId: 1, activityType: 1, timestamp: -1 });

module.exports = activityDB.model('ActivityLog', activityLogSchema);
