const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./utils/goalScheduler');

// Initialise both database connections
const { userDB, activityDB } = require('./config/database');

const app = express();

// ==================== Middleware ====================
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// ==================== Routes ====================
app.get('/', (req, res) => {
  res.json({ message: 'HealUp API is running' });
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const statsRoutes = require('./routes/stats');
app.use('/api/stats', statsRoutes);

const goalsRoutes = require('./routes/goals');
app.use('/api/goals', goalsRoutes);

const challengesRoutes = require('./routes/quests');
app.use('/api/challenges', challengesRoutes);

const healthLogsRoutes = require('./routes/healthLogs');
app.use('/api/health-logs', healthLogsRoutes);

const metricsRoutes = require('./routes/metrics');
app.use('/api/metrics', metricsRoutes);

const reportRoutes = require('./routes/report');
app.use('/api/report', reportRoutes);

const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);
const avatarRoutes = require('./routes/avatars');
app.use('/api/avatars', avatarRoutes);

// Import models (registers them against their respective connections)
require('./models/User');
require('./models/UserStats');
require('./models/Quest');
require('./models/Reward');
require('./models/HealthLog');
require('./models/Goals');
require('./models/FoodIntake');
require('./models/WeeklyHealthMetrics');
require('./models/Notification');
require('./models/AvatarItem');
require('./models/UserAvatarSelection'); // Registers UserAvatarProfile

// Drop legacy single-field unique index on userId if it still exists, so the new
// compound (userId, deviceId) index can allow multiple docs per user.
activityDB.once('open', async () => {
  try {
    const WeeklyHealthMetrics = activityDB.model('WeeklyHealthMetrics');
    await WeeklyHealthMetrics.collection.dropIndex('userId_1');
    console.log('Dropped legacy WeeklyHealthMetrics.userId_1 index');
  } catch {
    // Index already gone — nothing to do.
  }
});

// Database status check
app.get('/api/health', (req, res) => {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    server: 'running',
    userDB: states[userDB.readyState] || 'unknown',
    activityDB: states[activityDB.readyState] || 'unknown',
    timestamp: new Date().toISOString()
  });
});


const cron = require('node-cron');
const UserQuest = require('./models/Quest'); // 👉 Update this if your model is named differently (e.g., Challenge)

// 🕛 The text '0 0 * * *' tells the server: "Run this exactly at 00:00 (Midnight) every single day"
cron.schedule('* * * * *', async () => {
    console.log("🕛 Midnight Reset: Wiping daily challenge progress...");
    try {
        // This searches your database for all daily challenges and resets their progress to 0
        // 👉 Note: If your database uses a different field name to identify dailies, update `challengeType: 'daily'` to match!
        await UserQuest.updateMany(
            { challengeType: 'daily' }, 
            { 
                $set: { 
                    progress: 0, 
                    currentProgress: 0, 
                    isCompleted: false 
                } 
            }
        );
        console.log("✅ Daily challenges successfully reset for the new day!");
    } catch (error) {
        console.error("🔥 Error resetting daily challenges:", error);
    }
});


// 🕛 ALARM 1: The Daily Reset (Runs at Midnight every single day)
cron.schedule('* * * * *', async () => {
    console.log("🕛 Daily Reset: Wiping daily challenge progress...");
    try {
        await UserQuest.updateMany(
            { challengeType: 'daily' }, 
            { 
                $set: { 
                    progress: 0, 
                    currentProgress: 0, 
                    isCompleted: false 
                } 
            }
        );
        console.log("✅ Daily checkboxes have been unchecked for the new day!");
    } catch (error) {
        console.error("🔥 Error resetting daily challenges:", error);
    }
});

// 📅 ALARM 2: The Weekly Reset (Runs at Midnight on Sunday)
// The text '0 0 * * 0' means: Minute 0, Hour 0, Any Day, Any Month, Day of Week 0 (Sunday)
cron.schedule('* * * * *', async () => {
    console.log("📅 Weekly Reset: Emptying weekly progress bars...");
    try {
        await UserQuest.updateMany(
            { challengeType: 'weekly' }, 
            { 
                $set: { 
                    progress: 0, 
                    currentProgress: 0, 
                    isCompleted: false 
                } 
            }
        );
        console.log("✅ Weekly progress bars have been reset to 0% for the new week!");
    } catch (error) {
        console.error("🔥 Error resetting weekly challenges:", error);
    }
});
// ==================== Start Server ====================
const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
