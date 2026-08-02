import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BatteryCharging, Brain, Dumbbell, HeartPulse, Moon, Sparkles } from "lucide-react";
import { today, useAICoach, calcWeeklyVolume, showToast } from "../utils/helpers";

const FIELDS = [
  { key: "sleep", label: "Sleep Duration", suffix: "h", min: 0, max: 12, step: 0.5, color: "#4D9FFF" },
  { key: "quality", label: "Sleep Quality", suffix: "/10", min: 1, max: 10, step: 1, color: "#C8FF00" },
  { key: "stress", label: "Stress Level", suffix: "/10", min: 1, max: 10, step: 1, color: "#FF9F43" },
  { key: "heartRate", label: "Resting Heart Rate", suffix: " bpm", min: 40, max: 120, step: 1, color: "#A78BFA" },
];

const Recovery = ({ state, dispatch }) => {
  const [form, setForm] = useState({ sleep: 7, quality: 7, stress: 3, heartRate: 60 });
  const [aiRec, setAiRec] = useState("");
  const { ask, loading } = useAICoach();

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

  const scoreColor = score === null ? "rgba(255,255,255,0.35)" : score >= 7 ? "#C8FF00" : score >= 5 ? "#FF9F43" : "#FF4757";
  const scoreText = score === null
    ? "Not logged yet"
    : score >= 7 ? "High readiness — Train hard"
    : score >= 5 ? "Moderate — Normal training"
    : "Low — Consider deload";

  return (
    <div className="rd-page">
      <div className="rd-page-head">
        <div>
          <span className="rd-kicker"><BatteryCharging size={13} /> Recovery</span>
          <h1 className="rd-title">Recover Smarter</h1>
          <p className="rd-sub">Log sleep, stress and heart rate to stay ahead of fatigue.</p>
        </div>
      </div>

      <div className="rd-2col">
        <div className="rd-card">
          <div className="rd-card-head">
            <div className="rd-card-title">
              <div className="rd-card-title-ico blue"><Moon size={15} /></div>
              <div>
                <div className="rd-card-kicker">Daily check-in</div>
                <div className="rd-card-name">Log Today's Recovery</div>
              </div>
            </div>
          </div>

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
            <HeartPulse size={16} /> Log Recovery
          </button>
        </div>

        <div className="rd-stack">
          <div className="rd-card rd-score-center">
            <div className="rd-metric-label">Today's Recovery Score</div>
            <div className="rd-big-metric" style={{ fontSize: 56, color: scoreColor }}>
              {score !== null ? score.toFixed(1) : "—"}
            </div>
            <div style={{ fontSize: 12, color: score === null ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.55)", fontWeight: 500 }}>{scoreText}</div>
          </div>

          <div className="rd-card">
            <div className="rd-card-head">
              <div className="rd-card-title">
                <div className="rd-card-title-ico purple"><Brain size={15} /></div>
                <div className="rd-card-name">AI Recovery Coach</div>
              </div>
              <button className="rd-btn-secondary" onClick={getRecAdvice} disabled={loading} style={{ padding: "8px 14px", fontSize: 12 }}>
                <Sparkles size={13} /> {loading ? "Thinking..." : "Advise"}
              </button>
            </div>
            {aiRec ? (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.65 }}>{aiRec}</p>
            ) : (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Get AI-powered recovery recommendations based on your sleep, stress and training volume.</p>
            )}
          </div>

          <div className="rd-card" style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px" }}>
            <Dumbbell size={15} style={{ color: "rgba(200,255,0,0.7)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              Recent training volume: <b style={{ color: "#FFFFFF", fontFamily: "'JetBrains Mono',monospace" }}>{Math.round(calcWeeklyVolume(state.workouts))} kg</b>
            </span>
          </div>
        </div>
      </div>

      <div className="rd-card">
        <div className="rd-card-head">
          <div className="rd-card-title">
            <div className="rd-card-title-ico lime"><BatteryCharging size={15} /></div>
            <div>
              <div className="rd-card-kicker">Trend</div>
              <div className="rd-card-name">Recovery Score & Sleep (14 days)</div>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={recData.length ? recData : [{ date: today().slice(5), score: 0, sleep: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0A0A0" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} axisLine={false} tickLine={false} width={34} />
            <Tooltip contentStyle={{ background: "rgba(15,15,15,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="score" stroke="#C8FF00" strokeWidth={2} dot={false} name="Recovery" />
            <Line type="monotone" dataKey="sleep" stroke="#4D9FFF" strokeWidth={2} dot={false} name="Sleep hrs" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Recovery;
