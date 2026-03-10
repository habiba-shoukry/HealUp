import React, { useState, useEffect, useCallback } from "react";
import "./styles.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ChatboxButton from "./components/ChatboxButton";
import Dashboard from "./pages/Dashboard";
import ProgramAvatar from "./pages/ProgramAvatar";
import Challenges from "./pages/Challenges";
import GoalsProgress from "./pages/GoalsProgress";
import ActivityFoodLog from "./pages/ActivityFoodLog";
import Notifications from "./pages/Notifications";
import Chatbot from "./pages/Chatbot";

const DEFAULT_SELECTIONS = {
  skin: 's1', hairStyle: 'hs1', hairColor: 'hc1',
  animalEars: 'ae1', armour: 'ar1', pets: null,
};

const DECAY_PER_DAY = { hp: 8, energy: 10, discipline: 6 };
const STREAK_BONUS_PER_DAY = 0.1;

const load = (key, fallback) => {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
  catch { return fallback; }
};
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

const loadSelections = () => load('healup_avatar_selections', DEFAULT_SELECTIONS);
const loadAvatarName = () => { try { return localStorage.getItem('healup_avatar_name') || ''; } catch { return ''; } };
const loadStats      = () => load('healup_stats', { xp: 0, coins: 0 });
const loadBars       = () => load('healup_bars',  { hp: 65, energy: 80, discipline: 45 });
const loadStreak     = () => load('healup_streak', { count: 0, lastCompletedDate: null, todayDone: false });
const loadLastActive = () => load('healup_last_active', { date: null });
const loadDailyReset = () => load('healup_daily_reset', { date: null });

const todayStr = () => new Date().toISOString().slice(0, 10);

const daysBetween = (dateStrA, dateStrB) => {
  if (!dateStrA || !dateStrB) return 0;
  const a = new Date(dateStrA), b = new Date(dateStrB);
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
};

const clamp = (val, min = 0, max = 100) => Math.max(min, Math.min(max, val));

function App() {
  document.title = "HealUp!- Your Personal Health Companion";
  const link = document.querySelector("link[rel='icon']") || document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = '/logo-transparent.png';
  document.head.appendChild(link);

  const [avatarSelections, setAvatarSelections] = useState(loadSelections);
  const [avatarName, setAvatarName]             = useState(loadAvatarName);
  const [stats, setStats]                       = useState(loadStats);
  const [bars, setBars]                         = useState(() => {
    const defaultBars = { hp: 65, energy: 80, discipline: 45 };
    const saved = load('healup_bars', defaultBars);
    return saved;
  });
  const [streak, setStreak]                     = useState(loadStreak);
  const [decayAlert, setDecayAlert]             = useState(null);
  const [dailyChallengesKey] = useState(() => {
    localStorage.removeItem('healup_daily_checked');
    return 'challenges';
  });

  useEffect(() => {
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

        setStreak(prev => {
          const streakBroken = missedDays >= 2 || !prev.todayDone;
          if (streakBroken && prev.count > 0) {
            const broken = { count: 0, lastCompletedDate: null, todayDone: false };
            save('healup_streak', broken);
            const streakPenalty = Math.min(20, prev.count * 2);
            setBars(b => {
              const penalised = {
                hp:         clamp(b.hp         - streakPenalty),
                energy:     clamp(b.energy     - streakPenalty),
                discipline: clamp(b.discipline - streakPenalty),
              };
              save('healup_bars', penalised);
              return penalised;
            });
            losses._streakBroken = prev.count;
            losses._streakPenalty = streakPenalty;
            return broken;
          }
          const carried = { ...prev, todayDone: false };
          save('healup_streak', carried);
          return carried;
        });

        setDecayAlert({ ...losses, missedDays });
      }
    }

    save('healup_last_active', { date: today });
  }, []);

  const handleBadHabit = useCallback((penalties) => {
    setBars(prev => {
      const next = {
        hp:         clamp(prev.hp         - (penalties.hp         || 0)),
        energy:     clamp(prev.energy     - (penalties.energy     || 0)),
        discipline: clamp(prev.discipline - (penalties.discipline || 0)),
      };
      save('healup_bars', next);
      return next;
    });
    if (penalties.xpPenalty) {
      setStats(prev => {
        const next = { ...prev, xp: Math.max(0, prev.xp - penalties.xpPenalty) };
        save('healup_stats', next);
        return next;
      });
    }
  }, []);

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
        next = {
          count: consecutive ? prev.count + 1 : 1,
          lastCompletedDate: today,
          todayDone: true,
        };
      }
      save('healup_streak', next);
      newStreak = next;
      return next;
    });

    const streakBonus = 1 + Math.min(newStreak.count * STREAK_BONUS_PER_DAY, 1);
    const finalXP    = Math.round(xpGain    * streakBonus);
    const finalCoins = Math.round(coinGain  * streakBonus);

    setStats(prev => {
      const next = { xp: prev.xp + finalXP, coins: prev.coins + finalCoins };
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

    return { finalXP, finalCoins, streakCount: newStreak.count, streakBonus };
  }, [streak]);

  const handleSetSelections = (updater) => {
    setAvatarSelections(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      save('healup_avatar_selections', next);
      return next;
    });
  };

  const handleSetAvatarName = (name) => {
    setAvatarName(name);
    localStorage.setItem('healup_avatar_name', name);
  };

  const DecayAlert = () => {
    if (!decayAlert) return null;
    return (
      <div style={{
        position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        border: '1px solid rgba(239,68,68,0.4)', borderRadius: 16,
        padding: '1rem 1.5rem', maxWidth: 420, width: '90%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        animation: 'popupIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: '#f87171', fontWeight: 800, fontSize: '0.95rem', marginBottom: 6 }}>
              ⚠️ You were away for {decayAlert.missedDays} day{decayAlert.missedDays > 1 ? 's' : ''}!
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.6 }}>
              Your stats decayed from inactivity:<br />
              <span style={{ color: '#f87171' }}>❤️ −{decayAlert.hp} HP</span>{'  '}
              <span style={{ color: '#60a5fa' }}>⚡ −{decayAlert.energy} Energy</span>{'  '}
              <span style={{ color: '#a78bfa' }}>💪 −{decayAlert.discipline} Discipline</span>
              {decayAlert._streakBroken > 0 && (
                <><br /><span style={{ color: '#fb923c' }}>🔥 {decayAlert._streakBroken}-day streak broken! −{decayAlert._streakPenalty} all stats</span></>
              )}
            </div>
            <div style={{ color: '#34d399', fontSize: '0.75rem', marginTop: 6, fontWeight: 600 }}>
              Complete challenges to recover your stats!
            </div>
          </div>
          <button onClick={() => setDecayAlert(null)} style={{
            background: 'none', border: 'none', color: '#64748b',
            cursor: 'pointer', fontSize: '1.1rem', padding: '0 0 0 1rem',
          }}>✕</button>
        </div>
      </div>
    );
  };

  return (
    <BrowserRouter>
      <DecayAlert />
      <Layout stats={stats} streak={streak}>
        <Routes>
          <Route path="/" element={
            <Dashboard
              avatarSelections={avatarSelections}
              avatarName={avatarName}
              bars={bars}
              streak={streak}
              onChallengeComplete={handleChallengeComplete}
            />
          } />
          <Route path="/program" element={
            <ProgramAvatar
              avatarSelections={avatarSelections}
              setAvatarSelections={handleSetSelections}
              avatarName={avatarName}
              setAvatarName={handleSetAvatarName}
            />
          } />
          <Route path="/challenges" element={
            <Challenges
              key={dailyChallengesKey}
              onChallengeComplete={handleChallengeComplete}
              bars={bars}
              streak={streak}
            />
          } />
          <Route path="/goals"         element={<GoalsProgress bars={bars} />} />
          <Route path="/activity-food" element={<ActivityFoodLog onBadHabit={handleBadHabit} />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/chatbot"       element={<Chatbot />} />
        </Routes>
        <ChatboxButton />
      </Layout>
    </BrowserRouter>
  );
}

export default App;
