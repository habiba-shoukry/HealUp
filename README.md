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
- **FastAPI** 0.110.1
- **MongoDB** (via Motor & PyMongo)
- **Python** 3.x

---

## 📂 Project Structure

```
/app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── App.js           # Main app with routes
│   │   ├── index.js         # Entry point
│   │   ├── styles.css       # All CSS styles (external)
│   │   ├── components/
│   │   │   └── Layout.js    # Sidebar navigation
│   │   └── pages/           # All page components
│   │       ├── Dashboard.js
│   │       ├── ProgramAvatar.js
│   │       ├── Challenges.js
│   │       ├── GoalsProgress.js
│   │       ├── ActivityFoodLog.js
│   │       ├── Notifications.js
│   │       └── Chatbot.js
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── .env                 # Frontend environment variables
│
└── backend/                 # FastAPI backend
    ├── server.py            # Main FastAPI application
    ├── requirements.txt     # Python dependencies
    └── .env                 # Backend environment variables
```

---

## ✅ Prerequisites

Before running the application, ensure you have:

- **Node.js** (v16 or higher)
- **Yarn** (v1.22 or higher)
- **Python** (v3.8 or higher)
- **pip** (Python package manager)
- **MongoDB** (running locally or remote connection)

---

## 📦 Installation

### 1. Clone/Access the Project

```bash
cd /app
```

### 2. Install Frontend Dependencies

```bash
cd /app/frontend
yarn install
```

### 3. Install Backend Dependencies

```bash
cd /app/backend
pip install -r requirements.txt
```

---

## 🚀 Running the Application

### Option 1: Run Both Frontend & Backend Separately

#### Start Backend Server

```bash
cd /app/backend
python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The backend will be available at: `http://localhost:8001`

#### Start Frontend Development Server

```bash
cd /app/frontend
yarn start
```

The frontend will automatically open at: `http://localhost:3000`

---

### Option 2: Run with Supervisor (Production Mode)

If using supervisor (already configured in this environment):

```bash
# Check status
sudo supervisorctl status

# Restart services
sudo supervisorctl restart frontend
sudo supervisorctl restart backend

# Stop services
sudo supervisorctl stop frontend backend

# Start services
sudo supervisorctl start frontend backend
```

---

## 🔑 Environment Variables

### Frontend Environment (`/app/frontend/.env`)

```env
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

- **REACT_APP_BACKEND_URL**: The URL where your backend API is hosted
- ⚠️ **Important**: Do not modify this if running in production/deployment

### Backend Environment (`/app/backend/.env`)

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=health_tracker
```

- **MONGO_URL**: MongoDB connection string
- **DB_NAME**: Database name
- ⚠️ **Important**: Do not modify these in production

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

### Frontend Development

#### Run Development Server

```bash
cd /app/frontend
yarn start
```

The app will automatically reload when you make changes to the code.

#### Build for Production

```bash
cd /app/frontend
yarn build
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
