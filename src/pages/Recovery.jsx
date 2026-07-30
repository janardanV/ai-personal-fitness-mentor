import { useState, useMemo } from "react";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { today, COLORS, useAICoach, calcWeeklyVolume, showToast } from "../utils/helpers";

const Card = ({ children, style, className = "" }) => (
  <div className={`glass ${className}`} style={{ padding: "20px", ...style }}>{children}</div>
);

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Recovery & Sleep</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Log Today's Recovery</div>
          {[["sleep", "Sleep Duration (hrs)", 0, 12, 0.5], ["quality", "Sleep Quality (1-10)", 1, 10, 1], ["stress", "Stress Level (1-10)", 1, 10, 1], ["heartRate", "Resting Heart Rate", 40, 120, 1]].map(([k, l, min, max, step]) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <label style={{ fontSize: 12, color: "#A0A0A0" }}>{l}</label>
                <span style={{ fontSize: 12, color: COLORS.cyan, fontFamily: "'JetBrains Mono',monospace" }}>{form[k]}{k === "sleep" ? "h" : k === "heartRate" ? " bpm" : ""}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: +e.target.value }))} />
            </div>
          ))}
          <button className="neon-btn" onClick={logRecovery} style={{ width: "100%", marginTop: 4 }}>Log Recovery</button>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#A0A0A0", marginBottom: 8 }}>Today's Recovery Score</div>
            <div style={{ fontSize: 56, fontWeight: 700, color: score !== null ? (score >= 7 ? "var(--green)" : score >= 5 ? "var(--amber)" : "var(--red)") : "#A0A0A0", fontFamily: "'JetBrains Mono',monospace" }}>
              {score !== null ? score.toFixed(1) : "—"}
            </div>
            <div style={{ fontSize: 12, color: "#A0A0A0", marginTop: 4 }}>{score !== null ? (score >= 7 ? "High readiness — Train hard" : score >= 5 ? "Moderate — Normal training" : "Low — Consider deload") : "Not logged yet"}</div>
          </Card>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>AI Recovery Coach</span>
              <button className="ghost-btn" onClick={getRecAdvice} disabled={loading} style={{ fontSize: 12 }}>{loading ? "..." : "Advise ⚡"}</button>
            </div>
            {aiRec ? <p style={{ fontSize: 13, color: "#FFFFFF", lineHeight: 1.6 }}>{aiRec}</p> : <p style={{ fontSize: 13, color: "#A0A0A0" }}>Get AI-powered recovery recommendations.</p>}
          </Card>
        </div>
      </div>

      <Card>
        <div style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 12 }}>Recovery score & sleep (14 days)</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={recData.length ? recData : [{ date: today().slice(5), score: 0, sleep: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0A0A0" }} />
            <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} />
            <Tooltip contentStyle={{ background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#FFFFFF", fontSize: 12 }} />
            <Line type="monotone" dataKey="score" stroke="var(--green)" strokeWidth={2} dot={false} name="Recovery" />
            <Line type="monotone" dataKey="sleep" stroke={COLORS.cyan} strokeWidth={2} dot={false} name="Sleep hrs" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default Recovery;
