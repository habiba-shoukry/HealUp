const UserStats = require('../models/UserStats');

const clamp = (value, min = 0, max = Number.MAX_SAFE_INTEGER) => Math.max(min, Math.min(max, value));

// GET /api/stats/:userId
exports.getStats = async (req, res) => {
    try {
        const stats = await UserStats.findOne({ userId: req.params.userId });
        if (!stats) {
            return res.status(404).json({ error: 'Stats not found.' });
        }
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
};

// PATCH /api/stats/:userId
exports.updateStats = async (req, res) => {
    try {
        const userId = req.params.userId;
        let stats = await UserStats.findOne({ userId });

        if (!stats) {
            stats = await UserStats.create({ userId });
        }

        const {
            // Absolute updates
            hp,
            totalXp,
            coins,
            totalEnergy,
            totalDiscipline,
            totalActivitiesLogged,
            totalCaloriesBurned,
            totalDistance,
            dayStreak,
            bestStreak,
            streakLastCompletedDate,
            streakTodayDone,

            // Delta updates
            hpDelta = 0,
            xpDelta = 0,
            coinsDelta = 0,
            energyDelta = 0,
            disciplineDelta = 0,
            activitiesDelta = 0,
            caloriesDelta = 0,
            distanceDelta = 0,
        } = req.body || {};

        // Apply absolute values if present
        if (typeof hp === 'number') stats.hp = clamp(Math.round(hp), 0, 100);
        if (typeof totalXp === 'number') stats.totalXp = clamp(Math.round(totalXp), 0);
        if (typeof coins === 'number') stats.coins = clamp(Math.round(coins), 0);
        if (typeof totalEnergy === 'number') stats.totalEnergy = clamp(Math.round(totalEnergy), 0, 100);
        if (typeof totalDiscipline === 'number') stats.totalDiscipline = clamp(Math.round(totalDiscipline), 0, 100);
        if (typeof totalActivitiesLogged === 'number') stats.totalActivitiesLogged = clamp(Math.round(totalActivitiesLogged), 0);
        if (typeof totalCaloriesBurned === 'number') stats.totalCaloriesBurned = clamp(Math.round(totalCaloriesBurned), 0);
        if (typeof totalDistance === 'number') stats.totalDistance = clamp(Number(totalDistance), 0);
        if (typeof dayStreak === 'number') stats.dayStreak = clamp(Math.round(dayStreak), 0);
        if (typeof bestStreak === 'number') stats.bestStreak = clamp(Math.round(bestStreak), 0);
        if (typeof streakLastCompletedDate === 'string' || streakLastCompletedDate === null) stats.streakLastCompletedDate = streakLastCompletedDate;
        if (typeof streakTodayDone === 'boolean') stats.streakTodayDone = streakTodayDone;

        // Apply deltas
        stats.hp = clamp(Math.round(stats.hp + hpDelta), 0, 100);
        stats.totalXp = clamp(Math.round(stats.totalXp + xpDelta), 0);
        stats.coins = clamp(Math.round((stats.coins || 0) + coinsDelta), 0);
        stats.totalEnergy = clamp(Math.round(stats.totalEnergy + energyDelta), 0, 100);
        stats.totalDiscipline = clamp(Math.round(stats.totalDiscipline + disciplineDelta), 0, 100);
        stats.totalActivitiesLogged = clamp(Math.round(stats.totalActivitiesLogged + activitiesDelta), 0);
        stats.totalCaloriesBurned = clamp(Math.round(stats.totalCaloriesBurned + caloriesDelta), 0);
        stats.totalDistance = clamp(Number(stats.totalDistance + distanceDelta), 0);

        stats.level = Math.max(1, Math.floor(stats.totalXp / 200) + 1);
        stats.bestStreak = Math.max(stats.bestStreak || 0, stats.dayStreak || 0);
        stats.updatedAt = new Date();

        await stats.save();
        return res.json(stats);
    } catch (error) {
        return res.status(500).json({ error: 'Server error. Please try again.' });
    }
};




exports.updateRewards = async (req, res) => {
    try {
        const { userId, xp, coins, energy, discipline, hp } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Find the user's stats document (or create one if missing)
        let stats = await UserStats.findOne({ userId: userId });
        if (!stats) {
            stats = await UserStats.create({ userId });
        }

        // Add the rewards and use the 'clamp' helper to keep them within boundaries
        // This prevents stats from dropping below 0 or going above 100!
        stats.totalXp = clamp(stats.totalXp + (xp || 0), 0);
        stats.coins = clamp((stats.coins || 0) + (coins || 0), 0);
        
        stats.totalEnergy = clamp(stats.totalEnergy + (energy || 0), 0, 100);
        stats.totalDiscipline = clamp(stats.totalDiscipline + (discipline || 0), 0, 100);
        stats.hp = clamp(stats.hp + (hp || 0), 0, 100);

        // 🟢 Automatic Level-Up Logic
        // Every 200 XP grants 1 level. 
        stats.level = Math.max(1, Math.floor(stats.totalXp / 200) + 1);
        
        stats.updatedAt = new Date();

        await stats.save();

        res.status(200).json({ success: true, stats });
    } catch (error) {
        console.error("🔥 Error updating rewards:", error);
        res.status(500).json({ error: 'Server error while updating stats.' });
    }
};