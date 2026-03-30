const express = require('express');
const ActivityLog = require('../models/HealthLog');
const FoodIntake = require('../models/FoodIntake');
const WeeklyHealthMetrics = require('../models/WeeklyHealthMetrics');

const router = express.Router();

// Recalculate today's total calorie intake for a user and update all their
// WeeklyHealthMetrics documents (all devices) so the dashboard stays in sync.
const syncCalorieIntakeToMetrics = async (userId, date) => {
  // Determine the start/end of the calendar day for the given date.
  const d = new Date(date);
  const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayEnd   = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  // Sum all food calories for this user on this day.
  const foods = await FoodIntake.find({
    userId,
    timestamp: { $gte: dayStart.toISOString(), $lt: dayEnd.toISOString() }
  });
  const totalCalories = foods.reduce((sum, f) => sum + (Number(f.calories) || 0), 0);

  // Update every WeeklyHealthMetrics doc for this user (all devices).
  const allDocs = await WeeklyHealthMetrics.find({ userId });
  await Promise.all(allDocs.map(async (doc) => {
    const idx = (doc.dates || []).findIndex(d => d === dateKey);
    if (idx === -1) return; // date not in this doc's window
    const updatedIntake = [...doc.calorieIntake];
    updatedIntake[idx] = totalCalories;
    doc.calorieIntake = updatedIntake;
    doc.updatedAt = new Date();
    await doc.save();
  }));
};

router.get('/activities', async (req, res) => {
	try {
		const { userId, activityType } = req.query;
		const filter = {};
		if (userId) filter.userId = userId;
		if (activityType) filter.activityType = activityType;

		const activities = await ActivityLog.find(filter).sort({ timestamp: -1 }).limit(100);
		return res.json(activities);
	} catch (error) {
		return res.status(500).json({ error: 'Failed to fetch activity logs.' });
	}
});

router.post('/activities', async (req, res) => {
	try {
		const activity = await ActivityLog.create(req.body);
		return res.status(201).json(activity);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
});

router.patch('/activities/:id', async (req, res) => {
	try {
		const activity = await ActivityLog.findOneAndUpdate(
			{ id: req.params.id },
			{ ...req.body, updatedAt: new Date() },
			{ new: true }
		);
		if (!activity) return res.status(404).json({ error: 'Activity log not found.' });
		return res.json(activity);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
});

router.delete('/activities/:id', async (req, res) => {
	try {
		const deleted = await ActivityLog.findOneAndDelete({ id: req.params.id });
		if (!deleted) return res.status(404).json({ error: 'Activity log not found.' });
		return res.json({ success: true });
	} catch (error) {
		return res.status(500).json({ error: 'Failed to delete activity log.' });
	}
});

router.get('/foods', async (req, res) => {
	try {
		const { userId, mealType } = req.query;
		const filter = {};
		if (userId) filter.userId = userId;
		if (mealType) filter.mealType = mealType;

		const foods = await FoodIntake.find(filter).sort({ timestamp: -1 }).limit(100);
		return res.json(foods);
	} catch (error) {
		return res.status(500).json({ error: 'Failed to fetch food logs.' });
	}
});

router.post('/foods', async (req, res) => {
	try {
		const food = await FoodIntake.create(req.body);
		// Fire-and-forget: update today's calorieIntake in WeeklyHealthMetrics.
		if (food.userId) {
			syncCalorieIntakeToMetrics(food.userId, food.timestamp || new Date()).catch(() => {});
		}
		return res.status(201).json(food);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
});

router.patch('/foods/:id', async (req, res) => {
	try {
		const food = await FoodIntake.findOneAndUpdate(
			{ id: req.params.id },
			{ ...req.body, updatedAt: new Date() },
			{ new: true }
		);
		if (!food) return res.status(404).json({ error: 'Food log not found.' });
		if (food.userId) {
			syncCalorieIntakeToMetrics(food.userId, food.timestamp || new Date()).catch(() => {});
		}
		return res.json(food);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
});

router.delete('/foods/:id', async (req, res) => {
	try {
		const deleted = await FoodIntake.findOneAndDelete({ id: req.params.id });
		if (!deleted) return res.status(404).json({ error: 'Food log not found.' });
		// Recalculate after deletion too.
		if (deleted.userId) {
			syncCalorieIntakeToMetrics(deleted.userId, deleted.timestamp || new Date()).catch(() => {});
		}
		return res.json({ success: true });
	} catch (error) {
		return res.status(500).json({ error: 'Failed to delete food log.' });
	}
});

module.exports = router;
