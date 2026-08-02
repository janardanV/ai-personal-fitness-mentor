import { useMemo } from "react";
import React from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fmt, calcStreak, calcE1RM } from "../utils/helpers";
import { TrendingUp, Flame, Activity, CalendarCheck, Trophy } from "lucide-react";

const StatCard = ({ label, value, unit, color = "lime", sub, icon: Icon }) => (
  <div className={`rd-nut-stat ${color}`}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span className="l">{label}</span>
      {Icon && <Icon size={15} style={{ color: "rgba(255,255,255,0.28)" }} />}
    </div>
    <div className="v">{value}<span>{unit}</span></div>
    {sub && <div className="s">{sub}</div>}
  </div>
);

const Card = ({ children, style, className = "" }) => (
  <div className={`rd-card ${className}`} style={style}>{children}</div>
);

const CardHead = ({ icon, iconCls, kicker, title, right }) => (
  <div className="rd-card-head">
    <div className="rd-card-title">
      <div className={`rd-card-title-ico ${iconCls || ""}`}>{icon}</div>
      <div>
        {kicker && <div className="rd-card-kicker">{kicker}</div>}
        <div className="rd-card-name">{title}</div>
      </div>
    </div>
    {right}
  </div>
);

const tooltipStyle = { background: "rgba(16,16,16,0.98)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#FFFFFF", fontSize: 12 };

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

  const totalVolume = Math.round(workouts.reduce((s, w) => s + w.totalVolume, 0));

  return (
    <div className="rd-page">
      <div className="rd-page-head">
        <div>
          <span className="rd-kicker"><TrendingUp size={13} /> Progress</span>
          <h1 className="rd-title">Track Your Gains</h1>
          <p className="rd-sub">Volume trends and estimated 1RM progression across your lifts.</p>
        </div>
      </div>

      <div className="rd-nut-stats">
        <StatCard label="Total Workouts" value={workouts.length} color="lime" icon={CalendarCheck} sub={workouts.length > 0 ? "Sessions logged" : "Start logging sessions"} />
        <StatCard label="Total Volume" value={fmt(totalVolume)} unit=" kg" color="blue" icon={Flame} sub="All-time lifted" />
        <StatCard label="Avg Volume / Session" value={workouts.length ? fmt(Math.round(totalVolume / workouts.length)) : 0} unit=" kg" color="orange" icon={Activity} sub={workouts.length > 0 ? "Per workout" : "No sessions yet"} />
        <StatCard label="Best Streak" value={calcStreak(workouts)} unit=" days" color="purple" icon={Trophy} sub="Consistency bonus" />
      </div>

      <Card>
        <CardHead icon={<TrendingUp size={15} />} iconCls="lime" title="Weekly Volume Trend" />
        {workouts.length > 0 ? (
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={volumeByWeek.length ? volumeByWeek : [{ week: "No data", volume: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#A0A0A0" }} />
              <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="volume" fill="#C8FF00" radius={[4, 4, 0, 0]} name="Volume (kg)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="rd-empty" style={{ minHeight: 210 }}>
            <div className="rd-empty-title">No workout data yet</div>
            <div className="rd-empty-sub">Complete a workout to start tracking your volume trend.</div>
          </div>
        )}
      </Card>

      {topExercises.length > 0 && (
        <div>
          <div className="rd-legend" style={{ marginBottom: 12 }}>
            <span className="rd-legend-item"><span className="rd-legend-dot" style={{ background: "#4D9FFF" }} /> Estimated 1RM Progression</span>
          </div>
          <div className="rd-chart-grid">
            {topExercises.map(([name, data]) => {
              const start = data[0]?.e1rm || 0;
              const current = data[data.length - 1]?.e1rm || 0;
              const diff = current - start;
              const improved = diff >= 0;
              return (
                <Card key={name} style={{ padding: 18 }}>
                  <CardHead icon={<Trophy size={15} />} iconCls="blue" title={name} />
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#A0A0A0" }} />
                      <YAxis tick={{ fontSize: 9, fill: "#A0A0A0" }} domain={["auto", "auto"]} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="e1rm" stroke="#4D9FFF" strokeWidth={2.5} dot={{ r: 3, fill: "#4D9FFF", strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, gap: 8 }}>
                    <span style={{ color: "rgba(255,255,255,0.45)" }}>Start: <b style={{ color: "#FFFFFF" }}>{start}kg</b></span>
                    <span style={{ color: "rgba(255,255,255,0.45)" }}>Current: <b style={{ color: "#4D9FFF" }}>{current}kg</b></span>
                    <span className="rd-trend" style={{ color: improved ? "#C8FF00" : "#FF4757", fontWeight: 700 }}>
                      {improved ? "▲" : "▼"} {fmt(Math.abs(diff), 1)}kg
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
