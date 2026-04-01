const express = require('express');
const Goal = require('../models/Goals');
const WeeklyHealthMetrics = require('../models/WeeklyHealthMetrics');
const createNotification = require('../utils/createNotification');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { userId, programType } = req.query;
    const filter = { userId }; 
    if (programType && programType !== 'all') filter.programType = programType;

    const goals = await Goal.find(filter);
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const goal = await Goal.create(req.body);
    return res.status(201).json(goal);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const existing = await Goal.findOne({ id: req.params.id });
    if (!existing) return res.status(404).json({ error: 'Goal not found.' });

    // calculates the new completion state
    const nextCurrent = typeof req.body.currentValue === 'number'
      ? req.body.currentValue
      : existing.currentValue;
    
    const explicitCompleted = typeof req.body.isCompleted === 'boolean'
      ? req.body.isCompleted
      : null;
      
    const computedCompleted = nextCurrent >= existing.targetValue;
    const isCompleted = explicitCompleted === null ? computedCompleted : explicitCompleted;

    // defineing the updates object
    const updates = {
      ...req.body,
      isCompleted,
      completedAt: isCompleted ? (existing.completedAt || new Date()) : null,
      updatedAt: new Date(),
    };

    // do the update only once
    const goal = await Goal.findOneAndUpdate(
      { id: req.params.id },
      updates,
      { new: true }
    );

    if (!goal) return res.status(404).json({ error: 'Goal not found.' });

    // trigger streak logic and notifications
    if (!existing.isCompleted && isCompleted) {
      const stats = await UserStats.findOne({ userId: goal.userId });
      if (stats) {
        await checkGoalCompletionAndStreak(stats, 100); 
      }

      // achievement notification
      await createNotification({
        userId: goal.userId,
        type: "challenge_complete",
        title: "Goal Completed",
        desc: `You achieved your goal: ${goal.title}`,
        icon: "trophy",
        tag: "Achievement"
      });
    }

    // progress update notification
    else if (!isCompleted && nextCurrent > existing.currentValue) {
      await createNotification({
        userId: goal.userId,
        type: "motivation",
        title: "Progress Update",
        desc: `You are making progress on ${goal.title}. Keep going`,
        icon: "spark",
        tag: "Motivation"
      });
    }

    return res.json(goal);
  } catch (error) {
    console.error("Patch Error:", error);
    return res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Goal.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Goal not found.' });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete goal.' });
  }
});

module.exports = router;
