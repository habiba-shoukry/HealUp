const updateGoalProgress = async (userId, activityType, amount) => {
    // find the active goal for this user/type
    const goal = await Goal.findOne({ userId, goalType: activityType, isCompleted: false });
    
    if (goal) {
        goal.currentValue += amount;
        
        // checks for completion
        if (goal.currentValue >= goal.targetValue) {
            goal.isCompleted = true;
        }
        await goal.save();
    }
};

const updateDailyBehaviorStreak = async (userStats, dailyMetrics) => {
    const today = new Date().toISOString().split('T')[0];
    if (userStats.streakLastCompletedDate === today) return userStats;

    // defines "Success" based on the 24/7 synced metrics
    const metStepThreshold = dailyMetrics.steps >= 2500; 
    const metSleepThreshold = dailyMetrics.sleepHours >= 7;

    if (metStepThreshold || metSleepThreshold) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (userStats.streakLastCompletedDate === yesterdayStr) {
            userStats.dayStreak += 1;
        } else {
            userStats.dayStreak = 1;
        }

        userStats.streakLastCompletedDate = today;
        userStats.streakTodayDone = true;
        if (userStats.dayStreak > userStats.bestStreak) userStats.bestStreak = userStats.dayStreak;

        await userStats.save();
    }
};