import React, { useState, useEffect, useCallback } from "react";
import "./styles.css";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

// Components
import Layout from "./components/Layout";
import ChatboxButton from "./components/ChatboxButton";

// Pages
import Dashboard from "./pages/Dashboard";
import ProgramAvatar from "./pages/ProgramAvatar";
import Challenges from "./pages/Challenges";
import GoalsProgress from "./pages/GoalsProgress";
import ActivityFoodLog from "./pages/ActivityFoodLog";
import Notifications from "./pages/Notifications";
import Chatbot from "./pages/Chatbot";
import Welcome from "./pages/Welcome";
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import DoctorDashboard from "./pages/DoctorDashboard";
import Reports from "./pages/Reports";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import socket from './socket';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

const DEFAULT_SELECTIONS = {
  skin: 's1', hairStyle: 'hs1', hairColor: 'hc1',
  animalEars: 'ae1', armour: 'ar1', pets: null,
};

const toFrontendSelections = (backendSelections = {}) => ({
  ...DEFAULT_SELECTIONS,
  ...backendSelections,
  hairStyle: backendSelections.hairStyle
    ? backendSelections.hairStyle.replace(/^h(\d+)$/, 'hs$1')
    : DEFAULT_SELECTIONS.hairStyle,
  animalEars: backendSelections.animalEars
    ? backendSelections.animalEars.replace(/^e(\d+)$/, 'ae$1')
    : DEFAULT_SELECTIONS.animalEars,
  pets: backendSelections.pet ?? backendSelections.pets ?? null,
});

const toBackendSelections = (frontendSelections = {}) => ({
  skin: frontendSelections.skin ?? DEFAULT_SELECTIONS.skin,
  hairStyle: (frontendSelections.hairStyle ?? DEFAULT_SELECTIONS.hairStyle).replace(/^hs(\d+)$/, 'h$1'),
  hairColor: frontendSelections.hairColor ?? DEFAULT_SELECTIONS.hairColor,
  animalEars: (frontendSelections.animalEars ?? DEFAULT_SELECTIONS.animalEars).replace(/^ae(\d+)$/, 'e$1'),
  armour: frontendSelections.armour ?? DEFAULT_SELECTIONS.armour,
  pet: frontendSelections.pets ?? null,
});

const DECAY_PER_DAY = { hp: 8, energy: 10, discipline: 6 };

const load = (key, fallback) => {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
  catch { return fallback; }
};
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { }
};

const loadSelections  = () => load('healup_avatar_selections', DEFAULT_SELECTIONS);
const loadAvatarName  = () => { try { return localStorage.getItem('healup_avatar_name') || ''; } catch { return ''; } };
const loadStats       = () => {
  const raw = load('healup_stats', { xp: 0, coins: 0 });
  return { xp: raw?.xp ?? raw?.totalXp ?? 0, coins: raw?.coins ?? 0 };
};
const loadBars        = () => load('healup_bars', { hp: 65, energy: 80, discipline: 45 });
const loadStreak      = () => load('healup_streak', { count: 0, lastCompletedDate: null, todayDone: false });
const loadLastActive  = () => load('healup_last_active', { date: null });

const todayStr    = () => new Date().toISOString().slice(0, 10);
const daysBetween = (dateStrA, dateStrB) => {
  if (!dateStrA || !dateStrB) return 0;
  const a = new Date(dateStrA), b = new Date(dateStrB);
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
};
const clamp = (val, min = 0, max = 100) => Math.max(min, Math.min(max, val));

function App() {
  document.title = "HealUp! - Your Personal Health Companion";
  const location = useLocation();

  const [avatarSelections, setAvatarSelections] = useState(loadSelections);
  const [avatarName,       setAvatarName]        = useState(loadAvatarName);
  const [stats,            setStats]             = useState(loadStats);
  const [activeDevice,     setActiveDevice]      = useState(() => localStorage.getItem('healup_active_device') || 'apple');
  const [bars,             setBars]              = useState(() => load('healup_bars', { hp: 65, energy: 80, discipline: 45 }));
  const [streak,           setStreak]            = useState(loadStreak);
  const [avatarSyncReady,  setAvatarSyncReady]   = useState(false);
  const [sessionHydrated,  setSessionHydrated]   = useState(false);

  const getCurrentUserId = useCallback(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      return user?.id || user?._id || null;
    } catch { return null; }
  }, []);

  const patchUserStats = useCallback(async (payload) => {
    const userId = getCurrentUserId();
    if (!userId) return null;
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token') || storedUser.token;

    try {
      const res = await fetch(`${BASE_URL}/api/stats/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  }, [getCurrentUserId]);

  // ── 1. Unified Session Hydration (Stats + Avatar) ──
  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      setSessionHydrated(true);
      setAvatarSyncReady(true);
      return;
    }

    let cancelled = false;
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token') || storedUser.token;

    const hydrate = async () => {
      try {
        // Fetch Stats
        const statsRes = await fetch(`${BASE_URL}/api/stats/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        
        if (!cancelled && statsData && !statsData.error) {
          const mappedStats  = { xp: statsData.totalXp ?? 0, coins: statsData.coins ?? 0 };
          const mappedBars   = { hp: statsData.hp ?? 100, energy: statsData.totalEnergy ?? 0, discipline: statsData.totalDiscipline ?? 0 };
          const mappedStreak = { count: statsData.dayStreak ?? 0, lastCompletedDate: statsData.streakLastCompletedDate || null, todayDone: Boolean(statsData.streakTodayDone) };
          
          setStats(mappedStats);
          setBars(mappedBars);
          setStreak(mappedStreak);
          save('healup_stats',  mappedStats);
          save('healup_bars',   mappedBars);
          save('healup_streak', mappedStreak);
        }

        // Fetch Avatar
        const avatarRes = await fetch(`${BASE_URL}/api/avatars/profile/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const avatarData = await avatarRes.json();
        
        if (!cancelled && avatarData?.data?.selections) {
          const mapped = toFrontendSelections(avatarData.data.selections);
          setAvatarSelections(mapped);
          save('healup_avatar_selections', mapped);
        }
      } catch (err) {
        console.error("Hydration failed:", err);
      } finally {
        if (!cancelled) {
          setAvatarSyncReady(true);
          setSessionHydrated(true);
        }
      }
    };

    hydrate();
    return () => { cancelled = true; };
  }, [getCurrentUserId]);

  // ── 2. Persist Avatar Selections ──
  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId || !avatarSyncReady || !sessionHydrated) return;

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token') || storedUser.token;

    const controller = new AbortController();
    const persistSelections = async () => {
      try {
        await fetch(`${BASE_URL}/api/avatars/profile/${userId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ selections: toBackendSelections(avatarSelections) }),
          signal: controller.signal,
        });
      } catch {}
    };
    persistSelections();
    return () => controller.abort();
  }, [avatarSelections, avatarSyncReady, sessionHydrated, getCurrentUserId]);

  // ── 3. Decay on inactivity ──
  useEffect(() => {
    const publicRoutes = ["/", "/login", "/signup", "/LogIn", "/SignUp"];
    if (publicRoutes.includes(location.pathname)) return;

    const lastActive = loadLastActive();
    const today = todayStr();
    if (lastActive.date && lastActive.date !== today) {
      const missedDays = daysBetween(lastActive.date, today);
      if (missedDays > 0) {
        const losses = {
          hp:         Math.min(40, DECAY_PER_DAY.hp         * missedDays),
          energy:     Math.min(50, DECAY_PER_DAY.energy     * missedDays),
          discipline: Math.min(30, DECAY_PER_DAY.discipline * missedDays),
        };
        setBars(prev => {
          const next = {
            hp:         clamp(prev.hp         - losses.hp),
            energy:     clamp(prev.energy     - losses.energy),
            discipline: clamp(prev.discipline - losses.discipline),
          };
          save('healup_bars', next);
          return next;
        });
      }
    }
    save('healup_last_active', { date: today });
  }, [location.pathname]);

  const handleChallengeComplete = useCallback((xpGain, coinGain, barEffects) => {
    const today = todayStr();
    let newStreak = streak;

    setStreak(prev => {
      let next;
      if (prev.lastCompletedDate === today) {
        next = prev;
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);
        const consecutive = prev.lastCompletedDate === yesterdayStr;
        next = { count: consecutive ? prev.count + 1 : 1, lastCompletedDate: today, todayDone: true };
      }
      save('healup_streak', next);
      newStreak = next;
      return next;
    });

    setStats(prev => {
      const next = { xp: Math.max(0, prev.xp + xpGain), coins: Math.max(0, prev.coins + coinGain) };
      save('healup_stats', next);
      return next;
    });

    if (barEffects) {
      setBars(prev => {
        const next = {
          hp:         clamp(prev.hp         + (barEffects.hp         || 0)),
          energy:     clamp(prev.energy     + (barEffects.energy     || 0)),
          discipline: clamp(prev.discipline + (barEffects.discipline || 0)),
        };
        save('healup_bars', next);
        return next;
      });
    }

    patchUserStats({
      dayStreak:               newStreak.count,
      bestStreak:              Math.max(streak.count || 0, newStreak.count || 0),
      streakLastCompletedDate: newStreak.lastCompletedDate || null,
      streakTodayDone:         Boolean(newStreak.todayDone),
    });

    return { finalXP: xpGain, finalCoins: coinGain, streakCount: newStreak.count };
  }, [streak, patchUserStats]);

  const handleSetSelections = (updater) => {
    setAvatarSelections(prev => {
      const next     = typeof updater === 'function' ? updater(prev) : updater;
      const safeNext = next || DEFAULT_SELECTIONS;
      save('healup_avatar_selections', safeNext);
      return safeNext;
    });
  };

  const publicRoutes = ["/", "/login", "/signup", "/LogIn", "/SignUp"];
  if (!sessionHydrated && !publicRoutes.includes(location.pathname)) {
    return <div className="page-container">Loading your account...</div>;
  }

  return (
    <>
      <Routes>
        <Route path="/"       element={<Welcome />} />
        <Route path="/LogIn"  element={<LogIn />} />
        <Route path="/SignUp" element={<SignUp />} />

        <Route element={
          <Layout stats={stats} streak={streak} onDeviceSwitch={(d) => setActiveDevice(d)}>
            <Outlet />
            <ChatboxButton />
          </Layout>
        }>
          <Route path="/dashboard" element={
            <Dashboard
              avatarSelections={avatarSelections}
              avatarName={avatarName}
              bars={bars}
              streak={streak}
              onChallengeComplete={handleChallengeComplete}
              activeDevice={activeDevice}
            />
          } />
          <Route path="/program" element={
            <ProgramAvatar
              avatarSelections={avatarSelections}
              setAvatarSelections={handleSetSelections}
              avatarName={avatarName}
              setAvatarName={(n) => { setAvatarName(n); localStorage.setItem('healup_avatar_name', n); }}
              stats={stats}
              setStats={setStats}
              patchUserStats={patchUserStats}
            />
          } />
          <Route path="/challenges" element={
            <Challenges
              onChallengeComplete={handleChallengeComplete}
              bars={bars}
              streak={streak}
            />
          } />
          <Route path="/goals"         element={<GoalsProgress bars={bars} onGoalComplete={handleChallengeComplete} activeDevice={activeDevice} />} />
          <Route path="/activity-food" element={<ActivityFoodLog onBadHabit={() => {}} />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/chatbot"       element={<Chatbot />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/patients"         element={<Patients />} />
          <Route path="/reports"          element={<Reports />} />
          <Route path="/patient-details"  element={<PatientDetail />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;