const express = require('express');
const Challenge = require('../models/Quest');
const Goal = require('../models/Goals');

const router = express.Router();

const inferGoalTypeFromChallenge = (challenge) => {
	const text = `${challenge?.title || ''} ${challenge?.description || ''}`.toLowerCase();
	if (/water|hydrat|drink/.test(text)) return 'hydration';
	if (/sleep|rest|bed|night/.test(text)) return 'sleep';
	if (/sugar|meal|calorie|food|nutrition/.test(text)) return 'nutrition';
	if (/weight|kg|bmi/.test(text)) return 'weight';
	if (/walk|run|steps|workout|exercise|stretch|activity/.test(text)) return 'fitness';
	return null;
};

const updateGoalFromChallengeTransition = async (challenge, direction) => {
	if (!challenge?.userId || !direction) return;

	const inferredGoalType = inferGoalTypeFromChallenge(challenge);
	const programType = challenge.programType || 'general';

	const activeGoals = await Goal.find({
		userId: challenge.userId,
		isCompleted: false,
		programType,
	});

	let targetGoal = null;
	if (inferredGoalType) {
		targetGoal = activeGoals.find((g) => g.goalType === inferredGoalType) || null;
	}
	if (!targetGoal) {
		targetGoal = activeGoals[0] || null;
	}

	if (!targetGoal) {
		const fallbackGoals = await Goal.find({
			userId: challenge.userId,
			isCompleted: false,
			programType: 'general',
		});
		if (inferredGoalType) {
			targetGoal = fallbackGoals.find((g) => g.goalType === inferredGoalType) || null;
		}
		if (!targetGoal) targetGoal = fallbackGoals[0] || null;
	}

	if (!targetGoal) return;

	const nextCurrent = Math.max(0, Math.min(targetGoal.targetValue, (targetGoal.currentValue || 0) + direction));
	targetGoal.currentValue = nextCurrent;
	targetGoal.isCompleted = nextCurrent >= targetGoal.targetValue;
	targetGoal.completedAt = targetGoal.isCompleted ? (targetGoal.completedAt || new Date()) : null;
	targetGoal.updatedAt = new Date();
	await targetGoal.save();
};

router.get('/', async (req, res) => {
	try {
		const { userId, programType, challengeType, isCompleted } = req.query;
		const filter = {};
		if (userId) filter.userId = userId;
		if (programType && programType !== 'all') filter.programType = programType;
		if (challengeType) filter.challengeType = challengeType;
		if (typeof isCompleted !== 'undefined') filter.isCompleted = isCompleted === 'true';

		const challenges = await Challenge.find(filter).sort({ createdAt: -1 });
		return res.json(challenges);
	} catch (error) {
		return res.status(500).json({ error: 'Failed to fetch challenges.' });
	}
});

router.post('/', async (req, res) => {
	try {
		const challenge = await Challenge.create(req.body);
		return res.status(201).json(challenge);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
});

router.patch('/:id', async (req, res) => {
	try {
		const existing = await Challenge.findOne({ id: req.params.id });
		if (!existing) return res.status(404).json({ error: 'Challenge not found.' });

		const clampedProgress = typeof req.body.progress === 'number'
			? Math.max(0, Math.min(100, Math.round(req.body.progress)))
			: existing.progress;
		const explicitCompleted = typeof req.body.isCompleted === 'boolean'
			? req.body.isCompleted
			: null;
		const isCompleted = explicitCompleted === null ? clampedProgress >= 100 : explicitCompleted;

		const updates = {
			...req.body,
			progress: clampedProgress,
			isCompleted,
			completedAt: isCompleted ? (existing.completedAt || new Date()) : null,
			updatedAt: new Date(),
		};

		const challenge = await Challenge.findOneAndUpdate(
			{ id: req.params.id },
			updates,
			{ new: true }
		);
		if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });

		if (!existing.isCompleted && challenge.isCompleted) {
			await updateGoalFromChallengeTransition(challenge, 1);
		} else if (existing.isCompleted && !challenge.isCompleted) {
			await updateGoalFromChallengeTransition(challenge, -1);
		}

		return res.json(challenge);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
});

router.patch('/:id/complete', async (req, res) => {
	try {
		const existing = await Challenge.findOne({ id: req.params.id });
		if (!existing) return res.status(404).json({ error: 'Challenge not found.' });

		const challenge = await Challenge.findOneAndUpdate(
			{ id: req.params.id },
			{ isCompleted: true, progress: 100, completedAt: new Date(), updatedAt: new Date() },
			{ new: true }
		);
		if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });

		if (!existing.isCompleted && challenge.isCompleted) {
			await updateGoalFromChallengeTransition(challenge, 1);
		}

		return res.json(challenge);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
});

router.delete('/:id', async (req, res) => {
	try {
		const deleted = await Challenge.findOneAndDelete({ id: req.params.id });
		if (!deleted) return res.status(404).json({ error: 'Challenge not found.' });
		return res.json({ success: true });
	} catch (error) {
		return res.status(500).json({ error: 'Failed to delete challenge.' });
	}
});

module.exports = router;
