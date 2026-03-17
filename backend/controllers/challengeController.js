const WeeklyHealthMetrics = require('../models/WeeklyHealthMetrics'); // Import your table

// Inside your GET /api/challenges route:
exports.getUserChallenges = async (req, res) => {
    try {
        const userId = req.user.id; // Or req.query.userId depending on your setup
        
        // 1. Fetch the user's active challenges
        let activeChallenges = await UserQuest.find({ userId }).populate('questId');
        
        // 2. Fetch their health data for the week
        const weeklyData = await WeeklyHealthMetrics.findOne({ userId });

        if (weeklyData) {
            // 3. Loop through and calculate progress for AUTO weekly challenges
            for (let uQuest of activeChallenges) {
                const blueprint = uQuest.questId;
                
                if (blueprint.frequency === 'weekly' && blueprint.trackingType === 'auto' && !uQuest.isCompleted) {
                    let totalAmount = 0;

                    // Match the metricToTrack to the arrays in your WeeklyHealthMetrics table
                    switch(blueprint.metricToTrack) {
                        case 'distance_km':
                            totalAmount = weeklyData.distanceKm.reduce((a, b) => a + b, 0);
                            break;
                        case 'sleep_hours':
                            totalAmount = weeklyData.sleepHours.reduce((a, b) => a + b, 0);
                            break;
                        case 'calories':
                            totalAmount = weeklyData.caloriesBurned.reduce((a, b) => a + b, 0);
                            break;
                        case 'steps':
                            totalAmount = weeklyData.steps.reduce((a, b) => a + b, 0);
                            break;
                    }

                    // Calculate percentage (max 100)
                    const progressPct = Math.min(100, Math.floor((totalAmount / blueprint.targetValue) * 100));
                    
                    // Save the calculated progress to the database
                    uQuest.currentProgress = progressPct;
                    await uQuest.save();
                }
            }
        }

        // Send the freshly calculated challenges to the frontend
        res.status(200).json(activeChallenges);

    } catch (error) {
        console.error("🔥 Error fetching challenges:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};