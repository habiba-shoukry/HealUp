import React, { useState } from 'react';
import '../styles/GoalsProgress.css';

const Img = ({ src, size = 24 }) => (
  <img src={src} alt="" style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }} />
);

const GoalsProgress = ({ bars = { hp: 65, energy: 80, discipline: 45 } }) => {
 const [goals, setGoals] = useState([
   { id: 'g1', icon: '/training.png',       title: 'Run 50km this month',      current: 34, target: 50,  unit: 'km',       deadline: 'Mar 31', status: 'on-track',  xp: 300, coins: 50  },
   { id: 'g2', icon: '/plastic-bottle.png', title: 'Drink 2L water daily',     current: 18, target: 30,  unit: 'days',     deadline: 'Mar 31', status: 'on-track',  xp: 150, coins: 25  },
   { id: 'g3', icon: '/sleeping-mask.png',  title: 'Sleep 8hrs for 21 nights', current: 9,  target: 21,  unit: 'nights',   deadline: 'Mar 31', status: 'at-risk',   xp: 200, coins: 35  },
   { id: 'g4', icon: '/healthy-food.png',   title: 'Log meals for 30 days',    current: 6,  target: 30,  unit: 'days',     deadline: 'Mar 31', status: 'behind',    xp: 120, coins: 20  },
   { id: 'g5', icon: '/workout.png',        title: 'Complete 20 workouts',     current: 20, target: 20,  unit: 'sessions', deadline: 'Mar 20', status: 'completed', xp: 400, coins: 75  },
   { id: 'g6', icon: '/exercising.png',     title: 'Meditate 15 days',         current: 11, target: 15,  unit: 'days',     deadline: 'Mar 31', status: 'on-track',  xp: 100, coins: 15  },
 ]);

 const weeklyData = [
   { day: 'Mon', steps: 8.2,  cals: 320 },
   { day: 'Tue', steps: 11.4, cals: 480 },
   { day: 'Wed', steps: 7.8,  cals: 290 },
   { day: 'Thu', steps: 13.1, cals: 560 },
   { day: 'Fri', steps: 9.6,  cals: 410 },
   { day: 'Sat', steps: 15.2, cals: 620 },
   { day: 'Sun', steps: 6.4,  cals: 240 },
 ];

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

 const streakDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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

 const handleGoalProgress = (id) => {
   setGoals(prev => prev.map(g => {
     if (g.id !== id || g.current >= g.target) return g;
     const next = Math.min(g.target, g.current + 1);
     const completed = next >= g.target;
     if (completed) {
       showPopup({
         burst: '/throphy.png', title: 'Goal Achieved!',
         rewards: [
           { type: 'xp',    icon: '/star.png',   value: `+${g.xp} XP`      },
           { type: 'coins', icon: '/profit.png',  value: `+${g.coins} Coins` },
         ]
       });
     }
     return { ...g, current: next, status: completed ? 'completed' : g.status };
   }));
 };

 const handleAddGoal = () => {
   showPopup({ burst: '/hourglass.png', title: 'Coming Soon!', message: 'Custom goal creation will be available in the next update.' });
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

 const maxSteps = Math.max(...weeklyData.map(d => d.steps));
 const maxCals  = Math.max(...weeklyData.map(d => d.cals));

 const getFillClass = (status) => ({ completed: 'green', 'at-risk': 'gold', behind: 'red' }[status] || '');
 const getStatusLabel = (status) => ({ 'on-track': 'On Track', 'at-risk': 'At Risk', behind: 'Behind', completed: 'Complete' }[status]);

 return (
  <div className="page-container">

    {/* ── PAGE HEADER ── */}
    <div className="gp-page-header">
      <div className="gp-header-left">
        <div className="gp-header-icon">
          <img src="/dart.png" alt="Goals" style={{ width: 52, height: 52, objectFit: 'contain' }} />
        </div>
        <div>
          <h1 className="gp-page-title">Goals & Progress</h1>
          <p className="gp-page-sub">Track your long-term health milestones</p>
        </div>
      </div>
      <div className="gp-header-stats">
        <div className="gp-hstat">
          <span className="gp-hstat-val gold">2,839</span>
          <span className="gp-hstat-label">Total XP</span>
        </div>
        <div className="gp-hstat">
          <span className="gp-hstat-val green">4 / 6</span>
          <span className="gp-hstat-label">Goals Active</span>
        </div>
        <div className="gp-hstat">
          <span className="gp-hstat-val blue">68%</span>
          <span className="gp-hstat-label">Avg Progress</span>
        </div>
        <div className="gp-hstat gp-hstat-streak">
          <span className="gp-hstat-val orange" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <img src="/fire2.png" alt="streak" style={{ width: 18, height: 18, objectFit: 'contain' }} /> 7
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
          <div className="gp-badge">4 In Progress</div>
        </div>
        <div className="gp-goals-list">
          {goals.map(g => {
            const pct = Math.round(Math.min(100, (g.current / g.target) * 100));
            const fc  = getFillClass(g.status);
            return (
              <div
                key={g.id}
                id={`goal-${g.id}`}
                className={`gp-goal-item ${g.status}`}
                onClick={g.status !== 'completed' ? () => handleGoalProgress(g.id) : undefined}
                data-testid={`goal-${g.id}`}
              >
                <div className="gp-goal-top">
                  <div className="gp-goal-left">
                    <Img src={g.icon} size={30} />
                    <div className="gp-goal-info">
                      <div className="gp-goal-title">{g.title}</div>
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
                <div className="gp-goal-footer">
                  <span className={`gp-goal-pct ${fc}`}>{pct}%</span>
                  <span className="gp-goal-reward">
                    <img src="/star.png" alt="XP" style={{ width: 14, height: 14, objectFit: 'contain', verticalAlign: 'middle' }} />
                    {' '}+{g.xp} XP · +{g.coins}{' '}
                    <img src="/profit.png" alt="Coins" style={{ width: 14, height: 14, objectFit: 'contain', verticalAlign: 'middle' }} />
                  </span>
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
          <div className="gp-bar-chart">
            {weeklyData.map(d => (
              <div className="gp-chart-col" key={d.day}>
                <div className="gp-chart-bars">
                  <div className="gp-chart-bar steps"    style={{ height: `${Math.round((d.steps / maxSteps) * 100)}px` }} title={`${d.steps}k steps`} />
                  <div className="gp-chart-bar calories" style={{ height: `${Math.round((d.cals  / maxCals)  * 100)}px` }} title={`${d.cals} kcal`} />
                </div>
                <div className="gp-chart-day">{d.day}</div>
              </div>
            ))}
          </div>

          {/* ── Weekly Summary Stats ── */}
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

          {/* ── Best / Worst Day ── */}
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

          {/* ── Daily Breakdown Table ── */}
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

        </div>
      </div>

      {/* DAILY STREAK */}
      <div className="card gp-section" data-testid="streak-panel">
        <div className="gp-section-header">
          <div className="gp-section-title"><span className="gp-dot orange" />Daily Streak</div>
          <div className="gp-badge orange">+20% XP Bonus</div>
        </div>
        <div className="gp-streak-body">

          {/* Top row: big number + bonus chip */}
          <div className="gp-streak-row">
            <div>
              <div className="gp-streak-num">7</div>
              <div className="gp-streak-lbl" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <img src="/fire2.png" alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} /> Keep it going!
              </div>
            </div>
            <div className="gp-streak-bonus">
              <div className="gp-streak-bonus-val">+20% XP</div>
              <div className="gp-streak-bonus-lbl">Streak Bonus</div>
            </div>
          </div>

          {/* Day pills */}
          <div className="gp-streak-days">
            {streakDays.map((d, i) => (
              <div key={i} className={`gp-streak-day${i < 6 ? ' done' : ''}${i === 6 ? ' today' : ''}`}>
                {d}<div className="gp-streak-dot" />
              </div>
            ))}
          </div>

          {/* Progress to next milestone */}
          <div className="gp-streak-milestone">
            <div className="gp-streak-milestone-top">
              <span className="gp-streak-milestone-label">
                <img src="/throphy.png" alt="" style={{ width: 13, height: 13, objectFit: 'contain', marginRight: 4, verticalAlign: 'middle' }} />
                Next milestone: <strong style={{ color: '#fb923c' }}>10 days</strong>
              </span>
              <span className="gp-streak-milestone-label">3 days away</span>
            </div>
            <div className="gp-streak-milestone-track">
              <div className="gp-streak-milestone-fill" style={{ width: '70%' }} />
            </div>
          </div>

          {/* Quick stats row */}
          <div className="gp-streak-stats">
            <div className="gp-streak-stat">
              <div className="gp-streak-stat-val">7</div>
              <div className="gp-streak-stat-label">Current</div>
            </div>
            <div className="gp-streak-stat-divider" />
            <div className="gp-streak-stat">
              <div className="gp-streak-stat-val" style={{ color: '#fbbf24' }}>14</div>
              <div className="gp-streak-stat-label">Best Ever</div>
            </div>
            <div className="gp-streak-stat-divider" />
            <div className="gp-streak-stat">
              <div className="gp-streak-stat-val" style={{ color: '#34d399' }}>23</div>
              <div className="gp-streak-stat-label">Total Days</div>
            </div>
            <div className="gp-streak-stat-divider" />
            <div className="gp-streak-stat">
              <div className="gp-streak-stat-val" style={{ color: '#a78bfa' }}>+20%</div>
              <div className="gp-streak-stat-label">XP Boost</div>
            </div>
          </div>

          {/* Milestone history */}
          <div className="gp-streak-history-label">Milestone History</div>
          <div className="gp-streak-history">
            {[
              { days: 3,  label: '3-Day Streak',  icon: '/fire2.png',   color: '#fb923c', date: 'Feb 12', done: true  },
              { days: 7,  label: '7-Day Streak',  icon: '/fire2.png',   color: '#f97316', date: 'Today',  done: true  },
              { days: 10, label: '10-Day Streak', icon: '/throphy.png', color: '#fbbf24', date: 'Locked', done: false },
              { days: 14, label: '14-Day Streak', icon: '/medal.png',   color: '#a78bfa', date: 'Locked', done: false },
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

    </div>{/* /gp-main-grid */}


    {/* ── REWARD POPUP ── */}
    {popup && (
      <div className="gp-popup-overlay">
        <div className="gp-popup">
          <div className="gp-popup-burst">
            <img src={popup.burst} alt="" style={{ width: 52, height: 52, objectFit: 'contain', animation: 'gp-burst 0.85s cubic-bezier(0.34,1.56,0.64,1)' }} />
          </div>
          <div className="gp-popup-title">{popup.title}</div>
          {popup.rewards && (
            <div className="gp-popup-rewards">
              {popup.rewards.map(r => (
                <div key={r.type} className={`gp-popup-item ${r.type}`}>
                  <img src={r.icon} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                  <span>{r.value}</span>
                </div>
              ))}
            </div>
          )}
          {popup.message && <p className="gp-popup-msg">{popup.message}</p>}
        </div>
      </div>
    )}

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

  </div>
 );
};

export default GoalsProgress;
