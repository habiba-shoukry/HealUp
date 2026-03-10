const mongoose = require('mongoose');
const { activityDB } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const rewardSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  rewardName: {
    type: String,
    required: [true, 'Reward name is required'],
    trim: true
  },
  rewardType: {
    type: String,
    required: [true, 'Reward type is required'],
    enum: ['avatar_item', 'badge', 'title', 'powerup', 'cosmetic']
  },
  description: {
    type: String,
    trim: true
  },
  xpRequired: {
    type: Number,
    default: 0
  },
  energyRequired: {
    type: Number,
    default: 0
  },
  disciplineRequired: {
    type: Number,
    default: 0
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isUnlocked: {
    type: Boolean,
    default: false
  },
  unlockedAt: {
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

rewardSchema.index({ userId: 1, isUnlocked: 1 });
rewardSchema.index({ userId: 1, rewardType: 1 });

module.exports = activityDB.model('Reward', rewardSchema);
