const express = require('express');
const Goal = require('../models/Goals');
const WeeklyHealthMetrics = require('../models/WeeklyHealthMetrics');
const createNotification = require('../utils/createNotification');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { userId, programType, isCompleted, device } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (programType && programType !== 'all') filter.programType = programType;
    if (typeof isCompleted !== 'undefined') filter.isCompleted = isCompleted === 'true';

    const goals = await Goal.find(filter).sort({ createdAt: -1 });

    if (!userId) return res.json(goals);

    const deviceId = String(device || 'apple');
    const weekly = await WeeklyHealthMetrics.findOne({ userId, deviceId });
    const weeklySteps = Array.isArray(weekly?.steps)
      ? weekly.steps.reduce((sum, s) => sum + (Number(s) || 0), 0)
      : 0;

    const withEffectiveProgress = goals.map((goal) => {
      const g = goal.toObject();
      const isStepGoal = g.goalType === 'fitness' && String(g.unit || '').toLowerCase() === 'steps';
      if (!isStepGoal) return g;

      const baseCurrent = Number(g.currentValue) || 0;
      g.effectiveCurrentValue = Math.min(Number(g.targetValue) || 0, baseCurrent + weeklySteps);
      return g;
    });

    return res.json(withEffectiveProgress);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch goals.' });
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

    const nextCurrent = typeof req.body.currentValue === 'number'
      ? req.body.currentValue
      : existing.currentValue;
    const explicitCompleted = typeof req.body.isCompleted === 'boolean'
      ? req.body.isCompleted
      : null;
    const computedCompleted = nextCurrent >= existing.targetValue;
    const isCompleted = explicitCompleted === null ? computedCompleted : explicitCompleted;

    const updates = {
      ...req.body,
      isCompleted,
      completedAt: isCompleted ? (existing.completedAt || new Date()) : null,
      updatedAt: new Date(),
    };

    const goal = await Goal.findOneAndUpdate(
      { id: req.params.id },
      updates,
      { new: true }
    );
    if (!goal) return res.status(404).json({ error: 'Goal not found.' });

    // Goal completed
    if (!existing.isCompleted && isCompleted) {
      await createNotification({
        userId: goal.userId,
        type: "challenge_complete",
        title: "Goal Completed",
        desc: `You achieved your goal: ${goal.title}`,
        icon: "trophy",
        tag: "Achievement"
      });
    }

    // Progress update (but not completed)
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
