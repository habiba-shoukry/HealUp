# Health & Fitness Tracker Application

A responsive web application for tracking health metrics, activities, food intake, challenges, and avatar customization.

## 📋 Table of Contents
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Available Pages](#available-pages)
- [Development](#development)

---

## 🛠 Tech Stack

### Frontend
- **React** 19.0.0
- **React Router DOM** 7.5.1
- **Recharts** 3.6.0 (for charts and visualizations)
- **Tailwind CSS** 3.4.17
- **Axios** 1.8.4

### Backend
- **Node.js** with Express.js
- **MongoDB** (via Mongoose)
- **Mongoose** (ODM for MongoDB)
- **Dotenv** for environment variables
- **CORS** for cross-origin requests

---

## 📂 Project Structure

```
HealUp/
├── frontend/                        # React frontend application
│   ├── src/
│   │   ├── App.js                  # Main app with routes
│   │   ├── index.js                # Entry point
│   │   ├── styles.css              # Global CSS
│   │   ├── components/
│   │   │   ├── Layout.js           # Sidebar navigation
│   │   │   ├── ChatboxButton.js    # Chat button
│   │   │   └── ui/                 # Shadcn UI components
│   │   ├── hooks/                  # React hooks
│   │   ├── lib/                    # Utility functions
│   │   ├── pages/                  # Page components
│   │   │   ├── Dashboard.js
│   │   │   ├── ProgramAvatar.js
│   │   │   ├── Challenges.js
│   │   │   ├── GoalsProgress.js
│   │   │   ├── ActivityFoodLog.js
│   │   │   ├── Notifications.js
│   │   │   └── Chatbot.js
│   │   └── styles/                 # Component-specific CSS
│   ├── public/                      # Static assets
│   ├── package.json                # Frontend dependencies
│   └── .env                        # Frontend environment variables
│
└── backend/                        # Node.js/Express backend
    ├── server.js                   # Main Express application
    ├── package.json                # Node.js dependencies
    ├── .env                        # Backend environment variables
    ├── config/
    │   └── database.js             # MongoDB connection setup
    ├── models/                     # Mongoose data models
    │   ├── User.js                 # User model
    │   ├── UserStats.js            # User statistics model
    │   ├── Quest.js                # Quest model
    │   ├── Reward.js               # Reward model
    │   └── HealthLog.js            # Health metrics logging model
    ├── controllers/                # Request handlers
    │   └── userController.js       # User-related handlers
    ├── routes/                     # API route definitions
    ├── middleware/                 # Custom middleware
    └── utils/                      # Utility functions
```

---

## ✅ Prerequisites

Before running the application, ensure you have:

- **Node.js** (v16 or higher)
- **npm** (v7 or higher) - comes with Node.js
- **MongoDB** (running locally or remote Atlas connection)
- **Git** for version control

---

## 📦 Installation

### 1. Clone/Access the Project

```bash
cd HealUp
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../backend
npm install
```

---

## 🚀 Running the Application

### Option 1: Run Both Frontend & Backend Separately

#### Start Backend Server

```bash
cd backend
npm start
```

The backend will be available at: `http://localhost:8001`

**Note:** Make sure MongoDB is running and `.env` file is configured with `MONGO_URL`

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
# or
npm start
```

The frontend will automatically open at: `http://localhost:3000` (or the configured port)

---

### Option 2: Run in Development Mode (with auto-reload)

#### Backend (with Nodemon)

```bash
cd backend
npm run dev
```

#### Frontend

```bash
cd frontend
npm run dev
```

---

## 🔑 Environment Variables

### Frontend Environment (`frontend/.env`)

```env
REACT_APP_BACKEND_URL=http://localhost:8001/api
```

- **REACT_APP_BACKEND_URL**: The URL where your backend API is hosted (default: local development)

### Backend Environment (`backend/.env`)

```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/health_tracker
PORT=8001
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

- **MONGO_URL**: MongoDB Atlas connection string or local MongoDB URI
- **PORT**: Backend server port (default: 8001)
- **NODE_ENV**: Environment mode (development/production)
- **CORS_ORIGINS**: Comma-separated list of allowed frontend URLs
- **JWT_SECRET**: Secret key for JWT token signing (authentication)
- **JWT_EXPIRE**: JWT token expiration time

⚠️ **Important**: Never commit `.env` files to git. Use `.env.example` instead.

---

## 📄 Available Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Main page with avatar, health stats, HP/Energy/Discipline bars |
| Program & Avatar | `/program` | Avatar customization (Face, Hair, Skin, Hair Color) |
| Challenges | `/challenges` | Daily and weekly challenges with progress tracking |
| Goals & Progress | `/goals` | Rewards, XP/EG/Dp tracking |
| Activity & Food Log | `/activity-food` | Log activities and food intake with charts |
| Notifications | `/notifications` | View notifications and health reports |
| Chatbot | `/chatbot` | Chat interface (placeholder) |

---

## 🛠 Development

### Backend Development

#### Run Development Server with Auto-Reload

```bash
cd backend
npm run dev
```

The server will automatically restart when you modify files.

#### Test Database Connection

```bash
curl http://localhost:8001/api/health
```

Expected response:
```json
{
  "server": "running",
  "database": "connected",
  "timestamp": "2026-01-30T12:00:00Z"
}
```

#### Database Models

The backend includes the following MongoDB collections:

| Model | File | Description |
|-------|------|-------------|
| User | `models/User.js` | User accounts with authentication |
| UserStats | `models/UserStats.js` | User statistics (XP, Energy, Discipline, HP, Level) |
| Quest | `models/Quest.js` | Daily/Weekly quests and challenges |
| Reward | `models/Reward.js` | Unlockable rewards and badges |
| HealthLog | `models/HealthLog.js` | Health metrics logging (heart rate, sleep, steps, etc.) |

### Frontend Development

#### Run Development Server

```bash
cd frontend
npm run dev
```

The app will automatically reload when you make changes to the code.

#### Build for Production

```bash
cd frontend
npm run build
```

Creates an optimized production build in the `build/` folder.

#### Run Tests

```bash
cd /app/frontend
yarn test
```

---

### Backend Development

#### Run with Hot Reload

```bash
cd /app/backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The `--reload` flag enables auto-restart on code changes.

#### View API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8001/docs`
- **ReDoc**: `http://localhost:8001/redoc`

---

## 📝 Adding Content

All empty content boxes in the application are marked with:

```jsx
{/* Content to be added */}
```

Search for this comment in any page file to find areas that need to be populated with:
- Avatar images
- Chart data
- Real health metrics
- Form submission handlers

---

## 🎨 Styling

All styles are in a single external CSS file:
- **Location**: `/app/frontend/src/styles.css`
- **No inline styles** - all styling is centralized
- **Responsive design** included for desktop, tablet, and mobile

### Color Scheme
- Sidebar: `#1e3a52` (dark blue)
- Background: `#c5d5db` (light gray)
- Cards: `#ffffff` (white)
- Content boxes: `#475f73` (slate blue)

---

## 🐛 Troubleshooting

### Frontend not starting?
```bash
cd /app/frontend
rm -rf node_modules
yarn install
yarn start
```

### Backend not starting?
```bash
cd /app/backend
pip install -r requirements.txt --force-reinstall
python -m uvicorn server:app --reload
```

### Port already in use?
```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 8001 (backend)
lsof -ti:8001 | xargs kill -9
```

### MongoDB connection issues?
Check if MongoDB is running:
```bash
sudo systemctl status mongodb
# or
ps aux | grep mongo
```

---

## 📚 Additional Documentation

- **File Structure Guide**: See `frontend/FILE_STRUCTURE.md`
- **Quick Reference**: See `frontend/QUICK_GUIDE.md`

---

## 🤝 Contributing

When adding new features:

1. Create new components in `/app/frontend/src/pages/` or `/app/frontend/src/components/`
2. Add routes in `/app/frontend/src/App.js`
3. Update navigation in `/app/frontend/src/components/Layout.js`
4. Add styles to `/app/frontend/src/styles.css`

---

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review the API docs at `http://localhost:8001/docs`
- Check browser console for frontend errors
- Check backend logs for API errors

---

**Happy Coding! 🚀**
