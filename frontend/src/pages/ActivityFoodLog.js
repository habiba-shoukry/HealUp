import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../styles/ActivityFoodLog.css';

const BAD_HABITS = [
  { id: 'skipped_workout', title: 'Skipped workout',       description: 'Did not exercise today',       icon: '/workout.png',        penalties: { energy: 8, discipline: 6, xpPenalty: 15 }, tags: [{ label: '-8 Energy', color: '#60a5fa' }, { label: '-6 Discipline', color: '#a78bfa' }, { label: '-15 XP', color: '#f87171' }] },
  { id: 'ate_junk',        title: 'Ate junk food',         description: 'Consumed unhealthy food today', icon: '/no-sugar.png',       penalties: { hp: 5, discipline: 8, xpPenalty: 10 },    tags: [{ label: '-5 HP', color: '#f87171' },    { label: '-8 Discipline', color: '#a78bfa' }, { label: '-10 XP', color: '#f87171' }] },
  { id: 'poor_sleep',      title: 'Poor sleep',            description: 'Slept less than 6 hours',      icon: '/sleeping-mask.png',  penalties: { hp: 4, energy: 12, xpPenalty: 10 },       tags: [{ label: '-4 HP', color: '#f87171' },    { label: '-12 Energy', color: '#60a5fa' },    { label: '-10 XP', color: '#f87171' }] },
  { id: 'no_water',        title: 'Forgot to drink water', description: 'Drank less than 1L today',     icon: '/plastic-bottle.png', penalties: { hp: 6, energy: 5, xpPenalty: 5 },         tags: [{ label: '-6 HP', color: '#f87171' },    { label: '-5 Energy', color: '#60a5fa' },     { label: '-5 XP', color: '#f87171' }] },
  { id: 'stress',          title: 'High stress day',       description: 'Did not manage stress well',   icon: '/health.png',         penalties: { hp: 5, energy: 6, discipline: 4, xpPenalty: 8 }, tags: [{ label: '-5 HP', color: '#f87171' }, { label: '-6 Energy', color: '#60a5fa' }, { label: '-4 Discipline', color: '#a78bfa' }] },
  { id: 'skipped_stretch', title: 'No stretching',         description: 'Skipped warmup/cooldown',      icon: '/exercising.png',     penalties: { energy: 4, discipline: 3, xpPenalty: 5 },  tags: [{ label: '-4 Energy', color: '#60a5fa' }, { label: '-3 Discipline', color: '#a78bfa' }] },
];

const ActivityFoodLog = ({ onBadHabit }) => {
  const [activityDate, setActivityDate] = useState('11/12/2025');
  const [activityType, setActivityType] = useState('Walking');
  const [duration, setDuration]         = useState('34 km');
  const [mealType, setMealType]         = useState('Breakfast');
  const [proteins, setProteins]         = useState('23');
  const [carbs, setCarbs]               = useState('42');
  const [fats, setFats]                 = useState('19');
  const [reported, setReported]         = useState({});
  const [flash, setFlash]               = useState(null);
  const [confirmHabit, setConfirmHabit] = useState(null);

  const weeklyData = [
    { day: 'Mon', value: 30 }, { day: 'Tue', value: 45 },
    { day: 'Wed', value: 35 }, { day: 'Thu', value: 50 },
    { day: 'Fri', value: 40 }, { day: 'Sat', value: 55 },
    { day: 'Sun', value: 35 },
  ];

  const nutritionData = [
    { name: 'Protein', value: parseInt(proteins) || 0, color: '#4A90E2' },
    { name: 'Carbs',   value: parseInt(carbs)    || 0, color: '#E74C3C' },
    { name: 'Fats',    value: parseInt(fats)     || 0, color: '#2ECC71' },
  ];

  const handleConfirm = (habit) => {
    if (reported[habit.id]) return;
    setReported(prev => ({ ...prev, [habit.id]: true }));
    if (onBadHabit) onBadHabit(habit.penalties);
    setFlash({ id: habit.id, tags: habit.tags });
    setTimeout(() => setFlash(null), 2500);
    setConfirmHabit(null);
  };

  return (
    <div className="dhl-page">

      {/* ── Confirm Modal ── */}
      {confirmHabit && (
        <div className="dhl-modal-overlay" onClick={() => setConfirmHabit(null)}>
          <div className="dhl-modal" onClick={e => e.stopPropagation()}>
            <div className="dhl-modal-icon">
              <img src={confirmHabit.icon} alt="" style={{ width: 48, height: 48, objectFit: 'contain' }} />
            </div>
            <div className="dhl-modal-title">Report bad habit?</div>
            <div className="dhl-modal-desc">"{confirmHabit.title}" will apply these penalties:</div>
            <div className="dhl-modal-tags">
              {confirmHabit.tags.map((t, i) => (
                <span key={i} className="dhl-modal-tag" style={{ color: t.color, borderColor: t.color + '55', background: t.color + '18' }}>{t.label}</span>
              ))}
            </div>
            <div className="dhl-modal-actions">
              <button className="dhl-btn-cancel" onClick={() => setConfirmHabit(null)}>Cancel</button>
              <button className="dhl-btn-confirm" onClick={() => handleConfirm(confirmHabit)}>Yes, report it</button>
            </div>
          </div>
        </div>
      )}

      <div className="dhl-inner">

        {/* ── Page Header ── */}
        <div className="dhl-header">
          <div className="dhl-header-left">
            <div className="dhl-header-icon">
              <img src="/healthy-food.png" alt="" />
            </div>
            <div>
              <div className="dhl-header-title">Daily Health Log</div>
              <div className="dhl-header-sub">Track your habits, activity and nutrition every day</div>
            </div>
          </div>
        </div>

        {/* ── Three Columns ── */}
        <div className="dhl-three-col">

          {/* ── Column 1: Bad Habits ── */}
          <div className="dhl-panel dhl-panel-bad">
            <div className="dhl-panel-header">
              <div className="dhl-panel-title-row">
                <div className="dhl-panel-dot red" />
                <span className="dhl-panel-title red">Bad Habits</span>
              </div>
              <span className="dhl-panel-badge red">{Object.keys(reported).length}/{BAD_HABITS.length} today</span>
            </div>
            <p className="dhl-panel-desc">Be honest — reporting bad habits keeps your stats real.</p>
            <div className="dhl-habit-list">
              {BAD_HABITS.map(habit => (
                <div key={habit.id} className={`dhl-habit-item ${reported[habit.id] ? 'dhl-reported' : ''}`}>
                  {flash && flash.id === habit.id && (
                    <div className="dhl-flash red">
                      {flash.tags.map((t, i) => <span key={i}>{t.label} </span>)}
                    </div>
                  )}
                  <img src={habit.icon} alt="" className="dhl-habit-icon" />
                  <div className="dhl-habit-body">
                    <div className="dhl-habit-title">{habit.title}</div>
                    <div className="dhl-habit-tags">
                      {habit.tags.map((t, i) => (
                        <span key={i} className="dhl-tag" style={{ color: t.color, borderColor: t.color + '44', background: t.color + '15' }}>{t.label}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    className={`dhl-report-btn ${reported[habit.id] ? 'done' : ''}`}
                    onClick={() => !reported[habit.id] && setConfirmHabit(habit)}
                    disabled={reported[habit.id]}
                  >
                    {reported[habit.id] ? '✓' : 'Report'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Column 2: Activity Log ── */}
          <div className="dhl-panel dhl-panel-activity">
            <div className="dhl-panel-header">
              <div className="dhl-panel-title-row">
                <div className="dhl-panel-dot blue" />
                <span className="dhl-panel-title blue">Activity Log</span>
              </div>
            </div>
            <p className="dhl-panel-desc">Log your workouts and track weekly progress.</p>

            <div className="dhl-form">
              <div className="dhl-form-group">
                <label>Date</label>
                <input type="text" value={activityDate} onChange={e => setActivityDate(e.target.value)} className="dhl-input" />
              </div>
              <div className="dhl-form-group">
                <label>Activity Type</label>
                <select value={activityType} onChange={e => setActivityType(e.target.value)} className="dhl-select">
                  <option>Walking</option><option>Running</option><option>Cycling</option><option>Swimming</option><option>Gym</option>
                </select>
              </div>
              <div className="dhl-form-group">
                <label>Duration / Distance</label>
                <input type="text" value={duration} onChange={e => setDuration(e.target.value)} className="dhl-input" />
              </div>
              <button className="dhl-submit-btn blue">Log Activity</button>
            </div>

            <div className="dhl-chart-box">
              <div className="dhl-chart-label">Weekly Activity</div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" tick={{ fill: '#5a88a8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: '#0e2236', border: '1px solid rgba(91,184,255,0.2)', borderRadius: 10, color: '#fff', fontSize: 12 }} />
                  <Line type="monotone" dataKey="value" stroke="#4A90E2" strokeWidth={2.5} dot={{ fill: '#4A90E2', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
              <p className="dhl-chart-caption">+12% compared to last week</p>
            </div>
          </div>

          {/* ── Column 3: Food Intake ── */}
          <div className="dhl-panel dhl-panel-food">
            <div className="dhl-panel-header">
              <div className="dhl-panel-title-row">
                <div className="dhl-panel-dot green" />
                <span className="dhl-panel-title green">Food Intake</span>
              </div>
            </div>
            <p className="dhl-panel-desc">Log your meals and monitor your nutrition balance.</p>

            <div className="dhl-form">
              <div className="dhl-form-group">
                <label>Meal Type</label>
                <select value={mealType} onChange={e => setMealType(e.target.value)} className="dhl-select">
                  <option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option>
                </select>
              </div>
              <div className="dhl-form-row">
                <div className="dhl-form-group">
                  <label>Protein (g)</label>
                  <input type="text" value={proteins} onChange={e => setProteins(e.target.value)} className="dhl-input" />
                </div>
                <div className="dhl-form-group">
                  <label>Carbs (g)</label>
                  <input type="text" value={carbs} onChange={e => setCarbs(e.target.value)} className="dhl-input" />
                </div>
                <div className="dhl-form-group">
                  <label>Fats (g)</label>
                  <input type="text" value={fats} onChange={e => setFats(e.target.value)} className="dhl-input" />
                </div>
              </div>
              <button className="dhl-submit-btn green">Log Meal</button>
            </div>

            <div className="dhl-chart-box">
              <div className="dhl-chart-label">Macro Split</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ResponsiveContainer width={130} height={130}>
                  <PieChart>
                    <Pie data={nutritionData} cx="50%" cy="50%" innerRadius={32} outerRadius={56} dataKey="value">
                      {nutritionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0e2236', border: '1px solid rgba(91,184,255,0.2)', borderRadius: 10, color: '#fff', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="dhl-legend">
                  <div className="dhl-legend-item"><span style={{ background: '#4A90E2' }} />Protein <strong>{proteins}g</strong></div>
                  <div className="dhl-legend-item"><span style={{ background: '#E74C3C' }} />Carbs <strong>{carbs}g</strong></div>
                  <div className="dhl-legend-item"><span style={{ background: '#2ECC71' }} />Fats <strong>{fats}g</strong></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ActivityFoodLog;
