import React, { useState } from "react";
import "../styles/Reports.css";

const reportsData = [
  {
    id: 1,
    patient: "Marcus Lee",
    age: 42,
    gender: "Male",
    type: "Critical Alert",
    message: "Stress level exceeded safe threshold",
    date: "Mar 30",
    time: "09:14 AM",
    status: "critical",
    vitals: { hr: 112, bp: "148/94", spo2: 96, temp: 37.8, stress: 91, sleep: 5.1 },
    trend: "worsening",
    notes: "Patient reported chest tightness and difficulty sleeping. Recommended immediate consultation. Cortisol levels elevated for 3 consecutive days.",
    history: [
      { date: "Mar 28", event: "Stress level at 78 (Borderline)" },
      { date: "Mar 29", event: "Stress spiked to 85 (Warned)" },
      { date: "Mar 30", event: "Stress reached 91 (Critical threshold)" },
    ],
    tags: ["Stress", "Cardio Risk", "Urgent"],
  },
  {
    id: 2,
    patient: "John Doe",
    age: 35,
    gender: "Male",
    type: "Health Decline",
    message: "Sleep dropped below 6 hours for 4 consecutive nights",
    date: "Mar 29",
    time: "07:45 AM",
    status: "high",
    vitals: { hr: 88, bp: "132/82", spo2: 98, temp: 36.9, stress: 64, sleep: 4.8 },
    trend: "declining",
    notes: "Consistent sleep deprivation detected. Patient works late shifts. Melatonin supplementation and sleep hygiene counseling recommended.",
    history: [
      { date: "Mar 26", event: "Sleep at 6.5 hrs (Normal)" },
      { date: "Mar 27", event: "Sleep at 5.9 hrs (Below threshold)" },
      { date: "Mar 28", event: "Sleep at 5.2 hrs (Declining)" },
      { date: "Mar 29", event: "Sleep at 4.8 hrs (Health decline flagged)" },
    ],
    tags: ["Sleep", "Fatigue", "Follow-up"],
  },
  {
    id: 3,
    patient: "Jane Smith",
    age: 29,
    gender: "Female",
    type: "Improvement",
    message: "Stress levels improving consistently over 5 days",
    date: "Mar 28",
    time: "11:30 AM",
    status: "stable",
    vitals: { hr: 68, bp: "118/74", spo2: 99, temp: 36.6, stress: 32, sleep: 7.4 },
    trend: "improving",
    notes: "Patient has been following the mindfulness protocol assigned last week. Heart rate variability has improved significantly. Continue current regimen.",
    history: [
      { date: "Mar 24", event: "Stress at 68 (Concerning)" },
      { date: "Mar 25", event: "Stress at 55 (Improving)" },
      { date: "Mar 27", event: "Stress at 44 (Good progress)" },
      { date: "Mar 28", event: "Stress at 32 (Stable range)" },
    ],
    tags: ["Stress", "Recovery", "Mindfulness"],
  },
  {
    id: 4,
    patient: "Emily Chen",
    age: 51,
    gender: "Female",
    type: "Routine Check",
    message: "Monthly vitals within normal range",
    date: "Mar 27",
    time: "02:00 PM",
    status: "stable",
    vitals: { hr: 72, bp: "122/78", spo2: 99, temp: 36.5, stress: 28, sleep: 7.8 },
    trend: "stable",
    notes: "All biomarkers within optimal range. Patient reports feeling energetic and well-rested. No interventions required. Schedule next check in 30 days.",
    history: [
      { date: "Feb 27", event: "Monthly check (All normal) " },
      { date: "Mar 27", event: "Monthly check (All normal)" },
    ],
    tags: ["Routine", "All Clear"],
  },
  {
    id: 5,
    patient: "Robert Kim",
    age: 67,
    gender: "Male",
    type: "Critical Alert",
    message: "Heart rate irregularity detected during night",
    date: "Mar 26",
    time: "03:22 AM",
    status: "critical",
    vitals: { hr: 128, bp: "155/98", spo2: 94, temp: 37.2, stress: 78, sleep: 3.2 },
    trend: "worsening",
    notes: "Nocturnal tachycardia detected. SpO2 dipped to 92% at peak. Patient has history of atrial fibrillation. Immediate cardiology referral initiated.",
    history: [
      { date: "Mar 24", event: "Mild irregularity (Monitored)" },
      { date: "Mar 25", event: "HR peaked at 118 during sleep" },
      { date: "Mar 26", event: "HR at 128, SpO2 at 94 (Critical)" },
    ],
    tags: ["Cardiac", "AFib Risk", "Urgent", "Referral"],
  },
];

const STATUS_CONFIG = {
  critical: { color: "#f87171", glow: "rgba(248,113,113,0.25)", label: "Critical", dot: "#ef4444" },
  high:     { color: "#fbbf24", glow: "rgba(251,191,36,0.25)",  label: "High",     dot: "#f59e0b" },
  stable:   { color: "#34d399", glow: "rgba(52,211,153,0.25)",  label: "Stable",   dot: "#10b981" },
  reviewed: { color: "#60a5fa", glow: "rgba(96,165,250,0.2)",   label: "Reviewed", dot: "#3b82f6" },
};

const TREND_CONFIG = {
  worsening: { icon: "↓", color: "#f87171", label: "Worsening" },
  declining: { icon: "↘", color: "#fbbf24", label: "Declining" },
  stable:    { icon: "→", color: "#5bb8ff", label: "Stable"    },
  improving: { icon: "↑", color: "#34d399", label: "Improving" },
};

const Icon = ({ name, size = 16, style = {} }) => (
  <img src={`/${name}.png`} width={size} height={size} style={{ objectFit: "contain", ...style }} alt={name} />
);

const VitalCard = ({ label, value, unit, color, iconName }) => (
  <div className="rp-vital-card">
    <Icon name={iconName} size={20} />
    <div className="rp-vital-body">
      <span className="rp-vital-val" style={{ color }}>{value}</span>
      <span className="rp-vital-unit">{unit}</span>
    </div>
    <span className="rp-vital-label">{label}</span>
  </div>
);

const ReportModal = ({ report, onClose, onMarkReviewed }) => {
  const [tab, setTab] = useState("overview");
  const st = STATUS_CONFIG[report.status];
  const tr = TREND_CONFIG[report.trend];

  return (
    <div className="rp-modal-overlay" onClick={onClose}>
      <div className="rp-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="rp-modal-header" style={{ borderTopColor: st.color }}>
          <div className="rp-modal-avatar" style={{ background: `linear-gradient(135deg, ${st.color}22, ${st.color}11)`, border: `1.5px solid ${st.color}44` }}>
            {report.patient.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="rp-modal-hinfo">
            <div className="rp-modal-name">{report.patient}</div>
            <div className="rp-modal-meta">{report.age} yrs · {report.gender} · {report.date} at {report.time}</div>
          </div>
          <div className="rp-modal-status-badge" style={{ color: st.color, background: `${st.color}18`, border: `1px solid ${st.color}40` }}>
            <span className="rp-status-dot" style={{ background: st.color, boxShadow: `0 0 6px ${st.color}` }} />
            {st.label}
          </div>
          <button className="rp-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Alert banner for critical */}
        {report.status === "critical" && (
          <div className="rp-alert-banner">
            ⚠ Critical alert (immediate review recommended)
          </div>
        )}

        {/* Tabs */}
        <div className="rp-tabs">
          {["overview", "vitals", "history"].map(t => (
            <button key={t} className={`rp-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="rp-modal-body">

          {tab === "overview" && (
            <div className="rp-tab-content">
              <div className="rp-type-row">
                <span className="rp-type-badge" style={{ color: st.color, background: `${st.color}18`, border: `1px solid ${st.color}33` }}>{report.type}</span>
                <span className="rp-trend-badge" style={{ color: tr.color }}>
                  {tr.icon} {tr.label}
                </span>
              </div>
              <div className="rp-message-box">
                <span className="rp-message-label">Summary</span>
                <p className="rp-message-text">{report.message}</p>
              </div>
              <div className="rp-notes-box">
                <span className="rp-message-label">Doctor Notes</span>
                <p className="rp-notes-text">{report.notes}</p>
              </div>
              <div className="rp-tags-row">
                {report.tags.map(tag => (
                  <span key={tag} className="rp-tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {tab === "vitals" && (
            <div className="rp-tab-content">
              <div className="rp-vitals-grid">
                <VitalCard label="Heart Rate"  value={report.vitals.hr}     unit="bpm"  color="#f87171" iconName="heartbeat"     />
                <VitalCard label="Blood Pres." value={report.vitals.bp}     unit="mmHg" color="#5bb8ff" iconName="blood-pressure" />
                <VitalCard label="SpO₂"        value={report.vitals.spo2}   unit="%"    color="#34d399" iconName="oxygen"         />
                <VitalCard label="Temperature" value={report.vitals.temp}   unit="°C"   color="#fb923c" iconName="temperature"    />
                <VitalCard label="Stress"      value={report.vitals.stress} unit="/100" color="#a78bfa" iconName="stress-relief"  />
                <VitalCard label="Sleep"       value={report.vitals.sleep}  unit="hrs"  color="#fbbf24" iconName="moon"           />
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="rp-tab-content">
              <div className="rp-timeline">
                {report.history.map((h, i) => (
                  <div key={i} className={`rp-timeline-item ${i === report.history.length - 1 ? "latest" : ""}`}>
                    <div className="rp-timeline-dot" style={{ background: i === report.history.length - 1 ? st.color : "rgba(255,255,255,0.15)", boxShadow: i === report.history.length - 1 ? `0 0 8px ${st.color}` : "none" }} />
                    <div className="rp-timeline-content">
                      <span className="rp-timeline-date">{h.date}</span>
                      <span className="rp-timeline-event">{h.event}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="rp-modal-footer">
          <button
            className="rp-btn-primary"
            disabled={report.status === "reviewed"}
            onClick={() => onMarkReviewed(report.id)}
          >
            {report.status === "reviewed" ? "Reviewed" : "Mark as Reviewed"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Reports() {
  const [selected, setSelected] = useState(null);
  const [reports, setReports] = useState(reportsData);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = reports.filter(r => {
    const matchFilter = filter === "all" || r.status === filter;
    const matchSearch = r.patient.toLowerCase().includes(search.toLowerCase()) ||
                        r.type.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const markAsReviewed = (id) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "reviewed" } : r));
    setToast("Report marked as reviewed");
    setTimeout(() => setToast(""), 2500);
  };

  const counts = {
    all:      reportsData.length,
    critical: reportsData.filter(r => r.status === "critical").length,
    high:     reportsData.filter(r => r.status === "high").length,
    stable:   reportsData.filter(r => r.status === "stable").length,
  };

  return (
    <div className="rp-page">

      {/* Page header */}
      <div className="rp-page-header">
        <div className="rp-page-title-block">
          <h1 className="rp-page-title">Reports from Patients</h1>
          <span className="rp-page-sub">Health reports submitted by your patients · {reportsData.length} reports received</span>
        </div>
        <div className="rp-search-wrap">
          <Icon name="search" size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input
            className="rp-search"
            placeholder="Search patient or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="rp-stats-row">
        {[
          { key: "all",      label: "All Reports", color: "#5bb8ff" },
          { key: "critical", label: "Critical",    color: "#f87171" },
          { key: "high",     label: "High Risk",   color: "#fbbf24" },
          { key: "stable",   label: "Stable",      color: "#34d399" },
        ].map(s => (
          <button
            key={s.key}
            className={`rp-stat-chip ${filter === s.key ? "active" : ""}`}
            style={{ "--chip-color": s.color }}
            onClick={() => setFilter(s.key)}
          >
            <span className="rp-stat-count" style={{ color: s.color }}>{counts[s.key]}</span>
            <span className="rp-stat-label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Report list */}
      <div className="rp-list">
        {filtered.length === 0 && (
          <div className="rp-empty">No reports match your filters.</div>
        )}
        {filtered.map((r, i) => {
          const st = STATUS_CONFIG[r.status];
          const tr = TREND_CONFIG[r.trend];
          return (
            <div
              key={r.id}
              className={`rp-card ${r.status === "reviewed" ? "reviewed" : ""}`}
              style={{ "--status-color": st.color, "--status-glow": st.glow, animationDelay: `${i * 0.06}s` }}
              onClick={() => setSelected(r)}
            >
              <div className="rp-card-accent" style={{ background: st.color }} />

              <div className="rp-card-left">
                <div className="rp-patient-avatar" style={{ background: `linear-gradient(135deg, ${st.color}22, ${st.color}11)`, border: `1.5px solid ${st.color}44`, color: st.color }}>
                  {r.patient.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="rp-card-info">
                  <span className="rp-patient-name">{r.patient}</span>
                  <span className="rp-card-msg">{r.message}</span>
                  <div className="rp-card-tags">
                    {r.tags.slice(0, 2).map(t => <span key={t} className="rp-mini-tag">{t}</span>)}
                  </div>
                </div>
              </div>

              <div className="rp-card-right">
                <div className="rp-status-pill" style={{ color: st.color, background: `${st.color}15`, border: `1px solid ${st.color}35` }}>
                  <span className="rp-status-dot" style={{ background: st.color, boxShadow: `0 0 5px ${st.color}` }} />
                  {st.label}
                </div>
                <div className="rp-trend-pill" style={{ color: tr.color }}>
                  {tr.icon} {tr.label}
                </div>
                <div className="rp-card-date">{r.type} · {r.date}</div>
              </div>

              <div className="rp-card-arrow">›</div>
            </div>
          );
        })}
      </div>

      {selected && (
        <ReportModal
          report={selected}
          onClose={() => setSelected(null)}
          onMarkReviewed={markAsReviewed}
        />
      )}

      {toast && (
        <div className="rp-center-popup-overlay">
          <div className="rp-center-popup">
            <div className="rp-popup-icon">
              <Icon name="check-circle" size={40} />
            </div>
            <div className="rp-popup-text">{toast}</div>
          </div>
        </div>
      )}
    </div>
  );
}