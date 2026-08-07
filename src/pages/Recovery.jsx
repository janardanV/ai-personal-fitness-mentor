import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BatteryCharging, Brain, HeartPulse, Moon, Sparkles, Check, ChevronRight } from "lucide-react";
import { today, useAICoach, calcWeeklyVolume, showToast, fmt } from "../utils/helpers";

const FIELDS = [
  { key: "sleep", label: "Sleep Duration", suffix: "h", min: 0, max: 12, step: 0.5, color: "#5AC8FA" },
  { key: "quality", label: "Sleep Quality", suffix: "/10", min: 1, max: 10, step: 1, color: "#C8FF32" },
  { key: "stress", label: "Stress Level", suffix: "/10", min: 1, max: 10, step: 1, color: "#FF9F0A" },
  { key: "heartRate", label: "Resting Heart Rate", suffix: " bpm", min: 40, max: 120, step: 1, color: "#8B5CF6" },
];

const Fade = ({ delay = 0, className, children }) => (
  <motion.div className={className}
    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}>
    {children}
  </motion.div>
);

const Recovery = ({ state, dispatch }) => {
  const [form, setForm] = useState({ sleep: 7, quality: 7, stress: 3, heartRate: 60 });
  const [aiRec, setAiRec] = useState("");
  const { ask, loading } = useAICoach();
  const logRef = useRef(null);

  const todayRec = state.recovery.find(r => r.date === today());
  const score = todayRec ? todayRec.score : null;

  const logRecovery = () => {
    const s = Math.round((form.sleep / 9 * 3 + form.quality / 10 * 4 + (10 - form.stress) / 10 * 3) * 10) / 10;
    dispatch({ type: "ADD_RECOVERY", payload: { ...form, score: s, id: Date.now(), date: today() } });
    showToast("Recovery logged!");
  };

  const getRecAdvice = async () => {
    const recHistory = state.recovery.slice(-7);
    const advice = await ask(
      "You are a recovery and sports science coach. Be specific and data-driven. Max 80 words.",
      `Recent recovery scores: ${recHistory.map(r => `${r.date}: ${r.score}/10`).join(", ")}. Today's metrics: sleep ${form.sleep}hrs, quality ${form.quality}/10, stress ${form.stress}/10. Recent training volume: ${Math.round(calcWeeklyVolume(state.workouts))}kg. Should I train today or recover? What's your recommendation?`
    );
    if (advice) setAiRec(advice);
  };

  const recData = useMemo(() =>
    state.recovery.slice(-14).map(r => ({ date: r.date.slice(5), score: r.score, sleep: r.sleep })),
    [state.recovery]
  );

  const last7 = state.recovery.slice(-7);
  const avgScore = last7.length ? fmt(last7.reduce((s, r) => s + r.score, 0) / last7.length, 1) : "—";
  const avgSleep = last7.length ? fmt(last7.reduce((s, r) => s + (r.sleep || 0), 0) / last7.length, 1) : "—";

  const scoreColor = score === null ? "rgba(255,255,255,0.35)" : score >= 7 ? "#C8FF32" : score >= 5 ? "#FF9F0A" : "#FF5A5F";
  const scoreText = score === null
    ? "Not logged yet"
    : score >= 7 ? "High readiness — train hard"
    : score >= 5 ? "Moderate — normal training"
    : "Low — consider deload";

  const scorePct = score === null ? 0 : (score / 10) * 100;
  const ringR = 86;
  const ringC = 2 * Math.PI * ringR;

  const subMetrics = [
    { label: "Sleep", display: todayRec?.sleep != null ? `${fmt(todayRec.sleep, 1)}h` : "—", pct: todayRec?.sleep != null ? Math.min((todayRec.sleep / 9) * 100, 100) : 0, color: "#5AC8FA" },
    { label: "Quality", display: todayRec?.quality != null ? `${todayRec.quality}/10` : "—", pct: todayRec?.quality != null ? (todayRec.quality / 10) * 100 : 0, color: "#C8FF32" },
    { label: "Stress", display: todayRec?.stress != null ? `${todayRec.stress}/10` : "—", pct: todayRec?.stress != null ? ((10 - todayRec.stress) / 10) * 100 : 0, color: "#FF9F0A" },
    { label: "RHR", display: todayRec?.heartRate != null ? `${todayRec.heartRate} bpm` : "—", pct: todayRec?.heartRate != null ? Math.max(0, Math.min(1 - (todayRec.heartRate - 40) / 80, 1)) * 100 : 0, color: "#8B5CF6" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="rd-page">

        {/* â•â•â• HERO â•â•â• */}
        <div className="rd-hero">
          <div className="rd-hero-grid">
            <div className="rd-hero-copy">
              <span className="rd-kicker"><BatteryCharging size={12} />Recovery</span>
              <div>
                <h1 className="rd-hero-title">Recover Smarter</h1>
                <div className="rd-hero-date">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </div>
              </div>
              <p className="rd-hero-sub">
                {score !== null
                  ? <>Today's readiness is <b>{score >= 7 ? "strong" : score >= 5 ? "manageable" : "low"}</b> — {scoreText.toLowerCase()}</>
                  : <>Log sleep, stress and heart rate to see your daily readiness score</>}
              </p>
              <div className="rd-hero-stats">
                <div className="rd-hero-stat-chip">
                  <div className="c-v">{avgScore}<span> /10</span></div>
                  <div className="c-l">Avg score</div>
                </div>
                <div className="rd-hero-stat-chip">
                  <div className="c-v">{avgSleep}<span> h</span></div>
                  <div className="c-l">Avg sleep</div>
                </div>
                <div className="rd-hero-stat-chip">
                  <div className="c-v">{Math.round(calcWeeklyVolume(state.workouts)).toLocaleString()}<span> kg</span></div>
                  <div className="c-l">Volume / wk</div>
                </div>
              </div>
              <div className="rd-hero-actions">
                <button className="rd-btn-primary" onClick={() => logRef.current?.scrollIntoView({ behavior: "smooth" })}>
                  {score !== null ? <><Check size={15} />Update Today's Log</> : <><HeartPulse size={15} />Log Today's Recovery</>}
                  <ChevronRight size={15} />
                </button>
                <button className="rd-btn-secondary" onClick={getRecAdvice} disabled={loading}>
                  <Sparkles size={15} /> {loading ? "Thinking…" : "AI Advice"}
                </button>
              </div>
            </div>

            <div className="rd-hero-visual" style={{ justifyContent: "center" }}>
              <div className="rd-ring-big" style={{ filter: `drop-shadow(0 0 30px ${scoreColor}40)` }}>
                <svg viewBox="0 0 200 200">
                  <circle className="rr-bg" cx={100} cy={100} r={ringR} strokeWidth={14} />
                  <circle className="rr-fg" cx={100} cy={100} r={ringR} strokeWidth={14}
                    stroke={scoreColor}
                    strokeDasharray={`${(scorePct / 100) * ringC} ${ringC}`} />
                </svg>
                <div className="rd-ring-big-center">
                  <span className="rd-ring-big-score" style={{ color: scoreColor }}>
                    {score !== null ? fmt(score, 1) : "—"}
                  </span>
                  <span className="rd-ring-big-label">Recovery</span>
                  <span className="rd-ring-big-status" style={{ color: score === null ? "rgba(255,255,255,0.35)" : scoreColor }}>
                    {scoreText.split("—")[0].trim()}
                  </span>
                </div>
              </div>
              <div className="rd-rec-bars">
                {subMetrics.map(m => (
                  <div className="rd-rec-row" key={m.label}>
                    <span className="rr-l">{m.label}</span>
                    <div className="rr-bar"><i style={{ width: `${m.pct}%`, background: m.color }} /></div>
                    <span className="rd-rec-val">{m.display}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* â•â•â• GRID â•â•â• */}
        <div className="rd-grid">
          <Fade className="rd-span-3 rd-card" delay={0.06}>
            <div className="rd-card-head">
              <div className="rd-card-title">
                <div className="rd-card-title-ico blue"><Moon size={16} /></div>
                <div>
                  <div className="rd-card-kicker">Daily check-in</div>
                  <div className="rd-card-name">Log Recovery</div>
                </div>
              </div>
              {score !== null && (
                <span className="rd-ex-tag green"><Check size={10} /> Logged</span>
              )}
            </div>
            <div ref={logRef} style={{ scrollMarginTop: 16 }}>
              <div style={{ marginBottom: 18 }}>
                {FIELDS.map(({ key, label, suffix, min, max, step, color }) => (
                  <div key={key} className="rd-slider-row">
                    <div className="rd-slider-head">
                      <label className="rd-slider-label">{label}</label>
                      <span className="rd-slider-val" style={{ color }}>{form[key]}<span>{suffix}</span></span>
                    </div>
                    <input className="rd-range" type="range" min={min} max={max} step={step} value={form[key]}
                      onChange={e => setForm(p => ({ ...p, [key]: +e.target.value }))} />
                  </div>
                ))}
              </div>
              <button className="rd-btn-primary" onClick={logRecovery} style={{ width: "100%" }}>
                <HeartPulse size={16} /> {score !== null ? "Update Recovery" : "Log Recovery"}
              </button>
            </div>
          </Fade>

          <Fade className="rd-span-3 rd-card" delay={0.1}>
            <div className="rd-card-head">
              <div className="rd-card-title">
                <div className="rd-card-title-ico purple"><Brain size={16} /></div>
                <div>
                  <div className="rd-card-kicker">AI Coach</div>
                  <div className="rd-card-name">Recovery Advice</div>
                </div>
              </div>
              <button className="rd-btn-sm ghost" onClick={getRecAdvice} disabled={loading} tabIndex={0}>
                <Sparkles size={13} /> {loading ? "Thinking…" : "Advise"}
              </button>
            </div>
            {aiRec ? (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>{aiRec}</p>
            ) : (
              <>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                  Get AI-powered recommendations based on your sleep, stress and training volume.
                </p>
                <div className="rd-ai-tips">
                  <span>Sleep â‰¥ 7h</span>
                  <span>Stress â†“ before bed</span>
                  <span>Deload when score &lt; 5</span>
                </div>
              </>
            )}
          </Fade>

          <Fade className="rd-span-6 rd-card" delay={0.14}>
            <div className="rd-card-head">
              <div className="rd-card-title">
                <div className="rd-card-title-ico lime"><BatteryCharging size={16} /></div>
                <div>
                  <div className="rd-card-kicker">Trend</div>
                  <div className="rd-card-name">Recovery Score &amp; Sleep</div>
                </div>
              </div>
              <div className="rd-legend">
                <span className="rd-legend-item"><span className="rd-legend-dot" style={{ background: "#C8FF32" }} />Recovery</span>
                <span className="rd-legend-item"><span className="rd-legend-dot" style={{ background: "#5AC8FA" }} />Sleep hrs</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={recData.length ? recData : [{ date: today().slice(5), score: 0, sleep: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} width={34} />
                <Tooltip contentStyle={{ background: "rgba(18,22,28,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#C8FF32" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="Recovery" />
                <Line type="monotone" dataKey="sleep" stroke="#5AC8FA" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="Sleep hrs" />
              </LineChart>
            </ResponsiveContainer>
          </Fade>
        </div>
      </div>
    </motion.div>
  );
};

export default Recovery;
