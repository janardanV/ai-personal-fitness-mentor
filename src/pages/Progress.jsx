import { useMemo } from "react";
import React from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fmt, COLORS, calcStreak, calcE1RM } from "../utils/helpers";

const StatCard = ({ label, value, unit, color = COLORS.primary, sub }) => (
  <div style={{ background: "#151515", border: `1px solid ${color}18`, borderRadius: 16, padding: "18px 16px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(${color}20, transparent)`, borderRadius: "0 0 0 100%" }} />
    <div style={{ fontSize: 11, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 500 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em" }}>{value}<span style={{ fontSize: 13, fontWeight: 400, marginLeft: 4, color: "#A0A0A0" }}>{unit}</span></div>
    {sub && <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 4 }}>{sub}</div>}
  </div>
);

const Card = ({ children, style, className = "" }) => (
  <div className={`glass ${className}`} style={{ padding: "20px", ...style }}>{children}</div>
);

const Progress = ({ state }) => {
  const { workouts, profile } = state;

  const e1rmHistory = useMemo(() => {
    const history = {};
    workouts.forEach(w => {
      w.exercises?.forEach(ex => {
        if (!history[ex.name]) history[ex.name] = [];
        const best = Math.max(...ex.sets.map(s => calcE1RM(s.weight, s.reps)));
        history[ex.name].push({ date: w.date.slice(5), e1rm: +best.toFixed(1) });
      });
    });
    return history;
  }, [workouts]);

  const topExercises = useMemo(() =>
    Object.entries(e1rmHistory).sort((a, b) => b[1].length - a[1].length).slice(0, 4),
    [e1rmHistory]
  );

  const volumeByWeek = useMemo(() => {
    const byWeek = {};
    workouts.forEach(w => {
      const d = new Date(w.date);
      const week = `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleDateString("en", { month: "short" })}`;
      byWeek[week] = (byWeek[week] || 0) + w.totalVolume;
    });
    return Object.entries(byWeek).slice(-8).map(([w, v]) => ({ week: w, volume: Math.round(v) }));
  }, [workouts]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Progress Tracker</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <StatCard label="Total Workouts" value={workouts.length} color={COLORS.primary} />
        <StatCard label="Total Volume" value={Math.round(workouts.reduce((s, w) => s + w.totalVolume, 0))} unit="kg" color={COLORS.cyan} />
        <StatCard label="Avg Volume/Session" value={workouts.length ? Math.round(workouts.reduce((s, w) => s + w.totalVolume, 0) / workouts.length) : 0} unit="kg" color={COLORS.green} />
        <StatCard label="Best Streak" value={calcStreak(workouts)} unit="days" color={COLORS.amber} />
      </div>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Weekly Volume Trend</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={volumeByWeek.length ? volumeByWeek : [{ week: "No data", volume: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#A0A0A0" }} />
            <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} />
            <Tooltip contentStyle={{ background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#FFFFFF", fontSize: 12 }} />
            <Bar dataKey="volume" fill="#22C55E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {topExercises.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Estimated 1RM Progression</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {topExercises.map(([name, data]) => (
              <Card key={name} style={{ padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{name}</div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#A0A0A0" }} />
                    <YAxis tick={{ fontSize: 9, fill: "#A0A0A0" }} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#FFFFFF", fontSize: 11 }} />
                    <Line type="monotone" dataKey="e1rm" stroke={COLORS.cyan} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "#A0A0A0" }}>
                  <span>Start: <span style={{ color: "#FFFFFF" }}>{data[0]?.e1rm}kg</span></span>
                  <span>Current: <span style={{ color: COLORS.cyan }}>{data[data.length - 1]?.e1rm}kg</span></span>
                  <span style={{ color: data[data.length - 1]?.e1rm > data[0]?.e1rm ? "var(--green)" : "var(--red)" }}>
                    {data[data.length - 1]?.e1rm > data[0]?.e1rm ? "▲" : "▼"} {fmt(Math.abs(data[data.length - 1]?.e1rm - data[0]?.e1rm), 1)}kg
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
