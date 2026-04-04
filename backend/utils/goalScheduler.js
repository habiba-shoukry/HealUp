const cron = require('node-cron');
const Goal = require('../models/Goals');
const HealthLog = require('../models/HealthLog');
const UserStats = require('../models/UserStats');
const Notification = require('../models/Notification');
const createNotification = require('./createNotification');

//Checks if notification already exists today
const existsToday = async (userId, title, type) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const existing = await Notification.findOne({
    userId,
    type,
    title,
    createdAt: { $gte: todayStart }
  });
  return !!existing;
};

// ==================== MISSED GOALS ====================
// Runs every day at 11:59 PM
cron.schedule('59 23 * * *', async () => {
  console.log("Running missed goals check...");

  try {
    const goals = await Goal.find({ isCompleted: false });

    for (const goal of goals) {
      const current = Number(goal.currentValue) || 0;
      const target = Number(goal.targetValue) || 0;

      if (current < target) {
        // Check if a missed goal notification already exists for this goal today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const existingNotification = await Notification.findOne({
          userId: goal.userId,
          type: "missed_goal",
          title: `You missed your goal: ${goal.title}. Try again tomorrow!`,
          createdAt: { $gte: todayStart }
        });

        if (!existingNotification) {
          await createNotification({
            userId: goal.userId,
            type: "missed_goal",
            title: "Goal Missed",
            desc: `You missed your goal: ${goal.title}. Try again tomorrow!`,
            icon: "mental-pressure",  
            tag: "Goals"
          });
        }
      }
    }

    console.log("Missed goals processed");
  } catch (err) {
    console.error("Scheduler error:", err);
  }
});

// ==================== HEALTH EVENTS ====================
// Check for unusual health metrics every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log("Checking health events...");

  try {
    const recentLogs = await HealthLog.find({
      timestamp: { $gte: new Date(Date.now() - 21600000) } // last 6 hours
    }).sort({ timestamp: -1 });

    for (const log of recentLogs) {
      // High heart rate alert
      if (log.heartRate && log.heartRate > 100) {
        const title = `Heart Rate Alert`;
        if (!await existsToday(log.userId, title, "health_event")) {
          await createNotification({
            userId: log.userId,
            type: "health_event",
            title,
            desc: `Your heart rate was ${log.heartRate} bpm - higher than normal`,
            icon: "heart (2)",  
            tag: "Health"
          });
        }
      }

      // Low sleep alert
      if (log.sleepDuration && log.sleepDuration < 6) {
        const title = "Low Sleep Detected";
        if (!await existsToday(log.userId, title, "health_event")) {
          await createNotification({
            userId: log.userId,
            type: "health_event",
            title,
            desc: `You only slept ${log.sleepDuration} hours last night`,
            icon: "zzz",  
            tag: "Health"
          });
        }
      }

      // High stress alert
      if (log.stressLevel && log.stressLevel > 75) {
        const title = "High Stress Alert";
        if (!await existsToday(log.userId, title, "health_event")) {
          await createNotification({
            userId: log.userId,
            type: "health_event",
            title,
            desc: `Your stress level is elevated (${log.stressLevel}%)`,
            icon: "stress",  
            tag: "Health"
          });
        }
      }
    }

    console.log("Health events processed");
  } catch (err) {
    console.error("Scheduler error:", err);
  }
});

// ==================== SUGGESTIONS ====================
// Run every morning at 8 AM
cron.schedule('0 8 * * *', async () => {
  console.log("Generating suggestions...");

  try {
    const stats = await UserStats.find();

    for (const stat of stats) {
      const suggestions = [];

      // Low activity suggestion
      if (stat.totalSteps && stat.totalSteps < 5000) {
        suggestions.push({
          type: "suggestion",
          title: "Get Moving!",
          desc: "Try to take a short walk today. Even 10 minutes helps!",
          icon: "step"  
        });
      }

      // Low energy suggestion
      if (stat.totalEnergy && stat.totalEnergy < 40) {
        suggestions.push({
          type: "suggestion",
          title: "Rest & Recover",
          desc: "Your energy is low. Consider a rest day or light activity",
          icon: "mental-pressure"  
        });
      }

      for (const suggestion of suggestions) {
        if (!await existsToday(stat.userId, suggestion.title, "suggestion")) {
          await createNotification({
            userId: stat.userId,
            type: suggestion.type,
            title: suggestion.title,
            desc: suggestion.desc,
            icon: suggestion.icon,
            tag: "Suggestions"
          });
        }
      }
    }

    console.log("Suggestions processed");
  } catch (err) {
    console.error("Scheduler error:", err);
  }
});

// ==================== RECOMMENDATIONS ====================
// Run every evening at 7 PM
// TODO: Replace with actual AI recommendations when implemented
cron.schedule('0 19 * * *', async () => {
  console.log("Generating recommendations...");

  try {
    const stats = await UserStats.find();

    for (const stat of stats) {
      const recommendations = [];

      // Sleep recommendation
      if (stat.hp && stat.hp < 50) {
        recommendations.push({
          type: "recommendation",
          title: "Sleep Optimization",
          desc: "Try sleeping 30 minutes earlier for better recovery",
          icon: "zzz"  
        });
      }

      // Discipline recommendation
      if (stat.totalDiscipline && stat.totalDiscipline < 40) {
        recommendations.push({
          type: "recommendation",
          title: "Build Consistency",
          desc: "Set smaller daily goals to build discipline gradually",
          icon: "mental-pressure"  
        });
      }

      // Recovery recommendation
      if (stat.totalEnergy && stat.totalEnergy > 80 && stat.hp && stat.hp < 60) {
        recommendations.push({
          type: "recommendation",
          title: "Balance Your Training",
          desc: "High energy but low HP - consider active recovery",
          icon: "burn"  
        });
      }

      for (const rec of recommendations) {
        if (!await existsToday(stat.userId, rec.title, "recommendation")) {
          await createNotification({
            userId: stat.userId,
            type: rec.type,
            title: rec.title,
            desc: rec.desc,
            icon: rec.icon,
            tag: "Recommendations"
          });
        }
      }
    }

    console.log("Recommendations processed");
  } catch (err) {
    console.error("Scheduler error:", err);
  }
});

//  MOTIVATIONAL FEEDBACK FROM DOC (TODO)

// For now, this is commented out until the feature is implemented
/*
cron.schedule('0 14 * * *', async () => {
  console.log("motivational messages from doc");

  try {
    const stats = await UserStats.find();

    const motivationalMessages = [

    ];

    for (const stat of stats) {
      // Check if already sent motivation today
      if (await existsToday(stat.userId, "Daily Motivation", "motivation")) {
        continue;
      }

      await createNotification({
        userId: stat.userId,
        type: "motivation",
        title: "Daily Motivation",
        desc: ,
        icon: "burn",
        tag: "Motivation"
      });
    }

    console.log("Motivational messages processed");
  } catch (err) {
    console.error("Scheduler error:", err);
  }
});
*/
