import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// ─── Notifications ────────────────────────────────────────────────────────────
const NOTIFICATIONS = [
  { id:1, icon:'heart (2)', title:'Heart Rate Normal',          desc:'Resting heart rate is 72 bpm — within healthy range.',            time:'2 min ago', type:'good', tag:'Heart'    },
  { id:2, icon:'zzz', title:'Sleep Goal Not Met',          desc:'You only slept 5.5 hrs last night. Try to aim for 8 hrs tonight.', time:'1 hr ago',  type:'warn', tag:'Sleep'    },
  { id:3, icon:'burn', title:'Calorie Goal Almost Reached', desc:"You're at 72% of your daily calorie burn goal. Keep it up!",       time:'3 hr ago',  type:'info', tag:'Calories' },
  { id:4, icon:'mental-pressure', title:'Stress Level Elevated',       desc:'HRV indicates moderate stress today. A short walk may help.',      time:'5 hr ago',  type:'warn', tag:'Stress'   },
  { id:5, icon:'step', title:'Step Goal Achieved!',         desc:'You hit 9,158 steps today — 91% of your daily goal. Great work!',  time:'6 hr ago',  type:'good', tag:'Steps'    },
];
const NS = {
  good: { dot:'#34d399', glow:'rgba(52,211,153,0.6)',  bg:'rgba(52,211,153,0.07)',  border:'rgba(52,211,153,0.2)',  tag:{color:'#34d399',bg:'rgba(52,211,153,0.12)',border:'rgba(52,211,153,0.25)'} },
  warn: { dot:'#fbbf24', glow:'rgba(251,191,36,0.6)',  bg:'rgba(251,191,36,0.07)',  border:'rgba(251,191,36,0.2)',  tag:{color:'#fbbf24',bg:'rgba(251,191,36,0.12)',border:'rgba(251,191,36,0.25)'} },
  info: { dot:'#60a5fa', glow:'rgba(96,165,250,0.6)',  bg:'rgba(96,165,250,0.07)',  border:'rgba(96,165,250,0.2)',  tag:{color:'#60a5fa',bg:'rgba(96,165,250,0.12)',border:'rgba(96,165,250,0.25)'} },
};

// ─── Devices ──────────────────────────────────────────────────────────────────
const INIT_DEVICES = [
  { id:'apple',   name:'Apple Watch',    img:'/devices/apple-watch.png',   desc:'Series 9 · watchOS 10',      color:'#60a5fa', connected:true  },
  { id:'fitbit',  name:'Fitbit Sense 2', img:'/devices/fitbit.png',        desc:'Firmware 1.187.48',           color:'#34d399', connected:false },
  { id:'samsung', name:'Galaxy Watch 6', img:'/devices/samsung-watch.png', desc:'Wear OS 4 · One UI Watch 6',  color:'#a78bfa', connected:false },
  { id:'whoop',   name:'WHOOP 4.0',      img:'/devices/whoop.png',         desc:'Fitness & Recovery Tracker',  color:'#f87171', connected:false },
];
const NEW_DEVICES = [
  { id:'oura',     name:'Oura Ring Gen 3',   img:'/devices/oura.png',     desc:'Sleep & Recovery Ring',      color:'#4696fd' },
  { id:'garmin',   name:'Garmin Fenix 7',    img:'/devices/garmin.png',   desc:'GPS Multisport Watch',       color:'#4696fd' },
  { id:'polar',    name:'Polar H10',         img:'/devices/polar.png',    desc:'Heart Rate Sensor',          color:'#4696fd' },
  { id:'withings', name:'Withings ScanWatch',img:'/devices/withings.png', desc:'Hybrid Smartwatch + ECG',    color:'#4696fd' },
];

const F = "'Exo 2', sans-serif";

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&display=swap');
  @keyframes notifDropIn {
    from { opacity:0; transform:translateY(-10px) scale(0.95); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes centrePopIn {
    from { opacity:0; transform:translate(-50%,-48%) scale(0.93); }
    to   { opacity:1; transform:translate(-50%,-50%) scale(1); }
  }
  @keyframes spin { to { transform:rotate(360deg); } }
  .notif-scroll::-webkit-scrollbar,
  .sync-scroll::-webkit-scrollbar  { width:5px; }
  .notif-scroll::-webkit-scrollbar-track,
  .sync-scroll::-webkit-scrollbar-track  { background:transparent; }
  .notif-scroll::-webkit-scrollbar-thumb,
  .sync-scroll::-webkit-scrollbar-thumb  { background:rgba(91,184,255,0.2); border-radius:4px; }
  .notif-scroll::-webkit-scrollbar-thumb:hover,
  .sync-scroll::-webkit-scrollbar-thumb:hover { background:rgba(91,184,255,0.4); }
`;

// ─── Device row ───────────────────────────────────────────────────────────────
const CONNECT_GREEN = '#34d399';

const DeviceRow = ({ dev, onAction, onRemove, isSyncing, isConnected, method }) => {
  const [hoverRemove, setHoverRemove] = React.useState(false);
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:'1.1rem',
      padding:'1.05rem 1.2rem', borderRadius:20,
      background: isConnected ? 'rgba(52,211,153,0.07)' : 'rgba(255,255,255,0.03)',
      border:`1px solid ${isConnected ? 'rgba(52,211,153,0.28)' : 'rgba(255,255,255,0.07)'}`,
      transition:'all 0.2s',
    }}>
      <div style={{ width:52, height:52, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <img src={dev.img} alt={dev.name} style={{ width:44, height:44, objectFit:'contain' }}
          onError={e => {
            e.target.style.display='none';
            e.target.parentNode.innerHTML=`<span style="font-family:${F};font-size:0.68rem;font-weight:700;color:${dev.color}">${dev.name.slice(0,2).toUpperCase()}</span>`;
          }} />
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:F, fontSize:'0.92rem', fontWeight:700, color: isConnected ? '#fff' : '#c8dff0', marginBottom:3 }}>{dev.name}</div>
        <div style={{ fontFamily:F, fontSize:'0.72rem', fontWeight:400, color:'#3d6b8a', lineHeight:1.4 }}>{dev.desc}</div>
        {isConnected && (
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:5 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#34d399', boxShadow:'0 0 6px #34d399' }} />
            <span style={{ fontFamily:F, fontSize:'0.65rem', color:'#34d399', fontWeight:700 }}>
              Connected via {method==='bt' ? 'Bluetooth' : 'Phone App'} · Syncing
            </span>
          </div>
        )}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>
        <button onClick={onAction} disabled={isSyncing} style={{
          padding:'0.5rem 1.15rem', borderRadius:20,
          border: isConnected ? '1px solid rgba(248,113,113,0.45)' : '1px solid rgba(52,211,153,0.45)',
          background: isConnected ? 'rgba(248,113,113,0.12)' : 'rgba(52,211,153,0.12)',
          color: isConnected ? '#f87171' : CONNECT_GREEN,
          fontFamily:F, fontWeight:700, fontSize:'0.74rem',
          cursor: isSyncing ? 'default' : 'pointer',
          transition:'all 0.2s', whiteSpace:'nowrap', letterSpacing:'0.04em',
          display:'flex', alignItems:'center', gap:'0.4rem',
        }}
          onMouseEnter={e=>{ if(!isSyncing) e.currentTarget.style.transform='scale(1.06)'; }}
          onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; }}
        >
          {isSyncing && <span style={{ display:'inline-block', width:13, height:13, border:`2px solid ${CONNECT_GREEN}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />}
          {isSyncing ? 'Connecting…' : isConnected ? 'Disconnect' : '+ Connect'}
        </button>

        {onRemove && (
          <button onClick={onRemove}
            onMouseEnter={() => setHoverRemove(true)}
            onMouseLeave={() => setHoverRemove(false)}
            title="Remove device"
            style={{
              width:34, height:34, borderRadius:10, flexShrink:0,
              border:`1px solid ${hoverRemove ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'}`,
              background: hoverRemove ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.04)',
              color: hoverRemove ? '#f87171' : '#3d6b8a',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', transition:'all 0.18s',
            }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Connection method picker ─────────────────────────────────────────────────
const ConnectMethodPicker = ({ dev, onConnect, onBack, custom }) => {
  const [chosen, setChosen]         = useState(null);
  const [pairing, setPairing]       = useState(false);
  const [done, setDone]             = useState(false);
  const [customName, setCustomName] = useState('');

  const handlePair = () => {
    if (!chosen) return;
    setPairing(true);
    setTimeout(() => { setPairing(false); setDone(true); }, 2000);
    setTimeout(() => { onConnect(chosen); }, 2600);
  };

  const BluetoothIcon = ({ size=28, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const PhoneIcon = ({ size=28, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="2" width="14" height="20" rx="3" stroke={color} strokeWidth="2"/>
      <circle cx="12" cy="17.5" r="1" fill={color}/>
      <line x1="9" y1="6" x2="15" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const MethodCard = ({ id, title, subtitle, IconComp }) => {
    const active = chosen === id;
    const ICON_COLOR = active ? '#5bb8ff' : '#4a7a9b';
    return (
      <div onClick={() => !done && setChosen(id)} style={{
        flex:1, padding:'1.2rem 1rem', borderRadius:18, cursor: done ? 'default' : 'pointer',
        background: active ? 'rgba(91,184,255,0.12)' : 'rgba(255,255,255,0.04)',
        border:`2px solid ${active ? 'rgba(91,184,255,0.5)' : 'rgba(255,255,255,0.09)'}`,
        display:'flex', flexDirection:'column', alignItems:'center', gap:'0.65rem',
        transition:'all 0.2s',
        boxShadow: active ? '0 0 22px rgba(91,184,255,0.2)' : 'none',
      }}>
        <div style={{
          width:54, height:54, borderRadius:16,
          background: active ? 'rgba(91,184,255,0.18)' : 'rgba(255,255,255,0.06)',
          border:`1px solid ${active ? 'rgba(91,184,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all 0.2s',
        }}><IconComp size={26} color={ICON_COLOR} /></div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:F, fontSize:'0.85rem', fontWeight:700, color: active ? '#fff' : '#a8c8e0', marginBottom:3 }}>{title}</div>
          <div style={{ fontFamily:F, fontSize:'0.68rem', fontWeight:400, color:'#3d6b8a', lineHeight:1.5 }}>{subtitle}</div>
        </div>
        {active && (
          <div style={{
            width:20, height:20, borderRadius:'50%',
            background:'#5bb8ff', display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 10px rgba(91,184,255,0.7)',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
        <button onClick={onBack} style={{
          background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
          borderRadius:10, padding:'0.3rem 0.75rem', color:'#5a88a8',
          fontFamily:F, fontSize:'0.72rem', fontWeight:700, cursor:'pointer', transition:'all 0.15s',
        }}
          onMouseEnter={e=>e.currentTarget.style.color='#fff'}
          onMouseLeave={e=>e.currentTarget.style.color='#5a88a8'}
        >← Back</button>
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <div style={{
            width:32, height:32, borderRadius:10, overflow:'hidden',
            background:`${dev.color}22`, border:`1px solid ${dev.color}44`,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            {custom ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={dev.color} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            ) : (
              <img src={dev.img} alt={dev.name} style={{ width:22, height:22, objectFit:'contain' }}
                onError={e=>{ e.target.style.display='none'; e.target.parentNode.innerHTML=`<span style="font-family:${F};font-size:0.6rem;font-weight:700;color:${dev.color}">${dev.name.slice(0,2).toUpperCase()}</span>`; }} />
            )}
          </div>
          <span style={{ fontFamily:F, fontSize:'0.88rem', fontWeight:700, color:'#fff' }}>{dev.name}</span>
        </div>
      </div>

      {custom && !done && (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
          <label style={{ fontFamily:F, fontSize:'0.72rem', color:'#5a88a8', fontWeight:700 }}>Device name (optional)</label>
          <input
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            placeholder="e.g. My Smartwatch"
            style={{
              fontFamily:F, fontWeight:400,
              background:'rgba(255,255,255,0.05)', border:'1px solid rgba(91,184,255,0.25)',
              borderRadius:12, padding:'0.6rem 0.9rem', color:'#e2e8f0', fontSize:'0.82rem',
              outline:'none', width:'100%', boxSizing:'border-box',
            }}
          />
        </div>
      )}

      <div style={{ fontFamily:F, fontSize:'0.75rem', color:'#3d6b8a', fontWeight:700 }}>Choose how to connect:</div>

      <div style={{ display:'flex', gap:'0.75rem' }}>
        <MethodCard id="bt"    title="Bluetooth"         subtitle="Connect directly via Bluetooth Low Energy"  IconComp={BluetoothIcon} />
        <MethodCard id="phone" title="Connect via Phone" subtitle="Sync through your phone's companion app"    IconComp={PhoneIcon} />
      </div>

      {chosen === 'bt' && !done && (
        <div style={{
          padding:'0.85rem 1rem', borderRadius:14,
          background:'rgba(91,184,255,0.06)', border:'1px solid rgba(91,184,255,0.18)',
          fontFamily:F, fontSize:'0.72rem', fontWeight:400, color:'#5a88a8', lineHeight:1.7,
        }}>
          1. Make sure <strong style={{color:'#c8dff0'}}>{customName || dev.name}</strong> is powered on and nearby<br/>
          2. Put the device into pairing mode<br/>
          3. Tap <strong style={{color:'#c8dff0'}}>Pair via Bluetooth</strong> below to start scanning
        </div>
      )}

      {chosen === 'phone' && !done && (
        <div style={{
          padding:'0.85rem 1rem', borderRadius:14,
          background:'rgba(167,139,250,0.06)', border:'1px solid rgba(167,139,250,0.18)',
          fontFamily:F, fontSize:'0.72rem', fontWeight:400, color:'#5a88a8', lineHeight:1.7,
        }}>
          1. Open the <strong style={{color:'#c8dff0'}}>{dev.name.split(' ')[0]} companion app</strong> on your phone<br/>
          2. Make sure the device is paired in the app<br/>
          3. Tap <strong style={{color:'#c8dff0'}}>Connect via Phone</strong> below to link your account
        </div>
      )}

      {done && (
        <div style={{
          padding:'0.85rem 1rem', borderRadius:14,
          background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)',
          display:'flex', alignItems:'center', gap:'0.6rem',
          fontFamily:F, fontSize:'0.78rem', color:'#34d399', fontWeight:700,
        }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#34d399', boxShadow:'0 0 8px #34d399' }} />
          {dev.name} connected successfully! Redirecting…
        </div>
      )}

      {!done && (
        <button onClick={handlePair} disabled={!chosen || pairing} style={{
          width:'100%', padding:'0.8rem',
          background: chosen ? `linear-gradient(135deg,${dev.color}44,${dev.color}22)` : 'rgba(255,255,255,0.04)',
          border:`1px solid ${chosen ? dev.color+'55' : 'rgba(255,255,255,0.08)'}`,
          borderRadius:14, color: chosen ? '#fff' : '#3d6b8a',
          fontFamily:F, fontWeight:700, fontSize:'0.88rem', cursor: chosen ? 'pointer' : 'default',
          transition:'all 0.2s', letterSpacing:'0.04em',
          display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
          boxShadow: chosen ? `0 4px 20px ${dev.color}33` : 'none',
        }}
          onMouseEnter={e=>{ if(chosen && !pairing) e.currentTarget.style.transform='translateY(-1px)'; }}
          onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; }}
        >
          {pairing && <span style={{ display:'inline-block', width:14, height:14, border:'2px solid #fff', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />}
          {pairing ? 'Pairing…' : chosen === 'bt' ? (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11"/></svg> Pair via Bluetooth</>
          ) : chosen === 'phone' ? (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><circle cx="12" cy="17.5" r="1" fill="currentColor"/></svg> Connect via Phone</>
          ) : 'Select a connection method'}
        </button>
      )}
    </div>
  );
};

// ─── Sync Modal ───────────────────────────────────────────────────────────────
const SyncModal = ({ onClose, onDeviceSwitch, devices, setDevices }) => {
  const [tab, setTab]         = useState('my');
  const [syncing, setSyncing] = useState(null);
  const [picking, setPicking] = useState(null);

  const handleToggle = (id) => {
    const dev = devices.find(d => d.id === id);
    if (dev.connected) {
      // Disconnect this device only
      setDevices(prev => prev.map(d => d.id===id ? {...d, connected:false, method:null} : d));
    } else {
      // Disconnect all other devices, then connect this one
      setSyncing(id);
      setTimeout(() => {
        setDevices(prev => prev.map(d =>
          d.id===id ? {...d, connected:true} : {...d, connected:false, method:null}
        ));
        setSyncing(null);
        if (onDeviceSwitch) onDeviceSwitch(id);
      }, 1800);
    }
  };

  const handleRemove = (id) => setDevices(prev => prev.filter(d => d.id !== id));
  const handlePickMethod = (dev) => setPicking(dev);
  const handleConnect = (dev, method) => {
    // Disconnect all existing devices, then connect the new one
    setDevices(prev => {
      const allDisconnected = prev.map(d => ({...d, connected:false, method:null}));
      const exists = allDisconnected.find(d => d.id === dev.id);
      if (exists) return allDisconnected.map(d => d.id===dev.id ? {...d, connected:true, method} : d);
      return [...allDisconnected, {...dev, connected:true, method}];
    });
    if (onDeviceSwitch) onDeviceSwitch(dev.id);
    setPicking(null);
    setTab('my');
  };

  const connected = devices.filter(d => d.connected).length;

  const TabBtn = ({ k, label }) => (
    <button onClick={() => { setTab(k); setPicking(null); }} style={{
      flex:1, padding:'0.65rem 0', fontFamily:F, fontWeight:700, fontSize:'0.82rem',
      border:'none', borderRadius:10, cursor:'pointer', letterSpacing:'0.04em',
      transition:'all 0.18s',
      background: tab===k ? 'linear-gradient(135deg,rgba(91,184,255,0.2),rgba(91,184,255,0.08))' : 'transparent',
      color: tab===k ? '#fff' : '#3d6b8a',
      borderBottom: tab===k ? '2px solid #5bb8ff' : '2px solid transparent',
    }}>{label}</button>
  );

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)', zIndex:9998 }} />
      <div style={{
        position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:'min(640px, 92vw)', height:'min(680px, 88vh)',
        background:'linear-gradient(160deg,#0c1e30 0%,#0f2840 50%,#0c1e30 100%)',
        border:'1px solid rgba(91,184,255,0.22)', borderRadius:28,
        boxShadow:'0 40px 100px rgba(0,0,0,0.8)',
        zIndex:9999, overflow:'hidden', display:'flex', flexDirection:'column',
        animation:'centrePopIn 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily:F,
      }}>
        <div style={{ height:3, background:'linear-gradient(90deg,transparent,#5bb8ff,#60a5fa,#5bb8ff,transparent)', opacity:0.9, flexShrink:0 }} />

        {/* Header */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'1.5rem 1.8rem 1.2rem',
          borderBottom:'1px solid rgba(91,184,255,0.1)',
          background:'rgba(91,184,255,0.03)', flexShrink:0,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ width:48, height:48, borderRadius:15, background:'transparent', border:'none', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
              <img src="/fitness-tracker.png" alt="Sync"
                style={{ width:34, height:34, objectFit:'contain', filter:'drop-shadow(0 0 8px rgba(91,184,255,0.9)) drop-shadow(0 0 18px rgba(91,184,255,0.5))' }}
                onError={e=>e.target.style.display='none'} />
            </div>
            <div>
              <div style={{ fontFamily:F, fontWeight:700, fontSize:'1.15rem', color:'#fff', lineHeight:1.2 }}>Sync Devices</div>
              <div style={{ fontFamily:F, fontSize:'0.75rem', color:'#5a88a8', marginTop:3 }}>
                {connected > 0
                  ? <span style={{ color:'#34d399', fontWeight:700 }}>{connected} device{connected>1?'s':''} connected</span>
                  : <span style={{ color:'#5a88a8', fontWeight:400 }}>No devices connected</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
            borderRadius:'50%', width:36, height:36, color:'#5a88a8', fontSize:'0.9rem',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
          }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.14)'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='#5a88a8'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display:'flex', gap:'0.3rem', padding:'0.85rem 1.4rem 0',
          borderBottom:'1px solid rgba(255,255,255,0.06)',
          background:'rgba(255,255,255,0.01)', flexShrink:0,
        }}>
          <TabBtn k="my"  label="My Devices" />
          <TabBtn k="new" label="+ Connect New Device" />
        </div>

        {/* Scrollable body */}
        <div className="sync-scroll" style={{ overflowY:'auto', padding:'1rem 1.4rem', flex:1 }}>

          {/* MY DEVICES */}
          {tab==='my' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              {devices.length===0 && (
                <div style={{ textAlign:'center', padding:'3rem', fontFamily:F, color:'#3d6b8a', fontSize:'0.82rem' }}>
                  No devices added yet. Switch to "+ Connect New Device".
                </div>
              )}
              {devices.map(dev => (
                <DeviceRow key={dev.id} dev={dev}
                  isConnected={dev.connected} isSyncing={syncing===dev.id}
                  method={dev.method}
                  onAction={() => handleToggle(dev.id)}
                  onRemove={() => handleRemove(dev.id)}
                />
              ))}
            </div>
          )}

          {/* CONNECT NEW */}
          {tab==='new' && !picking && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              <p style={{ fontFamily:F, fontSize:'0.75rem', fontWeight:400, color:'#3d6b8a', margin:'0 0 0.4rem 0.2rem' }}>
                Select a device to choose how to connect
              </p>
              {NEW_DEVICES.map(dev => {
                const alreadyAdded = !!devices.find(d => d.id===dev.id && d.connected);
                return (
                  <div key={dev.id} style={{
                    display:'flex', alignItems:'center', gap:'1.1rem',
                    padding:'1.05rem 1.2rem', borderRadius:20,
                    background: alreadyAdded ? `${dev.color}0f` : 'rgba(255,255,255,0.03)',
                    border:`1px solid ${alreadyAdded ? dev.color+'33' : 'rgba(255,255,255,0.07)'}`,
                  }}>
                    <div style={{ width:52, height:52, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <img src={dev.img} alt={dev.name} style={{ width:44, height:44, objectFit:'contain' }}
                        onError={e=>{ e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                      <svg style={{display:'none'}} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={dev.color} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:F, fontSize:'0.92rem', fontWeight:700, color:'#e2e8f0', marginBottom:3 }}>{dev.name}</div>
                      <div style={{ fontFamily:F, fontSize:'0.72rem', fontWeight:400, color:'#3d6b8a' }}>{dev.desc}</div>
                    </div>
                    <button onClick={() => !alreadyAdded && handlePickMethod(dev)} disabled={alreadyAdded} style={{
                      flexShrink:0, padding:'0.5rem 1.15rem', borderRadius:20,
                      border: alreadyAdded ? '1px solid rgba(52,211,153,0.4)' : '1px solid rgba(52,211,153,0.45)',
                      background:'rgba(52,211,153,0.12)', color:'#34d399',
                      fontFamily:F, fontWeight:700, fontSize:'0.74rem', cursor: alreadyAdded ? 'default' : 'pointer',
                      transition:'all 0.2s', whiteSpace:'nowrap', letterSpacing:'0.04em',
                      display:'flex', alignItems:'center', gap:'0.35rem',
                    }}
                      onMouseEnter={e=>{ if(!alreadyAdded) e.currentTarget.style.transform='scale(1.06)'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; }}
                    >
                      {alreadyAdded
                        ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Added</>
                        : <>+ Add</>
                      }
                    </button>
                  </div>
                );
              })}

              {/* Add Other Device */}
              <div
                onClick={() => setPicking('other')}
                style={{
                  display:'flex', alignItems:'center', gap:'1.1rem',
                  padding:'1.05rem 1.2rem', borderRadius:20,
                  background:'rgba(255,255,255,0.02)',
                  border:'1px dashed rgba(91,184,255,0.25)',
                  cursor:'pointer', transition:'all 0.2s', marginTop:'0.2rem',
                }}
                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(91,184,255,0.07)'; e.currentTarget.style.borderColor='rgba(91,184,255,0.5)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor='rgba(91,184,255,0.25)'; }}
              >
                <div style={{ width:52, height:52, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5bb8ff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:F, fontSize:'0.92rem', fontWeight:700, color:'#a8c8e0', marginBottom:3 }}>Add Other Device</div>
                  <div style={{ fontFamily:F, fontSize:'0.72rem', fontWeight:400, color:'#3d6b8a' }}>Connect any device via Bluetooth or phone app</div>
                </div>
                <div style={{
                  padding:'0.5rem 1.15rem', borderRadius:20,
                  border:'1px solid rgba(91,184,255,0.35)',
                  background:'rgba(91,184,255,0.1)',
                  fontFamily:F, color:'#5bb8ff', fontWeight:700, fontSize:'0.74rem',
                  whiteSpace:'nowrap', letterSpacing:'0.04em', pointerEvents:'none',
                }}>Connect</div>
              </div>
            </div>
          )}

          {tab==='new' && picking && picking !== 'other' && (
            <ConnectMethodPicker
              dev={picking}
              onConnect={(method) => handleConnect(picking, method)}
              onBack={() => setPicking(null)}
            />
          )}

          {tab==='new' && picking === 'other' && (
            <ConnectMethodPicker
              dev={{ id:'custom', name:'Other Device', img:'', desc:'Connect your device manually', color:'#5bb8ff' }}
              onConnect={() => { setPicking(null); setTab('my'); }}
              onBack={() => setPicking(null)}
              custom
            />
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding:'0.85rem 1.4rem 1rem',
          borderTop:'1px solid rgba(91,184,255,0.1)',
          background:'rgba(91,184,255,0.02)',
          display:'flex', alignItems:'center', flexShrink:0,
        }}>
          <span style={{ fontFamily:F, fontSize:'0.72rem', fontWeight:400, color:'#3d6b8a', display:'flex', alignItems:'center', gap:'0.35rem' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Data is encrypted end-to-end
          </span>
        </div>
      </div>
    </>
  );
};

// ─── Layout ───────────────────────────────────────────────────────────────────
const Layout = ({ children, stats = { xp: 0, coins: 0 }, onDeviceSwitch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [syncOpen,  setSyncOpen]  = useState(false);
  const [devices,   setDevices]   = useState(() => {
    const active = localStorage.getItem('healup_active_device') || 'apple';
    return INIT_DEVICES.map(d => ({ ...d, connected: d.id === active }));
  });
  const [read, setRead]           = useState({});
  const notifRef = useRef(null);
  const unread   = NOTIFICATIONS.filter(n => !read[n.id]).length;

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const markAll       = () => setRead(Object.fromEntries(NOTIFICATIONS.map(n => [n.id, true])));
  const handleViewAll = () => { markAll(); setNotifOpen(false); navigate('/notifications'); };

  const menuItems = [
    { path:'/dashboard',     icon:'/dashboard.png',         label:'Dashboard' },
    { path:'/program',       icon:'/user.png',              label:'Program and Avatar customization' },
    { path:'/challenges',    icon:'/rpg-game.png',          label:'Challenges' },
    { path:'/goals',         icon:'/dart.png',              label:'Goals and Progress' },
    { path:'/activity-food', icon:'/healthy-food.png',      label:'Daily Health Log' },
    { path:'/notifications', icon:'/notification-bell.png', label:'Notifications and Report' },
    { path:'/chatbot',       icon:'/robot (1).png',         label:'Chatbot' },
  ];

  return (
    <div>
      <header className="topbar">
        <div className="topbar-left">
          <img src="/logo-transparent.png" alt="Logo" className="topbar-logo" />
          <span className="topbar-brand">HealUp!</span>
        </div>

        <div className="topbar-center">
          <button className="topbar-icon-btn" onClick={() => navigate('/chatbot')} title="AI Chatbot">
            <img src="/robot.png" alt="Chatbot" className="topbar-icon-img" />
          </button>

          <button className="topbar-icon-btn" title="Sync Devices"
            onClick={() => { setSyncOpen(p => !p); setNotifOpen(false); }}
            style={{ position:'relative' }}>
            <img src="/fitness-tracker.png" alt="Sync" className="topbar-icon-img"
              style={syncOpen ? { filter:'drop-shadow(0 0 6px rgba(52,211,153,0.9))' } : {}} />
          </button>

          <div ref={notifRef} style={{ position:'relative' }}>
            <button className="topbar-icon-btn" title="Alerts"
              onClick={() => { setNotifOpen(p => !p); setSyncOpen(false); }}
              style={{ position:'relative' }}>
              <img src="/notification.png" alt="Alerts" className="topbar-icon-img"
                style={notifOpen ? { filter:'drop-shadow(0 0 6px rgba(91,184,255,0.9))' } : {}} />
              {unread > 0 && (
                <span style={{
                  position:'absolute', top:1, right:1, minWidth:17, height:17,
                  background:'linear-gradient(135deg,#ef4444,#dc2626)', borderRadius:20,
                  fontFamily:F, fontSize:'0.58rem', fontWeight:700, color:'#fff',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  border:'2px solid #0b1a27', padding:'0 3px',
                  boxShadow:'0 0 8px rgba(239,68,68,0.7)', pointerEvents:'none',
                }}>{unread}</span>
              )}
            </button>

            {notifOpen && (
              <div style={{
                position:'absolute', top:'calc(100% + 14px)', right:'-160px', width:520,
                background:'linear-gradient(160deg,#0c1e30 0%,#0f2840 50%,#0c1e30 100%)',
                border:'1px solid rgba(91,184,255,0.22)', borderRadius:26,
                boxShadow:'0 32px 90px rgba(0,0,0,0.75)',
                zIndex:9999, overflow:'hidden',
                animation:'notifDropIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                fontFamily:F,
              }}>
                <div style={{ height:3, background:'linear-gradient(90deg,transparent,#5bb8ff,#a78bfa,#5bb8ff,transparent)', opacity:0.85 }} />
                <div style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'1.3rem 1.6rem 1.1rem',
                  borderBottom:'1px solid rgba(91,184,255,0.1)',
                  background:'rgba(91,184,255,0.03)',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.85rem' }}>
                    <div style={{
                      width:42, height:42, borderRadius:13,
                      background:'rgba(91,184,255,0.12)', border:'1px solid rgba(91,184,255,0.28)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'1.2rem', boxShadow:'0 0 14px rgba(91,184,255,0.22)',
                    }}>
                      <img src="/icons/notification-bell (1).png" alt="Notifications" style={{ width:22, height:22, objectFit:'contain' }} />
                    </div>
                    <div>
                      <div style={{ fontFamily:F, fontWeight:700, fontSize:'1.05rem', color:'#fff', lineHeight:1.2 }}>Notifications</div>
                      <div style={{ fontFamily:F, fontSize:'0.72rem', color:'#5a88a8', marginTop:3 }}>
                        {unread > 0
                          ? <span style={{ color:'#f87171', fontWeight:700 }}>{unread} unread alerts</span>
                          : <span style={{ color:'#34d399', fontWeight:700, display:'flex', alignItems:'center', gap:'4px' }}>All caught up <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={markAll} style={{
                    background:'rgba(91,184,255,0.08)', border:'1px solid rgba(91,184,255,0.22)',
                    borderRadius:20, color:'#5bb8ff', fontFamily:F, fontSize:'0.73rem', fontWeight:700,
                    cursor:'pointer', padding:'6px 16px', transition:'all 0.15s',
                  }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(91,184,255,0.2)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(91,184,255,0.08)'}
                  >Mark all read</button>
                </div>

                <div className="notif-scroll" style={{ maxHeight:460, overflowY:'auto', padding:'0.85rem 1rem' }}>
                  {NOTIFICATIONS.map((n, idx) => {
                    const isRead = !!read[n.id];
                    return (
                      <div key={n.id} onClick={() => setRead(p=>({...p,[n.id]:true}))}
                        style={{
                          display:'flex', gap:'1rem', alignItems:'flex-start',
                          padding:'1rem 1.1rem', borderRadius:18,
                          background: isRead ? 'rgba(255,255,255,0.02)' : 'rgba(91,184,255,0.07)',
                          border:`1px solid ${isRead ? 'rgba(255,255,255,0.05)' : 'rgba(91,184,255,0.2)'}`,
                          marginBottom: idx<NOTIFICATIONS.length-1 ? '0.55rem' : 0,
                          cursor:'pointer', transition:'transform 0.18s', opacity: isRead ? 0.4 : 1,
                        }}
                        onMouseEnter={e=>{ if(!isRead) e.currentTarget.style.transform='translateX(4px)'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.transform='translateX(0)'; }}
                      >
                        <div style={{ width:42, height:42, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <img src={`/icons/${n.icon}.png`} alt={n.icon} style={{
                            width:36, height:36, objectFit:'contain',
                            opacity: isRead ? 0.25 : 1,
                            filter: isRead ? 'grayscale(1) opacity(0.3)' : 'brightness(0) saturate(100%) invert(53%) sepia(96%) saturate(400%) hue-rotate(180deg) brightness(105%)',
                          }} />
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.4rem', marginBottom:5 }}>
                            <span style={{ fontFamily:F, fontSize:'0.9rem', fontWeight:700, color: isRead?'#4a7a9b':'#e2e8f0' }}>{n.title}</span>
                            {!isRead && <div style={{ width:10, height:10, borderRadius:'50%', flexShrink:0, background:'#5bb8ff', boxShadow:'0 0 8px rgba(91,184,255,0.7)' }} />}
                          </div>
                          <div style={{ fontFamily:F, fontSize:'0.77rem', fontWeight:400, color: isRead?'#3d5c72':'#5a88a8', lineHeight:1.6, marginBottom:8 }}>{n.desc}</div>
                          <div style={{ display:'flex', alignItems:'center', gap:'0.55rem' }}>
                            <span style={{ fontFamily:F, fontSize:'0.64rem', fontWeight:700, padding:'3px 10px', borderRadius:20, letterSpacing:'0.05em', color:'#5bb8ff', background:'rgba(91,184,255,0.12)', border:'1px solid rgba(91,184,255,0.25)' }}>{n.tag}</span>
                            <span style={{ fontFamily:F, fontSize:'0.65rem', fontWeight:400, color:'#2e5470' }}>{n.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ padding:'1rem 1.1rem', borderTop:'1px solid rgba(91,184,255,0.1)', background:'rgba(91,184,255,0.02)' }}>
                  <button onClick={handleViewAll} style={{
                    width:'100%', padding:'0.88rem',
                    background:'linear-gradient(135deg,rgba(91,184,255,0.18),rgba(167,139,250,0.12))',
                    border:'1px solid rgba(91,184,255,0.3)', borderRadius:16,
                    color:'#fff', fontFamily:F, fontWeight:700, fontSize:'0.92rem',
                    cursor:'pointer', letterSpacing:'0.05em', transition:'all 0.18s',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem',
                  }}
                    onMouseEnter={e=>{ e.currentTarget.style.background='linear-gradient(135deg,rgba(91,184,255,0.3),rgba(167,139,250,0.22))'; e.currentTarget.style.transform='translateY(-1px)'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background='linear-gradient(135deg,rgba(91,184,255,0.18),rgba(167,139,250,0.12))'; e.currentTarget.style.transform='translateY(0)'; }}
                  >
                    View All Notifications &amp; Reports
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.7}}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="topbar-right">
          <div id="xp-chip" style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
            <img src="/star.png" alt="XP" style={{ width:22, height:22, objectFit:'contain' }} />
            <span style={{ fontFamily:F, fontSize:'0.88rem', fontWeight:700, color:'#fff' }}>{stats.xp.toLocaleString()}</span>
            <span style={{ fontFamily:F, fontSize:'0.78rem', fontWeight:700, color:'#a0c4e0' }}>XP</span>
          </div>
          <div id="coins-chip" style={{ display:'flex', alignItems:'center', gap:'0.3rem', marginLeft:'1.2rem' }}>
            <img src="/profit.png" alt="Coins" style={{ width:22, height:22, objectFit:'contain' }} />
            <span style={{ fontFamily:F, fontSize:'0.88rem', fontWeight:700, color:'#fbbf24' }}>{stats.coins.toLocaleString()}</span>
            <span style={{ fontFamily:F, fontSize:'0.78rem', fontWeight:700, color:'#f59e0b' }}>Coins</span>
          </div>
          <div className="topbar-avatar-chip">
            <div className="topbar-avatar-dot" />
            <span className="topbar-avatar-name">My Profile</span>
          </div>
        </div>
      </header>

      <div className="layout-container">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {menuItems.map(item => (
              <Link key={item.path} to={item.path}
                className={`sidebar-item ${location.pathname===item.path?'active':''}`}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g,'-')}`}>
                <img src={item.icon} alt={item.label} className="sidebar-icon-img" />
                <span className="sidebar-label">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="main-content">{children}</main>
      </div>

      {syncOpen && <SyncModal onClose={() => setSyncOpen(false)} onDeviceSwitch={onDeviceSwitch} devices={devices} setDevices={setDevices} />}

      <style>{SHARED_STYLES}</style>
    </div>
  );
};

export default Layout;
