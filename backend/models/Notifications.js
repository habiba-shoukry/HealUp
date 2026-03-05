const mongoose = require('mongoose');
const { activityDB } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const notificationSchema = new mongoose.Schema({
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
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'challenge_complete', // Triggers the Trophy icon
      'reward_earned',      // Triggers the Star icon
      'goal_complete',      // Triggers the Moon icon
      'abnormal_activity',  // For health warnings
      'daily_suggestion'    // For your scheduled tips
    ],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for quickly fetching a user's unread notifications
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = activityDB.model('Notification', notificationSchema);