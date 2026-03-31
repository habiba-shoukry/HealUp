import React, { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import '../styles/DoctorDashboard.css';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bgPage:    '#060d18',
  bgCard:    'linear-gradient(160deg, #0d1e2e 0%, #091525 100%)',
  bgCardAlt: 'linear-gradient(150deg, #0b1829 0%, #070f1c 100%)',
  border:    'rgba(255,255,255,0.055)',
  borderHov: 'rgba(255,255,255,0.10)',
  textPrim:  '#f1f5f9',
  textSub:   '#a8c8e0',
  textMute:  '#64748b',
  textDim:   '#334155',
  blue:   '#60a5fa',
  red:    '#f87171',
  purple: '#a78bfa',
  green:  '#34d399',
  orange: '#fb923c',
  yellow: '#fbbf24',
};

const ICONS = {
  heartbeat:  '/heartbeat.png',
  moon:       '/moon.png',
  football:   '/football.png',
  fire:       '/fire.png',
  stress:     '/stress-relief.png',
  doctor:     '/doctor.png',
  star:       '/star.png',
  coin:       '/profit.png',
  energy:     '/lighting.png',
  health:     '/health.png',
  discipline: '/roman-helmet.png',
  target:     '/target.png',
  dollar:     '/dollar.png',
};

const Icon = ({ name, size = 18, style = {} }) => (
  <img
    src={ICONS[name]}
    alt=""
    style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, ...style }}
  />
);

const METRIC_ICONS = {
  hr:       'heartbeat',
  sleep:    'moon',
  steps:    'football',
  calories: 'fire',
  stress:   'stress',
};
const METRIC_COLORS = {
  hr:       T.red,
  sleep:    T.purple,
  stress:   T.yellow,
  calories: T.orange,
  steps:    T.green,
};

// ─── Patient data ─────────────────────────────────────────────────────────────
const patients = [
  {
    id: 1, name: "John Doe", age: 34, avatar: "JD", gender: "Male",
    bloodType: "A+", condition: "Hypertension", lastVisit: "Mar 24",
    nextVisit: "Apr 07", avatarColor: ["#3b82f6", "#6366f1"],
    data: [
      { day: "Mon", hr: 72, sleep: 6.5, stress: 70, calories: 2200, steps: 7200 },
      { day: "Tue", hr: 75, sleep: 7.0, stress: 65, calories: 2100, steps: 8100 },
      { day: "Wed", hr: 70, sleep: 6.8, stress: 72, calories: 2300, steps: 6900 },
      { day: "Thu", hr: 73, sleep: 7.2, stress: 60, calories: 2000, steps: 9400 },
      { day: "Fri", hr: 71, sleep: 6.9, stress: 75, calories: 2400, steps: 7800 },
    ]
  },
  {
    id: 2, name: "Jane Smith", age: 28, avatar: "JS", gender: "Female",
    bloodType: "O-", condition: "Anxiety Disorder", lastVisit: "Mar 20",
    nextVisit: "Apr 03", avatarColor: ["#ec4899", "#f43f5e"],
    data: [
      { day: "Mon", hr: 65, sleep: 7.8, stress: 30, calories: 1800, steps: 10200 },
      { day: "Tue", hr: 68, sleep: 8.0, stress: 35, calories: 1750, steps: 11000 },
      { day: "Wed", hr: 66, sleep: 7.9, stress: 40, calories: 1850, steps: 9800 },
      { day: "Thu", hr: 64, sleep: 8.1, stress: 32, calories: 1700, steps: 10500 },
      { day: "Fri", hr: 67, sleep: 7.7, stress: 34, calories: 1900, steps: 11300 },
    ]
  },
  {
    id: 3, name: "Marcus Lee", age: 45, avatar: "ML", gender: "Male",
    bloodType: "B+", condition: "Chronic Stress / Insomnia", lastVisit: "Mar 28",
    nextVisit: "Apr 04", avatarColor: ["#f97316", "#ef4444"],
    data: [
      { day: "Mon", hr: 88, sleep: 5.5, stress: 80, calories: 2600, steps: 3100 },
      { day: "Tue", hr: 91, sleep: 5.2, stress: 85, calories: 2750, steps: 2800 },
      { day: "Wed", hr: 86, sleep: 5.8, stress: 78, calories: 2500, steps: 3400 },
      { day: "Thu", hr: 90, sleep: 5.0, stress: 82, calories: 2800, steps: 2600 },
      { day: "Fri", hr: 93, sleep: 4.9, stress: 88, calories: 2900, steps: 2200 },
    ]
  },
  {
    id: 4, name: "Aisha Patel", age: 31, avatar: "AP", gender: "Female",
    bloodType: "AB+", condition: "Routine Monitoring", lastVisit: "Mar 15",
    nextVisit: "Apr 15", avatarColor: ["#10b981", "#06b6d4"],
    data: [
      { day: "Mon", hr: 62, sleep: 8.2, stress: 22, calories: 1650, steps: 12400 },
      { day: "Tue", hr: 60, sleep: 8.5, stress: 18, calories: 1700, steps: 13100 },
      { day: "Wed", hr: 63, sleep: 8.1, stress: 25, calories: 1600, steps: 11800 },
      { day: "Thu", hr: 61, sleep: 8.4, stress: 20, calories: 1720, steps: 12900 },
      { day: "Fri", hr: 59, sleep: 8.6, stress: 15, calories: 1680, steps: 13500 },
    ]
  }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getTrend = (data, key) => {
  const vals = data.map(d => d[key]);
  const diff = vals[vals.length - 1] - vals[0];
  if (Math.abs(diff) < 1) return { color: T.textMute, label: "Stable" };
  return diff > 0
    ? { color: T.red,   label: `+${diff.toFixed(1)}` }
    : { color: T.green, label: `${diff.toFixed(1)}` };
};

const getRiskScore = (p) => {
  const l = p.data[p.data.length - 1];
  let s = 0;
  if (l.hr > 85) s += 3; else if (l.hr > 75) s += 1;
  if (l.sleep < 6) s += 3; else if (l.sleep < 7) s += 1;
  if (l.stress > 70) s += 3; else if (l.stress > 50) s += 1;
  return s;
};

const getRiskLabel = (score) => {
  if (score >= 7) return { label: "CRITICAL", color: "#ef4444", bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.25)"  };
  if (score >= 4) return { label: "HIGH RISK", color: T.red,    bg: "rgba(248,113,113,0.09)", border: "rgba(248,113,113,0.20)" };
  if (score >= 2) return { label: "MODERATE",  color: T.yellow, bg: "rgba(251,191,36,0.09)",  border: "rgba(251,191,36,0.20)" };
  return            { label: "STABLE",    color: T.green,  bg: "rgba(52,211,153,0.09)",  border: "rgba(52,211,153,0.20)" };
};

const formatSteps = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
const fmtNum = (n, key) => (key === 'calories' || key === 'steps') ? Number(n).toLocaleString() : n;

const getMetricStatus = (key, val) => {
  const cfg = {
    hr:       val > 85 ? { label: 'ELEVATED', color: T.orange } : val > 75 ? { label: 'WATCH', color: T.yellow } : { label: 'NORMAL', color: T.green },
    sleep:    val >= 7.5 ? { label: 'GREAT', color: T.purple } : val >= 6.5 ? { label: 'GOOD', color: T.blue } : { label: 'LOW', color: T.orange },
    stress:   val > 70 ? { label: 'HIGH', color: T.red } : val > 45 ? { label: 'MODERATE', color: T.yellow } : { label: 'LOW', color: T.green },
    calories: val > 2400 ? { label: 'ACTIVE', color: T.orange } : val > 1800 ? { label: 'ON TRACK', color: '#f97316' } : { label: 'LOW', color: T.red },
    steps:    val >= 10000 ? { label: 'GREAT', color: T.green } : val >= 7000 ? { label: 'ACTIVE', color: '#4ade80' } : { label: 'LOW', color: T.orange },
  };
  return cfg[key] || { label: '—', color: T.textMute };
};

// ─── Shared sub-components ────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const color = payload[0].color || payload[0].fill || T.blue;
  return (
    <div style={{
      background: 'rgba(6,14,24,0.98)',
      border: `1px solid ${color}44`,
      borderRadius: 8, padding: '6px 10px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
      pointerEvents: 'none',
    }}>
      <p style={{ margin: 0, color: T.textMute, fontSize: 10, marginBottom: 2 }}>{label}</p>
      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color }}>{payload[0].value}</p>
    </div>
  );
};

// ─── Mini chart ───────────────────────────────────────────────────────────────
function MiniChart({ data, dataKey, color, gradientId, type }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const MiniTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'rgba(6,14,24,0.98)',
        border: `1px solid ${color}55`,
        borderRadius: 7, padding: '5px 9px',
        boxShadow: `0 4px 16px rgba(0,0,0,0.6)`,
        pointerEvents: 'none',
      }}>
        <p style={{ margin: 0, color: T.textMute, fontSize: 9, marginBottom: 2 }}>{label}</p>
        <p style={{ margin: 0, fontWeight: 800, fontSize: 12, color }}>{payload[0].value}</p>
      </div>
    );
  };

  const MiniBarShape = ({ x, y, width, height, index }) => {
    const isActive = activeIndex === index;
    return (
      <g>
        <rect
          x={x} y={y} width={width} height={height}
          fill={isActive ? color : `${color}42`}
          rx={3} ry={3}
          style={{ transition: 'fill 0.12s' }}
        />
        {isActive && (
          <rect x={x} y={y} width={width} height={height}
            fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth={1.5} rx={3} ry={3} />
        )}
      </g>
    );
  };

  if (type === 'area') {
    return (
      <div style={{ height: 62, marginLeft: -4, marginRight: -4 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 6, bottom: 0, left: 6 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip content={<MiniTooltip />} cursor={{ stroke: `${color}44`, strokeWidth: 1 }} />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
              fill={`url(#${gradientId})`} dot={false}
              activeDot={{ r: 4, fill: color, stroke: '#070f1c', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div style={{ height: 62, marginLeft: -4, marginRight: -4 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 2, right: 6, bottom: 2, left: 6 }}
          barSize={48}
          barCategoryGap="15%"
          onClick={(e) => {
            if (e?.activeTooltipIndex != null) {
              setActiveIndex(prev => prev === e.activeTooltipIndex ? null : e.activeTooltipIndex);
            }
          }}
        >
          <XAxis dataKey="day" hide />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip
            content={<MiniTooltip />}
            cursor={{ fill: `${color}10`, radius: 3 }}
          />
          <Bar
            dataKey={dataKey}
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
            shape={<MiniBarShape />}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Metric card ──────────────────────────────────────────────────────────────
function MetricCard({ metricKey, label, value, unit, note, noteRight, data, gradientId, type }) {
  const [hovered, setHovered] = useState(false);
  const color = METRIC_COLORS[metricKey];
  const status = getMetricStatus(metricKey, value);

  return (
    <div
      className="doc-metric-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderColor: hovered ? color + '38' : T.border,
        boxShadow: hovered
          ? `0 6px 22px rgba(0,0,0,0.4), 0 0 0 1px ${color}22`
          : '0 2px 12px rgba(0,0,0,0.25)',
      }}
    >
      {/* Top row */}
      <div className="doc-metric-top">
        <Icon name={METRIC_ICONS[metricKey]} size={18} />
        <span className="doc-metric-label">{label}</span>
        <span
          className="doc-metric-badge"
          style={{
            background: status.color + '18',
            color: status.color,
            borderColor: status.color + '44',
          }}
        >
          {status.label}
        </span>
      </div>

      {/* Value row */}
      <div className="doc-metric-value-row">
        <span className="doc-metric-value">{fmtNum(value, metricKey)}</span>
        <span className="doc-metric-unit">{unit}</span>
      </div>

      {/* Chart */}
      <div className="doc-metric-chart">
        <MiniChart data={data} dataKey={metricKey} color={color} gradientId={gradientId} type={type} />
      </div>

      {/* Footer */}
      <div className="doc-metric-footer">
        <span>{note}</span>
        <span>{noteRight}</span>
      </div>
    </div>
  );
}

// ─── Vital pill ───────────────────────────────────────────────────────────────
function VitalPill({ iconName, label, value, color }) {
  return (
    <div
      className="doc-vital-pill"
      style={{ background: color + '10', borderColor: color + '24' }}
    >
      <div className="doc-vital-pill-value" style={{ color }}>
        <Icon name={iconName} size={11} />
        {value}
      </div>
      <span className="doc-vital-pill-label">{label}</span>
    </div>
  );
}

// ─── Risk bar ─────────────────────────────────────────────────────────────────
function RiskBar({ score }) {
  const pct = Math.min((score / 9) * 100, 100);
  const color = score >= 7 ? '#ef4444' : score >= 4 ? T.red : score >= 2 ? T.yellow : T.green;
  return (
    <div className="doc-risk-bar-row">
      <span className="doc-risk-bar-label">Risk</span>
      <div className="doc-risk-bar-track">
        <div className="doc-risk-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="doc-risk-bar-score" style={{ color }}>{score}/9</span>
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
const SectionLabel = ({ children, style = {} }) => (
  <span className="doc-section-label" style={style}>{children}</span>
);

// ─── Modal chart (area or bar, fully interactive) ─────────────────────────────
function ModalChart({ metricKey, label, gradId, type, data }) {
  const color = METRIC_COLORS[metricKey];
  const [activeIndex, setActiveIndex] = useState(null);

  const ModalTooltip = ({ active, payload, label: day }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'rgba(6,14,24,0.98)',
        border: `1px solid ${color}55`,
        borderRadius: 8, padding: '7px 11px',
        boxShadow: `0 4px 20px rgba(0,0,0,0.65), 0 0 0 1px ${color}18`,
        pointerEvents: 'none',
      }}>
        <p style={{ margin: 0, color: T.textMute, fontSize: 10, marginBottom: 3 }}>{day}</p>
        <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color }}>{payload[0].value}</p>
      </div>
    );
  };

  const ModalBarShape = (props) => {
    const { x, y, width, height, index } = props;
    const isActive = activeIndex === index;
    const fill = isActive ? color : `${color}42`;
    return (
      <g style={{ cursor: 'pointer' }}>
        <rect x={x} y={y} width={width} height={height} fill={fill} rx={3} ry={3}
          style={{ transition: 'fill 0.15s' }} />
        {isActive && (
          <rect x={x} y={y} width={width} height={height} fill="none"
            stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} rx={3} ry={3} />
        )}
      </g>
    );
  };

  return (
    <div className="doc-modal-chart-panel">
      <div className="doc-modal-chart-title">
        <Icon name={METRIC_ICONS[metricKey]} size={13} />
        <SectionLabel>{label} (Weekly)</SectionLabel>
      </div>
      <div style={{ height: 108 }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart
              data={data}
              margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
              barSize={48}
              barCategoryGap="2%"
              onClick={(e) => {
                if (e && e.activeTooltipIndex != null) {
                  setActiveIndex(prev =>
                    prev === e.activeTooltipIndex ? null : e.activeTooltipIndex
                  );
                }
              }}
            >
              <XAxis
                dataKey="day"
                stroke="#1e293b"
                tick={{ fontSize: 9, fill: T.textMute }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip
                content={<ModalTooltip />}
                cursor={{ fill: `${color}12`, radius: 4 }}
              />
              <Bar
                dataKey={metricKey}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
                shape={<ModalBarShape />}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                stroke="#1e293b"
                tick={{ fontSize: 9, fill: T.textMute }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                content={<ModalTooltip />}
                cursor={{ stroke: `${color}45`, strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area
                type="monotone"
                dataKey={metricKey}
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#${gradId})`}
                dot={{ r: 3, fill: color, stroke: '#070f1c', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: color, stroke: '#070f1c', strokeWidth: 2 }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [filter, setFilter] = useState('all');

  const handleSend = () => {
    if (message.trim()) {
      setSent(true);
      setTimeout(() => { setSent(false); setMessage(''); }, 2000);
    }
  };

  const criticalCount = patients.filter(p => getRiskScore(p) >= 7).length;
  const highCount     = patients.filter(p => { const s = getRiskScore(p); return s >= 4 && s < 7; }).length;
  const stableCount   = patients.length - criticalCount - highCount;

  const filtered = patients.filter(p => {
    const s = getRiskScore(p);
    if (filter === 'critical') return s >= 7;
    if (filter === 'high')     return s >= 4 && s < 7;
    if (filter === 'stable')   return s < 4;
    return true;
  });

  return (
    <div className="doctor-page">
      <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;700;800&display=swap" rel="stylesheet" />

      {/* ── Header ── */}
      <header className="doc-header">
        <div className="doc-header-left">
          <div className="doc-header-icon">
            <Icon name="doctor" size={22} />
          </div>
          <div className="doc-header-text">
            <div className="doc-header-title-row">
              <h1 className="doc-header-title">
                Doctor <span>Dashboard</span>
              </h1>
              <div className="doc-live-pill">
                <span className="doc-live-dot" />
                <span className="doc-live-label">LIVE</span>
              </div>
            </div>
            <p className="doc-header-meta">
              Monitoring <strong>{patients.length} patients</strong> · Last sync: just now ·{' '}
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="doc-header-right">
          {[
            { count: criticalCount, label: 'Critical',  color: '#ef4444' },
            { count: highCount,     label: 'High Risk', color: T.red    },
            { count: stableCount,   label: 'Stable',    color: T.green  },
          ].map(({ count, label, color }) => count > 0 && (
            <div
              key={label}
              className="doc-stat-chip"
              style={{ background: color + '10', borderColor: color + '24' }}
            >
              <span className="doc-stat-chip-count" style={{ color }}>{count}</span>
              <span className="doc-stat-chip-label" style={{ color }}>{label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* ── Filter tabs ── */}
      <div className="doc-filter-bar">
        {[
          ['all',      `All (${patients.length})`    ],
          ['critical', `Critical (${criticalCount})` ],
          ['high',     `High Risk (${highCount})`    ],
          ['stable',   `Stable (${stableCount})`     ],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`doc-filter-btn${filter === key ? ' doc-filter-btn--active' : ''}`}
          >{label}</button>
        ))}
      </div>

      {/* ── Patient cards ── */}
      <div className="doc-patient-list">
        {filtered.map((patient) => {
          const latest = patient.data[patient.data.length - 1];
          const score  = getRiskScore(patient);
          const risk   = getRiskLabel(score);
          const avgHr    = Math.round(patient.data.reduce((a, b) => a + b.hr, 0) / patient.data.length);
          const avgSleep  = (patient.data.reduce((a, b) => a + b.sleep, 0) / patient.data.length).toFixed(1);
          const avgStress = Math.round(patient.data.reduce((a, b) => a + b.stress, 0) / patient.data.length);
          const avgCals   = Math.round(patient.data.reduce((a, b) => a + b.calories, 0) / patient.data.length);
          const avgSteps  = Math.round(patient.data.reduce((a, b) => a + b.steps, 0) / patient.data.length);

          return (
            <div
              key={patient.id}
              className="doc-patient-card"
              style={{ borderColor: risk.border }}
            >
              {/* Card header */}
              <div className="doc-card-header">
                {/* Avatar */}
                <div
                  className="doc-patient-avatar"
                  style={{
                    background: `linear-gradient(135deg, ${patient.avatarColor[0]}, ${patient.avatarColor[1]})`,
                    boxShadow: `0 3px 10px ${patient.avatarColor[0]}38`,
                  }}
                >
                  {patient.avatar}
                </div>

                {/* Name + info */}
                <div className="doc-patient-info">
                  <div className="doc-patient-name-row">
                    <span className="doc-patient-name">{patient.name}</span>
                    <span
                      className="doc-risk-badge"
                      style={{ background: risk.bg, color: risk.color, borderColor: risk.border }}
                    >
                      {risk.label}
                    </span>
                  </div>
                  <div className="doc-patient-meta">
                    <span>{`Age ${patient.age}`}</span>
                    <span className="doc-patient-meta-sep">·</span>
                    <span>{patient.gender}</span>
                    <span className="doc-patient-meta-sep">·</span>
                    <span>{`Blood ${patient.bloodType}`}</span>
                    <span className="doc-patient-meta-sep">·</span>
                    <span className="doc-patient-condition">{patient.condition}</span>
                  </div>
                </div>

                <div className="doc-card-spacer" />

                {/* Vital pills */}
                <div className="doc-vital-pills">
                  <VitalPill iconName="heartbeat" label="Avg HR"  value={`${avgHr}`}                                                    color={T.red}    />
                  <VitalPill iconName="moon"       label="Sleep"   value={`${avgSleep}h`}                                               color={T.purple} />
                  <VitalPill iconName="stress"     label="Stress"  value={`${avgStress}`}                                               color={T.yellow} />
                  <VitalPill iconName="fire"        label="Cal"     value={avgCals >= 1000 ? `${(avgCals/1000).toFixed(1)}k` : avgCals}  color={T.orange} />
                  <VitalPill iconName="football"   label="Steps"   value={formatSteps(avgSteps)}                                        color={T.green}  />
                </div>

                {/* Actions */}
                <div className="doc-card-actions">
                  <div className="doc-card-action-row">
                    <div className="doc-card-visit">
                      <div className="doc-card-visit-row">Last <span>{patient.lastVisit}</span></div>
                      <div className="doc-card-visit-row">Next <span className="doc-next">{patient.nextVisit}</span></div>
                    </div>
                    <button
                      className="doc-detail-btn"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      Details →
                    </button>
                  </div>
                  <RiskBar score={score} />
                </div>
              </div>

              {/* Divider */}
              <div className="doc-card-divider" />

              {/* Metric cards */}
              <div className="doc-metrics-row">
                <MetricCard
                  metricKey="hr" label="Heart Rate"
                  value={latest.hr} unit="bpm"
                  note={`Min ${Math.min(...patient.data.map(d => d.hr))} bpm`}
                  noteRight={`Max ${Math.max(...patient.data.map(d => d.hr))} bpm`}
                  data={patient.data} gradientId={`hrG${patient.id}`} type="area"
                />
                <MetricCard
                  metricKey="sleep" label="Sleep"
                  value={latest.sleep} unit="hrs"
                  note="Goal: 8 hrs"
                  noteRight={`Avg ${avgSleep} hrs`}
                  data={patient.data} gradientId={`slG${patient.id}`} type="bar"
                />
                <MetricCard
                  metricKey="stress" label="Stress Level"
                  value={latest.stress} unit="/ 100"
                  note="HRV based"
                  noteRight={`Peak ${Math.max(...patient.data.map(d => d.stress))}`}
                  data={patient.data} gradientId={`stG${patient.id}`} type="area"
                />
                <MetricCard
                  metricKey="calories" label="Calories"
                  value={latest.calories} unit="kcal"
                  note="Goal: 2,000 kcal"
                  noteRight={`Avg ${avgCals.toLocaleString()}`}
                  data={patient.data} gradientId={`calG${patient.id}`} type="bar"
                />
                <MetricCard
                  metricKey="steps" label="Steps"
                  value={latest.steps} unit="steps"
                  note="Goal: 10,000"
                  noteRight={`Avg ${formatSteps(avgSteps)}`}
                  data={patient.data} gradientId={`stpG${patient.id}`} type="bar"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Detail modal ── */}
      {selectedPatient && (() => {
        const p = selectedPatient;
        const latest = p.data[p.data.length - 1];
        const score  = getRiskScore(p);
        const risk   = getRiskLabel(score);
        const avgSteps = Math.round(p.data.reduce((a, b) => a + b.steps, 0) / p.data.length);
        const metricConfigs = [
          { key: 'hr',       label: 'Heart Rate', unit: 'bpm',   gradId: `mhr${p.id}`,  type: 'area' },
          { key: 'sleep',    label: 'Sleep',       unit: 'hrs',   gradId: `msl${p.id}`,  type: 'bar'  },
          { key: 'stress',   label: 'Stress',      unit: '/100',  gradId: `mst${p.id}`,  type: 'area' },
          { key: 'calories', label: 'Calories',    unit: 'kcal',  gradId: `mcal${p.id}`, type: 'bar'  },
          { key: 'steps',    label: 'Steps',       unit: 'steps', gradId: `mstp${p.id}`, type: 'bar'  },
        ];

        return (
          <div
            className="doc-modal-overlay"
            onClick={() => { setSelectedPatient(null); setSent(false); setMessage(''); }}
          >
            <div
              className="doc-modal"
              onClick={e => e.stopPropagation()}
              style={{ border: `1px solid ${risk.border}` }}
            >
              {/* Modal header */}
              <div className="doc-modal-header">
                <div
                  className="doc-modal-avatar"
                  style={{
                    background: `linear-gradient(135deg, ${p.avatarColor[0]}, ${p.avatarColor[1]})`,
                    boxShadow: `0 4px 14px ${p.avatarColor[0]}48`,
                  }}
                >
                  {p.avatar}
                </div>
                <div>
                  <div className="doc-modal-name-row">
                    <h2 className="doc-modal-name">{p.name}</h2>
                    <span
                      className="doc-risk-badge"
                      style={{ background: risk.bg, color: risk.color, borderColor: risk.border }}
                    >
                      {risk.label}
                    </span>
                  </div>
                  <p className="doc-modal-meta">
                    Age {p.age} · {p.gender} · Blood Type {p.bloodType} · <span className="doc-condition">{p.condition}</span>
                  </p>
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    className="doc-modal-risk-box"
                    style={{ background: risk.bg, border: `1px solid ${risk.border}` }}
                  >
                    <div className="doc-modal-risk-score" style={{ color: risk.color }}>
                      {score}<sub>/9</sub>
                    </div>
                    <div className="doc-modal-risk-label">Risk Score</div>
                  </div>
                  <button
                    className="doc-modal-close"
                    onClick={() => setSelectedPatient(null)}
                  >✕</button>
                </div>
              </div>

              {/* Summary strip */}
              <div className="doc-modal-summary">
                {metricConfigs.map(({ key, label, unit }) => {
                  const color = METRIC_COLORS[key];
                  const vals  = p.data.map(d => d[key]);
                  const avg   = key === 'sleep'
                    ? (vals.reduce((x, b) => x + b, 0) / vals.length).toFixed(1)
                    : Math.round(vals.reduce((x, b) => x + b, 0) / vals.length);
                  const t  = getTrend(p.data, key);
                  const lv = latest[key];
                  return (
                    <div
                      key={key}
                      className="doc-modal-summary-card"
                      style={{ background: color + '09', border: `1px solid ${color}20` }}
                    >
                      <div className="doc-modal-summary-top">
                        <Icon name={METRIC_ICONS[key]} size={14} />
                        <span className="doc-modal-summary-key">{label}</span>
                      </div>
                      <div className="doc-modal-summary-value" style={{ color }}>
                        {fmtNum(lv, key)}<sub>{unit}</sub>
                      </div>
                      <div className="doc-modal-summary-bottom">
                        <span className="doc-modal-summary-avg">Avg: <span>{fmtNum(avg, key)}</span></span>
                        <span className="doc-modal-summary-trend" style={{ color: t.color }}>{t.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trend charts — top 3 */}
              <div className="doc-modal-charts-3">
                {metricConfigs.slice(0, 3).map(({ key, label, gradId, type }) => (
                  <ModalChart key={key} metricKey={key} label={label} gradId={gradId} type={type} data={p.data} />
                ))}
              </div>

              {/* Trend charts — bottom 2 */}
              <div className="doc-modal-charts-2">
                {metricConfigs.slice(3).map(({ key, label, gradId, type }) => (
                  <ModalChart key={key} metricKey={key} label={label} gradId={gradId} type={type} data={p.data} />
                ))}
              </div>

              {/* Bottom: info + message */}
              <div className="doc-modal-bottom">
                {/* Patient info */}
                <div className="doc-modal-panel">
                  <div className="doc-modal-panel-header">
                    <Icon name="doctor" size={13} />
                    <SectionLabel>Patient Info</SectionLabel>
                  </div>
                  {[
                    ['Last Visit',  p.lastVisit,           T.blue   ],
                    ['Next Visit',  p.nextVisit,           T.green  ],
                    ['Condition',   p.condition,           T.yellow ],
                    ['Blood Type',  p.bloodType,           T.red    ],
                    ['Gender',      p.gender,              T.purple ],
                    ['Avg Steps',   formatSteps(avgSteps), T.green  ],
                  ].map(([k, v, c]) => (
                    <div key={k} className="doc-info-row">
                      <span className="doc-info-row-key">{k}</span>
                      <span className="doc-info-row-val" style={{ color: c }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Message composer */}
                <div className="doc-modal-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="doc-modal-panel-header">
                    <Icon name="target" size={13} />
                    <SectionLabel>Send Message</SectionLabel>
                  </div>
                  <div className="doc-message-row">
                    <input
                      className="doc-message-input"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      placeholder="Write a clinical note or message…"
                    />
                    <button
                      className="doc-send-btn"
                      onClick={handleSend}
                      style={{
                        background: sent
                          ? T.green + '20'
                          : `linear-gradient(135deg, ${p.avatarColor[0]}, ${p.avatarColor[1]})`,
                        color: sent ? T.green : '#fff',
                      }}
                    >
                      {sent ? '✓ Sent!' : 'Send →'}
                    </button>
                  </div>

                  <div className="doc-templates-label">Quick Templates</div>
                  <div className="doc-templates">
                    {[
                      "Great progress this week!",
                      "Please schedule a follow-up.",
                      "Stay hydrated & rest well.",
                      "Stress levels are high, please rest.",
                      "Your readings look improved!",
                      "Try to hit 10,000 steps today!",
                    ].map(t => (
                      <button
                        key={t}
                        className="doc-template-btn"
                        onClick={() => setMessage(t)}
                      >{t}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
