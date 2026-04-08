const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');
require('dotenv').config();
require('./utils/goalScheduler');

// Initialise both database connections
const { userDB, activityDB } = require('./config/database');

const app = express();
const server = http.createServer(app);

// ==================== CORS Configuration ====================
// This handles the string from your Render Environment Variables
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);
    
    const isExplicitlyAllowed = allowedOrigins.includes(origin);
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');

    if (isExplicitlyAllowed || isLocal) {
      return callback(null, true);
    } else {
      console.error(`CORS Blocked for: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}));

app.use(express.json());

// ==================== Socket.io Setup ====================
const io = socketIo(server, {
  cors: {
    // Socket.io needs the same allowed origins list
    origin: allowedOrigins.length > 0 ? allowedOrigins : "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'] // Improves stability on Render
});

// Pass 'io' to the socket manager
require('./sockets/socketManager')(io); 

// ==================== Models ====================
// Load models BEFORE routes to ensure they are registered
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
const UserQuest = require('./models/Challenges'); 
const UserStats = require('./models/UserStats');

// ==================== Routes ====================
app.get('/', (req, res) => {
  res.json({ message: 'HealUp API is running' });
});

// Standard Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/health-logs', require('./routes/healthLogs'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/report', require('./routes/report'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/avatars', require('./routes/avatars'));
app.use('/api/users', require('./routes/users'));

// Real-time Messages Route
const messageRoutes = require('./routes/messages')(io);
app.use('/api/messages', messageRoutes);

// ==================== Database Maintenance ====================
activityDB.once('open', async () => {
  try {
    const WeeklyHealthMetrics = activityDB.model('WeeklyHealthMetrics');
    await WeeklyHealthMetrics.collection.dropIndex('userId_1');
    console.log('Dropped legacy WeeklyHealthMetrics.userId_1 index');
  } catch (err) {
    // Index already gone or not found
  }
});

// Health Check for Render Deployment
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
// Daily Challenge Reset (00:00)
cron.schedule('0 0 * * *', async () => {
    try {
        await UserQuest.updateMany(
            { challengeType: 'daily' }, 
            { $set: { progress: 0, isCompleted: false } }
        );
        console.log(`Daily reset complete!`);
    } catch (error) {
        console.error("🔥 Error resetting daily challenges:", error);
    }
});

// Weekly Challenge Reset (Sunday 00:00)
cron.schedule('0 0 * * 0', async () => {
    try {
        await UserQuest.updateMany(
            { challengeType: 'weekly' }, 
            { $set: { progress: 0, currentProgress: 0, isCompleted: false } }
        );
        console.log("Weekly reset complete!");
    } catch (error) {
        console.error("🔥 Error resetting weekly challenges:", error);
    }
});

// Daily Streak Status Reset
cron.schedule('0 0 * * *', async () => {
  try {
    await UserStats.updateMany({}, { $set: { streakTodayDone: false } });
    console.log('Streak status reset.');
  } catch (err) {
    console.error('Failed to reset streak status:', err);
  }
});

// ==================== Start Server ====================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;