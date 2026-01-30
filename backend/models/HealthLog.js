const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const healthLogSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  logType: {
    type: String,
    required: [true, 'Log type is required'],
    enum: ['heart_rate', 'sleep', 'steps', 'calories', 'water_intake', 'weight', 'blood_pressure', 'temperature']
  },
  value: {
    type: Number,
    required: [true, 'Value is required']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required']
    // Examples: 'bpm', 'hours', 'steps', 'kcal', 'ml', 'kg', 'mmHg', 'C'
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

// Indexes
healthLogSchema.index({ userId: 1, timestamp: -1 });
healthLogSchema.index({ userId: 1, logType: 1, timestamp: -1 });

module.exports = mongoose.model('HealthLog', healthLogSchema);
