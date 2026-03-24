import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/Challenges.css';

const parseReward = (rewardStr) => {
  const xpMatch = rewardStr.match(/(\d+)\s*XP/);
  const xp = xpMatch ? parseInt(xpMatch[1]) : 0;
  const coins = Math.max(5, Math.round(xp * 0.2));
  return { xp, coins };
};

// ─── Shared checked state helpers ─────────────────────────────────────────────
const getTodayKey  = () => `healup_daily_checked_${new Date().toISOString().slice(0,10)}`;
const loadChecked  = () => { try { const s = localStorage.getItem(getTodayKey()); return s ? JSON.parse(s) : {}; } catch { return {}; } };
const saveChecked  = (v) => { try { localStorage.setItem(getTodayKey(), JSON.stringify(v)); } catch {} };

const Img = ({ src, size = 28 }) => (
  <img src={src} alt="" style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }} />
);

const FALLBACK_DAILY_CHALLENGES = [
  {
    id: 'd1',
    programType: 'endurance',
    title: 'Walk 10,000 steps today',
    tags: [{ label: '50 XP', type: 'xp' }, { label: '+5 Energy', type: 'energy' }, { label: '+10 Coins', type: 'coins' }],
    reward: '50 XP +5 Energy',
    barEffects: { energy: 5 },
    icon: '/footprint.png',
  },
  {
    id: 'd2',
    programType: 'general',
    title: 'Drink 2L of water',
    tags: [{ label: '20 XP', type: 'xp' }, { label: '+3 HP', type: 'hp' }, { label: '+4 Coins', type: 'coins' }],
    reward: '20 XP +3 HP',
    barEffects: { hp: 3 },
    icon: '/plastic-bottle.png',
  },
  {
    id: 'd3',
    programType: 'weight-loss',
    title: 'No Sugary snacks',
    tags: [{ label: '30 XP', type: 'xp' }, { label: '+3 Discipline', type: 'disc' }, { label: '+6 Coins', type: 'coins' }],
    reward: '30 XP +3 Discipline',
    barEffects: { discipline: 3 },
    icon: '/no-sugar.png',
  },
  {
    id: 'd4',
    programType: 'stress',
    title: 'Morning Stretch',
    tags: [{ label: '15 XP', type: 'xp' }, { label: '+2 Energy', type: 'energy' }, { label: '+3 Coins', type: 'coins' }],
    reward: '15 XP +2 Energy',
    barEffects: { energy: 2 },
    icon: '/exercising.png',
  },
  {
    id: 'd5',
    programType: 'muscle-gain',
    title: 'Daily Workout Complete',
    tags: [{ label: '50 XP', type: 'xp' }, { label: '+5 Energy', type: 'energy' }, { label: '+2 Discipline', type: 'disc' }, { label: '+10 Coins', type: 'coins' }],
    reward: '50 XP +5 Energy +2 Discipline',
    barEffects: { energy: 5, discipline: 2 },
    icon: '/workout.png',
  },
];

const FALLBACK_WEEKLY_CHALLENGES = [
  { id: 'w1', programType: 'endurance', title: 'Run a total distance of 20 km in a week', progress: 40,  reward: '150 XP +50 Energy', icon: '/training.png' },
  { id: 'w2', programType: 'general', title: 'Share progress with a friend',            progress: 100, reward: '60 XP +20 Energy',  icon: '/collaborative-growth.png' },
  { id: 'w3', programType: 'sleep', title: 'Sleep 7-8 hours per night for 5 nights', progress: 70,  reward: '120 XP +40 Energy', icon: '/sleeping-mask.png' },
  { id: 'w4', programType: 'general', title: 'Drink 14L water total this week',         progress: 60,  reward: '100 XP +30 Energy', icon: '/plastic-bottle.png' },
];

const statMeta = {
  energy:     { icon: '/lighting.png',      label: 'Energy',     color: '#60a5fa' },
  hp:         { icon: '/health.png',        label: 'HP',         color: '#f87171' },
  discipline: { icon: '/roman-helmet.png',  label: 'Discipline', color: '#a78bfa' },
};

const PROGRAMS = [
  { value: 'general', label: 'General' },
  { value: 'weight-loss', label: 'Weight Loss' },
  { value: 'muscle-gain', label: 'Muscle Gain' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'stress', label: 'Stress' },
  { value: 'custom', label: 'Custom' },
];

const PROGRAM_STORAGE_KEY = 'healup_selected_program';

const mapChallenge = (c) => {
  const effects = {};
  if ((c.rewardEnergy || 0) > 0) effects.energy = c.rewardEnergy;
  if ((c.rewardDiscipline || 0) > 0) effects.discipline = c.rewardDiscipline;
  const coins = Math.max(5, Math.round((c.rewardXp || 0) * 0.2));
  const tags = [
    { label: `${c.rewardXp || 0} XP`, type: 'xp' },
    ...(effects.energy ? [{ label: `+${effects.energy} Energy`, type: 'energy' }] : []),
    ...(effects.discipline ? [{ label: `+${effects.discipline} Discipline`, type: 'disc' }] : []),
    { label: `+${coins} Coins`, type: 'coins' },
  ];
  return {
    id: c.id,
    title: c.title,
    tags,
    reward: `${c.rewardXp || 0} XP${effects.energy ? ` +${effects.energy} Energy` : ''}${effects.discipline ? ` +${effects.discipline} Discipline` : ''}`,
    barEffects: Object.keys(effects).length ? effects : null,
    icon: c.challengeType === 'weekly' ? '/training.png' : '/rpg-game.png',
    progress: c.progress || 0,
    isCompleted: Boolean(c.isCompleted),
    rewardXp: c.rewardXp || 0,
    rewardEnergy: c.rewardEnergy || 0,
    rewardDiscipline: c.rewardDiscipline || 0,
    programType: c.programType || 'general',
    challengeType: c.challengeType,
  };
};

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

const RewardPopup = ({ popup }) => {
  if (!popup) return null;
  return (
    <div className="reward-popup-overlay">
      <div className="reward-popup">
        <div className="reward-popup-burst"><img src="/star.png" alt="" style={{width:48,height:48,objectFit:'contain',animation:'burstSpin 0.6s ease'}} /></div>
        <div className="reward-popup-title">Challenge Complete!</div>
        <div className="reward-popup-rewards">
          <div className="reward-popup-item xp">
            <img src="/star.png" alt="XP" className="rp-icon-img" />
            <span className="rp-val">+{popup.xp} XP</span>
          </div>
          <div className="reward-popup-item coins">
            <img src="/profit.png" alt="Coins" className="rp-icon-img" />
            <span className="rp-val">+{popup.coins} Coins</span>
          </div>
          {popup.stat && (
            <div className="reward-popup-item stat">
              <img src={popup.stat.icon} alt={popup.stat.label} className="rp-icon-img" />
              <span className="rp-val">+{popup.stat.val} {popup.stat.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Challenges = ({ onChallengeComplete, bars = { hp: 65, energy: 80, discipline: 45 }, streak = { count: 0 } }) => {
  const [selectedProgram, setSelectedProgram] = useState(() => {
    try {
      return localStorage.getItem(PROGRAM_STORAGE_KEY) || 'general';
    } catch {
      return 'general';
    }
  });
  const [remoteChallenges, setRemoteChallenges] = useState({ daily: [], weekly: [] });
  const [checked, setChecked]     = useState(loadChecked);
  const [justDone, setJustDone]   = useState({});
  const [particles, setParticles] = useState([]);
  const [popup, setPopup]         = useState(null);
  const itemRefs                  = useRef({});
  let particleId                  = useRef(0);
  const hasRemoteDaily = remoteChallenges.daily.length > 0;

  useEffect(() => {
    const sync = () => {
      // When daily challenges are DB-backed, checked state is derived from DB.
      if (hasRemoteDaily) return;
      setChecked(loadChecked());
    };
    sync();
    window.addEventListener('focus', sync);
    return () => window.removeEventListener('focus', sync);
  }, [hasRemoteDaily]);

  useEffect(() => {
    try {
      localStorage.setItem(PROGRAM_STORAGE_KEY, selectedProgram);
    } catch {}
  }, [selectedProgram]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user?.id) {
      setRemoteChallenges({ daily: [], weekly: [] });
      return;
    }
    fetch(`http://localhost:8001/api/challenges?userId=${user.id}&programType=${selectedProgram}`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) {
          setRemoteChallenges({ daily: [], weekly: [] });
          return;
        }
        const mapped = data.map(mapChallenge);
        const daily = mapped.filter(c => c.challengeType === 'daily');
        const weekly = mapped.filter(c => c.challengeType === 'weekly');
        setRemoteChallenges({ daily, weekly });
        if (daily.length > 0) {
          const persistedChecked = daily.reduce((acc, c) => {
            acc[c.id] = Boolean(c.isCompleted);
            return acc;
          }, {});
          setChecked(persistedChecked);
        }
      })
      .catch(() => {
        setRemoteChallenges({ daily: [], weekly: [] });
      });
  }, [selectedProgram]);

  const dailyChallenges = remoteChallenges.daily.length
    ? remoteChallenges.daily
    : FALLBACK_DAILY_CHALLENGES.filter(c => c.programType === selectedProgram);
  const weeklyChallenges = remoteChallenges.weekly.length
    ? remoteChallenges.weekly
    : FALLBACK_WEEKLY_CHALLENGES.filter(c => c.programType === selectedProgram);

  const challengeKey = (c, index) => c.id || String(index);
  const isDone = (c, index) => {
    if (hasRemoteDaily) return Boolean(c.isCompleted);
    return Boolean(checked[challengeKey(c, index)]);
  };

  const doneCount = dailyChallenges.filter((c, i) => isDone(c, i)).length;
  const totalXP = dailyChallenges.reduce((sum, c) => {
    const m = c.reward.match(/(\d+)\s*XP/); return sum + (m ? parseInt(m[1]) : 0);
  }, 0);

  const spawnParticles = useCallback((originEl, xp, coins, barEffects) => {
    const rect = originEl.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top  + rect.height / 2;

    // ── Use id selectors so they work regardless of CSS class changes ──
    const hpBar    = document.querySelector('.ch-stat-hp');
    const energyBar= document.querySelector('.ch-stat-energy');
    const discBar  = document.querySelector('.ch-stat-disc');
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

    // 6 XP stars → XP element in navbar
    for (let i = 0; i < 6; i++) {
      newParticles.push({
        id: `${now}-xp-${i}`,
        x: originX, y: originY,
        tx: xpPos.x - originX + (Math.random() - 0.5) * 20,
        ty: xpPos.y - originY,
        icon: '/star.png', color: '#34d399',
        delay: i * 0.07,
      });
    }

    // 6 Coin particles → Coins element in navbar
    for (let i = 0; i < 6; i++) {
      newParticles.push({
        id: `${now}-coin-${i}`,
        x: originX, y: originY,
        tx: coinPos.x - originX + (Math.random() - 0.5) * 20,
        ty: coinPos.y - originY,
        icon: '/profit.png', color: '#fbbf24',
        delay: 0.1 + i * 0.07,
      });
    }

    // Stat particles → fly to stat bars on the page
    if (barEffects) {
      Object.entries(barEffects).forEach(([statKey, statVal], idx) => {
        const meta = statMeta[statKey];
        if (!meta) return;

        const targetEl = statKey === 'hp' ? hpBar : statKey === 'energy' ? energyBar : discBar;
        const targetPos = getCenter(targetEl);

        for (let i = 0; i < 5; i++) {
          newParticles.push({
            id: `${now}-stat-${statKey}-${i}`,
            x: originX, y: originY,
            tx: targetPos.x - originX + (Math.random() - 0.5) * 30,
            ty: targetPos.y - originY,
            icon: meta.icon, color: meta.color,
            delay: 0.15 + idx * 0.1 + i * 0.08,
          });
        }
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(n => n.id === p.id)));
    }, 3500);

    // Flash the target stat bar when particles arrive
    if (barEffects) {
      Object.entries(barEffects).forEach(([statKey]) => {
        setTimeout(() => {
          const selector = statKey === 'hp' ? '.ch-stat-hp' : statKey === 'energy' ? '.ch-stat-energy' : '.ch-stat-disc';
          const el = document.querySelector(selector);
          if (el) {
            el.classList.add('bar-pulse');
            setTimeout(() => el.classList.remove('bar-pulse'), 1000);
          }
        }, 1650);
      });
    }
  }, []);

  const handleCheck = (index) => {
    const c = dailyChallenges[index];
    const key = challengeKey(c, index);
    if (isDone(c, index)) return;

    const next = { ...checked, [key]: true };
    setChecked(next);
    if (!hasRemoteDaily) saveChecked(next);
    if (hasRemoteDaily && c.id) {
      setRemoteChallenges(prev => ({
        ...prev,
        daily: prev.daily.map((d) => d.id === c.id ? { ...d, isCompleted: true, progress: 100 } : d),
      }));
    }

    setJustDone(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setJustDone(prev => ({ ...prev, [key]: false })), 700);

    const { xp, coins } = parseReward(c.reward);
    if (hasRemoteDaily && c.id) {
      fetch(`http://localhost:8001/api/challenges/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: 100, isCompleted: true }),
      }).catch(() => {});
    }
    if (onChallengeComplete) onChallengeComplete(xp, coins, c.barEffects);

    let statInfo = null;
    if (c.barEffects) {
      const [key, val] = Object.entries(c.barEffects)[0];
      const meta = statMeta[key];
      if (meta) statInfo = { icon: meta.icon, label: meta.label, val };
    }

    setPopup({ xp, coins, stat: statInfo });
    setTimeout(() => setPopup(null), 2800);

    const el = itemRefs.current[index];
    if (el) spawnParticles(el, xp, coins, c.barEffects);
  };

  const handleUndo = (index) => {
    const c = dailyChallenges[index];
    const key = challengeKey(c, index);
    const next = { ...checked, [key]: false };
    setChecked(next);
    if (!hasRemoteDaily) saveChecked(next);
    if (hasRemoteDaily && c.id) {
      setRemoteChallenges(prev => ({
        ...prev,
        daily: prev.daily.map((d) => d.id === c.id ? { ...d, isCompleted: false, progress: 0 } : d),
      }));
      fetch(`http://localhost:8001/api/challenges/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: 0, isCompleted: false }),
      }).catch(() => {});
    }

    const { xp, coins } = parseReward(c.reward);
    if (onChallengeComplete) onChallengeComplete(
      -xp, -coins,
      c.barEffects ? Object.fromEntries(Object.entries(c.barEffects).map(([k,v]) => [k, -v])) : null
    );
  };

  const handleWeeklyProgress = (challenge) => {
    if (!challenge?.id || challenge.isCompleted) return;
    const nextProgress = Math.min(100, (challenge.progress || 0) + 10);
    const justCompleted = nextProgress >= 100 && !challenge.isCompleted;

    setRemoteChallenges(prev => ({
      ...prev,
      weekly: prev.weekly.map((w) => w.id === challenge.id
        ? { ...w, progress: nextProgress, isCompleted: nextProgress >= 100 }
        : w),
    }));

    fetch(`http://localhost:8001/api/challenges/${challenge.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress: nextProgress, isCompleted: nextProgress >= 100 }),
    }).catch(() => {});

    if (justCompleted && onChallengeComplete) {
      const coins = Math.max(5, Math.round((challenge.rewardXp || 0) * 0.2));
      const barEffects = {
        ...(challenge.rewardEnergy ? { energy: challenge.rewardEnergy } : {}),
        ...(challenge.rewardDiscipline ? { discipline: challenge.rewardDiscipline } : {}),
      };
      onChallengeComplete(challenge.rewardXp || 0, coins, Object.keys(barEffects).length ? barEffects : null);
    }
  };

  return (
    <>
      <div className="particles-root">
        {particles.map(p => <FlyingParticle key={p.id} particle={p} />)}
      </div>

      <RewardPopup popup={popup} />

      <div className="challenges-page">
        <div className="challenges-page-inner">

          <div className="challenges-header">
            <div className="challenges-header-left">
              <div className="challenges-header-icon"><Img src="/rpg-game.png" size={32} /></div>
              <div>
                <div className="challenges-header-title">Challenges</div>
                <div className="challenges-header-sub">Complete tasks to earn XP, coins and stat boosts</div>
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
            <div className="challenges-header-stats">
              <div className="ch-header-stat">
                <span className="ch-header-stat-val gold">{doneCount}/{dailyChallenges.length}</span>
                <span className="ch-header-stat-label">Daily Done</span>
              </div>
              <div className="ch-header-stat">
                <span className="ch-header-stat-val blue">{totalXP}</span>
                <span className="ch-header-stat-label">Max XP Today</span>
              </div>
              <div className="ch-header-stat">
                <span className="ch-header-stat-val green">{weeklyChallenges.filter(c => c.progress === 100).length}/{weeklyChallenges.length}</span>
                <span className="ch-header-stat-label">Weekly Done</span>
              </div>
              <div className={`ch-header-stat streak-stat ${streak.count >= 3 ? 'streak-hot' : ''}`}>
                <span className="ch-header-stat-val streak-val">
                  🔥 {streak.count}
                </span>
                <span className="ch-header-stat-label">Day Streak</span>
                {streak.count >= 3 && (
                  <span className="streak-bonus-badge">+{Math.min(streak.count * 10, 100)}% XP</span>
                )}
              </div>
            </div>
          </div>

          <div className="ch-stat-bars-panel">
            <div className="ch-stat-bar-row">
              <Img src="/health.png" size={24} />
              <div className="ch-stat-label-text">HP</div>
              <div className="ch-stat-track">
                <div className="ch-stat-fill ch-stat-hp" style={{ width: `${bars.hp}%`, transition: 'width 0.6s ease' }} />
                <span className="ch-stat-pct">{bars.hp}%</span>
              </div>
            </div>
            <div className="ch-stat-bar-row">
              <Img src="/lighting.png" size={24} />
              <div className="ch-stat-label-text">Energy</div>
              <div className="ch-stat-track">
                <div className="ch-stat-fill ch-stat-energy" style={{ width: `${bars.energy}%`, transition: 'width 0.6s ease' }} />
                <span className="ch-stat-pct">{bars.energy}%</span>
              </div>
            </div>
            <div className="ch-stat-bar-row">
              <Img src="/roman-helmet.png" size={24} />
              <div className="ch-stat-label-text">Discipline</div>
              <div className="ch-stat-track">
                <div className="ch-stat-fill ch-stat-disc" style={{ width: `${bars.discipline}%`, transition: 'width 0.6s ease' }} />
                <span className="ch-stat-pct">{bars.discipline}%</span>
              </div>
            </div>
          </div>

          <div className="challenges-grid">

            <div className="challenges-section">
              <div className="challenges-section-header">
                <div className="ch-section-title">
                  <div className="ch-section-dot" />
                  Daily Challenges
                </div>
                <div className="ch-section-progress-badge">{doneCount}/{dailyChallenges.length} Complete</div>
              </div>
              <div className="challenges-list">
                {dailyChallenges.map((c, i) => (
                  <div
                    key={challengeKey(c, i)}
                    ref={el => itemRefs.current[i] = el}
                    className={`ch-item ${isDone(c, i) ? 'ch-completed' : ''} ${justDone[challengeKey(c, i)] ? 'ch-just-completed' : ''}`}
                    onClick={() => handleCheck(i)}
                    data-testid={`daily-challenge-${i}`}
                  >
                    <div className={`ch-custom-check ${isDone(c, i) ? 'checked' : ''}`}>
                      {isDone(c, i) && <span className="ch-check-icon">✓</span>}
                    </div>
                    <Img src={c.icon} size={30} />
                    <div className="ch-item-body">
                      <div className="ch-item-title">{c.title}</div>
                      <div className="ch-item-tags">
                        {c.tags.map((tag, ti) => (
                          <span key={ti} className={`ch-tag ${tag.type}`}>{tag.label}</span>
                        ))}
                      </div>
                    </div>
                    <div className="ch-reward-badge">
                      {isDone(c, i) ? (
                        <button
                          className="ch-undo-btn"
                          onClick={e => { e.stopPropagation(); handleUndo(i); }}
                        >
                          <span style={{fontSize:'0.9rem'}}>↩</span> Undo
                        </button>
                      ) : (
                        <>
                          <img src="/star.png" alt="XP" className="ch-preview-icon" title="XP" />
                          {c.barEffects && Object.keys(c.barEffects).map(statKey => {
                            const meta = statMeta[statKey];
                            return meta ? <img key={statKey} src={meta.icon} alt={meta.label} className="ch-preview-icon" title={meta.label} /> : null;
                          })}
                          <div className="ch-reward-icon"><img src="/profit.png" alt="Coins" style={{width:18,height:18,objectFit:'contain'}} /></div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="challenges-section">
              <div className="challenges-section-header">
                <div className="ch-section-title">
                  <div className="ch-section-dot" style={{ background: '#fbbf24', boxShadow: '0 0 8px #fbbf24' }} />
                  Weekly Challenges
                </div>
                <div className="ch-section-progress-badge">Resets in 4 days</div>
              </div>
              <div className="challenges-list">
                {weeklyChallenges.map((c, i) => (
                  <div key={challengeKey(c, i)} className="ch-weekly-item" data-testid={`weekly-challenge-${i}`}>
                    <div className="ch-weekly-top">
                      <Img src={c.icon} size={28} style={{ marginRight: '0.4rem' }} />
                      <div className="ch-weekly-title">{c.title}</div>
                      <div className="ch-weekly-pct">{c.progress}%</div>
                    </div>
                    <div className="ch-weekly-track">
                      <div className={`ch-weekly-fill ${c.progress === 100 ? 'complete' : ''}`} style={{ width: `${c.progress}%` }} />
                    </div>
                    <div className="ch-weekly-bottom">
                      <div className="ch-weekly-reward">
                        <img src="/lighting.png" alt="" style={{width:16,height:16,objectFit:'contain'}} />
                        <span className="ch-weekly-reward-text">{c.reward}</span>
                      </div>
                      {remoteChallenges.weekly.length > 0 && (
                        <button
                          className="ch-undo-btn"
                          onClick={() => handleWeeklyProgress(c)}
                          disabled={Boolean(c.isCompleted)}
                          style={{ opacity: c.isCompleted ? 0.6 : 1, cursor: c.isCompleted ? 'default' : 'pointer' }}
                        >
                          {c.isCompleted ? 'Completed' : '+10%'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Challenges;
