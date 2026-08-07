import { useMemo } from "react";
import React from "react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fmt, calcStreak, calcE1RM } from "../utils/helpers";
import { TrendingUp, Flame, Activity, CalendarCheck, Trophy, Target, Award } from "lucide-react";

const Fade = ({ delay = 0, className, children }) => (
  <motion.div className={className}
    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}>
    {children}
  </motion.div>
);

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

const tooltipStyle = { background: "rgba(18,22,28,0.98)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#FFFFFF", fontSize: 12 };

const Progress = ({ state }) => {
  const { workouts = [] } = state;

  const e1rmHistory = useMemo(() => {
    const history = {};
    workouts.forEach(w => {
      w.exercises?.forEach(ex => {
        const name = ex.exerciseName || ex.name;
        if (!name) return;
        if (!history[name]) history[name] = [];
        const best = Math.max(...ex.sets.map(s => calcE1RM(s.weight, s.reps)));
        history[name].push({ date: w.date.slice(5), e1rm: +best.toFixed(1) });
      });
    });
    return history;
  }, [workouts]);

  const topExercises = useMemo(() =>
    Object.entries(e1rmHistory).sort((a, b) => b[1].length - a[1].length).slice(0, 4),
    [e1rmHistory]
  );

  const liftData = topExercises.map(([name, data]) => {
    const start = data[0]?.e1rm || 0;
    const current = data[data.length - 1]?.e1rm || 0;
    const diff = +(current - start).toFixed(1);
    return { name, data, start, current, diff, improved: diff >= 0 };
  });

  const topGains = useMemo(() => {
    const all = Object.entries(e1rmHistory).map(([name, data]) => {
      const start = data[0]?.e1rm || 0;
      const current = data[data.length - 1]?.e1rm || 0;
      return { name, data, start, current, diff: +(current - start).toFixed(1) };
    }).filter(g => g.data.length > 1);
    return all.sort((a, b) => b.diff - a.diff).slice(0, 4);
  }, [e1rmHistory]);

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
  const liftNames = useMemo(() =>
    [...new Set(workouts.flatMap(w => (w.exercises || []).map(e => e.exerciseName || e.name).filter(Boolean)))],
    [workouts]
  );
  const liftsTracked = liftNames.length;

  const now = new Date();
  const monthCount = workouts.filter(w => {
    const d = new Date(w.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
  const weekVol = Math.round(workouts.reduce((s, w) => s + (new Date(w.date) >= cutoff ? w.totalVolume : 0), 0));

  const improvedCount = liftData.filter(l => l.diff > 0.05).length;
  const bestLift = topGains[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="rd-page">

        {/* â•â•â• HERO â•â•â• */}
        <div className="rd-hero">
          <div className="rd-hero-grid">
            <div className="rd-hero-copy">
              <span className="rd-kicker"><TrendingUp size={12} />Progress</span>
              <div>
                <h1 className="rd-hero-title">Track Your Gains</h1>
                <div className="rd-hero-date">
                  {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </div>
              </div>
              <p className="rd-hero-sub">
                {workouts.length > 0
                  ? <>Volume trends and estimated 1RM progression across <b>{liftsTracked}</b> lifts</>
                  : <>Log workouts to unlock volume trends and 1RM progression charts</>}
              </p>
              <div className="rd-hero-stats">
                <div className="rd-hero-stat-chip">
                  <div className="c-v">{weekVol.toLocaleString()}<span> kg</span></div>
                  <div className="c-l">Volume / 7d</div>
                </div>
                <div className="rd-hero-stat-chip">
                  <div className="c-v">{monthCount}<span> {monthCount === 1 ? "session" : "sessions"}</span></div>
                  <div className="c-l">This month</div>
                </div>
                <div className="rd-hero-stat-chip">
                  <div className="c-v">{liftsTracked}<span> lifts</span></div>
                  <div className="c-l">Tracked</div>
                </div>
              </div>
            </div>

            <div className="rd-hero-visual" style={{ justifyContent: "center" }}>
              <div className="rd-plan-panel">
                <div className="rd-plan-top">
                  <div className="rd-ring">
                    <svg viewBox="0 0 76 76">
                      <circle className="rr-bg" cx={38} cy={38} r={30} strokeWidth={6} />
                      <circle className="rr-fg" cx={38} cy={38} r={30} strokeWidth={6}
                        stroke="#C8FF32"
                        strokeDasharray={`${liftData.length ? (improvedCount / liftData.length) * 201 : 0} 201`} />
                    </svg>
                    <div className="rd-ring-center">
                      <b>{liftData.length ? `${improvedCount}/${liftData.length}` : "—"}</b>
                      <span>Improving</span>
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="rd-plan-kicker">Estimated 1RM</div>
                    <div className="rd-plan-name">Top Lifts</div>
                    <div className="rd-plan-meta">{liftsTracked} exercise{liftsTracked !== 1 ? "s" : ""} tracked</div>
                  </div>
                </div>
                {liftData.length > 0 ? (
                  <div className="rd-leader">
                    {liftData.map((l, i) => (
                      <div className="rd-leader-row" key={l.name}>
                        <span className={`rd-leader-rank ${i === 0 ? "gold" : ""}`}>{i + 1}</span>
                        <div className="rd-leader-body">
                          <div className="rd-leader-name">{l.name}</div>
                          <div className="rd-leader-sub">Est. 1RM</div>
                        </div>
                        <div className="rd-leader-val">{fmt(l.current, 1)}<span>kg</span></div>
                        <span className={`rd-leader-delta ${l.diff > 0.05 ? "up" : l.diff < -0.05 ? "down" : "flat"}`}>
                          {l.diff > 0.05 ? "▲" : l.diff < -0.05 ? "▼" : "·"}{fmt(Math.abs(l.diff), 1)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "8px 0" }}>
                    Complete workouts to track your best lifts here
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* â•â•â• STATS â•â•â• */}
        <Fade className="rd-nut-stats" delay={0.05}>
          <StatCard label="Total Workouts" value={workouts.length} color="lime" icon={CalendarCheck} sub={workouts.length > 0 ? "Sessions logged" : "Start logging sessions"} />
          <StatCard label="Total Volume" value={fmt(totalVolume)} unit=" kg" color="blue" icon={Flame} sub="All-time lifted" />
          <StatCard label="Avg Volume / Session" value={workouts.length ? fmt(Math.round(totalVolume / workouts.length)) : 0} unit=" kg" color="orange" icon={Activity} sub={workouts.length > 0 ? "Per workout" : "No sessions yet"} />
          <StatCard label="Current Streak" value={calcStreak(workouts)} unit=" days" color="purple" icon={Trophy} sub="Keep the momentum" />
        </Fade>

        {/* â•â•â• GRID â•â•â• */}
        <div className="rd-grid">
          <Fade className="rd-span-3 rd-card" delay={0.08}>
            <div className="rd-card-head">
              <div className="rd-card-title">
                <div className="rd-card-title-ico lime"><TrendingUp size={16} /></div>
                <div>
                  <div className="rd-card-kicker">Analytics</div>
                  <div className="rd-card-name">Weekly Volume</div>
                </div>
              </div>
            </div>
            {workouts.length > 0 ? (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={volumeByWeek.length ? volumeByWeek : [{ week: "No data", volume: 0 }]} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="volume" radius={[5, 5, 0, 0]} name="Volume (kg)">
                    {volumeByWeek.map((entry, i) => (
                      <Cell key={entry.week} fill={i === volumeByWeek.length - 1 ? "#C8FF32" : "rgba(200,255,50,0.32)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="rd-empty" style={{ minHeight: 210 }}>
                <div className="rd-empty-title">No workout data yet</div>
                <div className="rd-empty-sub">Complete a workout to start tracking your volume trend.</div>
              </div>
            )}
          </Fade>

          <Fade className="rd-span-3 rd-card" delay={0.12}>
            <div className="rd-card-head">
              <div className="rd-card-title">
                <div className="rd-card-title-ico blue"><Award size={16} /></div>
                <div>
                  <div className="rd-card-kicker">Highlights</div>
                  <div className="rd-card-name">Biggest 1RM Gains</div>
                </div>
              </div>
            </div>
            {topGains.length > 0 ? (
              <div className="rd-leader">
                {topGains.map((g, i) => (
                  <div className="rd-leader-row" key={g.name}>
                    <span className={`rd-leader-rank ${i === 0 ? "gold" : ""}`}>{i + 1}</span>
                    <div className="rd-leader-body">
                      <div className="rd-leader-name">{g.name}</div>
                      <div className="rd-leader-sub">{fmt(g.start, 1)}kg â†’ {fmt(g.current, 1)}kg</div>
                    </div>
                    <span className={`rd-leader-delta ${g.diff > 0.05 ? "up" : g.diff < -0.05 ? "down" : "flat"}`}>
                      {g.diff > 0.05 ? "▲" : g.diff < -0.05 ? "▼" : "·"}{fmt(Math.abs(g.diff), 1)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rd-empty" style={{ minHeight: 210 }}>
                <div className="rd-empty-title">No 1RM data yet</div>
                <div className="rd-empty-sub">Lift the same exercise a few times to see progression here.</div>
              </div>
            )}
          </Fade>

          {liftData.map((l, i) => (
            <Fade className="rd-span-3 rd-card" delay={0.14 + i * 0.04} key={l.name}>
              <div className="rd-card-head">
                <div className="rd-card-title">
                  <div className="rd-card-title-ico blue"><Target size={16} /></div>
                  <div>
                    <div className="rd-card-kicker">Estimated 1RM</div>
                    <div className="rd-card-name">{l.name}</div>
                  </div>
                </div>
                <span className={`rd-pr-badge ${l.diff > 0.05 ? "up" : l.diff < -0.05 ? "down" : "flat"}`}>
                  {l.diff > 0.05 ? "▲" : l.diff < -0.05 ? "▼" : "—"} {fmt(Math.abs(l.diff), 1)}kg
                </span>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={l.data} margin={{ top: 4, right: 6, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} width={34} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="e1rm" stroke="#5AC8FA" strokeWidth={2.5} dot={{ r: 3, fill: "#5AC8FA", strokeWidth: 0 }} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, gap: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>Start: <b style={{ color: "#FFFFFF" }}>{fmt(l.start, 1)}kg</b></span>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>Now: <b style={{ color: "#5AC8FA" }}>{fmt(l.current, 1)}kg</b></span>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Progress;
