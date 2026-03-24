const mongoose = require('mongoose');
const { activityDB } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const NUMBER_ARRAY_LEN = 7;
const SERIES_LEN = 12;

const defaultArray = (value = 0) => Array.from({ length: NUMBER_ARRAY_LEN }, () => value);
const defaultSeriesArray = () => Array.from({ length: NUMBER_ARRAY_LEN }, () => Array.from({ length: SERIES_LEN }, () => 0));

const weeklyHealthMetricsSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  deviceId: {
    type: String,
    required: true,
    default: 'apple',
    index: true
  },
  dates: {
    type: [String],
    default: () => Array.from({ length: NUMBER_ARRAY_LEN }, () => ''),
  },
  steps: {
    type: [Number],
    default: () => defaultArray(0)
  },
  distanceKm: {
    type: [Number],
    default: () => defaultArray(0)
  },
  caloriesBurned: {
    type: [Number],
    default: () => defaultArray(0)
  },
  calorieIntake: {
    type: [Number],
    default: () => defaultArray(0)
  },
  sleepHours: {
    type: [Number],
    default: () => defaultArray(0)
  },
  sleepScore: {
    type: [Number],
    default: () => defaultArray(0)
  },
  sleepDeepHours: {
    type: [Number],
    default: () => defaultArray(0)
  },
  sleepRemHours: {
    type: [Number],
    default: () => defaultArray(0)
  },
  sleepLightHours: {
    type: [Number],
    default: () => defaultArray(0)
  },
  stressLevel: {
    type: [Number],
    default: () => defaultArray(0)
  },
  stressHrv: {
    type: [Number],
    default: () => defaultArray(0)
  },
  stressPeak: {
    type: [Number],
    default: () => defaultArray(0)
  },
  stressPeakTime: {
    type: [String],
    default: () => Array.from({ length: NUMBER_ARRAY_LEN }, () => '')
  },
  stressRecovery: {
    type: [Number],
    default: () => defaultArray(0)
  },
  stressSeries: {
    type: [[Number]],
    default: () => defaultSeriesArray()
  },
  restingHeartRate: {
    type: [Number],
    default: () => defaultArray(0)
  },
  heartRateMin: {
    type: [Number],
    default: () => defaultArray(0)
  },
  heartRateMax: {
    type: [Number],
    default: () => defaultArray(0)
  },
  heartRateSeries: {
    type: [[Number]],
    default: () => defaultSeriesArray()
  },
  windowStart: {
    type: Date,
    index: true
  },
  windowEnd: {
    type: Date,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
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

weeklyHealthMetricsSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

module.exports = activityDB.model('WeeklyHealthMetrics', weeklyHealthMetricsSchema);
