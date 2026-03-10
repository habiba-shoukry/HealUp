<<<<<<< HEAD
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const AVATAR_IMAGES = {
  base: { s1: '/Avatars/sittingavatar.jpg', s2: '/Avatars/skin-brown.png' },
  skinArmour: {
    s2_ar2: '/Avatars/skin-brown-iron.png', s2_ar3: '/Avatars/skin-brown-mage.png',
    s2_ar4: '/Avatars/skin-brown-gold.png', s2_ar5: '/Avatars/skin-brown-shadow.png',
    s2_ar6: '/Avatars/skin-brown-dragon.png',
  },
  armour: { ar1:null, ar2:'/Avatars/armour-iron.png', ar3:'/Avatars/armour-mage.png', ar4:'/Avatars/armour-gold.png', ar5:'/Avatars/armour-shadow.png', ar6:'/Avatars/armour-dragon.png' },
  hair: {
    hs1_black:null, hs2_black:'/Avatars/hair-spiky-black.png', hs3_black:'/Avatars/hair-long-black.png', hs4_black:'/Avatars/hair-wavy-black.png',
    hs1_brown:null, hs2_brown:'/Avatars/hair-spiky.png', hs3_brown:'/Avatars/hair-long.png', hs4_brown:'/Avatars/hair-wavy.png',
    hs1_blonde:null, hs2_blonde:'/Avatars/hair-spiky-blonde.png', hs3_blonde:'/Avatars/hair-long-blonde.png', hs4_blonde:'/Avatars/hair-wavy-blonde.png',
  },
  ears: { ae1:null, ae2:'/Avatars/ears-cat.png', ae3:'/Avatars/ears-bunny.png', ae4:'/Avatars/ears-fox.png', ae5:null, ae6:null, ae7:null, ae8:null },
  pets: { p1:'/Avatars/pet-fire-dragon.png', p2:'/Avatars/pet-ice-dragon.png', p3:null, p4:'/Avatars/pet-golden-wyvern.png', p5:null, p6:null },
};

const PET_INFO = {};

const STAT_META = {
  energy:     { icon: '/lighting.png',     label: 'Energy',     color: '#60a5fa' },
  hp:         { icon: '/health.png',       label: 'HP',         color: '#f87171' },
  discipline: { icon: '/roman-helmet.png', label: 'Discipline', color: '#a78bfa' },
};

const DAILY = [
  { title: 'Walk 10,000 steps today',  reward: '50 XP',  xp: 50, barEffects: { energy: 5 } },
  { title: 'Drink 2L of water',        reward: '20 XP',  xp: 20, barEffects: { hp: 3 } },
  { title: 'No Sugary snacks',         reward: '30 XP',  xp: 30, barEffects: { discipline: 3 } },
  { title: 'Morning Stretch',          reward: '15 XP',  xp: 15, barEffects: { energy: 2 } },
  { title: 'Daily Workout Complete',   reward: '50 XP',  xp: 50, barEffects: { energy: 5, discipline: 2 } },
];

const WEEKLY = [
  { title: 'Run 20 km this week',          progress: 40,  reward: '150 XP +50 Energy' },
  { title: 'Share progress with a friend', progress: 100, reward: '60 XP +20 Energy'  },
  { title: 'Sleep 7-8 hrs for 5 nights',  progress: 70,  reward: '120 XP +40 Energy' },
  { title: 'Drink 14L water this week',    progress: 60,  reward: '100 XP +30 Energy' },
];

const getTodayKey = () => `healup_daily_checked_${new Date().toISOString().slice(0, 10)}`;
const loadChecked = () => {
  try { const s = localStorage.getItem(getTodayKey()); return s ? JSON.parse(s) : {}; }
  catch { return {}; }
};
const saveChecked = (v) => {
  try { localStorage.setItem(getTodayKey(), JSON.stringify(v)); } catch {}
};

const getCenter = (el) => {
  if (!el) return { x: window.innerWidth / 2, y: 40 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

// ─── Metric Detail Popup ──────────────────────────────────────────────────────
const MetricPopup = ({ type, onClose }) => {
  if (!type) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const Icon = ({ src, size = 22, style = {} }) => (
    <img src={src} alt="" style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, ...style }} />
  );

  // ── Heart Rate: per-day data ────────────────────────────────────────────────
  const HR_DAYS = [
    { day: 'M', resting: 68, peak: 88, min: 58, chart: [65,68,72,70,75,71,68,80,76,70,66,68] },
    { day: 'T', resting: 74, peak: 95, min: 62, chart: [70,74,78,82,90,85,78,74,70,68,72,74] },
    { day: 'W', resting: 71, peak: 90, min: 60, chart: [68,71,75,79,85,82,76,71,68,65,69,71] },
    { day: 'T', resting: 73, peak: 92, min: 63, chart: [69,73,77,81,88,84,77,73,70,67,71,73] },
    { day: 'F', resting: 69, peak: 86, min: 59, chart: [66,69,73,70,78,74,70,69,65,63,67,69] },
    { day: 'S', resting: 72, peak: 89, min: 61, chart: [68,72,76,80,84,81,75,72,69,66,70,72] },
    { day: 'S', resting: 72, peak: 92, min: 65, chart: [68,72,75,80,78,85,82,88,84,79,76,72] },
  ];
  const avgBpm = Math.round(HR_DAYS.reduce((s, d) => s + d.resting, 0) / HR_DAYS.length);

  const [selectedDayIdx, setSelectedDayIdx] = useState(6);
  const [selectedSleepIdx, setSelectedSleepIdx] = useState(6);
  const [selectedStepsIdx, setSelectedStepsIdx] = useState(6);
  const [selectedStressIdx, setSelectedStressIdx] = useState(6);
  const selectedDay = HR_DAYS[selectedDayIdx];
  const selectedSleep = SLEEP_DAYS[selectedSleepIdx];
  const selectedSteps = STEPS_DAYS[selectedStepsIdx];
  const selectedStress = STRESS_DAYS[selectedStressIdx];
  const maxSleepHrs = Math.max(...SLEEP_DAYS.map(d => d.hrs));
  const maxStepsVal = Math.max(...STEPS_DAYS.map(d => d.steps));
  const maxStressVal = Math.max(...STRESS_DAYS.map(d => d.level));

  const configs = {
    heartRate: {
      icon: '/heartbeat.png', title: 'Heart Rate', subtitle: 'Resting · Today',
      badge: { label: 'Normal', color: '#34d399' },
      accentColor: '#ff5c7a',
      weeklyColor: '#ff5c7a',
      insight: { icon: '/idea.png', title: 'Insight', text: 'Your resting heart rate has been stable this week. A resting BPM of 60–80 is healthy for most adults. Keep up your cardio!' },
    },
    sleep: {
      icon: '/moon.png', title: 'Sleep', subtitle: 'Last 7 nights',
      badge: { label: 'Good', color: '#818cf8' },
      accentColor: '#a78bfa',
      weeklyColor: '#a78bfa',
      insight: { icon: '/idea.png', title: 'Insight', text: 'You\'re sleeping well! Try to hit 8 hrs consistently for maximum XP gains and better Energy stats on your avatar.' },
    },
    steps: {
      icon: '/football.png', title: 'Steps', subtitle: 'Today · 91% of goal',
      badge: { label: 'On Track', color: '#34d399' },
      accentColor: '#34d399',
      weeklyColor: '#34d399',
      insight: { icon: '/target.png', title: 'Almost there!', text: 'Just 842 more steps to complete today\'s challenge and earn 50 XP. A short 7-minute walk will do it!' },
    },
    calories: {
      icon: '/fire.png', title: 'Calories', subtitle: 'Today\'s burn & intake',
      badge: { label: 'Active', color: '#fb923c' },
      accentColor: '#fb923c',
      metricValue: '1,840', metricUnit: 'kcal burned',
      stats: [
        { label: 'BMR (Base)',    value: '1,420 kcal', note: 'At rest burn',    color: '#fbbf24' },
        { label: 'Active Burn',   value: '420 kcal',   note: 'From movement',   color: '#fb923c' },
        { label: 'Net Calories',  value: '+360',        note: 'Intake − burned', color: '#34d399' },
        { label: 'Goal Gap',      value: '711 kcal',   note: 'Left to burn',    color: '#a78bfa' },
      ],
      macros: [
        { label: 'Protein', value: '82g',  pct: 52, color: '#f472b6' },
        { label: 'Carbs',   value: '210g', pct: 80, color: '#fbbf24' },
        { label: 'Fat',     value: '54g',  pct: 40, color: '#60a5fa' },
      ],
      donut: { burned: 1840, goal: 2551, intake: 2200 },
      insight: { icon: '/idea.png', title: 'Insight', text: 'Your protein intake is solid! Carbs are on the higher side — consider a lighter dinner to stay within your calorie goal and maximize recovery.' },
    },
    stress: {
      icon: '/stress-relief.png', title: 'Stress', subtitle: 'HRV-based · Today',
      badge: { label: 'Moderate', color: '#d97706' },
      accentColor: '#fbbf24',
      weeklyColor: '#fbbf24',
      insight: { icon: '/idea.png', title: 'Tip', text: 'Your stress peaked mid-week. Try a 5-minute breathing exercise before sleep to improve HRV and reduce tomorrow\'s baseline. This will also boost your DISCIPLINE stat!' },
    },
  };

  const cfg = configs[type];
  if (!cfg) return null;

  // Mini line chart for popup
  const PopupLineChart = ({ data, color }) => {
    if (!data) return null;
    const h = 90, w = 420;
    const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 10) - 5}`).join(' ');
    const area = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 10) - 5}`);
    const areaPath = `M${area[0]} L${area.slice(1).join(' L')} L${w},${h} L0,${h} Z`;
    const gradId = `popup-grad-${type}`;
    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', borderRadius: 8 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    );
  };

  // ── Heart Rate popup (interactive day selection) ────────────────────────────
  if (type === 'heartRate') {
    const maxResting = Math.max(...HR_DAYS.map(d => d.resting));
    return (
      <div className="metric-popup-overlay" onClick={handleOverlayClick}>
        <div className="metric-popup">
          {/* Header */}
          <div className="metric-popup-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Icon src={cfg.icon} size={26} />
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{cfg.title}</div>
                <div style={{ fontSize: '0.72rem', color: '#a8c8e0' }}>
                  Resting · {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][selectedDayIdx]}
                </div>
              </div>
              <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: cfg.badge.color + '22', color: cfg.badge.color, border: `1px solid ${cfg.badge.color}55` }}>
                {cfg.badge.label.toUpperCase()}
              </span>
            </div>
            <button className="metric-popup-close" onClick={onClose}>✕</button>
          </div>

          <div className="metric-popup-body">
            {/* Big metric — updates with selected day */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '1rem', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '3rem', fontWeight: 900, color: cfg.accentColor, lineHeight: 1 }}>
                {selectedDay.resting}
              </span>
              <span style={{ fontSize: '1rem', color: '#a8c8e0' }}>bpm</span>
            </div>

            {/* Chart — updates with selected day */}
            <div style={{ marginBottom: '1rem', borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.02)', padding: '0.5rem' }}>
              <PopupLineChart data={selectedDay.chart} color={cfg.accentColor} />
            </div>

            {/* Stats — update with selected day */}
            <div className="metric-popup-stats-grid" style={{ marginBottom: '1rem' }}>
              <div className="metric-popup-stat-box">
                <div style={{ fontSize: '0.68rem', color: '#a8c8e0', marginBottom: 3 }}>Resting BPM</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ff5c7a' }}>{selectedDay.resting}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>Healthy range</div>
              </div>
              <div className="metric-popup-stat-box">
                <div style={{ fontSize: '0.68rem', color: '#a8c8e0', marginBottom: 3 }}>Peak</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fb923c' }}>{selectedDay.peak}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>During activity</div>
              </div>
              <div className="metric-popup-stat-box">
                <div style={{ fontSize: '0.68rem', color: '#a8c8e0', marginBottom: 3 }}>Min</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>{selectedDay.min}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>During rest</div>
              </div>
              <div className="metric-popup-stat-box">
                <div style={{ fontSize: '0.68rem', color: '#a8c8e0', marginBottom: 3 }}>7-Day Avg</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a78bfa' }}>{avgBpm} bpm</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>Trending stable</div>
              </div>
            </div>

            {/* Interactive weekly bar chart */}
            <div className="metric-popup-section-label">Weekly Breakdown</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center', marginBottom: '1rem' }}>
              {HR_DAYS.map((d, i) => {
                const pct = (d.resting / maxResting) * 100;
                const isSelected = i === selectedDayIdx;
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDayIdx(i)}
                    style={{ cursor: 'pointer' }}
                    className="hr-day-col"
                  >
                    <div style={{ fontSize: '0.6rem', color: isSelected ? '#fff' : '#a8c8e0', marginBottom: 3, fontWeight: isSelected ? 700 : 400 }}>{d.day}</div>
                    <div style={{ height: 44, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 3 }}>
                      <div style={{
                        width: '75%',
                        borderRadius: '3px 3px 0 0',
                        height: `${pct}%`,
                        background: isSelected ? cfg.accentColor : cfg.accentColor + '44',
                        transition: 'background 0.2s, height 0.3s',
                        boxShadow: isSelected ? `0 0 8px ${cfg.accentColor}88` : 'none',
                      }} />
                    </div>
                    <div style={{ fontSize: '0.6rem', fontWeight: isSelected ? 700 : 400, color: isSelected ? cfg.accentColor : '#a8c8e0' }}>{d.resting}</div>
                  </div>
                );
              })}
            </div>

            {/* Insight */}
            <div className="metric-popup-insight" style={{ borderColor: cfg.accentColor + '33', background: cfg.accentColor + '0d' }}>
              <strong style={{ color: cfg.accentColor, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Icon src={cfg.insight.icon} size={16} /> {cfg.insight.title}:
              </strong> {cfg.insight.text}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Sleep popup (interactive day selection) ────────────────────────────────
  if (type === 'sleep') {
    const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    return (
      <div className="metric-popup-overlay" onClick={handleOverlayClick}>
        <div className="metric-popup">
          <div className="metric-popup-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Icon src={cfg.icon} size={26} />
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{cfg.title}</div>
                <div style={{ fontSize: '0.72rem', color: '#a8c8e0' }}>{DAY_NAMES[selectedSleepIdx]}</div>
              </div>
              <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: cfg.badge.color + '22', color: cfg.badge.color, border: `1px solid ${cfg.badge.color}55` }}>
                {cfg.badge.label.toUpperCase()}
              </span>
            </div>
            <button className="metric-popup-close" onClick={onClose}>✕</button>
          </div>

          <div className="metric-popup-body">
            {/* Big metric */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 900, color: cfg.accentColor, lineHeight: 1, transition: 'all 0.2s' }}>
                {selectedSleep.hrs}
              </span>
              <span style={{ fontSize: '1rem', color: '#a8c8e0' }}>hrs</span>
            </div>

            {/* Stats grid — update per day */}
            <div className="metric-popup-stats-grid" style={{ marginBottom: '1rem' }}>
              <div className="metric-popup-stat-box">
                <div style={{ fontSize: '0.68rem', color: '#a8c8e0', marginBottom: 3 }}>7-Day Average</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a78bfa' }}>{SLEEP_AVG} hrs</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>Near your goal</div>
              </div>
              <div className="metric-popup-stat-box">
                <div style={{ fontSize: '0.68rem', color: '#a8c8e0', marginBottom: 3 }}>Goal</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>8.0 hrs</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>Recommended</div>
              </div>
              <div className="metric-popup-stat-box">
                <div style={{ fontSize: '0.68rem', color: '#a8c8e0', marginBottom: 3 }}>Sleep Score</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#818cf8' }}>{selectedSleep.score}/100</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>
                  {selectedSleep.score >= 85 ? 'Excellent' : selectedSleep.score >= 75 ? 'Above average' : 'Below average'}
                </div>
              </div>
              <div className="metric-popup-stat-box">
                <div style={{ fontSize: '0.68rem', color: '#a8c8e0', marginBottom: 3 }}>Best Night</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24' }}>
                  {Math.max(...SLEEP_DAYS.map(d=>d.hrs))} hrs
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>Friday</div>
              </div>
            </div>

            {/* Interactive weekly bar chart */}
            <div className="metric-popup-section-label">Weekly Breakdown</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center', marginBottom: '1rem' }}>
              {SLEEP_DAYS.map((d, i) => {
                const pct = (d.hrs / maxSleepHrs) * 100;
                const isSelected = i === selectedSleepIdx;
                return (
                  <div key={i} onClick={() => setSelectedSleepIdx(i)} style={{ cursor: 'pointer' }} className="hr-day-col">
                    <div style={{ fontSize: '0.6rem', color: isSelected ? '#fff' : '#a8c8e0', marginBottom: 3, fontWeight: isSelected ? 700 : 400 }}>{d.day}</div>
                    <div style={{ height: 44, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 3 }}>
                      <div style={{
                        width: '75%', borderRadius: '3px 3px 0 0', height: `${pct}%`,
                        background: isSelected ? cfg.accentColor : cfg.accentColor + '44',
                        boxShadow: isSelected ? `0 0 8px ${cfg.accentColor}88` : 'none',
                        transition: 'background 0.2s, height 0.3s',
                      }} />
                    </div>
                    <div style={{ fontSize: '0.6rem', fontWeight: isSelected ? 700 : 400, color: isSelected ? cfg.accentColor : '#a8c8e0' }}>{d.hrs}</div>
                  </div>
                );
              })}
            </div>

            {/* Sleep stages — update per day */}
            <div className="metric-popup-section-label">Sleep Stages</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1rem' }}>
              {[
                { label: 'Deep Sleep',  value: selectedSleep.deep,  pct: selectedSleep.deepPct,  color: '#6366f1' },
                { label: 'REM Sleep',   value: selectedSleep.rem,   pct: selectedSleep.remPct,   color: '#a78bfa' },
                { label: 'Light Sleep', value: selectedSleep.light, pct: selectedSleep.lightPct, color: '#c4b5fd' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.75rem', flex: 1, color: '#e2e8f0' }}>{s.label}</span>
                  <div style={{ width: 120, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                    <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: 3, transition: 'width 0.3s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e2e8f0', width: 50, textAlign: 'right' }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Insight */}
            <div className="metric-popup-insight" style={{ borderColor: cfg.accentColor + '33', background: cfg.accentColor + '0d' }}>
              <strong style={{ color: cfg.accentColor, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Icon src={cfg.insight.icon} size={16} /> {cfg.insight.title}:
              </strong> {cfg.insight.text}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Steps popup (interactive day selection) ────────────────────────────────
  if (type === 'steps') {
    const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const stPct = Math.round((selectedSteps.steps / selectedSteps.goal) * 100);
    const stepsLeft = Math.max(0, selectedSteps.goal - selectedSteps.steps);
    return (
      <div className="metric-popup-overlay" onClick={handleOverlayClick}>
        <div className="metric-popup">
          <div className="metric-popup-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Icon src={cfg.icon} size={26} />
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{cfg.title}</div>
                <div style={{ fontSize: '0.72rem', color: '#a8c8e0' }}>{DAY_NAMES[selectedStepsIdx]} · {stPct}% of goal</div>
              </div>
              <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: cfg.badge.color + '22', color: cfg.badge.color, border: `1px solid ${cfg.badge.color}55` }}>
                {cfg.badge.label.toUpperCase()}
              </span>
            </div>
            <button className="metric-popup-close" onClick={onClose}>✕</button>
          </div>

          <div className="metric-popup-body">
            {/* Big metric */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 900, color: cfg.accentColor, lineHeight: 1, transition: 'all 0.2s' }}>
                {selectedSteps.steps.toLocaleString()}
              </span>
              <span style={{ fontSize: '1rem', color: '#a8c8e0' }}>steps</span>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#a8c8e0', marginBottom: 4 }}>
                <span>{selectedSteps.steps.toLocaleString()} steps</span>
                <span style={{ color: '#34d399', fontWeight: 700 }}>{stPct}% of {selectedSteps.goal.toLocaleString()}</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(stPct,100)}%`, background: 'linear-gradient(90deg,#34d399,#10b981)', borderRadius: 4, transition: 'width 0.4s ease' }} />
              </div>
            </div>

            {/* Stats grid */}
            <div className="metric-popup-stats-grid" style={{ marginBottom: '1rem' }}>
              <div className="metric-popup-stat-box">
                <div style={{ fontSize: '0.68rem', color: '#a8c8e0', marginBottom: 3 }}>Daily Goal</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>{selectedSteps.goal.toLocaleString()}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>{stepsLeft > 0 ? `${stepsLeft.toLocaleString()} steps left!` : 'Goal reached! 🎉'}</div>
              </div>
              <div className="metric-popup-stat-box">
                <div style={{ fontSize: '0.68rem', color: '#a8c8e0', marginBottom: 3 }}>Distance</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>{selectedSteps.dist} km</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>~{((selectedSteps.goal - selectedSteps.steps) * 0.00075).toFixed(1)} km to go</div>
              </div>
              <div className="metric-popup-stat-box">
                <div style={{ fontSize: '0.68rem', color: '#a8c8e0', marginBottom: 3 }}>Calories Burned</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fb923c' }}>{selectedSteps.cal} kcal</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>Active burn</div>
              </div>
              <div className="metric-popup-stat-box">
                <div style={{ fontSize: '0.68rem', color: '#a8c8e0', marginBottom: 3 }}>7-Day Avg</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a78bfa' }}>{STEPS_AVG.toLocaleString()}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>Above average</div>
              </div>
            </div>

            {/* Interactive weekly bar chart */}
            <div className="metric-popup-section-label">Weekly Breakdown</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center', marginBottom: '1rem' }}>
              {STEPS_DAYS.map((d, i) => {
                const pct = (d.steps / maxStepsVal) * 100;
                const isSelected = i === selectedStepsIdx;
                return (
                  <div key={i} onClick={() => setSelectedStepsIdx(i)} style={{ cursor: 'pointer' }} className="hr-day-col">
                    <div style={{ fontSize: '0.6rem', color: isSelected ? '#fff' : '#a8c8e0', marginBottom: 3, fontWeight: isSelected ? 700 : 400 }}>{d.day}</div>
                    <div style={{ height: 44, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 3 }}>
                      <div style={{
                        width: '75%', borderRadius: '3px 3px 0 0', height: `${pct}%`,
                        background: isSelected ? cfg.accentColor : cfg.accentColor + '44',
                        boxShadow: isSelected ? `0 0 8px ${cfg.accentColor}88` : 'none',
                        transition: 'background 0.2s, height 0.3s',
                      }} />
                    </div>
                    <div style={{ fontSize: '0.6rem', fontWeight: isSelected ? 700 : 400, color: isSelected ? cfg.accentColor : '#a8c8e0' }}>
                      {d.steps >= 1000 ? `${(d.steps/1000).toFixed(1)}k` : d.steps}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Insight */}
            <div className="metric-popup-insight" style={{ borderColor: cfg.accentColor + '33', background: cfg.accentColor + '0d' }}>
              <strong style={{ color: cfg.accentColor, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Icon src={cfg.insight.icon} size={16} /> {cfg.insight.title}:
              </strong> {stepsLeft > 0
                ? `Just ${stepsLeft.toLocaleString()} more steps to complete today's challenge and earn 50 XP. A short ${Math.ceil(stepsLeft/120)}-minute walk will do it!`
                : `Great work! You've hit your step goal for ${DAY_NAMES[selectedStepsIdx]}. Keep the momentum going!`
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Stress popup (interactive day selection) ───────────────────────────────
  if (type === 'stress') {
    const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const stressColor = (l) => l < 40 ? '#34d399' : l < 60 ? '#fbbf24' : '#f87171';
    const stressLabel = (l) => l < 40 ? 'Low' : l < 60 ? 'Moderate' : 'High';
    const accentColor = stressColor(selectedStress.level);

    return (
      <div className="metric-popup-overlay" onClick={handleOverlayClick}>
        <div className="metric-popup">
          <div className="metric-popup-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Icon src={cfg.icon} size={26} />
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{cfg.title}</div>
                <div style={{ fontSize: '0.72rem', color: '#a8c8e0' }}>HRV-based · {DAY_NAMES[selectedStressIdx]}</div>
              </div>
              <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: accentColor + '22', color: accentColor, border: `1px solid ${accentColor}55` }}>
                {stressLabel(selectedStress.level).toUpperCase()}
              </span>
            </div>
            <button className="metric-popup-close" onClick={onClose}>✕</button>
          </div>

          <div className="metric-popup-body">
            {/* Big metric */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 900, color: accentColor, lineHeight: 1, transition: 'color 0.3s' }}>
                {selectedStress.level}
              </span>
              <span style={{ fontSize: '1rem', color: '#a8c8e0' }}>/ 100</span>
            </div>

            {/* Line chart for selected day */}
            <div style={{ marginBottom: '1rem', borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.02)', padding: '0.5rem' }}>
              <PopupLineChart data={selectedStress.chart} color={accentColor} />
            </div>

            {/* Stats grid */}
            <div className="metric-popup-stats-grid" style={{ marginBottom: '1rem' }}>
              <div className="metric-popup-stat-box">
                <div style={{ fontSize: '0.68rem', color: '#a8c8e0', marginBottom: 3 }}>Current Level</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: accentColor }}>{selectedStress.level}/100</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>{stressLabel(selectedStress.level)} range</div>
              </div>
              <div className="metric-popup-stat-box">
                <div style={{ fontSize: '0.68rem', color: '#a8c8e0', marginBottom: 3 }}>HRV Score</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>{selectedStress.hrv} ms</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>Above avg for age</div>
              </div>
              <div className="metric-popup-stat-box">
                <div style={{ fontSize: '0.68rem', color: '#a8c8e0', marginBottom: 3 }}>Peak Stress</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f87171' }}>{selectedStress.peak}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>Around {selectedStress.peakTime}</div>
              </div>
              <div className="metric-popup-stat-box">
                <div style={{ fontSize: '0.68rem', color: '#a8c8e0', marginBottom: 3 }}>Recovery Score</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a78bfa' }}>{selectedStress.recovery}/100</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>{selectedStress.recovery >= 80 ? 'Great recovery' : 'Good recovery'}</div>
              </div>
            </div>

            {/* Interactive weekly bar chart */}
            <div className="metric-popup-section-label">Weekly Breakdown</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center', marginBottom: '1rem' }}>
              {STRESS_DAYS.map((d, i) => {
                const pct = (d.level / maxStressVal) * 100;
                const isSelected = i === selectedStressIdx;
                const barCol = stressColor(d.level);
                return (
                  <div key={i} onClick={() => setSelectedStressIdx(i)} style={{ cursor: 'pointer' }} className="hr-day-col">
                    <div style={{ fontSize: '0.6rem', color: isSelected ? '#fff' : '#a8c8e0', marginBottom: 3, fontWeight: isSelected ? 700 : 400 }}>{d.day}</div>
                    <div style={{ height: 44, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 3 }}>
                      <div style={{
                        width: '75%', borderRadius: '3px 3px 0 0', height: `${pct}%`,
                        background: isSelected ? barCol : barCol + '44',
                        boxShadow: isSelected ? `0 0 8px ${barCol}88` : 'none',
                        transition: 'background 0.2s, height 0.3s',
                      }} />
                    </div>
                    <div style={{ fontSize: '0.6rem', fontWeight: isSelected ? 700 : 400, color: isSelected ? barCol : '#a8c8e0' }}>{d.level}</div>
                  </div>
                );
              })}
            </div>

            {/* Insight */}
            <div className="metric-popup-insight" style={{ borderColor: accentColor + '33', background: accentColor + '0d' }}>
              <strong style={{ color: accentColor, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Icon src={cfg.insight.icon} size={16} /> {cfg.insight.title}:
              </strong> {selectedStress.level < 40
                ? `Great job keeping stress low on ${DAY_NAMES[selectedStressIdx]}! Your HRV of ${selectedStress.hrv}ms shows strong recovery.`
                : selectedStress.level < 60
                ? `Moderate stress on ${DAY_NAMES[selectedStressIdx]}. A 5-minute breathing exercise before sleep can improve your HRV and boost your DISCIPLINE stat!`
                : `High stress detected on ${DAY_NAMES[selectedStressIdx]}. Take some time to rest and recover — your body will thank you.`
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── All other popups ────────────────────────────────────────────────────────
  return (
    <div className="metric-popup-overlay" onClick={handleOverlayClick}>
      <div className="metric-popup">
        {/* Header */}
        <div className="metric-popup-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Icon src={cfg.icon} size={26} />
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{cfg.title}</div>
              <div style={{ fontSize: '0.72rem', color: '#a8c8e0' }}>{cfg.subtitle}</div>
            </div>
            <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: cfg.badge.color + '22', color: cfg.badge.color, border: `1px solid ${cfg.badge.color}55` }}>
              {cfg.badge.label.toUpperCase()}
            </span>
          </div>
          <button className="metric-popup-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="metric-popup-body">
          {/* Big metric */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'inherit', fontSize: '3rem', fontWeight: 900, color: cfg.accentColor, lineHeight: 1 }}>{cfg.metricValue}</span>
            <span style={{ fontSize: '1rem', color: '#a8c8e0' }}>{cfg.metricUnit}</span>
          </div>

          {/* Line chart (stress) */}
          {cfg.chartData && (
            <div style={{ marginBottom: '1rem', borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.02)', padding: '0.5rem' }}>
              <PopupLineChart data={cfg.chartData} color={cfg.chartColor} />
            </div>
          )}

          {/* Calories donut row */}
          {cfg.donut && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1rem' }}>
              <svg width="88" height="88" viewBox="0 0 72 72" style={{ flexShrink: 0 }}>
                <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                <circle cx="36" cy="36" r="28" fill="none" stroke="#fb923c" strokeWidth="7"
                  strokeDasharray={`${(cfg.donut.burned / cfg.donut.goal) * 2 * Math.PI * 28} ${2 * Math.PI * 28}`}
                  strokeLinecap="round" transform="rotate(-90 36 36)" />
                <text x="36" y="40" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">
                  {Math.round((cfg.donut.burned / cfg.donut.goal) * 100)}%
                </text>
              </svg>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#a8c8e0', marginBottom: 2 }}>Intake: <strong style={{ color: '#fff' }}>{cfg.donut.intake.toLocaleString()} kcal</strong></div>
                <div style={{ fontSize: '0.75rem', color: '#a8c8e0' }}>Goal: <strong style={{ color: '#fff' }}>{cfg.donut.goal.toLocaleString()} kcal</strong></div>
=======
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const HP_MAX = 100;
const ENERGY_MAX = 100;
const DISCIPLINE_MAX = 100;

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedStats = localStorage.getItem('stats');

    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Seed with cached stats immediately, then refresh from API
    if (storedStats) {
      setStats(JSON.parse(storedStats));
      setLoading(false);
    }

    fetch(`http://localhost:8001/api/stats/${parsedUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setStats(data);
          localStorage.setItem('stats', JSON.stringify(data));
        }
      })
      .catch(() => {/* use cached stats if fetch fails */})
      .finally(() => setLoading(false));
  }, [navigate]);

  const hpPct = stats ? Math.round((stats.hp / HP_MAX) * 100) : 0;
  const energyPct = stats ? Math.min(Math.round((stats.totalEnergy / ENERGY_MAX) * 100), 100) : 0;
  const disciplinePct = stats ? Math.min(Math.round((stats.totalDiscipline / DISCIPLINE_MAX) * 100), 100) : 0;

  return (
    <div className="page-container">
      <div className="dashboard-grid">

        {/* Avatar and Stats Section */}
        <div className="card large-card">
          <div className="avatar-section">
            <div className="avatar-placeholder" data-testid="avatar-image"></div>

            {user && (
              <p className="dashboard-greeting">Welcome, {user.fullName}!</p>
            )}

            {stats && (
              <div className="level-info">
                <span className="level-badge">Level {stats.level}</span>
                <span className="xp-display">{stats.totalXp} XP</span>
              </div>
            )}

            <div className="stat-bars">
              <div className="stat-bar" data-testid="hp-bar">
                <span className="stat-icon">❤️</span>
                <div className="progress-bar">
                  <div className="progress-fill red" style={{ width: `${hpPct}%` }}></div>
                </div>
                <span className="stat-label">
                  HP {loading ? '—' : `${stats?.hp ?? 0}/${HP_MAX}`}
                </span>
              </div>

              <div className="stat-bar" data-testid="energy-bar">
                <span className="stat-icon">⚡</span>
                <div className="progress-bar">
                  <div className="progress-fill blue" style={{ width: `${energyPct}%` }}></div>
                </div>
                <span className="stat-label">
                  Energy {loading ? '—' : stats?.totalEnergy ?? 0}
                </span>
              </div>

              <div className="stat-bar" data-testid="discipline-bar">
                <span className="stat-icon">💪</span>
                <div className="progress-bar">
                  <div className="progress-fill green" style={{ width: `${disciplinePct}%` }}></div>
                </div>
                <span className="stat-label">
                  Discipline {loading ? '—' : stats?.totalDiscipline ?? 0}
                </span>
>>>>>>> 6e5e852d0642ea4cf449851088218ed2a345af31
              </div>
            </div>
          )}

          {/* Steps progress bar */}
          {cfg.progress && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#a8c8e0', marginBottom: 4 }}>
                <span>{cfg.progress.current.toLocaleString()} steps</span>
                <span style={{ color: '#34d399', fontWeight: 700 }}>{cfg.progress.pct}% of {cfg.progress.goal.toLocaleString()}</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${cfg.progress.pct}%`, background: 'linear-gradient(90deg,#34d399,#10b981)', borderRadius: 4, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          )}

          {/* Stats grid */}
          {cfg.stats && (
            <div className="metric-popup-stats-grid">
              {cfg.stats.map((s, i) => (
                <div key={i} className="metric-popup-stat-box">
                  <div style={{ fontSize: '0.68rem', color: '#a8c8e0', marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>{s.note}</div>
                </div>
              ))}
            </div>
          )}

          {/* Weekly bar chart */}
          {cfg.weeklyData && (
            <>
              <div className="metric-popup-section-label">Weekly Breakdown</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center', marginBottom: '1rem' }}>
                {cfg.weeklyData.map((d, i) => {
                  const maxVal = Math.max(...cfg.weeklyData.map(x => parseFloat(x.val.replace('k','')) || 0));
                  const thisVal = parseFloat(d.val.replace('k','')) || 0;
                  const pct = maxVal ? (thisVal / maxVal) * 100 : 50;
                  return (
                    <div key={i}>
                      <div style={{ fontSize: '0.6rem', color: '#a8c8e0', marginBottom: 3 }}>{d.day}</div>
                      <div style={{ height: 44, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 3 }}>
                        <div style={{ width: '75%', borderRadius: '3px 3px 0 0', height: `${pct}%`, background: d.active ? cfg.weeklyColor : cfg.weeklyColor + '44', transition: 'height 0.4s ease' }} />
                      </div>
                      <div style={{ fontSize: '0.6rem', fontWeight: d.active ? 700 : 400, color: d.active ? cfg.weeklyColor : '#a8c8e0' }}>{d.val}</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Sleep stages */}
          {cfg.stages && (
            <>
              <div className="metric-popup-section-label">Sleep Stages (Last Night)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1rem' }}>
                {cfg.stages.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.75rem', flex: 1, color: '#e2e8f0' }}>{s.label}</span>
                    <div style={{ width: 120, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                      <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e2e8f0', width: 50, textAlign: 'right' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Macros */}
          {cfg.macros && (
            <>
              <div className="metric-popup-section-label">Macronutrients</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1rem' }}>
                {cfg.macros.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.75rem', flex: 1, color: '#e2e8f0' }}>{m.label}</span>
                    <div style={{ width: 120, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                      <div style={{ width: `${m.pct}%`, height: '100%', background: m.color, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e2e8f0', width: 36, textAlign: 'right' }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Insight */}
          {cfg.insight && (
            <div className="metric-popup-insight" style={{ borderColor: cfg.accentColor + '33', background: cfg.accentColor + '0d' }}>
              <strong style={{ color: cfg.accentColor, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Icon src={cfg.insight.icon} size={16} /> {cfg.insight.title}:
              </strong> {cfg.insight.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// ─── Flying Particle ──────────────────────────────────────────────────────────
const FlyingParticle = ({ p }) => (
  <div
    style={{
      position: 'fixed', left: p.x, top: p.y, width: 24, height: 24,
      transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 99999,
      opacity: 0, animation: `dbFly 1.5s cubic-bezier(0.22,0.61,0.36,1) ${p.delay}s forwards`,
      '--tx': `${p.tx}px`, '--ty': `${p.ty}px`, filter: `drop-shadow(0 0 5px ${p.color})`,
    }}
  >
    <img src={p.icon} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
  </div>
);

<<<<<<< HEAD
// ─── Reward Popup ─────────────────────────────────────────────────────────────
const RewardPopup = ({ popup }) => {
  if (!popup) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99998, pointerEvents: 'none' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(14,34,54,0.97), rgba(26,58,82,0.97))',
        border: '1px solid rgba(91,184,255,0.35)', borderRadius: 24,
        padding: '1.6rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(91,184,255,0.15)',
        backdropFilter: 'blur(16px)', minWidth: 260,
        animation: 'dbPopIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards, dbPopOut 0.4s ease 2.3s forwards',
      }}>
        <div style={{ animation: 'dbSpin 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
          <img src="/star.png" alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} />
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Challenge Complete!</div>
        <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.3rem 0.85rem', borderRadius:20, background:'rgba(52,211,153,0.15)', border:'1px solid rgba(52,211,153,0.4)', color:'#34d399', fontWeight:800, fontSize:'0.88rem' }}>
            <img src="/star.png" alt="" style={{ width:18, height:18, objectFit:'contain' }} />+{popup.xp} XP
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.3rem 0.85rem', borderRadius:20, background:'rgba(251,191,36,0.15)', border:'1px solid rgba(251,191,36,0.4)', color:'#fbbf24', fontWeight:800, fontSize:'0.88rem' }}>
            <img src="/profit.png" alt="" style={{ width:18, height:18, objectFit:'contain' }} />+{popup.coins} Coins
=======
        {/* Heart Rate Card */}
        <div className="card small-card" data-testid="heart-rate-card">
          <h3>Heart Rate</h3>
          <div className="heart-icon">❤️</div>
          <div className="heart-rate-value">
            <span className="stat-placeholder-text">No data yet</span>
          </div>
        </div>

        {/* Sleep Card */}
        <div className="card small-card" data-testid="sleep-card">
          <h3>Sleep</h3>
          <div className="sleep-chart">
            <span className="stat-placeholder-text">No data yet</span>
          </div>
        </div>

        {/* Activities Card */}
        <div className="card small-card" data-testid="steps-card">
          <h3>Activities</h3>
          <div className="steps-content">
            <p className="stat-big-value">
              {loading ? '—' : stats?.totalActivitiesLogged ?? 0}
            </p>
            <span className="stat-unit">logged</span>
>>>>>>> 6e5e852d0642ea4cf449851088218ed2a345af31
          </div>
          {popup.statBonuses.map((s, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.3rem 0.85rem', borderRadius:20, background:`${s.color}22`, border:`1px solid ${s.color}66`, color:s.color, fontWeight:800, fontSize:'0.88rem' }}>
              <img src={s.icon} alt="" style={{ width:18, height:18, objectFit:'contain' }} />+{s.val} {s.label}
            </div>
          ))}
        </div>
<<<<<<< HEAD
=======

        {/* Calories Card */}
        <div className="card small-card" data-testid="calories-card">
          <h3>Calories Burned</h3>
          <div className="calories-chart">
            <p className="stat-big-value">
              {loading ? '—' : stats?.totalCaloriesBurned ?? 0}
            </p>
            <span className="stat-unit">kcal</span>
          </div>
        </div>

        {/* Challenges Card */}
        <div className="card medium-card" data-testid="challenges-summary-card">
          <h3>Challenges</h3>
          <div className="challenge-list">
            <span className="stat-placeholder-text">No challenges yet</span>
          </div>
        </div>

        {/* Distance Card */}
        <div className="card medium-card" data-testid="stress-card">
          <h3>Distance</h3>
          <div className="stress-meter">
            <p className="stat-big-value">
              {loading ? '—' : (stats?.totalDistance ?? 0).toFixed(1)}
            </p>
            <span className="stat-unit">km</span>
          </div>
        </div>

        {/* Action Buttons */}
        <button className="dashboard-action-btn log-btn" data-testid="log-activities-btn">
          Log Activities and Food Intake
        </button>

        <button className="dashboard-action-btn sync-btn" data-testid="sync-device-btn">
          Sync Device
        </button>

>>>>>>> 6e5e852d0642ea4cf449851088218ed2a345af31
      </div>
    </div>
  );
};

// ─── Challenges Card ──────────────────────────────────────────────────────────
const ChallengesCard = ({ onViewAll, onChallengeComplete }) => {
  const [checked,   setChecked]   = useState(loadChecked);
  const [particles, setParticles] = useState([]);
  const [popup,     setPopup]     = useState(null);
  const itemRefs = useRef({});

  useEffect(() => {
    const sync = () => setChecked(loadChecked());
    sync();
    window.addEventListener('focus', sync);
    return () => window.removeEventListener('focus', sync);
  }, []);

  const spawnParticles = useCallback((originEl, challenge) => {
    const rect    = originEl.getBoundingClientRect();
    const originX = rect.left + rect.width  / 2;
    const originY = rect.top  + rect.height / 2;
    const xpPos   = getCenter(document.querySelector('.xp-chip'));
    const coinPos = getCenter(document.querySelector('.coins-chip'));
    const now = Date.now();
    const batch = [];
    for (let i = 0; i < 6; i++) {
      batch.push({ id:`${now}-xp-${i}`, x:originX, y:originY, tx:xpPos.x-originX+(Math.random()-0.5)*24, ty:xpPos.y-originY, icon:'/star.png', color:'#34d399', delay:i*0.07 });
    }
    for (let i = 0; i < 6; i++) {
      batch.push({ id:`${now}-coin-${i}`, x:originX, y:originY, tx:coinPos.x-originX+(Math.random()-0.5)*24, ty:coinPos.y-originY, icon:'/profit.png', color:'#fbbf24', delay:0.08+i*0.07 });
    }
    if (challenge.barEffects) {
      Object.entries(challenge.barEffects).forEach(([statKey], idx) => {
        const meta = STAT_META[statKey];
        if (!meta) return;
        const barClass = statKey === 'hp' ? 'red' : statKey === 'energy' ? 'blue' : 'green';
        const targetEl = document.querySelector(`.progress-fill.${barClass}`);
        const targetPos = getCenter(targetEl);
        for (let i = 0; i < 5; i++) {
          batch.push({ id:`${now}-stat-${statKey}-${i}`, x:originX, y:originY, tx:targetPos.x-originX+(Math.random()-0.5)*30, ty:targetPos.y-originY, icon:meta.icon, color:meta.color, delay:0.14+idx*0.12+i*0.08 });
        }
        const arrivalMs = (0.14 + idx * 0.12) * 1000 + 1550;
        setTimeout(() => {
          const el = document.querySelector(`.progress-fill.${barClass}`);
          if (!el) return;
          el.classList.add('db-bar-pulse');
          setTimeout(() => el.classList.remove('db-bar-pulse'), 900);
        }, arrivalMs);
      });
    }
    setParticles(prev => [...prev, ...batch]);
    setTimeout(() => { setParticles(prev => prev.filter(p => !batch.find(b => b.id === p.id))); }, 3200);
  }, []);

  const handleTick = (i) => {
    if (checked[i]) return;
    const next = { ...checked, [i]: true };
    setChecked(next);
    saveChecked(next);
    const c = DAILY[i];
    const coins = Math.max(5, Math.round(c.xp * 0.2));
    const statBonuses = c.barEffects
      ? Object.entries(c.barEffects).filter(([k]) => STAT_META[k]).map(([k, v]) => ({ ...STAT_META[k], val: v }))
      : [];
    setPopup({ xp: c.xp, coins, statBonuses });
    setTimeout(() => setPopup(null), 2800);
    const el = itemRefs.current[i];
    if (el) spawnParticles(el, c);
    if (onChallengeComplete) onChallengeComplete(c.xp, coins, c.barEffects || null);
  };

  const done = Object.values(checked).filter(Boolean).length;

  return (
    <>
      {particles.map(p => <FlyingParticle key={p.id} p={p} />)}
      <RewardPopup popup={popup} />
      <div className="bio-card-inner challenges-summary-inner">
        <div className="bio-card-top">
          <img src="/target.png" alt="Challenges" className="bio-icon" style={{width:22,height:22,objectFit:'contain'}} />
          <div>
            <div className="bio-title">Challenges</div>
            <div className="bio-subtitle">{done}/{DAILY.length} daily done</div>
          </div>
          <button className="view-all-btn" onClick={onViewAll}>View All →</button>
        </div>
        <div className="ch-section-label">DAILY</div>
        <div className="ch-list">
          {DAILY.slice(0, 3).map((c, i) => {
            const coins = Math.max(5, Math.round(c.xp * 0.2));
            return (
              <div key={i} ref={el => itemRefs.current[i] = el} className={`ch-row ${checked[i] ? 'ch-done' : ''}`}>
                <div className={`ch-check ${checked[i] ? 'checked' : ''}`} onClick={() => handleTick(i)}>
                  {checked[i] && '✓'}
                </div>
                <div className="ch-row-body">
                  <span className="ch-title">{c.title}</span>
                  <div className="ch-tags">
                    {/* XP tag */}
                    <span className="ch-tag ch-tag-xp">
                      <img src="/star.png" alt="" style={{width:11,height:11,objectFit:'contain'}}/> {c.xp} XP
                    </span>
                    {/* Stat bonus tags */}
                    {c.barEffects && Object.entries(c.barEffects).map(([key, val]) => {
                      const meta = STAT_META[key];
                      if (!meta) return null;
                      return (
                        <span key={key} className="ch-tag" style={{background: meta.color + '22', color: meta.color, border: `1px solid ${meta.color}55`}}>
                          <img src={meta.icon} alt="" style={{width:11,height:11,objectFit:'contain'}}/> +{val} {meta.label.toUpperCase()}
                        </span>
                      );
                    })}
                    {/* Coins tag */}
                    <span className="ch-tag ch-tag-coins">
                      <img src="/dollar.png" alt="" style={{width:11,height:11,objectFit:'contain'}}/> +{coins} COINS
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="ch-section-label" style={{ marginTop: '0.5rem' }}>WEEKLY</div>
        <div className="ch-list">
          {WEEKLY.slice(0, 2).map((c, i) => (
            <div key={i} className="ch-weekly-row">
              <div className="ch-weekly-top">
                <span className="ch-title">{c.title}</span>
                <span className="ch-reward"><img src="/lightning.png" alt="xp" style={{width:13,height:13,objectFit:'contain',verticalAlign:'middle',marginRight:3}}/>{c.reward}</span>
              </div>
              <div className="ch-weekly-bar">
                <div className="ch-weekly-fill" style={{ width: `${c.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const DashboardAvatar = ({ selections }) => {
  const skin=selections?.skin||'s1', armour=selections?.armour||'ar1';
  const style=selections?.hairStyle||'hs1', color=selections?.hairColor||'hc1';
  const earsId=selections?.animalEars||'ae1';
  const colorName={hc1:'black',hc2:'brown',hc3:'blonde'}[color]||'black';
  const skinArmourImg=AVATAR_IMAGES.skinArmour[skin+'_'+armour]||null;
  const baseImg=AVATAR_IMAGES.base[skin]||'/Avatars/sittingavatar.jpg';
  const armourImg=skin==='s1'?(AVATAR_IMAGES.armour[armour]||null):null;
  const hairImg=AVATAR_IMAGES.hair[style+'_'+colorName]||null;
  const earsImg=AVATAR_IMAGES.ears[earsId]||null;
  return (
    <div className="dashboard-avatar-wrap">
      <img src={skinArmourImg||baseImg} alt="avatar" className="dashboard-avatar-img" onError={(e)=>{e.target.src='/Avatars/sittingavatar.jpg'}}/>
      {armourImg && <img src={armourImg} alt="armour" className="dashboard-avatar-layer" onError={(e)=>{e.target.style.display='none'}}/>}
      {hairImg   && <img src={hairImg}   alt="hair"   className="dashboard-avatar-layer" onError={(e)=>{e.target.style.display='none'}}/>}
      {earsImg   && <img src={earsImg}   alt="ears"   className="dashboard-avatar-layer" onError={(e)=>{e.target.style.display='none'}}/>}
    </div>
  );
};

const DashboardPet = ({ petId }) => {
  if (!petId) return null;
  const pet=PET_INFO[petId]; const petImg=AVATAR_IMAGES.pets[petId];
  if (petImg) return (
    <div className="dashboard-pet">
      <img src={petImg} alt={pet?.label||'Pet'} className="dashboard-pet-img" onError={(e)=>{e.target.style.display='none'}}/>
      <span className="dashboard-pet-name">{pet?.label}</span>
    </div>
  );
  return (
    <div className="dashboard-pet">
      <div className="dashboard-pet-emoji" style={{background:(pet?.color||'#ccc')+'22',borderColor:pet?.color}}>
        <span>{pet?.emoji}</span>
      </div>
      <span className="dashboard-pet-name">{pet?.label}</span>
    </div>
  );
};

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
const MiniBarChart = ({ data, color, height = 48 }) => {
  const max = Math.max(...data);
  return (
    <div className="mini-bar-chart">
      {data.map((v, i) => (
        <div key={i} className="mini-bar-wrap" style={{ height }}>
          <div className="mini-bar" style={{ height:`${(v/max)*100}%`, background:color, opacity:i===data.length-1?1:0.45+(i/data.length)*0.45 }}/>
        </div>
      ))}
    </div>
  );
};

// ─── Mini Line Chart ──────────────────────────────────────────────────────────
const MiniLineChart = ({ data, color, height = 52, width = 160 }) => {
  const max=Math.max(...data), min=Math.min(...data), range=max-min||1;
  const pts  = data.map((v,i)=>`${(i/(data.length-1))*width},${height-((v-min)/range)*(height-8)-4}`).join(' ');
  const area = data.map((v,i)=>`${(i/(data.length-1))*width},${height-((v-min)/range)*(height-8)-4}`);
  const areaPath=`M${area[0]} L${area.slice(1).join(' L')} L${width},${height} L0,${height} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{display:'block'}}>
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${color.replace('#','')})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
};

// ─── Bio Cards (now accept onClick) ──────────────────────────────────────────
const HeartRateCard = ({ onClick }) => {
  const data = [68,72,75,80,78,85,82,88,84,79,76,72];
  const hours = ['6am','7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm'];
  const [hoverIdx, setHoverIdx] = useState(null);
  const W = 160, H = 52;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const px = (i) => (i / (data.length - 1)) * W;
  const py = (v) => H - ((v - min) / range) * (H - 10) - 4;
  const pts = data.map((v,i) => `${px(i)},${py(v)}`).join(' ');
  const area = data.map((v,i) => `${px(i)},${py(v)}`);
  const areaPath = `M${area[0]} L${area.slice(1).join(' L')} L${W},${H} L0,${H} Z`;
  const hoveredVal = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <div className="bio-card-inner bio-card-clickable" onClick={onClick}>
      <div className="bio-card-top">
        <img src="/heartbeat.png" alt="Heart Rate" className="bio-icon" style={{width:22,height:22,objectFit:'contain'}} />
        <div><div className="bio-title">Heart Rate</div><div className="bio-subtitle">Resting</div></div>
        <div className="bio-badge green">Normal</div>
      </div>
      <div className="bio-value-row">
        <span className="bio-value" style={{color: hoveredVal ? '#ff5c7a' : undefined, transition:'color 0.15s'}}>
          {hoveredVal ?? 72}
        </span>
        <span className="bio-unit">bpm{hoveredVal ? ` · ${hours[hoverIdx]}` : ''}</span>
      </div>

      {/* Interactive SVG chart */}
      <div style={{position:'relative', width:'100%'}}>
        <svg
          width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
          style={{display:'block', overflow:'visible'}}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="hr-card-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff5c7a" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#ff5c7a" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#hr-card-grad)"/>
          <polyline points={pts} fill="none" stroke="#ff5c7a" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>

          {/* Hover dot + vertical line */}
          {hoverIdx !== null && (
            <>
              <line x1={px(hoverIdx)} y1={0} x2={px(hoverIdx)} y2={H} stroke="#ff5c7a" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3,2"/>
              <circle cx={px(hoverIdx)} cy={py(data[hoverIdx])} r="3.5" fill="#ff5c7a" stroke="#0f1923" strokeWidth="1.5"/>
            </>
          )}

          {/* Invisible hover zones per data point */}
          {data.map((v,i) => (
            <rect
              key={i}
              x={px(i) - W/(data.length*2)}
              y={0} width={W/data.length} height={H}
              fill="transparent"
              style={{cursor:'default'}}
              onMouseEnter={(e) => { e.stopPropagation(); setHoverIdx(i); }}
              onClick={(e) => e.stopPropagation()}
            />
          ))}
        </svg>

        {/* Floating tooltip */}
        {hoverIdx !== null && (
          <div style={{
            position:'absolute',
            left: `${(px(hoverIdx)/W)*100}%`,
            top: `${(py(data[hoverIdx])/H)*100}%`,
            transform: hoverIdx > data.length*0.7 ? 'translate(-110%, -130%)' : 'translate(8px, -130%)',
            background:'rgba(15,25,35,0.95)',
            border:'1px solid #ff5c7a55',
            borderRadius:6, padding:'3px 8px',
            fontSize:'0.65rem', fontWeight:700, color:'#ff5c7a',
            pointerEvents:'none', whiteSpace:'nowrap',
            boxShadow:'0 2px 8px rgba(0,0,0,0.5)',
            zIndex:10,
          }}>
            {data[hoverIdx]} bpm
          </div>
        )}
      </div>

      <div className="bio-footer"><span>Min: {min} bpm</span><span>Max: {max} bpm</span></div>
    </div>
  );
};

// Shared sleep data (used by both SleepCard and sleep popup)
const SLEEP_DAYS = [
  { day:'M', hrs:6.8, score:72, deep:'1h 10m', rem:'1h 50m', light:'3h 12m', deepPct:28, remPct:45, lightPct:38 },
  { day:'T', hrs:6.2, score:65, deep:'0h 58m', rem:'1h 35m', light:'3h 08m', deepPct:22, remPct:38, lightPct:35 },
  { day:'W', hrs:7.1, score:76, deep:'1h 22m', rem:'2h 00m', light:'3h 22m', deepPct:31, remPct:48, lightPct:40 },
  { day:'T', hrs:6.5, score:70, deep:'1h 05m', rem:'1h 45m', light:'3h 15m', deepPct:26, remPct:42, lightPct:37 },
  { day:'F', hrs:8.6, score:91, deep:'2h 10m', rem:'2h 40m', light:'3h 52m', deepPct:45, remPct:58, lightPct:48 },
  { day:'S', hrs:7.9, score:84, deep:'1h 48m', rem:'2h 20m', light:'3h 40m', deepPct:38, remPct:52, lightPct:44 },
  { day:'S', hrs:7.8, score:84, deep:'1h 42m', rem:'2h 15m', light:'3h 48m', deepPct:35, remPct:55, lightPct:45 },
];
const SLEEP_AVG = (SLEEP_DAYS.reduce((s,d)=>s+d.hrs,0)/SLEEP_DAYS.length).toFixed(1);

const SleepCard = ({ onClick }) => {
  const [selectedIdx, setSelectedIdx] = useState(6); // default Sunday
  const selected = SLEEP_DAYS[selectedIdx];

  return (
    <div className="bio-card-inner bio-card-clickable" onClick={onClick}>
      <div className="bio-card-top">
        <img src="/moon.png" alt="Sleep" className="bio-icon" style={{width:22,height:22,objectFit:'contain'}} />
        <div><div className="bio-title">Sleep</div><div className="bio-subtitle">Last 7 nights</div></div>
        <div className="bio-badge blue">Good</div>
      </div>
      <div className="bio-value-row">
        <span className="bio-value" style={{transition:'all 0.2s'}}>{selected.hrs}</span>
        <span className="bio-unit">hrs</span>
      </div>
      <div className="mini-bar-chart" style={{alignItems:'flex-end',gap:'4px'}}>
        {SLEEP_DAYS.map((d,i)=>(
          <div
            key={i}
            onClick={(e)=>{e.stopPropagation(); setSelectedIdx(i);}}
            style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1,gap:'3px',cursor:'pointer'}}
          >
            <div style={{
              width:'100%', borderRadius:'4px 4px 0 0',
              height:`${(d.hrs/9)*44}px`,
              background: i===selectedIdx ? '#a78bfa' : 'rgba(167,139,250,0.35)',
              boxShadow: i===selectedIdx ? '0 0 8px #a78bfa88' : 'none',
              transition:'background 0.2s, box-shadow 0.2s, height 0.3s'
            }}/>
            <span style={{fontSize:'0.55rem',color: i===selectedIdx ? '#a78bfa' : '#a8c8e0', fontWeight: i===selectedIdx ? 700 : 400}}>{d.day}</span>
          </div>
        ))}
      </div>
      <div className="bio-footer"><span>Avg: {SLEEP_AVG} hrs</span><span>Goal: 8 hrs</span></div>
    </div>
  );
};

// Shared steps data (used by both StepsCard and steps popup)
const STEPS_DAYS = [
  { day:'M', steps:8200,  dist:6.0, cal:378, goal:10000 },
  { day:'T', steps:7100,  dist:5.2, cal:327, goal:10000 },
  { day:'W', steps:9000,  dist:6.6, cal:414, goal:10000 },
  { day:'T', steps:7800,  dist:5.7, cal:359, goal:10000 },
  { day:'F', steps:11000, dist:8.1, cal:506, goal:10000 },
  { day:'S', steps:8600,  dist:6.3, cal:396, goal:10000 },
  { day:'S', steps:9158,  dist:6.7, cal:412, goal:10000 },
];
const STEPS_AVG = Math.round(STEPS_DAYS.reduce((s,d)=>s+d.steps,0)/STEPS_DAYS.length);

const StepsCard = ({ onClick }) => {
  const [selectedIdx, setSelectedIdx] = useState(6);
  const selected = STEPS_DAYS[selectedIdx];
  const maxSteps = Math.max(...STEPS_DAYS.map(d => d.steps));
  const pct = Math.round((selected.steps / selected.goal) * 100);

  return (
    <div className="bio-card-inner bio-card-clickable" onClick={onClick}>
      <div className="bio-card-top">
        <img src="/football.png" alt="Steps" className="bio-icon" style={{width:22,height:22,objectFit:'contain'}} />
        <div><div className="bio-title">Steps</div><div className="bio-subtitle">{STEPS_DAYS[selectedIdx].day === STEPS_DAYS[6].day && selectedIdx === 6 ? 'Today' : STEPS_DAYS[selectedIdx].day}</div></div>
        <div className="bio-badge green">On Track</div>
      </div>
      <div className="bio-value-row">
        <span className="bio-value" style={{transition:'all 0.2s'}}>{selected.steps.toLocaleString()}</span>
        <span className="bio-unit">steps</span>
      </div>
      {/* Interactive bar chart */}
      <div className="mini-bar-chart" style={{alignItems:'flex-end',gap:'3px'}}>
        {STEPS_DAYS.map((d,i) => (
          <div
            key={i}
            onClick={(e)=>{e.stopPropagation(); setSelectedIdx(i);}}
            style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1,gap:'0',cursor:'pointer'}}
          >
            <div style={{
              width:'100%', borderRadius:'2px 2px 0 0',
              height:`${(d.steps/maxSteps)*44}px`,
              background: i===selectedIdx ? '#34d399' : 'rgba(52,211,153,0.35)',
              boxShadow: i===selectedIdx ? '0 0 8px #34d39988' : 'none',
              transition:'background 0.2s, box-shadow 0.2s, height 0.3s'
            }}/>
          </div>
        ))}
      </div>
      <div className="bio-progress-row">
        <div className="bio-progress-track">
          <div className="bio-progress-fill" style={{width:`${Math.min(pct,100)}%`,background:'linear-gradient(90deg,#34d399,#10b981)',transition:'width 0.4s ease'}}/>
        </div>
        <span className="bio-progress-label">{pct}% of goal</span>
      </div>
    </div>
  );
};

const CaloriesCard = ({ onClick }) => {
  const burned=1840,intake=2200,goal=2551,pct=Math.round((burned/goal)*100);
  const r=28,circ=2*Math.PI*r,dash=(burned/goal)*circ;
  return (
    <div className="bio-card-inner bio-card-clickable" onClick={onClick}>
      <div className="bio-card-top">
        <img src="/fire.png" alt="Calories" className="bio-icon" style={{width:22,height:22,objectFit:'contain'}} />
        <div><div className="bio-title">Calories</div><div className="bio-subtitle">Today</div></div>
        <div className="bio-badge orange">Active</div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'1rem',margin:'0.5rem 0'}}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7"/>
          <circle cx="36" cy="36" r={r} fill="none" stroke="#fb923c" strokeWidth="7" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 36 36)"/>
          <text x="36" y="40" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">{pct}%</text>
        </svg>
        <div>
          <div className="bio-value-row" style={{marginBottom:'0.25rem'}}>
            <span className="bio-value" style={{fontSize:'1.6rem'}}>{burned.toLocaleString()}</span>
            <span className="bio-unit">kcal burned</span>
          </div>
          <div style={{fontSize:'0.72rem',color:'#a8c8e0'}}>Intake: {intake.toLocaleString()} kcal</div>
          <div style={{fontSize:'0.72rem',color:'#a8c8e0'}}>Goal: {goal.toLocaleString()} kcal</div>
        </div>
      </div>
      <div className="bio-footer"><span>Protein: 82g</span><span>Carbs: 210g</span><span>Fat: 54g</span></div>
    </div>
  );
};

// Shared stress data
const STRESS_DAYS = [
  { day:'M', level:38, hrv:62, peak:55, peakTime:'3pm', recovery:78, chart:[40,38,42,50,55,48,41,38,35,36,38,38] },
  { day:'T', level:62, hrv:51, peak:78, peakTime:'2pm', recovery:61, chart:[45,52,58,65,75,78,70,62,58,54,60,62] },
  { day:'W', level:30, hrv:68, peak:44, peakTime:'12pm',recovery:85, chart:[35,32,30,38,44,40,34,30,28,27,29,30] },
  { day:'T', level:51, hrv:55, peak:66, peakTime:'4pm', recovery:70, chart:[42,46,50,55,62,66,58,51,48,45,49,51] },
  { day:'F', level:44, hrv:59, peak:60, peakTime:'1pm', recovery:74, chart:[38,42,48,55,60,56,50,44,40,38,42,44] },
  { day:'S', level:25, hrv:72, peak:35, peakTime:'11am',recovery:90, chart:[28,26,25,30,35,32,28,25,22,21,23,25] },
  { day:'S', level:42, hrv:58, peak:67, peakTime:'2pm', recovery:71, chart:[55,62,48,70,65,45,52,58,44,50,47,42] },
];

const StressCard = ({ onClick }) => {
  const [selectedIdx, setSelectedIdx] = useState(6);
  const selected = STRESS_DAYS[selectedIdx];
  const maxLevel = Math.max(...STRESS_DAYS.map(d => d.level));
  const stressColor = (l) => l < 40 ? '#34d399' : l < 60 ? '#d97706' : '#dc2626';
  const stressLabel = (l) => l < 40 ? 'Low' : l < 60 ? 'Moderate' : 'High';
  const color = stressColor(selected.level);

  return (
    <div className="bio-card-inner bio-card-clickable" onClick={onClick}>
      <div className="bio-card-top">
        <img src="/stress-relief.png" alt="Stress" className="bio-icon" style={{width:22,height:22,objectFit:'contain'}} />
        <div><div className="bio-title">Stress</div><div className="bio-subtitle">HRV-based</div></div>
        <div className="bio-badge" style={{background:color+'22',color}}>{stressLabel(selected.level)}</div>
      </div>
      <div className="bio-value-row">
        <span className="bio-value" style={{color, transition:'color 0.3s'}}>{selected.level}</span>
        <span className="bio-unit">/ 100</span>
      </div>
      {/* Interactive bar chart */}
      <div className="mini-bar-chart" style={{alignItems:'flex-end',gap:'3px',height:'52px'}}>
        {STRESS_DAYS.map((d,i) => {
          const barColor = stressColor(d.level);
          return (
            <div
              key={i}
              onClick={(e)=>{e.stopPropagation(); setSelectedIdx(i);}}
              style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1,cursor:'pointer',height:'100%',justifyContent:'flex-end',gap:'3px'}}
            >
              <div style={{
                width:'100%', borderRadius:'2px 2px 0 0',
                height:`${(d.level/maxLevel)*100}%`,
                background: i===selectedIdx ? barColor : barColor+'55',
                boxShadow: i===selectedIdx ? `0 0 8px ${barColor}88` : 'none',
                transition:'background 0.2s, box-shadow 0.2s, height 0.3s'
              }}/>
            </div>
          );
        })}
      </div>
      <div style={{display:'flex',gap:'3px',marginTop:'3px'}}>
        {STRESS_DAYS.map((d,i)=>(
          <div key={i} style={{flex:1,textAlign:'center',fontSize:'0.55rem',color: i===selectedIdx ? stressColor(d.level) : '#a8c8e0', fontWeight: i===selectedIdx ? 700 : 400}}>{d.day}</div>
        ))}
      </div>

      {/* Stress level bar */}
      <div style={{marginTop:'0.6rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.6rem',color:'#a8c8e0',marginBottom:'4px'}}>
          <span>Stress Level</span>
          <span style={{color,fontWeight:700}}>{stressLabel(selected.level)}</span>
        </div>
        <div style={{height:6,borderRadius:3,background:'rgba(255,255,255,0.06)',overflow:'hidden'}}>
          <div style={{height:'100%',width:`${selected.level}%`,background:`linear-gradient(90deg,#34d399,#fbbf24,#f87171)`,borderRadius:3,transition:'width 0.4s ease'}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.5rem',color:'#475569',marginTop:'2px'}}>
          <span>Low</span><span>Moderate</span><span>High</span>
        </div>
      </div>

      {/* Quick stats row */}
      <div style={{display:'flex',gap:'0.5rem',marginTop:'0.6rem'}}>
        <div style={{flex:1,background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'0.4rem 0.5rem',textAlign:'center'}}>
          <div style={{fontSize:'0.55rem',color:'#a8c8e0',marginBottom:2}}>HRV</div>
          <div style={{fontSize:'0.85rem',fontWeight:800,color:'#34d399'}}>{selected.hrv}<span style={{fontSize:'0.55rem',fontWeight:400}}> ms</span></div>
        </div>
        <div style={{flex:1,background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'0.4rem 0.5rem',textAlign:'center'}}>
          <div style={{fontSize:'0.55rem',color:'#a8c8e0',marginBottom:2}}>Peak</div>
          <div style={{fontSize:'0.85rem',fontWeight:800,color:'#f87171'}}>{selected.peak}<span style={{fontSize:'0.55rem',fontWeight:400}}> /100</span></div>
        </div>
        <div style={{flex:1,background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'0.4rem 0.5rem',textAlign:'center'}}>
          <div style={{fontSize:'0.55rem',color:'#a8c8e0',marginBottom:2}}>Recovery</div>
          <div style={{fontSize:'0.85rem',fontWeight:800,color:'#a78bfa'}}>{selected.recovery}<span style={{fontSize:'0.55rem',fontWeight:400}}> /100</span></div>
        </div>
      </div>
      <div className="bio-footer">
        <span>Peak: {selected.peak} at {selected.peakTime}</span>
        <span>HRV: {selected.hrv} ms</span>
      </div>
    </div>
  );
};

// ─── Doctor Modal ─────────────────────────────────────────────────────────────
const BIOMARKERS = [
  {key:'heartRate',label:'Heart Rate',icon:'/heartbeat.png'},
  {key:'sleep',    label:'Sleep',      icon:'/moon.png'},
  {key:'steps',    label:'Steps',      icon:'/football.png'},
  {key:'calories', label:'Calories',   icon:'/fire.png'},
  {key:'stress',   label:'Stress',     icon:'/stress-relief.png'},
  {key:'hydration',label:'Hydration',  icon:'/dollar.png'},
];
const ViewDoctorModal = ({ onClose }) => {
  const [enabled,setEnabled]=useState(Object.fromEntries(BIOMARKERS.map(b=>[b.key,true])));
  return (
    <div className="doctor-modal-overlay" onClick={onClose}>
      <div className="doctor-modal" onClick={e=>e.stopPropagation()}>
        <div className="doctor-modal-header">
          <div className="doctor-avatar-circle"><img src="/doctor.png" alt="Doctor" style={{width:40,height:40,objectFit:'contain'}}/></div>
          <div className="doctor-header-info">
            <h2 className="doctor-name">Dr. Sarah Mitchell</h2>
            <span className="doctor-specialty">General Practitioner</span>
          </div>
          <button className="doctor-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="doctor-message">
          <span className="doctor-message-icon"><img src="/doctor.png" alt="" style={{width:18,height:18,objectFit:'contain'}}/></span>
          <p>"Great progress this week! Keep up your hydration goals and aim for 8 hours of sleep. You're on the right track!"</p>
        </div>
        <div className="doctor-biomarkers">
          <p className="doctor-section-title">Share Biomarkers with Doctor</p>
          <div className="doctor-biomarker-list">
            {BIOMARKERS.map(b=>(
              <div key={b.key} className="doctor-biomarker-row">
                <img src={b.icon} alt={b.label} className="doctor-biomarker-icon" style={{width:20,height:20,objectFit:'contain'}}/>
                <span className="doctor-biomarker-label">{b.label}</span>
                <div className={`doctor-toggle ${enabled[b.key]?'on':'off'}`} onClick={()=>setEnabled(p=>({...p,[b.key]:!p[b.key]}))}>
                  <div className="doctor-toggle-knob"/>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="doctor-modal-footer">
          <button className="doctor-send-btn" onClick={onClose}>Send to Doctor</button>
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = ({ avatarSelections, avatarName, bars = { hp:65, energy:80, discipline:45 }, onChallengeComplete }) => {
  const petId    = avatarSelections?.pets || null;
  const navigate = useNavigate();
  const [showDoctor,     setShowDoctor]     = useState(false);
  const [activeMetric,   setActiveMetric]   = useState(null); // 'heartRate' | 'sleep' | 'steps' | 'calories' | 'stress'

  return (
    <div className="page-container">
      <div className="dashboard-grid">

        {/* Large avatar card */}
        <div className="card large-card">
          <div className="avatar-section">
            <div className="dashboard-avatar-scene">
              <DashboardAvatar selections={avatarSelections}/>
              {avatarName && <span className="dashboard-avatar-name">{avatarName}</span>}
              <DashboardPet petId={petId}/>
            </div>
            <div className="stat-bars">
              <div className="stat-bar">
                <img src="/health.png" alt="HP" style={{width:28,height:28,objectFit:'contain',flexShrink:0}}/>
                <div className="progress-bar">
                  <div className="progress-fill red" style={{width:`${bars.hp}%`,transition:'width 0.6s ease'}}/>
                  <span className="stat-bar-pct">{bars.hp}%</span>
                </div>
                <span className="stat-label">HP</span>
              </div>
              <div className="stat-bar">
                <img src="/lighting.png" alt="Energy" style={{width:28,height:28,objectFit:'contain',flexShrink:0}}/>
                <div className="progress-bar">
                  <div className="progress-fill blue" style={{width:`${bars.energy}%`,transition:'width 0.6s ease'}}/>
                  <span className="stat-bar-pct">{bars.energy}%</span>
                </div>
                <span className="stat-label">Energy</span>
              </div>
              <div className="stat-bar">
                <img src="/roman-helmet.png" alt="Discipline" style={{width:28,height:28,objectFit:'contain',flexShrink:0}}/>
                <div className="progress-bar">
                  <div className="progress-fill green" style={{width:`${bars.discipline}%`,transition:'width 0.6s ease'}}/>
                  <span className="stat-bar-pct">{bars.discipline}%</span>
                </div>
                <span className="stat-label">Discipline</span>
              </div>
              <button className="dashboard-action-btn avatar-btn" onClick={()=>navigate('/program')}>Customize Avatar</button>
            </div>
          </div>
        </div>

        {/* Bio metric cards — each gets an onClick to open its popup */}
        <div className="card small-card bio-card" data-testid="heart-rate-card">
          <HeartRateCard onClick={() => setActiveMetric('heartRate')} />
        </div>
        <div className="card small-card bio-card" data-testid="sleep-card">
          <SleepCard onClick={() => setActiveMetric('sleep')} />
        </div>
        <div className="card small-card bio-card" data-testid="steps-card">
          <StepsCard onClick={() => setActiveMetric('steps')} />
        </div>
        <div className="card small-card bio-card" data-testid="calories-card">
          <CaloriesCard onClick={() => setActiveMetric('calories')} />
        </div>
        <div className="card medium-card bio-card" data-testid="challenges-summary-card">
          <ChallengesCard
            onViewAll={() => navigate('/challenges')}
            onChallengeComplete={onChallengeComplete}
          />
        </div>
        <div className="card medium-card bio-card" data-testid="stress-card">
          <StressCard onClick={() => setActiveMetric('stress')} />
        </div>

        {/* Action buttons */}
        <button className="dashboard-action-btn doctor-btn" onClick={() => setShowDoctor(true)}>
          <img src="/doctor.png" alt="" style={{width:18,height:18,objectFit:'contain',verticalAlign:'middle',marginRight:6}}/>
          View Doctor
        </button>
      </div>

      {/* Metric detail popups */}
      <MetricPopup type={activeMetric} onClose={() => setActiveMetric(null)} />

      {/* Doctor modal */}
      {showDoctor && <ViewDoctorModal onClose={() => setShowDoctor(false)} />}
    </div>
  );
};

export default Dashboard;
