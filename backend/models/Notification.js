const mongoose = require('mongoose');
const { activityDB } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: [
      "missed_goal",
      "health_event",
      "challenge_complete",
      "goal_complete",
      "suggestion",
      "recommendation",
      "motivation"
    ],
    required: true
  },

  title: {
    type: String,
    required: true
  },

  desc: {
    type: String,
    required: true
  },

  icon: {
    type: String,
    default: "info"
  },

  tag: {
    type: String
  },

  isRead: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true

});

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = activityDB.model('Notification', notificationSchema);