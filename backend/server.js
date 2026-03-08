const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

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

const chatbotRoutes = require("./routes/chatbot");
app.use("/api", chatbotRoutes);

// Import models (registers them against their respective connections)  
require('./models/User');
require('./models/UserStats');
require('./models/Quest');
require('./models/Reward');
require('./models/HealthLog');
require('./models/Goals');
require('./models/FoodIntake');

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

// ==================== Start Server ====================
const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
