const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ==================== Middleware ====================
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// ==================== Database Connection ====================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ==================== Test Routes ====================
app.get('/', (req, res) => {
  res.json({ message: 'HealUp API is running' });
});

// Import models
const User = require('./models/User');
const UserStats = require('./models/UserStats');
const Quest = require('./models/Quest');
const Reward = require('./models/Reward');
const HealthLog = require('./models/HealthLog');

// Database status check
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    server: 'running',
    database: mongoStatus,
    timestamp: new Date().toISOString()
  });
});
// Development test routes removed. Keep tests in separate test files (e.g. Jest + Supertest).

// ==================== Start Server ====================
const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;