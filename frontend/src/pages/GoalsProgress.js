import React, { useEffect, useState, useRef, useCallback } from 'react';
import '../styles/GoalsProgress.css';
import '../styles/Challenges.css';

const Img = ({ src, size = 24 }) => (
  <img src={src} alt="" style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }} />
);

// ─── Shared Goal Memory ─────────────────────────────────────────────
const loadClaimedGoals = () => { try { const s = localStorage.getItem('healup_goals_claimed'); return s ? JSON.parse(s) : {}; } catch { return {}; } };
const saveClaimedGoals = (v) => { try { localStorage.setItem('healup_goals_claimed', JSON.stringify(v)); } catch {} };

const PROGRAMS = [
  { value: 'general', label: 'General' },
  { value: 'weight-loss', label: 'Weight Loss' },
  { value: 'muscle-gain', label: 'Muscle Gain' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'stress', label: 'Stress' },
  { value: 'custom', label: 'Custom' },
];

const GOAL_TYPE_ICON = {
  fitness: '/training.png',
  nutrition: '/healthy-food.png',
  weight: '/workout.png',
  sleep: '/sleeping-mask.png',
  hydration: '/plastic-bottle.png',
  custom: '/dart.png',
};

const FALLBACK_GOALS = [
  { id: 'g1', icon: '/training.png',       title: 'Run 50km this month',      current: 34, target: 50,  unit: 'km',       deadline: 'Mar 31', status: 'on-track',  xp: 300, coins: 50, programType: 'endurance' },
  { id: 'g2', icon: '/plastic-bottle.png', title: 'Drink 2L water daily',     current: 30, target: 30,  unit: 'days',     deadline: 'Mar 31', status: 'on-track',  xp: 150, coins: 25, programType: 'general' },
  { id: 'g3', icon: '/sleeping-mask.png',  title: 'Sleep 8hrs for 21 nights', current: 9,  target: 21,  unit: 'nights',   deadline: 'Mar 31', status: 'at-risk',   xp: 200, coins: 35, programType: 'sleep' },
  { id: 'g4', icon: '/healthy-food.png',   title: 'Log meals for 30 days',    current: 6,  target: 30,  unit: 'days',     deadline: 'Mar 31', status: 'behind',    xp: 120, coins: 20, programType: 'weight-loss' },
  { id: 'g5', icon: '/workout.png',        title: 'Complete 20 workouts',     current: 20, target: 20,  unit: 'sessions', deadline: 'Mar 20', status: 'completed', xp: 400, coins: 75, programType: 'muscle-gain' },
  { id: 'g6', icon: '/exercising.png',     title: 'Meditate 15 days',         current: 11, target: 15,  unit: 'days',     deadline: 'Mar 31', status: 'on-track',  xp: 100, coins: 15, programType: 'stress' },
];

const normalizeGoal = (goal) => {
  const current = goal.effectiveCurrentValue ?? goal.currentValue ?? 0;
  const target = goal.targetValue ?? 1;
  const pct = target > 0 ? Math.round((current / target) * 100) : 0;
  const status = goal.isCompleted || pct >= 100
    ? 'completed'
    : pct >= 60
      ? 'on-track'
      : pct >= 35
        ? 'at-risk'
        : 'behind';
  const xp = Math.max(100, Math.round(target * 5));
  const coins = Math.max(15, Math.round(xp * 0.2));
  return {
    id: goal.id,
    icon: GOAL_TYPE_ICON[goal.goalType] || '/dart.png',
    title: goal.title,
    current,
    target,
    unit: goal.unit,
    deadline: goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline',
    status,
    xp,
    coins,
    programType: goal.programType || 'general',
  };
};

const FALLBACK_WEEKLY_DATA = [
  { day: 'Mon', steps: 8.2, cals: 1020 },
  { day: 'Tue', steps: 11.4, cals: 1556 },
  { day: 'Wed', steps: 7.8, cals: 3522 },
  { day: 'Thu', steps: 13.1, cals: 1260 },
  { day: 'Fri', steps: 9.6, cals: 2234 },
  { day: 'Sat', steps: 15.2, cals: 2620 },
  { day: 'Sun', steps: 6.4, cals: 1940 },
];

// ─── Flying Particles Component ─────────────────────────────────────────────
const FlyingParticle = ({ particle }) => (
  <div
    className="fly-particle"
    style={{
      '--start-x': `${particle.x}px`,
      '--start-y': `${particle.y}px`,
      '--tx': `${particle.tx}px`,
      '--ty': `${particle.ty}px`,
      '--delay': `${particle.delay}s`,
      '--color': particle.color,
      animationDelay: `${particle.delay}s`,
    }}
  >
    <img src={particle.icon} alt="" style={{ width: 24, height: 24, objectFit: 'contain', filter: `drop-shadow(0 0 4px ${particle.color})` }} />
  </div>
);

const GoalsProgress = ({ bars = { hp: 65, energy: 80, discipline: 45 }, activeDevice = 'apple', onGoalComplete }) => {
 const [selectedProgram, setSelectedProgram] = useState('general');
 const [goals, setGoals] = useState(FALLBACK_GOALS.filter(g => g.programType === 'general'));
 const [weeklyData, setWeeklyData] = useState(FALLBACK_WEEKLY_DATA);
 const [totalXp, setTotalXp] = useState(0);
 const [dayStreak, setDayStreak] = useState(0);
 const [bestStreak, setBestStreak] = useState(0);
 
 
 const [dailyProgress, setDailyProgress] = useState(0);
 const [particles, setParticles] = useState([]);
 const processingRef = useRef({});

 useEffect(() => {
   let user = null;
   try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { user = null; }
   
   if (!user?.id) {
     setGoals(FALLBACK_GOALS.filter(g => g.programType === selectedProgram || g.programType === 'general'));
     return;
   }

   fetch(`http://localhost:8001/api/goals?userId=${user.id}&programType=${selectedProgram}&device=${encodeURIComponent(activeDevice)}`, { cache: 'no-store' })
     .then(res => res.json())
     .then(data => {
       if (Array.isArray(data) && data.length > 0) setGoals(data.map(normalizeGoal));
       else setGoals(FALLBACK_GOALS.filter(g => g.programType === selectedProgram || g.programType === 'general'));
     })
     .catch(() => setGoals(FALLBACK_GOALS.filter(g => g.programType === selectedProgram || g.programType === 'general')));
 }, [selectedProgram, activeDevice]);

 useEffect(() => {
   let user = null;
   try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { user = null; }
   if (!user?.id) return;

   fetch(`http://localhost:8001/api/stats/${user.id}`)
     .then(res => res.json())
     .then(data => {
       if (!data || data.error) return;
       setTotalXp(data.totalXp || 0);
       setDayStreak(data.dayStreak || 0);
       setBestStreak(data.bestStreak || 0);
     })
     .catch(() => {});
 }, []);

useEffect(() => {
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { user = null; }

  if (!user?.id) return;

  fetch(`http://localhost:8001/api/metrics/weekly/${user.id}?device=${encodeURIComponent(activeDevice)}`)
    .then(res => (res.ok ? res.json() : null))
    .then(data => {
      if (!data?.metrics || !Array.isArray(data.metrics)) return;

      // Update the chart data
      const next = data.metrics.map((m) => ({
        day: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }),
        steps: Number(((m.steps || 0) / 1000).toFixed(1)),
        cals: Math.round(m.caloriesBurned || 0),
      }));
      setWeeklyData(next);

      const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
      const todayMetrics = data.metrics[todayIdx];
      
      if (todayMetrics) {
        const stepTarget = 1300;
        const progress = Math.min(100, ((todayMetrics.steps || 0) / stepTarget) * 100);
        setDailyProgress(progress);
      }
    })
    .catch(() => {});
}, [activeDevice]);

 // ─── Particle Animation Function ─────────────────────────────────────────────
 const spawnParticles = useCallback((originEl, xp, coins) => {
    const rect = originEl.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top  + rect.height / 2;

    const xpChip   = document.getElementById('xp-chip');
    const coinChip = document.getElementById('coins-chip');

    const getCenter = (el) => {
      if (!el) return { x: window.innerWidth / 2, y: 40 };
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };

    const xpPos   = getCenter(xpChip);
    const coinPos = getCenter(coinChip);
    const now = Date.now();
    const newParticles = [];

    for (let i = 0; i < 6; i++) {
      newParticles.push({ id: `${now}-xp-${i}`, x: originX, y: originY, tx: xpPos.x - originX + (Math.random() - 0.5) * 20, ty: xpPos.y - originY, icon: '/star.png', color: '#34d399', delay: i * 0.07 });
    }
    if (coins > 0) {
      for (let i = 0; i < 6; i++) {
        newParticles.push({ id: `${now}-coin-${i}`, x: originX, y: originY, tx: coinPos.x - originX + (Math.random() - 0.5) * 20, ty: coinPos.y - originY, icon: '/profit.png', color: '#fbbf24', delay: 0.1 + i * 0.07 });
      }
    }

    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(n => n.id === p.id)));
    }, 3500);
  }, []);



 const achievements = [
   { icon: '/throphy.png',   name: 'First Goal',     desc: 'Completed your first goal',                     unlocked: true  },
   { icon: '/fire2.png',     name: 'Week Warrior',   desc: '7-day activity streak',                          unlocked: true  },
   { icon: '/water.png',     name: 'Hydration Hero', desc: 'Hit water goal 10 days straight',                unlocked: true  },
   { icon: '/running.png',   name: 'Marathon Month', desc: 'Run 50km in one month',                          unlocked: false },
   { icon: '/star__1_.png',  name: 'XP Milestone',   desc: 'Earn 2500 total XP',                             unlocked: true  },
   { icon: '/lotus.png',     name: 'Zen Master',     desc: 'Meditate 30 days straight',                      unlocked: false },
   { icon: '/medal.png',     name: 'Top Performer',  desc: 'Rank #1 on weekly leaderboard',                 unlocked: false },
   { icon: '/muscles.png',   name: 'Iron Will',      desc: 'Complete all daily challenges 5 days in a row', unlocked: true  },
 ];

 const [popup, setPopup] = useState(null);
 const [chatOpen, setChatOpen] = useState(false);
 const [messages, setMessages] = useState([
   { id: 0, sender: 'bot', text: "Hey! 🎯 You're 68% through your goals this month. Want to know which one needs the most attention?" }
 ]);
 const [showQuickReplies, setShowQuickReplies] = useState(true);
 const [isTyping, setIsTyping] = useState(false);
 const [chatInput, setChatInput] = useState('');
 const [replyCount, setReplyCount] = useState(0);

 const botReplies = {
   'Which goal needs attention?': "Your **Log meals for 30 days** goal is most behind at only 20%. Try logging just breakfast tomorrow to build the habit! 🥗",
   'How do I improve my streak?': "Set a reminder for your top 2 daily challenges. Completing them before noon keeps streaks alive even on busy days! ⏰",
   'Motivate me!': "You've already completed your **20 workouts goal** this month — incredible! 💪 You're performing better than 82% of users. Don't stop now!",
 };

 const defaultReplies = [
   "Great question! Your consistency this week is impressive — keep it up! 🎯",
   "You're on track to hit 3 goals before month end! 🌟",
   "Pro tip: small daily actions compound into big goal progress over time. 💡",
   "Your streak bonus gives you +20% extra XP on every action. Use it! ⚡",
 ];

 const showPopup = (data) => {
   setPopup(data);
   setTimeout(() => setPopup(null), 2700);
 };

 const [showAddGoal, setShowAddGoal] = useState(false);
const [newGoal, setNewGoal] = useState({
  title: '', goalType: 'fitness', targetValue: '', unit: '',
  currentValue: 0, deadline: '', programType: selectedProgram,
});

const handleAddGoal = () => setShowAddGoal(true);

const handleSubmitGoal = async () => {
  if (!newGoal.title || !newGoal.targetValue) return;
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user?.id) return;

  await fetch('http://localhost:8001/api/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...newGoal, userId: user.id }),
  });

  setShowAddGoal(false);
  setNewGoal({ title: '', goalType: 'fitness', targetValue: '', unit: '', currentValue: 0, deadline: '', programType: selectedProgram });
  // Re-fetch goals to show the new one
  setSelectedProgram(p => p); // trigger useEffect
 };

 const deliverBotReply = (userText) => {
   setIsTyping(true);
   setTimeout(() => {
     setIsTyping(false);
     const reply = botReplies[userText] || defaultReplies[replyCount % defaultReplies.length];
     setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: reply }]);
     setReplyCount(c => c + 1);
   }, 900 + Math.random() * 600);
 };

 const handleQuickReply = (text) => {
   setShowQuickReplies(false);
   setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text }]);
   deliverBotReply(text);
 };

 const handleChatSend = () => {
   const text = chatInput.trim();
   if (!text) return;
   setChatInput('');
   setShowQuickReplies(false);
   setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text }]);
   deliverBotReply(text);
 };

 const renderBotText = (text) => {
   const parts = text.split(/\*\*(.*?)\*\*/g);
   return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
 };

 const maxSteps = Math.max(1, ...weeklyData.map(d => d.steps || 0));
 const maxCals  = Math.max(1, ...weeklyData.map(d => d.cals || 0));
 const activeGoals = goals.filter(g => g.status !== 'completed').length;
 const avgProgress = goals.length
   ? Math.round(goals.reduce((sum, g) => sum + Math.min(100, Math.round((g.current / Math.max(1, g.target)) * 100)), 0) / goals.length)
   : 0;

  const streakDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayStreakIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const streakBonusPct = Math.min(dayStreak * 10, 100);

  const getFillClass = (status) => ({ completed: 'green', 'at-risk': 'gold', behind: 'red' }[status] || '');
  const getStatusLabel = (status) => ({ 'on-track': 'On Track', 'at-risk': 'At Risk', behind: 'Behind', completed: 'Complete' }[status]);
  
 return (
  <div className="page-container">

    {/* Flying Particles Container */}
    <div className="particles-root" style={{ pointerEvents: 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999 }}>
      {particles.map(p => <FlyingParticle key={p.id} particle={p} />)}
    </div>

    {/* ── PAGE HEADER ── */}
    <div className="gp-page-header">
      <div className="gp-header-left">
        <div className="gp-header-icon">
          <img src="/dart.png" alt="Goals" style={{ width: 52, height: 52, objectFit: 'contain' }} />
        </div>
        <div>
          <h1 className="gp-page-title">Goals & Progress</h1>
          <p className="gp-page-sub">Track your long-term health milestones</p>
          <div style={{ marginTop: 8 }}>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.08)', color: '#e8f4ff', border: '1px solid rgba(91,184,255,0.25)', borderRadius: 8, padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
            >
              {PROGRAMS.map((p) => (
                <option key={p.value} value={p.value} style={{ color: '#0b1a27' }}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="gp-header-stats">
        <div className="gp-hstat">
          <span className="gp-hstat-val gold">{totalXp.toLocaleString()}</span>
          <span className="gp-hstat-label">Total XP</span>
        </div>
        <div className="gp-hstat">
          <span className="gp-hstat-val green">{activeGoals} / {goals.length}</span>
          <span className="gp-hstat-label">Goals Active</span>
        </div>
        <div className="gp-hstat">
          <span className="gp-hstat-val blue">{avgProgress}%</span>
          <span className="gp-hstat-label">Avg Progress</span>
        </div>
        <div className="gp-hstat gp-hstat-streak">
          <span className="gp-hstat-val orange" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <img src="/fire2.png" alt="streak" style={{ width: 18, height: 18, objectFit: 'contain' }} /> {dayStreak}
          </span>
          <span className="gp-hstat-label">Day Streak</span>
        </div>
      </div>
    </div>

    {/* ── STAT BARS — matching Challenges icons ── */}
    <div className="gp-stat-bars">
      <div className="gp-bar-row">
        <Img src="/health.png" size={24} />
        <span className="gp-bar-label">HP</span>
        <div className="gp-bar-track">
          <div className="gp-bar-fill gp-hp" style={{ width: `${bars.hp}%`, transition: 'width 0.6s ease' }} />
          <span className="gp-bar-pct">{bars.hp}%</span>
        </div>
      </div>
      <div className="gp-bar-row">
        <Img src="/lighting.png" size={24} />
        <span className="gp-bar-label">Energy</span>
        <div className="gp-bar-track">
          <div className="gp-bar-fill gp-energy" style={{ width: `${bars.energy}%`, transition: 'width 0.6s ease' }} />
          <span className="gp-bar-pct">{bars.energy}%</span>
        </div>
      </div>
      <div className="gp-bar-row">
        <Img src="/roman-helmet.png" size={24} />
        <span className="gp-bar-label">Discipline</span>
        <div className="gp-bar-track">
          <div className="gp-bar-fill gp-disc" style={{ width: `${bars.discipline}%`, transition: 'width 0.6s ease' }} />
          <span className="gp-bar-pct">{bars.discipline}%</span>
        </div>
      </div>
    </div>

    {/* ── MAIN GRID ── */}
    <div className="gp-main-grid">

      {/* ACTIVE GOALS */}
      <div className="card gp-section" data-testid="active-goals">
        <div className="gp-section-header">
          <div className="gp-section-title"><span className="gp-dot" />Active Goals</div>
          <div className="gp-badge">{activeGoals} In Progress</div>
        </div>
        <div className="gp-goals-list">
          {goals.map(g => {
            const pct = Math.round(Math.min(100, (g.current / g.target) * 100));
            const fc  = getFillClass(g.status);
            return (
              <div
                key={g.id}
                id={`goal-${g.id}`}
                className={`gp-goal-item ${g.current >= g.target ? 'completed' : g.status}`}
                data-testid={`goal-${g.id}`}
              >
                <div className="gp-goal-top">
                  <div className="gp-goal-left">
                    <Img src={g.icon} size={30} />
                    <div className="gp-goal-info">
                      <div className="gp-goal-title"style={{ textDecoration: g.current >= g.target ? 'line-through' : 'none' }}>{g.title}</div>
                      <div className="gp-goal-meta">
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <img src="/deadline.png" alt="" style={{ width: 12, height: 12, objectFit: 'contain' }} /> {g.deadline}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <img src="/rise.png" alt="" style={{ width: 12, height: 12, objectFit: 'contain' }} /> {g.current} / {g.target} {g.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`gp-status-badge status-${g.status}`}>{getStatusLabel(g.status)}</div>
                </div>
                <div className="gp-goal-track">
                  <div className={`gp-goal-fill ${fc}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="gp-goal-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  
                  {/* Left Side: Percentage and Rewards */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`gp-goal-pct ${fc}`}>{pct}%</span>
                    <span className="gp-goal-reward">
                      <img src="/star.png" alt="XP" style={{ width: 14, height: 14, objectFit: 'contain', verticalAlign: 'middle' }} />
                      {' '}+{g.xp} XP · +{g.coins}{' '}
                      <img src="/profit.png" alt="Coins" style={{ width: 14, height: 14, objectFit: 'contain', verticalAlign: 'middle' }} />
                    </span>
                  </div>
                  
                  {/* Right Side: The Claim Button (Only shows if 100%) */}
                <div style={{ marginLeft: 'auto' }}>
                    {g.current >= g.target ? (
                      <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        ✓ Milestone Reached
                      </span>
                    ) : (
                      <span style={{ color: '#5a88a8', fontSize: '0.8rem' }}>
                        {g.target - g.current} {g.unit} left
                      </span>
                    )}
                </div>

                </div>
              </div>
            );
          })}
        </div>
        <button className="track-button" onClick={handleAddGoal} data-testid="add-goal-btn">+ Add New Goal</button>
      </div>

      {/* WEEKLY ACTIVITY CHART */}
      <div className="card gp-section" data-testid="weekly-chart">
        <div className="gp-section-header">
          <div className="gp-section-title"><span className="gp-dot green" />Weekly Activity</div>
          <div className="gp-badge green">This Week</div>
        </div>
        <div className="gp-chart-body">
          <div className="gp-chart-legend">
            <div className="gp-legend-item"><div className="gp-legend-dot" style={{ background: '#5bb8ff' }} />Steps (×1000)</div>
            <div className="gp-legend-item"><div className="gp-legend-dot" style={{ background: '#34d399' }} />Calories burned</div>
          </div>
          {/* <div className="gp-bar-chart">
            {weeklyData.map(d => (
              <div className="gp-chart-col" key={d.day}>
                <div className="gp-chart-bars">
                  <div className="gp-chart-bar steps"    style={{ height: `${Math.round((d.steps / maxSteps) * 100)}px` }} title={`${d.steps}k steps`} />
                  <div className="gp-chart-bar calories" style={{ height: `${Math.round((d.cals  / maxCals)  * 100)}px` }} title={`${d.cals} kcal`} />
                </div>
                <div className="gp-chart-day">{d.day}</div>
              </div>
            ))}
          </div> */}
            <div className="gp-breakdown">
            <div className="gp-breakdown-title">Daily Breakdown</div>
            {weeklyData.map(d => {
              const stepPct = Math.round((d.steps / maxSteps) * 100);
              const calPct  = Math.round((d.cals  / maxCals)  * 100);
              return (
                <div className="gp-breakdown-row" key={d.day}>
                  <span className="gp-breakdown-day">{d.day}</span>
                  <div className="gp-breakdown-bars">
                    <div className="gp-breakdown-bar-wrap">
                      <div className="gp-breakdown-fill steps" style={{ width: `${stepPct}%` }} />
                    </div>
                    <div className="gp-breakdown-bar-wrap">
                      <div className="gp-breakdown-fill cals" style={{ width: `${calPct}%` }} />
                    </div>
                  </div>
                  <span className="gp-breakdown-nums">{d.steps}k · {d.cals}</span>
                </div>
              );
            })}
          </div>
          <div className="gp-weekly-stats">
            <div className="gp-weekly-stat">
              <img src="/training.png" alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} />
              <div className="gp-weekly-stat-info">
                <span className="gp-weekly-stat-val">{weeklyData.reduce((s,d) => s + d.steps, 0).toFixed(1)}k</span>
                <span className="gp-weekly-stat-label">Total Steps</span>
              </div>
            </div>
            <div className="gp-weekly-stat-divider" />
            <div className="gp-weekly-stat">
              <img src="/fire2.png" alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} />
              <div className="gp-weekly-stat-info">
                <span className="gp-weekly-stat-val">{weeklyData.reduce((s,d) => s + d.cals, 0).toLocaleString()}</span>
                <span className="gp-weekly-stat-label">Calories Burned</span>
              </div>
            </div>
            <div className="gp-weekly-stat-divider" />
            <div className="gp-weekly-stat">
              <img src="/footprint.png" alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} />
              <div className="gp-weekly-stat-info">
                <span className="gp-weekly-stat-val">{(weeklyData.reduce((s,d) => s + d.steps, 0) / 7).toFixed(1)}k</span>
                <span className="gp-weekly-stat-label">Daily Average</span>
              </div>
            </div>
          </div>

          <div className="gp-best-worst">
            <div className="gp-bw-card best">
              <div className="gp-bw-label">
                <img src="/throphy.png" alt="" style={{ width: 13, height: 13, objectFit: 'contain', verticalAlign: 'middle', marginRight: 4 }} />
                Best Day
              </div>
              <div className="gp-bw-day">{weeklyData.reduce((a, b) => a.steps > b.steps ? a : b).day}</div>
              <div className="gp-bw-val">{weeklyData.reduce((a, b) => a.steps > b.steps ? a : b).steps}k steps</div>
              <div className="gp-bw-sub">{weeklyData.reduce((a, b) => a.cals > b.cals ? a : b).cals} kcal</div>
            </div>
            <div className="gp-bw-card worst">
              <div className="gp-bw-label">
                <img src="/rise.png" alt="" style={{ width: 13, height: 13, objectFit: 'contain', verticalAlign: 'middle', marginRight: 4 }} />
                 Needs Work
              </div>
              <div className="gp-bw-day">{weeklyData.reduce((a, b) => a.steps < b.steps ? a : b).day}</div>
              <div className="gp-bw-val">{weeklyData.reduce((a, b) => a.steps < b.steps ? a : b).steps}k steps</div>
              <div className="gp-bw-sub">{weeklyData.reduce((a, b) => a.cals < b.cals ? a : b).cals} kcal</div>
            </div>
          </div>

          {/* <div className="gp-breakdown">
            <div className="gp-breakdown-title">Daily Breakdown</div>
            {weeklyData.map(d => {
              const stepPct = Math.round((d.steps / maxSteps) * 100);
              const calPct  = Math.round((d.cals  / maxCals)  * 100);
              return (
                <div className="gp-breakdown-row" key={d.day}>
                  <span className="gp-breakdown-day">{d.day}</span>
                  <div className="gp-breakdown-bars">
                    <div className="gp-breakdown-bar-wrap">
                      <div className="gp-breakdown-fill steps" style={{ width: `${stepPct}%` }} />
                    </div>
                    <div className="gp-breakdown-bar-wrap">
                      <div className="gp-breakdown-fill cals" style={{ width: `${calPct}%` }} />
                    </div>
                  </div>
                  <span className="gp-breakdown-nums">{d.steps}k · {d.cals}</span>
                </div>
              );
            })}
          </div> */}

        </div>
      </div>

      {/* DAILY STREAK */}

      {/* GoalsProgress.js Snippet */}      
      <div className="card gp-section" data-testid="streak-panel">
        <div className="gp-section-header">
          <div className="gp-section-title"><span className="gp-dot orange" />Daily Streak</div>
          <div className="gp-badge orange">+{streakBonusPct}% XP Bonus</div>
        </div>
        <div className="gp-streak-body">
          <div className="gp-streak-row">
            <div>
              <div className="gp-streak-num">{dayStreak}</div>
              <div className="gp-streak-lbl" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <img src="/fire2.png" alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} /> Keep it going!
              </div>
            </div>
            <div className="gp-streak-bonus">
              <div className="gp-streak-bonus-val">+{streakBonusPct}% XP</div>
              <div className="gp-streak-bonus-lbl">Streak Bonus</div>
            </div>
          </div>
          <div className="gp-streak-days">
            {streakDays.map((d, i) => (
              <div key={i} className={`gp-streak-day${i < todayStreakIdx ? ' done' : ''}${i === todayStreakIdx ? ' today' : ''}`}>
                {d}<div className="gp-streak-dot" />
              </div>
            ))}
          </div>
          {/* GoalsProgress.js Snippet */}
          <div className="gp-streak-milestone">
            <div className="gp-streak-milestone-top">
              <span className="gp-streak-milestone-label">Today's Activity Goal</span>
              <span className="gp-streak-milestone-label">{Math.round(dailyProgress)}%</span>
            </div>
            <div className="gp-streak-milestone-track">
              <div 
                className="gp-streak-milestone-fill" 
                style={{ width: `${Math.min(100, dailyProgress)}%` }} 
              />
            </div>
          </div>
          <div className="gp-streak-stats">
            <div className="gp-streak-stat">
              <div className="gp-streak-stat-val">{dayStreak}</div>
              <div className="gp-streak-stat-label">Current</div>
            </div>
            <div className="gp-streak-stat-divider" />
            <div className="gp-streak-stat">
              <div className="gp-streak-stat-val" style={{ color: '#fbbf24' }}>{bestStreak}</div>
              <div className="gp-streak-stat-label">Best Ever</div>
            </div>
            <div className="gp-streak-stat-divider" />
            <div className="gp-streak-stat">
              <div className="gp-streak-stat-val" style={{ color: '#34d399' }}>{dayStreak}</div>
              <div className="gp-streak-stat-label">Total Days</div>
            </div>
            <div className="gp-streak-stat-divider" />
            <div className="gp-streak-stat">
              <div className="gp-streak-stat-val" style={{ color: '#a78bfa' }}>+{streakBonusPct}%</div>
              <div className="gp-streak-stat-label">XP Boost</div>
            </div>
          </div>
          <div className="gp-streak-history-label">Milestone History</div>
          <div className="gp-streak-history">
                         {/* // Dynamic Milestone History */}
            {[
              { days: 1,  label: '1-Day Streak',  icon: '/fire2.png',   color: '#fb923c', date: 'Today', done: dayStreak >= 1 },
              { days: 7,  label: '7-Day Streak',  icon: '/throphy.png', color: '#fbbf24', date: dayStreak >= 7 ? 'Earned' : 'Locked', done: dayStreak >= 7 },
              { days: 10, label: '10-Day Streak', icon: '/throphy.png', color: '#fbbf24', date: dayStreak >= 10 ? 'Earned' : 'Locked', done: dayStreak >= 10 },
              { days: 14, label: '14-Day Streak', icon: '/medal.png',   color: '#a78bfa', date: dayStreak >= 14 ? 'Earned' : 'Locked', done: dayStreak >= 14 },

            ].map((m, i) => (
              <div key={i} className={`gp-streak-milestone-row ${m.done ? 'done' : 'locked'}`}>
                <div className="gp-streak-milestone-icon" style={{ background: m.done ? m.color + '22' : 'rgba(255,255,255,0.04)', borderColor: m.done ? m.color + '55' : 'rgba(255,255,255,0.08)' }}>
                  <img src={m.icon} alt="" style={{ width: 16, height: 16, objectFit: 'contain', opacity: m.done ? 1 : 0.3 }} />
                </div>
                <div className="gp-streak-milestone-info">
                  <span className="gp-streak-milestone-name" style={{ color: m.done ? '#e2e8f0' : '#475569' }}>{m.label}</span>
                  <span className="gp-streak-milestone-date" style={{ color: m.done ? m.color : '#334155' }}>{m.date}</span>
                </div>
                <div className="gp-streak-milestone-check" style={{ color: m.done ? m.color : '#1e293b', borderColor: m.done ? m.color + '55' : '#1e293b' }}>
                  {m.done ? '✓' : `${m.days}d`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ACHIEVEMENTS */}
      <div className="card gp-section" data-testid="achievements">
        <div className="gp-section-header">
          <div className="gp-section-title"><span className="gp-dot gold" />Achievements</div>
          <div className="gp-badge gold">5 Unlocked</div>
        </div>
        <div className="gp-achievements">
          {achievements.map(a => (
            <div key={a.name} className={`gp-ach-card ${a.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="gp-ach-icon">
                <img src={a.icon} alt={a.name} style={{ width: 22, height: 22, objectFit: 'contain' }} />
              </div>
              <div className="gp-ach-info">
                <div className="gp-ach-name">{a.name}</div>
                <div className="gp-ach-desc">{a.desc}</div>
                {a.unlocked && <div className="gp-ach-tag">✓ UNLOCKED</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>


    {/* ── CHATBOT FAB ── */}
    <button className="gp-chat-fab" onClick={() => setChatOpen(o => !o)} title="AI Health Coach">
      <svg width="26" height="24" viewBox="0 0 36 32" fill="none">
        <ellipse cx="18" cy="14" rx="15" ry="11" fill="url(#cg1)"/>
        <path d="M10 23 Q8 28 5 30 Q12 29 14 24Z" fill="url(#cg1)"/>
        <ellipse cx="15" cy="10" rx="8" ry="4.5" fill="url(#cg2)" opacity="0.6"/>
        <defs>
          <radialGradient id="cg1" cx="40%" cy="35%" r="65%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#f0f8ff"/><stop offset="60%" stopColor="#d6eeff"/><stop offset="100%" stopColor="#b8dcf5"/>
          </radialGradient>
          <radialGradient id="cg2" cx="50%" cy="30%" r="60%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.95"/><stop offset="100%" stopColor="#fff" stopOpacity="0"/>
          </radialGradient>
        </defs>
      </svg>
    </button>

    {/* ── CHATBOT PANEL ── */}
    <div className={`gp-chat-panel ${chatOpen ? 'visible' : 'hidden'}`}>
      <div className="gp-chat-header">
        <div className="gp-chat-avatar">🤖</div>
        <div className="gp-chat-header-info">
          <div className="gp-chat-name">FitCoach AI</div>
          <div className="gp-chat-status">Online · Ready to help</div>
        </div>
        <button className="gp-chat-close" onClick={() => setChatOpen(false)}>✕</button>
      </div>
      <div className="gp-chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`gp-chat-msg ${msg.sender}`}>
            <div className="gp-chat-msg-avatar">{msg.sender === 'user' ? '🧑' : '🤖'}</div>
            <div className="gp-chat-bubble">{renderBotText(msg.text)}</div>
          </div>
        ))}
        {isTyping && (
          <div className="gp-chat-msg bot">
            <div className="gp-chat-msg-avatar">🤖</div>
            <div className="gp-chat-bubble typing"><span/><span/><span/></div>
          </div>
        )}
      </div>
      {showQuickReplies && (
        <div className="gp-chat-quick">
          <button className="gp-quick-btn" onClick={() => handleQuickReply('Which goal needs attention?')}>🎯 Which goal?</button>
          <button className="gp-quick-btn" onClick={() => handleQuickReply('How do I improve my streak?')}>🔥 Streak tips</button>
          <button className="gp-quick-btn" onClick={() => handleQuickReply('Motivate me!')}>💥 Motivate me</button>
        </div>
      )}
      <div className="gp-chat-input-row">
        <input
          className="gp-chat-input"
          placeholder="Ask your coach…"
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleChatSend()}
        />
        <button className="gp-chat-send" onClick={handleChatSend}>➤</button>
      </div>
    </div>
{showAddGoal && (
  <div className="modal-overlay" onClick={() => setShowAddGoal(false)}>
    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
      <div className="modal-header">
        <h2 className="modal-title">
          <img src="/icons/target_1.png" alt="goal" style={{ width: 20, height: 20, verticalAlign: 'middle', marginRight: 6 }} />
          Add New Goal
        </h2>
        <button className="modal-close-btn" onClick={() => setShowAddGoal(false)}>✕</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
        {/* Goal Type */}
        <div>
          <label style={{ color: 'rgba(180,210,240,0.6)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Goal Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 8 }}>
            {[
              ['fitness',   '/icons/running_1.png',      'Fitness'],
              ['nutrition', '/icons/salad.png',           'Nutrition'],
              ['hydration', '/icons/drop.png',            'Hydration'],
              ['sleep',     '/icons/sleeping-mask_1.png', 'Sleep'],
              ['weight',    '/icons/slim.png',            'Weight'],
              ['custom',    '/icons/customize.png',       'Custom'],
            ].map(([val, icon, lbl]) => (
              <button key={val} onClick={() => setNewGoal(p => ({...p, goalType: val}))}
                style={{ background: newGoal.goalType === val ? 'rgba(91,184,255,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${newGoal.goalType === val ? 'rgba(91,184,255,0.5)' : 'rgba(91,184,255,0.12)'}`, borderRadius: 10, padding: '10px 6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <img src={icon} alt={lbl} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                <span style={{ color: newGoal.goalType === val ? '#5bb8ff' : 'rgba(180,210,240,0.6)', fontSize: 11 }}>{lbl}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="field">
          <label>Goal Title</label>
          <input className="avatar-name-input" placeholder='e.g. "Run 50km this month"'
            value={newGoal.title} onChange={e => setNewGoal(p => ({...p, title: e.target.value}))} />
        </div>

        {/* Target / Unit / Start */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 12 }}>
          <div className="field"><label>Target</label>
            <input className="avatar-name-input" type="number" placeholder="50" value={newGoal.targetValue}
              onChange={e => setNewGoal(p => ({...p, targetValue: e.target.value}))} /></div>
          <div className="field"><label>Unit</label>
            <input className="avatar-name-input" placeholder="km, days…" value={newGoal.unit}
              onChange={e => setNewGoal(p => ({...p, unit: e.target.value}))} /></div>
          <div className="field"><label>Start</label>
            <input className="avatar-name-input" type="number" placeholder="0" value={newGoal.currentValue}
              onChange={e => setNewGoal(p => ({...p, currentValue: e.target.value}))} /></div>
        </div>

        {/* Deadline */}
        <div className="field"><label>Deadline</label>
          <input className="avatar-name-input" type="date" value={newGoal.deadline}
            onChange={e => setNewGoal(p => ({...p, deadline: e.target.value}))} /></div>
      </div>

      <div className="modal-footer">
        <button className="unlock-cancel-btn" onClick={() => setShowAddGoal(false)}>Cancel</button>
        <button className="create-button" style={{ flex: 2 }} onClick={handleSubmitGoal}>+ Add Goal</button>
      </div>
    </div>
  </div>
)}
  </div>
 );
};

export default GoalsProgress;