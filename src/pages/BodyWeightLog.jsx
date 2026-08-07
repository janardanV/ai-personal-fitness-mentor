import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, Scale, TrendingDown } from "lucide-react";
import { fmt, today, showToast } from "../utils/helpers";

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

  const latest = state.bodyWeight[state.bodyWeight.length - 1];
  const change = latest && data.length > 1
    ? (latest.weight - state.bodyWeight[state.bodyWeight.length - 2].weight)
    : null;

  return (
    <div className="rd-page">
      <div className="rd-page-head">
        <div>
          <span className="rd-kicker"><Scale size={13} /> Health</span>
          <h1 className="rd-title">Body Weight</h1>
          <p className="rd-sub">Track your weight over time to stay on course.</p>
        </div>
      </div>

      <div className="rd-2col">
        <div className="rd-card">
          <div className="rd-card-head">
            <div className="rd-card-title">
              <div className="rd-card-title-ico lime"><Scale size={15} /></div>
              <div>
                <div className="rd-card-kicker">New entry</div>
                <div className="rd-card-name">Log Weight</div>
              </div>
            </div>
          </div>

          <div className="rd-form">
            <div className="rd-field">
              <label>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="rd-field">
              <label>Weight (kg)</label>
              <input type="number" step="0.1" min={1} value={weight} onChange={e => setWeight(e.target.value)} />
            </div>
            <button className="rd-btn-primary" onClick={log} disabled={+weight <= 0} style={{ width: "100%" }}>
              <Scale size={16} /> Log Weight
            </button>
          </div>
        </div>

        <div className="rd-card">
          <div className="rd-card-head">
            <div className="rd-card-title">
              <div className="rd-card-title-ico blue"><TrendingDown size={15} /></div>
              <div>
                <div className="rd-card-kicker">Trend</div>
                <div className="rd-card-name">Weight History (60 days)</div>
              </div>
            </div>
            {latest && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "#FFFFFF" }}>
                  {fmt(latest.weight, 1)}<span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}> kg</span>
                </div>
                {change !== null && (
                  <div style={{ fontSize: 11, color: change < 0 ? "#C8FF32" : change > 0 ? "#FF9F0A" : "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {change > 0 ? "+" : ""}{fmt(change, 1)} kg
                  </div>
                )}
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.length ? data : [{ date: today().slice(5), weight: state.profile?.weight || 75 }]}>
              <defs>
                <linearGradient id="bwg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8FF32" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C8FF32" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A7B1C2" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#A7B1C2" }} axisLine={false} tickLine={false} width={36} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "rgba(15,15,15,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="weight" stroke="#C8FF32" fill="url(#bwg)" strokeWidth={2} dot={{ fill: "#C8FF32", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BodyWeightLog;
