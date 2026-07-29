import { useState, useMemo } from "react";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fmt, today, showToast } from "../utils/helpers";

const Card = ({ children, style, className = "" }) => (
  <div className={`glass ${className}`} style={{ padding: "20px", ...style }}>{children}</div>
);

const BodyWeightLog = ({ state, dispatch }) => {
  const [weight, setWeight] = useState(state.profile?.weight || 75);
  const [date, setDate] = useState(today());

  const log = () => {
    if (+weight <= 0) return;
    dispatch({ type: "ADD_WEIGHT", payload: { weight: +weight, date } });
    showToast("Weight logged!");
  };

  const data = useMemo(() =>
    state.bodyWeight.slice(-60).map(w => ({ date: w.date.slice(5), weight: w.weight })),
    [state.bodyWeight]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Body Weight</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Log Weight</div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: "#A0A0A0", display: "block", marginBottom: 6 }}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#A0A0A0", display: "block", marginBottom: 6 }}>Weight (kg)</label>
            <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
          <button className="neon-btn" onClick={log} style={{ width: "100%" }}>Log Weight</button>
        </Card>
        <Card>
          <div style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 12 }}>Weight history (60 days)</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.length ? data : [{ date: today().slice(5), weight: state.profile?.weight || 75 }]}>
              <defs><linearGradient id="bwg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} /><stop offset="95%" stopColor="#22C55E" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0A0A0" }} />
              <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#FFFFFF", fontSize: 12 }} />
              <Area type="monotone" dataKey="weight" stroke="#22C55E" fill="url(#bwg)" strokeWidth={2} dot={{ fill: "#22C55E", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default BodyWeightLog;
