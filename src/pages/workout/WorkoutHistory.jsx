import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown, Clock, Dumbbell, History, Search, TrendingUp, Trophy } from "lucide-react";
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

  const doneSets = (e) => e.sets?.filter(s => s.done !== false).length || e.sets?.length || 0;

  return (
    <div className="rd-stack">
      <div className="rd-tab-head">
        <div className="rd-count"><History size={13} /> <b>{workouts.length}</b> workout{workouts.length !== 1 ? "s" : ""}</div>
      </div>

      <div className="rd-filter-row">
        <div className="rd-search" style={{ flex: 1, minWidth: 200 }}>
          <Search size={15} />
          <input placeholder="Search workouts, exercises..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="rd-select-wrap">
          <ChevronDown size={14} />
          <select className="rd-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 165 }}>
            <option value="date">Sort by Date</option>
            <option value="volume">Sort by Volume</option>
            <option value="duration">Sort by Duration</option>
          </select>
        </div>
      </div>

      {weeklyVolume.length > 0 && (
        <div className="rd-card">
          <div className="rd-card-head">
            <div className="rd-card-title">
              <div className="rd-card-title-ico lime"><TrendingUp size={15} /></div>
              <div>
                <div className="rd-card-kicker">Trend</div>
                <div className="rd-card-name">Weekly Volume Trend</div>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={weeklyVolume.map(([week, vol]) => ({ week: week.slice(5), volume: Math.round(vol) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#A0A0A0" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#A0A0A0" }} axisLine={false} tickLine={false} width={44} />
              <Tooltip contentStyle={{ background: "rgba(15,15,15,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="volume" fill="#C8FF00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {workouts.length === 0 ? (
        <div className="rd-empty" style={{ padding: "44px 16px" }}>
          <Dumbbell size={30} style={{ color: "rgba(255,255,255,0.2)", marginBottom: 4 }} />
          <div className="rd-empty-title">No Workouts Yet</div>
          <div className="rd-empty-sub">Complete your first workout to see it here.</div>
        </div>
      ) : (
        <div className="rd-history-list">
          {workouts.map((w, i) => {
            const prev = getPrevWorkout(w, i);
            const isExpanded = expandedId === w.id;
            return (
              <motion.div key={w.id} className={`rd-history-card ${isExpanded ? "expanded" : ""}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => setExpandedId(isExpanded ? null : w.id)}>
                <div className="rd-history-top">
                  <div style={{ minWidth: 0 }}>
                    <div className="rd-history-name">{w.name || "Workout"}</div>
                    <div className="rd-history-sub">
                      <span>{w.date}</span>
                      {w.duration ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock size={11} /> {w.duration} min</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="rd-history-vol">
                    <div className="v">{fmt(w.totalVolume)}<span> kg</span></div>
                    {w.calories ? <div className="kcal">{w.calories} kcal</div> : null}
                  </div>
                </div>

                <div className="rd-history-chips">
                  {w.exercises?.slice(0, isExpanded ? 99 : 4).map((e, j) => (
                    <span key={j} className="rd-ex-tag">{e.name} {doneSets(e)}×{e.sets?.[0]?.reps || "?"}@{e.sets?.[0]?.weight || "?"}kg</span>
                  ))}
                  {!isExpanded && (w.exercises?.length || 0) > 4 && (
                    <span className="rd-ex-tag muted">+{w.exercises.length - 4} more</span>
                  )}
                </div>

                {isExpanded && prev && (
                  <div className="rd-vs-box">
                    <div className="l"><Trophy size={11} /> vs Previous ({prev.date})</div>
                    <div>
                      Volume: <b style={{ color: (w.totalVolume || 0) > (prev.totalVolume || 0) ? "#C8FF00" : "#FF4757" }}>{fmt(w.totalVolume)}</b> vs {fmt(prev.totalVolume)}{" "}
                      <span style={{ color: (w.totalVolume || 0) > (prev.totalVolume || 0) ? "#A5E600" : "#FF4757" }}>
                        ({(w.totalVolume || 0) > (prev.totalVolume || 0) ? "+" : ""}{fmt(((w.totalVolume || 0) / Math.max(prev.totalVolume || 1, 1) - 1) * 100, 1)}%)
                      </span>
                    </div>
                  </div>
                )}

                {isExpanded && w.prs && w.prs.length > 0 && (
                  <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {w.prs.map((pr, j) => (
                      <span key={j} className="rd-pr-badge"><Trophy size={11} /> {pr}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkoutHistory;
