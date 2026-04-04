const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
require('./utils/goalScheduler');

// Initialise both database connections
const { userDB, activityDB } = require('./config/database');

const app = express();
const server = http.createServer(app);

// ==================== Middleware ====================
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const isExplicitlyAllowed = allowedOrigins.includes(origin);
    const isLocalDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
    const isLanDevOrigin = process.env.NODE_ENV !== 'production' && /^https?:\/\/(\d{1,3}\.){3}\d{1,3}(:\d+)?$/i.test(origin);

    if (isExplicitlyAllowed || isLocalDevOrigin || isLanDevOrigin) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());

// ==================== Socket & Server Setup ====================
// We define 'io' here so it exists BEFORE the routes below try to use it
app.use(cors({
  origin: "http://localhost:3000", 
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], 
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const io = socketIo(server, {
  cors: { 
    origin: "http://localhost:3000", // our React URL
    credentials: true 
  }
});

// Pass 'io' to the socket manager
require('./sockets/socketManager')(io); 

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

const challengesRoutes = require('./routes/challenges');
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

// NOW this line works because 'io' is initialized above
const messageRoutes = require('./routes/messages')(io);
app.use('/api/messages', messageRoutes);

// ==================== Models ====================
require('./models/User');
require('./models/UserStats');
require('./models/Reward');
require('./models/HealthLog');
require('./models/Goals');
require('./models/FoodIntake');
require('./models/WeeklyHealthMetrics');
require('./models/Notification');
require('./models/AvatarItem');
require('./models/UserAvatarSelection');

// Drop legacy single-field unique index
activityDB.once('open', async () => {
  try {
    const WeeklyHealthMetrics = activityDB.model('WeeklyHealthMetrics');
    await WeeklyHealthMetrics.collection.dropIndex('userId_1');
    console.log('Dropped legacy WeeklyHealthMetrics.userId_1 index');
  } catch {
    // Index already gone
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

// ==================== Cron Jobs ====================
const cron = require('node-cron');
const UserQuest = require('./models/Challenges'); 
const UserStats = require('./models/UserStats');

// Daily Challenge Reset
cron.schedule('0 0 * * *', async () => {
    console.log("Daily Reset: Wiping daily challenge progress...");
    try {
        const result = await UserQuest.updateMany(
            { challengeType: 'daily' }, 
            { $set: { progress: 0, isCompleted: false } }
        );
        console.log(`Daily reset complete! Modified ${result.modifiedCount} challenges.`);
    } catch (error) {
        console.error("🔥 Error resetting daily challenges:", error);
    }
});

// Weekly Challenge Reset
cron.schedule('0 0 * * 0', async () => {
    try {
        await UserQuest.updateMany(
            { challengeType: 'weekly' }, 
            { $set: { progress: 0, currentProgress: 0, isCompleted: false } }
        );
        console.log("Weekly progress bars reset!");
    } catch (error) {
        console.error("🔥 Error resetting weekly challenges:", error);
    }
});

// Daily Streak Reset
cron.schedule('0 0 * * *', async () => {
  console.log('Resetting daily streak status for all users...');
  try {
    await UserStats.updateMany({}, { $set: { streakTodayDone: false } });
  } catch (err) {
    console.error('Failed to reset streak status:', err);
  }
});

// ==================== Start Server ====================
const PORT = process.env.PORT || 8001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;