const mongoose = require('mongoose');
const { activityDB } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const foodIntakeSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  foodName: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true
  },
  calories: {
    type: Number,
    required: [true, 'Calories are required'],
    min: 0
  },
  protein: {
    type: Number,
    default: 0,
    min: 0
    // in grams
  },
  carbohydrates: {
    type: Number,
    default: 0,
    min: 0
    // in grams
  },
  fat: {
    type: Number,
    default: 0,
    min: 0
    // in grams
  },
  servingSize: {
    type: Number,
    default: null
  },
  servingUnit: {
    type: String,
    trim: true,
    default: null
    // e.g. 'g', 'ml', 'cup', 'piece'
  },
  mealType: {
    type: String,
    required: [true, 'Meal type is required'],
    enum: ['breakfast', 'lunch', 'dinner', 'snack']
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

foodIntakeSchema.index({ userId: 1, timestamp: -1 });
foodIntakeSchema.index({ userId: 1, mealType: 1, timestamp: -1 });

module.exports = activityDB.model('FoodIntake', foodIntakeSchema);
