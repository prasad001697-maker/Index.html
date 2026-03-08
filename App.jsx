import { useState } from "react";
import "./styles.css";
import { INITIAL_SUBJECTS, DEMO_USER, C, pct, getStatus, canBunk, needMore } from "./utils.js";

// ── Ring Progress ────────────────────────────────────────
function Ring({ p, size = 56 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const col = p >= 85 ? C.green : p >= 75 ? C.yellow : C.red;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e2e" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={6}
        strokeDasharray={`${(p/100)*circ} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.5s ease" }} />
    </svg>
  );
}

// ── Subject Card ─────────────────────────────────────────
function Card({ s, onUpdate, sim, delta }) {
  const sa = s.attended + (sim ? (delta?.a || 0) : 0);
  const st = s.total   + (sim ? (delta?.t || 0) : 0);
  const p   = pct(sa, st);
  const st2 = getStatus(p);
  return (
    <div className="subject-card"
      onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Ring p={p} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 11, fontWeight: 700, color: st2.color }}>{p}%</div>
      </div>
      <div style={{ flex: 1 }}>
        <div className="subject-name">{s.name}</div>
        <div className="subject-count">{sa}/{st} classes</div>
        {p < 75
          ? <div className="subject-hint-danger">⚠ Attend {needMore(sa, st)} more to reach 75%</div>
          : <div className="subject-hint-safe">✓ Can bunk {canBunk(sa, st)} more</div>}
      </div>
      <div className="status-badge"
        style={{ background: `${st2.color}18`, border: `1px solid ${st2.color}40`, color: st2.color }}>
        {st2.label}</div>
      {!sim && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button className="btn-attend" onClick={() => onUpdate(s.id, 1, 1)}>+Attend</button>
          <button className="btn-bunk"   onClick={() => onUpdate(s.id, 0, 1)}>+Bunk</button>
        </div>
      )}
    </div>
  );
}

// ── Login Screen ─────────────────────────────────────────
function Login({ onLogin, onDemo }) {
  const [roll, setRoll] = useState("");
  const [err,  setErr]  = useState("");
  const [loading, setLoading] = useState(false);

  const go = () => {
    if (!roll.trim() || roll.trim().length < 4) { setErr("Invalid Roll Number"); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(roll.trim()); }, 1000);
  };

  return (
    <div className="login-wrap">
      <div className="login-glow" />
      <div className="login-card">
        <div className="login-title">Bunker.</div>
        <div className="login-subtitle">Smart Attendance Manager</div>
        <div style={{ textAlign: "left", marginBottom: 8 }}>
          <label style={{ fontSize: 12, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Roll Number</label>
        </div>
        <input className="login-input" value={roll} placeholder="e.g. 21CSE001"
          style={{ borderColor: err ? C.red : C.border }}
          onChange={e => { setRoll(e.target.value); setErr(""); }}
          onKeyDown={e => e.key === "Enter" && go()} />
        {err && <div className="login-error">{err}</div>}
        <button className="btn-primary" onClick={go}
          style={{ marginBottom: 12, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Signing in..." : "Sign In"}</button>
        <button className="btn-secondary" onClick={onDemo}>Try Demo Mode</button>
        <div style={{ marginTop: 20, fontSize: 11, color: C.muted }}>
          By logging in, you agree to our{" "}
          <span style={{ color: C.accent, cursor: "pointer" }}>Privacy Policy & Terms</span>
        </div>
      </div>
    </div>
  );
}

// ── Settings Panel ───────────────────────────────────────
function Settings({ user, onSignOut, onClose }) {
  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>⚙️ Settings</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {[
          { label: "Logged In As", value: user?.rollNo || "Demo User" },
          { label: "Mode",         value: user?.isDemo ? "Demo (Read Only)" : "Live" },
          { label: "Graphics Quality", value: "Auto" },
        ].map(r => (
          <div key={r.label} className="settings-row">
            <span style={{ color: C.muted }}>{r.label}</span>
            <span style={{ color: C.text, fontWeight: 600 }}>{r.value}</span>
          </div>
        ))}
        <button className="btn-signout" onClick={onSignOut}>Sign Out</button>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────
export default function BunkerApp() {
  const [screen,   setScreen]   = useState("login");
  const [user,     setUser]     = useState(null);
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [sim,      setSim]      = useState(false);
  const [deltas,   setDeltas]   = useState({});
  const [showSett, setShowSett] = useState(false);
  const [tab,      setTab]      = useState("dashboard");

  const login   = roll => { setUser({ rollNo: roll, isDemo: false }); setScreen("dash"); };
  const demo    = ()   => { setUser({ ...DEMO_USER, isDemo: true }); setScreen("dash"); };
  const signOut = ()   => { setUser(null); setScreen("login"); setShowSett(false); setSubjects(INITIAL_SUBJECTS); setSim(false); setDeltas({}); };

  const update = (id, da, dt) =>
    setSubjects(p => p.map(s => s.id === id
      ? { ...s, attended: Math.max(0, s.attended + da), total: s.total + dt } : s));

  const simToggle = (id, type) => setDeltas(p => {
    const cur = p[id] || { a: 0, t: 0 };
    return { ...p, [id]: type === "attend"
      ? { a: cur.a + 1, t: cur.t + 1 }
      : { a: cur.a,     t: cur.t + 1 } };
  });

  const overall = Math.round(subjects.reduce((a, s) => a + pct(s.attended, s.total), 0) / subjects.length);
  const safe    = subjects.filter(s => pct(s.attended, s.total) >= 75).length;

  if (screen === "login") return <Login onLogin={login} onDemo={demo} />;

  return (
    <div className="app">

      {/* Header */}
      <div className="header">
        <div className="header-logo">Bunker.</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user?.isDemo && <span className="demo-badge">DEMO</span>}
          <button onClick={() => setShowSett(true)}
            style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "6px 12px", color: C.text, cursor: "pointer", fontSize: 16 }}>⚙️</button>
        </div>
      </div>

      <div className="content">

        {/* Exam Countdown */}
        <div className="exam-card">
          <div>
            <div className="exam-label">Exam Countdown</div>
            <div className="exam-days">24 <span style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>days</span></div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Overall Attendance</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: overall >= 75 ? C.green : C.red }}>{overall}%</div>
            <div style={{ fontSize: 11, color: C.muted }}>{safe}/{subjects.length} safe</div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[{ label: "Safe Subjects", value: safe, color: C.green },
            { label: "At Risk", value: subjects.length - safe, color: C.red }].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Subjects Header */}
        <div className="section-header">
          <div className="section-title">Subjects</div>
          <button onClick={() => { setSim(v => !v); setDeltas({}); }}
            style={{ background: sim ? `${C.accent}20` : C.card,
              border: `1px solid ${sim ? C.accent : C.border}`,
              color: sim ? C.accent : C.muted, borderRadius: 8, padding: "5px 12px",
              fontSize: 12, cursor: "pointer", fontWeight: 600, fontFamily: "'Syne',sans-serif" }}>
            {sim ? "🔮 Simulating" : "Simulate"}</button>
        </div>

        {sim && <div className="sim-banner">Tap Attend / Bunk below each subject to preview impact.</div>}

        {/* Subject Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {subjects.map(s => (
            <div key={s.id}>
              <Card s={s} onUpdate={update} sim={sim} delta={deltas[s.id]} />
              {sim && (
                <div style={{ display: "flex", gap: 8, marginTop: 6, paddingLeft: 4 }}>
                  <button className="btn-attend" style={{ flex: 1, borderRadius: 8, padding: 7, fontSize: 12 }}
                    onClick={() => simToggle(s.id, "attend")}>+ Attend</button>
                  <button className="btn-bunk" style={{ flex: 1, borderRadius: 8, padding: 7, fontSize: 12 }}
                    onClick={() => simToggle(s.id, "bunk")}>+ Bunk</button>
                  {deltas[s.id] && (
                    <button onClick={() => setDeltas(p => { const n = { ...p }; delete n[s.id]; return n; })}
                      style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted,
                        borderRadius: 8, padding: "7px 12px", fontSize: 12, cursor: "pointer" }}>↺</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {sim  && <button className="btn-reset" onClick={() => setDeltas({})}>Reset All Simulations</button>}
        {!sim && (
          <button className="btn-add" onClick={() => {
            const name = prompt("Subject name:");
            if (!name?.trim()) return;
            const a = parseInt(prompt("Classes attended:") || "0");
            const t = parseInt(prompt("Total classes:")    || "0");
            if (t > 0) setSubjects(p => [...p, { id: Date.now(), name: name.trim(), attended: a, total: t }]);
          }}>+ Add Subject</button>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        {[{ id: "dashboard", icon: "📊", label: "Dashboard" },
          { id: "history",   icon: "📋", label: "History"   }].map(t => (
          <button key={t.id} className="nav-btn" onClick={() => setTab(t.id)}
            style={{ color: tab === t.id ? C.accent : C.muted }}>
            <span className="nav-icon">{t.icon}</span>
            <span style={{ fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {showSett && <Settings user={user} onSignOut={signOut} onClose={() => setShowSett(false)} />}
    </div>
  );
}