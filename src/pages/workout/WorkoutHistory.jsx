import { useState, useMemo } from "react";
import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fmt } from "../../utils/helpers";

const WorkoutHistory = ({ state }) => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [expandedId, setExpandedId] = useState(null);

  const workouts = useMemo(() => {
    let list = [...(state.workouts || [])];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(w =>
        w.date?.includes(q) || w.name?.toLowerCase().includes(q) ||
        w.exercises?.some(e => e.name?.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      if (sortBy === "date") return (b.date || "").localeCompare(a.date || "");
      if (sortBy === "volume") return (b.totalVolume || 0) - (a.totalVolume || 0);
      if (sortBy === "duration") return (b.duration || 0) - (a.duration || 0);
      return 0;
    });
    return list;
  }, [state.workouts, search, sortBy]);

  const getPrevWorkout = (w, idx) => {
    const sameExercises = state.workouts.filter(w2 => w2.id !== w.id && w2.exercises?.some(e => w.exercises?.some(w3 => w3.name === e.name)));
    return sameExercises.length > 0 ? sameExercises[sameExercises.length - 1] : null;
  };

  const weeklyVolume = useMemo(() => {
    const weeks = {};
    state.workouts.forEach(w => {
      if (!w.date) return;
      const d = new Date(w.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split("T")[0];
      weeks[key] = (weeks[key] || 0) + (w.totalVolume || 0);
    });
    return Object.entries(weeks).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 8);
  }, [state.workouts]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="wm-page-header">
        <h2>Workout History</h2>
        <div style={{ fontSize: 12, color: "#A0A0A0" }}>{workouts.length} workout{workouts.length !== 1 ? "s" : ""}</div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <div className="wm-search-bar" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input placeholder="Search workouts, exercises..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 140, height: 42 }}>
          <option value="date">Sort by Date</option>
          <option value="volume">Sort by Volume</option>
          <option value="duration">Sort by Duration</option>
        </select>
      </div>

      {weeklyVolume.length > 0 && (
        <div className="glass" style={{ padding: "20px", borderRadius: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", marginBottom: 12 }}>Weekly Volume Trend</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyVolume.map(([week, vol]) => ({ week: week.slice(5), volume: Math.round(vol) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#A0A0A0" }} />
              <YAxis tick={{ fontSize: 11, fill: "#A0A0A0" }} />
              <Tooltip contentStyle={{ background: "rgba(15,15,15,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="volume" fill="#C8FF00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {workouts.length === 0 ? (
        <div className="wm-empty">
          <div className="wm-empty-icon">📋</div>
          <div className="wm-empty-title">No Workouts Yet</div>
          <div className="wm-empty-desc">Complete your first workout to see it here.</div>
        </div>
      ) : (
        workouts.map((w, i) => {
          const prev = getPrevWorkout(w, i);
          const isExpanded = expandedId === w.id;
          return (
            <motion.div key={w.id} className="wm-history-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => setExpandedId(isExpanded ? null : w.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF" }}>{w.name || "Workout"}</div>
                  <div style={{ fontSize: 12, color: "#A0A0A0", marginTop: 2 }}>{w.date}{w.duration ? ` · ${w.duration} min` : ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "#C8FF00" }}>{fmt(w.totalVolume)}<span style={{ fontSize: 11, color: "#A0A0A0" }}> kg</span></div>
                  {w.calories ? <div style={{ fontSize: 11, color: "#A0A0A0" }}>{w.calories} kcal</div> : null}
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                {w.exercises?.slice(0, isExpanded ? 99 : 4).map((e, j) => (
                  <span key={j} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(200,255,0,0.08)", color: "#C8FF00" }}>
                    {e.name} {e.sets?.filter(s => s.done !== false).length || e.sets?.length || 0}×{e.sets?.[0]?.reps || "?"}@{e.sets?.[0]?.weight || "?"}kg
                  </span>
                ))}
                {!isExpanded && (w.exercises?.length || 0) > 4 && <span style={{ fontSize: 10, color: "#A0A0A0", alignSelf: "center" }}>+{w.exercises.length - 4} more</span>}
              </div>

              {isExpanded && prev && (
                <div style={{ marginTop: 12, padding: 10, background: "rgba(200,255,0,0.04)", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#C8FF00", marginBottom: 6 }}>vs Previous ({prev.date})</div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                    <span style={{ color: (w.totalVolume || 0) > (prev.totalVolume || 0) ? "#A5E600" : "#FF4757" }}>
                      Volume: {fmt(w.totalVolume)} vs {fmt(prev.totalVolume)} ({(w.totalVolume || 0) > (prev.totalVolume || 0) ? "+" : ""}{fmt(((w.totalVolume || 0) / Math.max(prev.totalVolume || 1, 1) - 1) * 100, 1)}%)
                    </span>
                  </div>
                </div>
              )}

              {isExpanded && w.prs && w.prs.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {w.prs.map((pr, j) => (
                    <span key={j} className="wm-pr-card" style={{ padding: "4px 8px", fontSize: 10 }}>🏆 {pr}</span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })
      )}
    </div>
  );
};

export default WorkoutHistory;
