import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const patients = [
  {
    id: 1,
    name: "John Doe",
    age: 34,
    gender: "Male",
    condition: "Hypertension",
    risk: "high",
    bloodType: "A+",
    lastSync: "2 min ago",
    nextAppt: "Apr 07",
    vitals: { hr: 72, sleep: 6.9, stress: 68, steps: 7900 },
    trend: "worsening",
    flagged: false,
    notes: "Blood pressure spiked twice this week. Recommend medication review.",
    messages: [
      { from: "doctor", text: "John, please monitor your BP twice daily.", time: "Mar 28" },
      { from: "patient", text: "Understood. It's been around 145/90.", time: "Mar 29" },
    ],
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 28,
    gender: "Female",
    condition: "Anxiety Disorder",
    risk: "stable",
    bloodType: "O+",
    lastSync: "15 min ago",
    nextAppt: "Apr 03",
    vitals: { hr: 66, sleep: 7.9, stress: 34, steps: 10600 },
    trend: "improving",
    flagged: false,
    notes: "Responding well to CBT sessions. Sleep improved significantly.",
    messages: [
      { from: "doctor", text: "Great progress Jane. Keep up the breathing exercises.", time: "Mar 25" },
      { from: "patient", text: "Thank you! Feeling much better this week.", time: "Mar 26" },
    ],
  },
  {
    id: 3,
    name: "Marcus Lee",
    age: 45,
    gender: "Male",
    condition: "Chronic Stress / Insomnia",
    risk: "critical",
    bloodType: "B-",
    lastSync: "1 hr ago",
    nextAppt: "Apr 04",
    vitals: { hr: 90, sleep: 5.3, stress: 83, steps: 2800 },
    trend: "worsening",
    flagged: true,
    notes: "Critical sleep deprivation. HRV declining. Urgent follow-up required.",
    messages: [
      { from: "doctor", text: "Marcus, I need to see you urgently. Please confirm Apr 4.", time: "Mar 29" },
      { from: "patient", text: "I'll be there. Feeling very fatigued lately.", time: "Mar 30" },
    ],
  },
];

const riskOrder = { critical: 0, high: 1, stable: 2 };
const riskConfig = {
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.35)", ring: "#ef4444" },
  high: { color: "#fbbf24", bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.35)", ring: "#fbbf24" },
  stable: { color: "#22c55e", bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.35)", ring: "#22c55e" },
};
const timeSlots = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"];
const upcomingDays = ["Mon Apr 01", "Tue Apr 02", "Wed Apr 03", "Thu Apr 04", "Fri Apr 05", "Mon Apr 07", "Tue Apr 08"];

const Icon = ({ name, size = 16, style = {} }) => (
  <img src={`/${name}.png`} width={size} height={size} style={{ objectFit: "contain", ...style }} alt={name} />
);

const VitalPill = ({ iconName, value, unit, alert }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 4,
    background: alert ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${alert ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.07)"}`,
    borderRadius: 6, padding: "3px 8px", fontSize: "0.74rem", color: alert ? "#ef4444" : "#94a3b8",
  }}>
    <Icon name={iconName} size={13} />
    <span style={{ color: alert ? "#ef4444" : "#e2e8f0", fontWeight: 600 }}>{value}</span>
    {unit && <span style={{ fontSize: "0.65rem" }}>{unit}</span>}
  </div>
);

const TrendBadge = ({ trend }) => {
  const cfg = {
    improving: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: "↑", label: "Improving" },
    worsening: { color: "#f97316", bg: "rgba(249,115,22,0.1)", icon: "↓", label: "Worsening" },
    stable: { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", icon: "→", label: "Stable" }
  }[trend] || {};
  return <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 6, padding: "3px 8px", fontSize: "0.7rem", fontWeight: 700 }}>{cfg.icon} {cfg.label}</span>;
};

/* ── MESSAGE MODAL ──────────────────────────────────────────── */
function MessagePanel({ patient, onClose }) {
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState(patient.messages);
  const rc = riskConfig[patient.risk];
  const initials = patient.name.split(" ").map(n => n[0]).join("");

  const send = () => {
    if (!draft.trim()) return;
    setMsgs(m => [...m, { from: "doctor", text: draft, time: "Just now" }]);
    setDraft("");
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#0f172a,#1a2540)", border: "1px solid rgba(6,182,212,0.35)", borderRadius: 18, width: 500, maxWidth: "95vw", boxShadow: "0 0 60px rgba(6,182,212,0.18)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(90deg,rgba(6,182,212,0.22),rgba(6,182,212,0.05))", borderBottom: "1px solid rgba(6,182,212,0.2)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${rc.ring}33,${rc.ring}11)`, border: `2px solid ${rc.ring}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: rc.ring }}>{initials}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e2e8f0", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="chat" size={15} /> Message {patient.name}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>{patient.condition} · Synced {patient.lastSync}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center" }}>
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Thread */}
        <div style={{ padding: "16px 20px", maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "doctor" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "76%", background: m.from === "doctor" ? "linear-gradient(135deg,#0e4f6e,#0c3a54)" : "rgba(255,255,255,0.05)", border: `1px solid ${m.from === "doctor" ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: m.from === "doctor" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "9px 13px" }}>
                <div style={{ fontSize: "0.82rem", color: m.from === "doctor" ? "#e2e8f0" : "#94a3b8", lineHeight: 1.45 }}>{m.text}</div>
                <div style={{ fontSize: "0.65rem", color: "#334155", marginTop: 4, textAlign: m.from === "doctor" ? "right" : "left" }}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Compose */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "14px 20px", display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Write a message… (Enter to send)"
            style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 10, padding: "10px 12px", color: "#e2e8f0", fontSize: "0.83rem", resize: "none", height: 76, fontFamily: "inherit", outline: "none" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button onClick={send} style={{ background: "linear-gradient(135deg,#06b6d4,#0284c7)", border: "none", borderRadius: 10, padding: "10px 16px", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", boxShadow: "0 0 14px rgba(6,182,212,0.4)", display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="up-arrow" size={14} /> Send
            </button>
            <button style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "6px 10px", color: "#475569", cursor: "pointer", fontSize: "0.72rem" }}>📋 Template</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SCHEDULE MODAL ─────────────────────────────────────────── */
function SchedulePanel({ patient, onClose }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [apptType, setApptType] = useState("in-person");
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#0f172a,#1a2540)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 18, padding: "44px 36px", textAlign: "center", boxShadow: "0 0 50px rgba(34,197,94,0.18)", minWidth: 340 }}>
        <div style={{ fontSize: "2.8rem", marginBottom: 12, display: "flex", justifyContent: "center" }}>
          <Icon name="check-circle" size={56} />
        </div>
        <div style={{ fontWeight: 700, fontSize: "1.15rem", color: "#22c55e", marginBottom: 8 }}>Appointment Confirmed</div>
        <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: 4 }}>{patient.name}</div>
        <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "1rem", marginBottom: 6 }}>{selectedDay}</div>
        <div style={{ color: "#a5b4fc", fontWeight: 600, marginBottom: 18 }}>{selectedTime} · {apptType === "in-person" ? "In-Person" : apptType === "video-call" ? "Video Call" : "Phone Call"}</div>
        <div style={{ fontSize: "0.78rem", color: "#475569", marginBottom: 22 }}>Confirmation sent to patient.</div>
        <button onClick={onClose} style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "9px 28px", color: "#22c55e", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>Done</button>
      </div>
    </div>
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(145deg,#0f172a,#1a2540)", border: "1px solid rgba(99,102,241,0.35)", borderRadius: 18, width: 530, maxWidth: "95vw", boxShadow: "0 0 60px rgba(99,102,241,0.18)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(90deg,rgba(99,102,241,0.22),rgba(99,102,241,0.05))", borderBottom: "1px solid rgba(99,102,241,0.2)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e2e8f0", display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="schedule" size={15} /> Schedule Appointment
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>{patient.name} · Current: {patient.nextAppt}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center" }}>
            <Icon name="close" size={16} />
          </button>
        </div>

        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Type */}
          <div>
            <div style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Appointment Type</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["in-person", "video-call", "phone-call"].map(t => (
                <button key={t} onClick={() => setApptType(t)} style={{ flex: 1, padding: "9px 4px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: "0.78rem", background: apptType === t ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)", border: `1px solid ${apptType === t ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`, color: apptType === t ? "#818cf8" : "#64748b", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {t === "in-person" ? <><Icon name="building" size={14} /> In-Person</> : t === "video-call" ? <><Icon name="video" size={14} /> Video Call</> : <><Icon name="phone" size={14} /> Phone Call</>}
                </button>
              ))}
            </div>
          </div>

          {/* Days */}
          <div>
            <div style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Available Days</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {upcomingDays.map(d => (
                <button key={d} onClick={() => setSelectedDay(d)} style={{ padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: "0.75rem", fontWeight: 500, background: selectedDay === d ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)", border: `1px solid ${selectedDay === d ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`, color: selectedDay === d ? "#818cf8" : "#64748b", transition: "all 0.15s" }}>{d}</button>
              ))}
            </div>
          </div>

          {/* Times */}
          <div>
            <div style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Available Times</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
              {timeSlots.map(t => (
                <button key={t} onClick={() => setSelectedTime(t)} style={{ padding: "7px 4px", borderRadius: 8, cursor: "pointer", fontSize: "0.74rem", fontWeight: 500, background: selectedTime === t ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)", border: `1px solid ${selectedTime === t ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`, color: selectedTime === t ? "#818cf8" : "#64748b", transition: "all 0.15s" }}>{t}</button>
              ))}
            </div>
          </div>

          {/* Confirm CTA */}
          <button
            onClick={() => selectedDay && selectedTime && setConfirmed(true)}
            style={{
              background: selectedDay && selectedTime ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${selectedDay && selectedTime ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 12, padding: "13px", color: selectedDay && selectedTime ? "white" : "#334155",
              fontWeight: 700, cursor: selectedDay && selectedTime ? "pointer" : "not-allowed", fontSize: "0.88rem",
              boxShadow: selectedDay && selectedTime ? "0 0 22px rgba(99,102,241,0.4)" : "none",
              transition: "all 0.2s",
            }}
          >
            {selectedDay && selectedTime ? `✓ Confirm · ${selectedDay} at ${selectedTime}` : "Select a day and time to confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN ───────────────────────────────────────────────────── */
export default function Patients() {

  const navigate = useNavigate()
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [flagged, setFlagged] = useState(Object.fromEntries(patients.map(p => [p.id, p.flagged])));
  const [sortBy, setSortBy] = useState("risk");
  const [messaging, setMessaging] = useState(null);
  const [scheduling, setScheduling] = useState(null);

  const filtered = patients
    .filter(p => {
      const ms = p.name.toLowerCase().includes(search.toLowerCase()) || p.condition.toLowerCase().includes(search.toLowerCase());
      const mf = filter === "all" || p.risk === filter;
      return ms && mf;
    })
    .sort((a, b) => sortBy === "risk" ? riskOrder[a.risk] - riskOrder[b.risk] : sortBy === "name" ? a.name.localeCompare(b.name) : a.age - b.age);

  const counts = { all: patients.length, critical: patients.filter(p => p.risk === "critical").length, high: patients.filter(p => p.risk === "high").length, stable: patients.filter(p => p.risk === "stable").length };

  return (
    <div style={{ padding: "2rem", color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .msg-btn:hover{box-shadow:0 0 22px rgba(6,182,212,0.6)!important;transform:translateY(-1px);}
        .sched-btn:hover{box-shadow:0 0 22px rgba(99,102,241,0.6)!important;transform:translateY(-1px);}
        .prow:hover{border-color:rgba(255,255,255,0.1)!important;transform:translateY(-1px);}
        *{box-sizing:border-box;}
      `}</style>

      {messaging && <MessagePanel patient={messaging} onClose={() => setMessaging(null)} />}
      {scheduling && <SchedulePanel patient={scheduling} onClose={() => setScheduling(null)} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700 }}>Patients</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.85rem" }}>Monitoring {patients.length} patients · Last sync: just now</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
              <Icon name="search" size={15} />
            </span>
            <input type="text" placeholder="Search by name or condition..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "8px 12px 8px 32px", borderRadius: 8, color: "white", width: 240, fontSize: "0.85rem", outline: "none" }} />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "8px 12px", borderRadius: 8, color: "#94a3b8", fontSize: "0.85rem", cursor: "pointer" }}>
            <option value="risk">Sort: Risk</option>
            <option value="name">Sort: Name</option>
            <option value="age">Sort: Age</option>
          </select>
          <button style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)", border: "none", padding: "8px 16px", borderRadius: 8, color: "white", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" }}>+ Add Patient</button>
        </div>
      </div>

      {/* Stats tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem", alignItems: "center" }}>
        {[{ label: "All Patients", value: counts.all, color: "#64748b", f: "all" }, { label: "Critical", value: counts.critical, color: "#ef4444", f: "critical" }, { label: "High Risk", value: counts.high, color: "#fbbf24", f: "high" }, { label: "Stable", value: counts.stable, color: "#22c55e", f: "stable" }].map(s => (
          <button key={s.f} onClick={() => setFilter(s.f)} style={{ background: filter === s.f ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${filter === s.f ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)"}`, borderRadius: 10, padding: "10px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s" }}>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>{s.label}</span>
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px #22c55e" }} />
          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Live sync active</span>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 0.8fr 0.85fr 1.8fr 1.5fr 0.5fr", padding: "6px 18px", marginBottom: 6, fontSize: "0.7rem", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        <span>Patient</span><span>Risk</span><span>Trend</span><span>Last Vitals</span>
        <span style={{ color: "#818cf8", display: "flex", alignItems: "center", gap: 5 }}><Icon name="schedule" size={13} /> Schedule & <Icon name="chat" size={13} /> Message</span>
        <span style={{ textAlign: "right" }}>More</span>
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(p => {
          const rc = riskConfig[p.risk];
          const isExp = expanded === p.id;
          const isFlag = flagged[p.id];
          const initials = p.name.split(" ").map(n => n[0]).join("");
          const unread = p.messages.filter(m => m.from === "patient").length;

          return (
            <div key={p.id} className="prow" style={{ background: "linear-gradient(145deg,#0f172a,#1a2540)", border: `1px solid ${isExp ? rc.border : isFlag ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.06)"}`, borderRadius: 14, overflow: "hidden", transition: "all 0.2s", boxShadow: isFlag ? "inset 0 0 20px rgba(239,68,68,0.04)" : "none" }}>
              {isFlag && <div style={{ height: 3, background: "linear-gradient(90deg,#ef4444,transparent)" }} />}

              <div style={{ display: "grid", gridTemplateColumns: "1.8fr 0.8fr 0.85fr 1.8fr 1.5fr 0.5fr", alignItems: "center", padding: "15px 18px", gap: 8 }}>

                {/* Patient */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setExpanded(isExp ? null : p.id)}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg,${rc.ring}33,${rc.ring}11)`, border: `2px solid ${rc.ring}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: rc.ring, flexShrink: 0 }}>{initials}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontWeight: 600, fontSize: "0.92rem" }}>{p.name}</span>
                      {isFlag && <Icon name="flag" size={13} />}
                    </div>
                    <div style={{ color: "#64748b", fontSize: "0.76rem", marginTop: 1 }}>{p.gender}, {p.age} · {p.condition}</div>
                    <div style={{ color: "#334155", fontSize: "0.68rem", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                      <Icon name="clock" size={11} /> {p.lastSync}
                    </div>
                  </div>
                </div>

                {/* Risk */}
                <span style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, padding: "4px 10px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  {p.risk === "high" ? "High Risk" : p.risk.charAt(0).toUpperCase() + p.risk.slice(1)}
                </span>

                {/* Trend */}
                <TrendBadge trend={p.trend} />

                {/* Vitals */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  <VitalPill iconName="heartbeat" value={p.vitals.hr} unit="bpm" alert={p.vitals.hr > 85} />
                  <VitalPill iconName="moon" value={p.vitals.sleep} unit="h" alert={p.vitals.sleep < 6} />
                  <VitalPill iconName="stress-relief" value={p.vitals.stress} unit="" alert={p.vitals.stress > 70} />
                  <VitalPill iconName="football" value={(p.vitals.steps / 1000).toFixed(1) + "k"} unit="" />
                </div>

                {/* ── PROMINENT SCHEDULE + MESSAGE ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>

                  {/* Schedule — indigo */}
                  <button className="sched-btn" onClick={() => setScheduling(p)} style={{
                    background: "linear-gradient(135deg,rgba(99,102,241,0.28),rgba(79,70,229,0.18))",
                    border: "1px solid rgba(99,102,241,0.5)",
                    borderRadius: 10, padding: "8px 14px",
                    color: "#c7d2fe", fontWeight: 700, cursor: "pointer", fontSize: "0.78rem",
                    display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s",
                    boxShadow: "0 0 12px rgba(99,102,241,0.2)",
                  }}>
                    <Icon name="schedule" size={15} />
                    <span style={{ flex: 1, textAlign: "left" }}>Schedule Appointment</span>
                    <span style={{ background: "rgba(99,102,241,0.3)", color: "#818cf8", borderRadius: 6, padding: "2px 7px", fontSize: "0.68rem", fontWeight: 600 }}>{p.nextAppt}</span>
                  </button>

                  {/* Message — teal */}
                  <button className="msg-btn" onClick={() => setMessaging(p)} style={{
                    background: "linear-gradient(135deg,rgba(6,182,212,0.28),rgba(8,145,178,0.18))",
                    border: "1px solid rgba(6,182,212,0.5)",
                    borderRadius: 10, padding: "8px 14px",
                    color: "#a5f3fc", fontWeight: 700, cursor: "pointer", fontSize: "0.78rem",
                    display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s",
                    boxShadow: "0 0 12px rgba(6,182,212,0.2)",
                    position: "relative",
                  }}>
                    <Icon name="chat" size={15} />
                    <span style={{ flex: 1, textAlign: "left" }}>Message Patient</span>
                    {unread > 0 && (
                      <span style={{ background: "#06b6d4", color: "#0f172a", borderRadius: "50%", minWidth: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, padding: "0 3px" }}>{unread}</span>
                    )}
                  </button>
                </div>

                {/* Overflow */}
                <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end" }}>
                  <button onClick={() => setExpanded(isExp ? null : p.id)} style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 7, padding: "5px 10px", color: "#60a5fa", cursor: "pointer", fontSize: "0.74rem", fontWeight: 600, transition: "all 0.15s" }}>
                    {isExp ? "▲" : "▼"}
                  </button>
                  <button onClick={() => setFlagged(f => ({ ...f, [p.id]: !f[p.id] }))} style={{ background: isFlag ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${isFlag ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: 7, padding: "5px 8px", color: isFlag ? "#ef4444" : "#334155", cursor: "pointer", fontSize: "0.74rem", transition: "all 0.15s", display: "flex", alignItems: "center" }}>
                    <Icon name="flag" size={14} />
                  </button>
                </div>
              </div>

              {/* Expanded */}
              {isExp && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "14px 18px 16px", background: "rgba(0,0,0,0.2)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Clinical Notes</div>
                    <p style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.5 }}>{p.notes}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Patient Info</div>
                    {[["Blood Type", p.bloodType], ["Condition", p.condition], ["Last Active", p.lastSync]].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: 4 }}>
                        <span style={{ color: "#475569" }}>{k}</span>
                        <span style={{ color: "#cbd5e1", fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Quick Actions</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <button onClick={() => setScheduling(p)} style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 8, padding: "7px 12px", color: "#a5b4fc", cursor: "pointer", fontSize: "0.8rem", textAlign: "left", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon name="schedule" size={14} /> Schedule Appointment
                      </button>
                      <button onClick={() => setMessaging(p)} style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)", borderRadius: 8, padding: "7px 12px", color: "#67e8f9", cursor: "pointer", fontSize: "0.8rem", textAlign: "left", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon name="chat" size={14} /> Message Patient
                      </button>
                      <button style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "7px 12px", color: "#64748b", cursor: "pointer", fontSize: "0.8rem", textAlign: "left", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon name="file-text" size={14} /> Generate PDF Report
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: "3rem", color: "#334155", fontSize: "0.9rem" }}>No patients match your search.</div>}
      </div>
    </div>
  );
}
