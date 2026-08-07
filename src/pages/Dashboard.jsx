import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  fmt, today, EXERCISE_DB, GOAL_LABELS,
  calcStreak, calcWeeklyVolume,
  showToast, showConfirm, useAICoach,
} from "../utils/helpers";
import {
  Bell, Dumbbell, Moon, Flame, Apple, Scale, Droplet, Bot, Target, Zap, Award,
  Sparkles, ChevronRight, Calendar, TrendingUp, Plus, Activity, ArrowRight, User,
  X, Trash2, Play,
} from "lucide-react";
import HumanBody from "../components/HumanBody";
import { PRIMARY_MUSCLE_IDS, MUSCLE_ID_LABEL } from "../data/muscleAtlas";

const NAV = (page) => { window.__setPage?.(page); };

const EXERCISE_LOOKUP = new Map((EXERCISE_DB || []).map(e => [e.name, e]));

const Fade = ({ delay = 0, className, children, style }) => (
  <motion.div
    className={className}
    style={style}
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
  >
    {children}
  </motion.div>
);

const ChartFilter = ({ value, onChange }) => (
  <div className="rd-chart-filter">
    {["7D", "30D", "90D"].map(f => (
      <button key={f} className={value === f ? "active" : ""}
        onClick={() => onChange(f)} tabIndex={0} aria-label={`Filter ${f}`}>{f}</button>
    ))}
  </div>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rd-tooltip">
      <div className="rd-tooltip-day">{label}</div>
      {payload.map(p => (
        <div className="rd-tooltip-row" key={p.dataKey}>
          <span className="dot" style={{ background: p.stroke || p.color }} />
          {p.name}
          <b>{p.value}{p.dataKey === "calories" ? " kcal" : p.dataKey === "volume" ? " kg" : ""}</b>
        </div>
      ))}
    </div>
  );
};

const GlowDot = (props) => {
  const { cx, cy, stroke } = props;
  if (cx == null || cy == null) return null;
  return (
    <circle
      cx={cx} cy={cy} r={5}
      fill={stroke} stroke="rgba(255,255,255,0.75)" strokeWidth={2}
      style={{ filter: `drop-shadow(0 0 9px ${stroke})` }}
    />
  );
};

const NotificationPanel = ({ workouts, nutrition, recovery, badges, water, profile, onClose }) => {
  const items = useMemo(() => {
    const notifs = [];
    const now = new Date();
    const hour = now.getHours();
    const todayStr = today();
    const todayW = workouts.filter(w => w.date === todayStr);
    const todayN = nutrition.filter(n => n.date === todayStr);
    const todayR = recovery.find(r => r.date === todayStr);
    const waterToday = (water || {})[todayStr] || 0;
    const todayCals = todayN.reduce((s, n) => s + (n.calories || 0), 0);
    const todayProt = todayN.reduce((s, n) => s + (n.protein || 0), 0);

    if (todayW.length === 0 && hour >= 9) {
      notifs.push({ id: "rem-workout", icon: Dumbbell, color: "#C8FF32", title: "Workout Reminder", desc: "You haven't trained today. Even 20 minutes counts!", time: "Reminder", page: "workout", type: "reminder" });
    }
    if (todayR && todayR.score < 5) {
      notifs.push({ id: "rem-recovery", icon: Moon, color: "#FF5A5F", title: "Low Recovery", desc: `Score ${todayR.score}/10 — consider rest or light activity.`, time: "Reminder", page: "recovery", type: "reminder" });
    } else if (!todayR && hour >= 20) {
      notifs.push({ id: "rem-recovery-log", icon: Moon, color: "#C8FF32", title: "Log Recovery", desc: "Don't forget to log your sleep and recovery for today.", time: "Reminder", page: "recovery", type: "reminder" });
    }
    if (waterToday < 1000 && hour >= 12) {
      notifs.push({ id: "rem-water", icon: Droplet, color: "#5AC8FA", title: "Hydration Reminder", desc: `Only ${fmt(waterToday / 1000, 1)}L today. Aim for 2.5L+.`, time: "Reminder", page: "water-tracker", type: "reminder" });
    }
    if (todayCals > (profile?.calories || 2000) * 1.1) {
      notifs.push({ id: "rem-overeat", icon: Flame, color: "#FF5A5F", title: "Calorie Over Target", desc: `${todayCals} kcal logged — ${Math.round((todayCals / (profile?.calories || 2000)) * 100)}% of target.`, time: "Alert", page: "nutrition", type: "reminder" });
    }
    if (todayProt < (profile?.protein || 150) * 0.4 && hour >= 15) {
      notifs.push({ id: "rem-protein", icon: Apple, color: "#C8FF32", title: "Protein Check", desc: `Only ${Math.round(todayProt)}g protein. Target: ${profile?.protein || 150}g.`, time: "Reminder", page: "nutrition", type: "reminder" });
    }

    const recentW = workouts.slice(-3).reverse();
    recentW.forEach(w => notifs.push({
      id: `w-${w.date}`, icon: Dumbbell, color: "#C8FF32",
      title: "Workout Completed", desc: `${w.exercises?.length || 0} exercises · ${Math.round(w.totalVolume)}kg volume`,
      time: w.date, page: "workout", type: "activity",
    }));
    const recentN = nutrition.slice(-2).reverse();
    recentN.forEach(n => notifs.push({
      id: `n-${n.date}`, icon: Apple, color: "#C8FF32",
      title: "Nutrition Logged", desc: `${n.calories || 0} kcal · ${n.protein || 0}g protein`,
      time: n.date, page: "nutrition", type: "activity",
    }));
    const recentR = recovery.slice(-2).reverse();
    recentR.forEach(r => notifs.push({
      id: `r-${r.date}`, icon: Moon, color: "#C8FF32",
      title: "Recovery Logged", desc: `Score: ${r.score}/10 · Sleep: ${r.sleep}h`,
      time: r.date, page: "recovery", type: "activity",
    }));
    const newBadges = badges.slice(-3);
    newBadges.forEach(b => notifs.push({
      id: `b-${b}`, icon: Award, color: "#FFD700",
      title: "Achievement Unlocked", desc: b.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      time: todayStr, page: null, type: "achievement",
    }));
    return notifs.sort((a, b) => {
      const order = { reminder: 0, achievement: 1, activity: 2 };
      return (order[a.type] ?? 3) - (order[b.type] ?? 3);
    }).slice(0, 15);
  }, [workouts, nutrition, recovery, badges, water, profile]);

  const reminders = items.filter(n => n.type === "reminder");
  const achievements = items.filter(n => n.type === "achievement");
  const activities = items.filter(n => n.type === "activity");

  return (
    <div className="dash-notif-panel" onClick={e => e.stopPropagation()}>
      <div style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Notifications</span>
        <button onClick={onClose} className="rd-icon-btn" style={{ width: 28, height: 28 }} tabIndex={0} aria-label="Close notifications"><X size={15} /></button>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: "24px 12px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
          <Bell size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
          No notifications yet
        </div>
      ) : (
        <div>
          {reminders.length > 0 && (
            <div style={{ padding: "4px 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Reminders</div>
              {reminders.map(n => {
                const Icon = n.icon;
                return (
                  <div key={n.id} className="dash-reminder" onClick={() => { if (n.page) NAV(n.page); onClose(); }}
                    style={{ cursor: n.page ? "pointer" : "default" }} role="button" tabIndex={0}
                    onKeyDown={e => { if (e.key === "Enter" && n.page) { NAV(n.page); onClose(); } }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${n.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={14} color={n.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{n.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {achievements.length > 0 && (
            <div style={{ padding: "4px 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, marginTop: reminders.length > 0 ? 8 : 0 }}>Achievements</div>
              {achievements.map(n => {
                const Icon = n.icon;
                return (
                  <div key={n.id} className="dash-reminder" style={{ borderColor: "rgba(255,215,0,0.15)", background: "rgba(255,215,0,0.04)" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,215,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={14} color="#FFD700" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#FFD700" }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{n.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {activities.length > 0 && (
            <div style={{ padding: "4px 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, marginTop: (reminders.length > 0 || achievements.length > 0) ? 8 : 0 }}>Activity</div>
              {activities.map(n => {
                const Icon = n.icon;
                return (
                  <div key={n.id} className="dash-notif-item" onClick={() => { if (n.page) NAV(n.page); onClose(); }}
                    style={{ cursor: n.page ? "pointer" : "default" }} role="button" tabIndex={0}
                    onKeyDown={e => { if (e.key === "Enter" && n.page) { NAV(n.page); onClose(); } }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${n.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={14} color={n.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{n.desc}</div>
                    </div>
                    <span style={{ fontSize: 10, color: "var(--faint)", flexShrink: 0 }}>{n.time}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProfileDropdown = ({ profile, dispatch, onClose }) => (
  <div className="dash-dropdown" onClick={e => e.stopPropagation()}>
    <div style={{ padding: "8px 12px 6px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>{profile.name}</div>
      <div style={{ fontSize: 12, color: "#A7B1C2" }}>{GOAL_LABELS[profile.goal] || profile.goal?.replace(/_/g, " ")}</div>
    </div>
    <button className="dash-dropdown-item" onClick={() => { NAV("profile"); onClose(); }} tabIndex={0}>
      <User size={14} /><span>Profile</span>
    </button>
    <button className="dash-dropdown-item" onClick={() => { NAV("settings"); onClose(); }} tabIndex={0}>
      <Target size={14} /><span>Settings</span>
    </button>
    <div className="dash-dropdown-divider" />
    <button className="dash-dropdown-item danger" onClick={async () => { onClose(); if (await showConfirm("Reset all data? This will permanently delete all workouts, nutrition logs, and progress. This cannot be undone.")) dispatch({ type: "RESET" }); }} tabIndex={0}>
      <Trash2 size={14} /><span>Reset All Data</span>
    </button>
  </div>
);

const EmptyState = ({ icon: Icon, title, subtitle, action, actionLabel }) => (
  <div className="rd-empty">
    {Icon && <Icon size={30} color="rgba(255,255,255,0.25)" />}
    <div className="rd-empty-title">{title}</div>
    <div className="rd-empty-sub">{subtitle}</div>
    {action && <button className="rd-btn-primary" onClick={action} style={{ marginTop: 8, padding: "10px 18px", fontSize: 13 }}>{actionLabel}</button>}
  </div>
);

const Dashboard = ({ state, dispatch, page }) => {
  const { profile = {}, workouts = [], nutrition = [], recovery = [], bodyWeight = [], water = {}, badges = [], xp = 0, level = 1, currentProgram = null, activeSession = null } = state || {};
  const { ask, loading: aiLoading } = useAICoach();
  const [aiInsight, setAiInsight] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [chartFilter, setChartFilter] = useState("30D");

  const weekVol = calcWeeklyVolume(workouts);
  const streak = calcStreak(workouts);
  const todayNutrition = nutrition.find(n => n.date === today()) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const todayRecovery = recovery.find(r => r.date === today()) || {};
  const waterLog = (water || {})[today()] || 0;
  const waterGoal = 2500;
  const todayLogCount = workouts.filter(w => w.date === today()).length
    + nutrition.filter(n => n.date === today()).length
    + (recovery.find(r => r.date === today()) ? 1 : 0);

  const latestWeight = bodyWeight.length > 0 ? bodyWeight[bodyWeight.length - 1].weight : (profile.weight || 0);
  let weightChange = 0;
  if (bodyWeight.length >= 2) {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    const weekEntries = bodyWeight.filter(b => (b.date || "") >= cutoffStr);
    if (weekEntries.length >= 2) {
      weightChange = weekEntries[weekEntries.length - 1].weight - weekEntries[0].weight;
    } else {
      weightChange = latestWeight - bodyWeight[0].weight;
    }
  }

  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifOpen && !e.target.closest(".dash-notif-panel") && !e.target.closest("[data-rd-notif]")) setNotifOpen(false);
      if (profileOpen && !e.target.closest(".dash-dropdown") && !e.target.closest("[data-rd-avatar]")) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen, profileOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") { setNotifOpen(false); setProfileOpen(false); } };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const shortDate = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const filterDays = chartFilter === "7D" ? 7 : chartFilter === "90D" ? 90 : 30;

  // â”€â”€ Hero: Today's Workout â”€â”€
  const todayWorkouts = workouts.filter(w => w.date === today());
  const progDays = currentProgram?.days || [];
  const nextIdx = workouts.length > 0 ? workouts.length % Math.max(progDays.length, 1) : 0;
  const heroDay = progDays.length ? progDays[nextIdx] : null;
  const heroExercises = heroDay?.exercises || [];
  const heroSets = heroExercises.reduce((s, e) => s + (typeof e?.sets === "number" ? e.sets : (e?.sets?.length || 1)), 0);
  const heroMinutes = heroExercises.length ? Math.max(heroSets * 3, heroExercises.length * 5) : 0;
  const heroFocus = useMemo(() => {
    const set = new Set();
    heroExercises.forEach(e => {
      const name = e?.exerciseName || (typeof e === "string" ? e : e?.name);
      const ex = EXERCISE_LOOKUP.get(name);
      if (ex) set.add(ex.primary);
    });
    return [...set].slice(0, 3).join(" • ");
  }, [heroExercises]);

  const heroMuscles = useMemo(() => {
    const set = new Set();
    heroExercises.forEach(e => {
      const name = e?.exerciseName || (typeof e === "string" ? e : e?.name);
      const ex = EXERCISE_LOOKUP.get(name);
      if (ex?.primary) set.add(ex.primary);
    });
    return [...set];
  }, [heroExercises]);

  const heroRegions = useMemo(() => {
    const s = new Set();
    heroMuscles.forEach(m => (PRIMARY_MUSCLE_IDS[m] || []).forEach(id => s.add(id)));
    return [...s];
  }, [heroMuscles]);

  const heroRegionLabels = useMemo(() => {
    const seen = new Set();
    const labels = [];
    heroRegions.forEach(id => {
      const l = MUSCLE_ID_LABEL(id);
      if (l && !seen.has(l)) {
        seen.add(l);
        labels.push(l);
      }
    });
    return labels;
  }, [heroRegions]);

  const startHero = () => {
    if (activeSession) { NAV("session"); return; }
    if (heroDay) {
      dispatch({ type: "SET_PENDING_WORKOUT", payload: heroDay });
      NAV("session");
    } else {
      NAV("workout");
    }
  };

  // â”€â”€ Readiness â”€â”€
  const recoveryScore = todayRecovery.score || 0;
  const recoveryPct = Math.round(recoveryScore * 10);
  const readinessStatus = recoveryPct >= 80 ? "Ready to train" : recoveryPct >= 60 ? "Moderate — manageable" : "Take it easy";
  const readinessColor = recoveryPct >= 80 ? "#C8FF32" : recoveryPct >= 60 ? "#FF9F0A" : "#FF5A5F";
  const subMetrics = [
    { label: "Sleep", pct: Math.round(Math.min((todayRecovery.sleep || 0) / 8 * 100, 100)) },
    { label: "Fatigue", pct: Math.max(0, Math.min(100 - (todayRecovery.quality || 5) * 10, 100)) },
    { label: "Soreness", pct: Math.max(0, Math.min(100 - recoveryPct, 100)) },
    { label: "Stress", pct: Math.max(0, Math.min((todayRecovery.stress || 5) * 10, 100)) },
  ];

  // â”€â”€ Consistency dots (last 7 days) â”€â”€
  const consistency = useMemo(() => {
    const dots = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      dots.push(workouts.some(w => w.date === ds));
    }
    return dots;
  }, [workouts]);

  // â”€â”€ Weekly overview chart â”€â”€
  const chartData = useMemo(() => {
    const data = [];
    for (let i = filterDays - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const dayW = workouts.filter(w => w.date === ds);
      const dayN = nutrition.filter(n => n.date === ds);
      data.push({
        day: ds.slice(5),
        workouts: dayW.length,
        volume: Math.round(dayW.reduce((s, w) => s + (w.totalVolume || 0), 0)),
        calories: dayN.reduce((s, n) => s + (n.calories || 0), 0),
      });
    }
    return data;
  }, [workouts, nutrition, filterDays]);

  const recentWorkouts = useMemo(() => [...workouts].slice(-6).reverse(), [workouts]);

  // â”€â”€ Default AI insight (real data only) â”€â”€
  const defaultInsight = useMemo(() => {
    const parts = [];
    if (workouts.length) {
      parts.push(`${workouts.length} workout${workouts.length > 1 ? "s" : ""} logged · ${Math.round(weekVol).toLocaleString()} kg volume this week`);
    }
    if (streak >= 2) parts.push(`${streak}-day streak`);
    const last7N = nutrition.slice(-7);
    if (last7N.length) {
      const protAvg = Math.round(last7N.reduce((s, n) => s + (n.protein || 0), 0) / last7N.length);
      parts.push(`${protAvg}g avg daily protein`);
    }
    const last7R = recovery.slice(-7);
    if (last7R.length) {
      const sleepAvg = fmt(last7R.reduce((s, r) => s + (r.sleep || 0), 0) / last7R.length, 1);
      parts.push(`${sleepAvg}h avg sleep`);
    }
    if (!parts.length) return "Log your first workout to unlock personalized coaching insights.";
    const intro = streak >= 2 ? "Great momentum — keep it up!" : "Here's your progress snapshot.";
    return `${intro} ${parts.join(" · ")}.`;
  }, [workouts, nutrition, recovery, weekVol, streak]);

  const getInsight = async () => {
    const recent = workouts.slice(-5);
    const avgVolume = recent.length ? recent.reduce((s, w) => s + w.totalVolume, 0) / recent.length : 0;
    const proteinAvg = nutrition.slice(-7).reduce((s, n) => s + (n.protein || 0), 0) / Math.max(nutrition.slice(-7).length, 1);
    const avgSleep = recovery.slice(-7).reduce((s, r) => s + (r.sleep || 0), 0) / Math.max(recovery.slice(-7).length, 1);
    const summary = [
      `User: ${profile.name}, Goal: ${GOAL_LABELS[profile.goal] || profile.goal}, Experience: ${profile.experience || "unknown"}.`,
      `Recent workouts: ${recent.map(w => `${w.date}: ${w.exercises?.map(e => e.exerciseName || e.name).join(", ")} (vol: ${Math.round(w.totalVolume)}kg)`).join(" | ")}.`,
      `Weekly volume: ${Math.round(weekVol)}kg. Average: ${Math.round(avgVolume)}kg/session.`,
      `Streak: ${streak} days. Total workouts: ${workouts.length}.`,
      `Today: ${todayNutrition.calories}/${profile.calories} kcal, ${todayNutrition.protein}/${profile.protein}g protein.`,
      `7-day avg protein: ${Math.round(proteinAvg)}g. 7-day avg sleep: ${fmt(avgSleep, 1)}h.`,
      `Recovery score: ${recoveryScore || "not logged"}/10. Weight: ${latestWeight}kg (started: ${profile.weight}kg).`,
    ].join(" ");
    const text = await ask(
      "You are an elite AI personal trainer. Analyze this data and give 3-4 actionable recommendations. Be specific with numbers. Keep under 150 words.",
      `Review my fitness data: ${summary}`
    );
    if (text) setAiInsight(text);
  };

  const hasChartData = workouts.length > 0 || nutrition.length > 0;
  const caloriePct = Math.min((todayNutrition.calories / Math.max(profile.calories || 2000, 1)) * 100, 100);
  const proteinPct = Math.min((todayNutrition.protein / Math.max(profile.protein || 150, 1)) * 100, 100);
  const carbGoal = Math.max(profile.carbs || Math.round((profile.calories || 2000) * 0.11), 1);
  const fatGoal = Math.max(profile.fat || Math.round((profile.calories || 2000) * 0.035), 1);

  const macroGoals = [
    { label: "Protein", val: todayNutrition.protein || 0, goal: profile.protein || 150, pct: proteinPct, color: "#C8FF32" },
    { label: "Carbs", val: todayNutrition.carbs || 0, goal: carbGoal, pct: Math.min(((todayNutrition.carbs || 0) / carbGoal) * 100, 100), color: "#5AC8FA" },
    { label: "Fat", val: todayNutrition.fat || 0, goal: fatGoal, pct: Math.min(((todayNutrition.fat || 0) / fatGoal) * 100, 100), color: "#FF9F0A" },
  ];

  const sparkData = useMemo(() => bodyWeight.slice(-7).map(b => b.weight), [bodyWeight]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="rd-page">

        {/* â•â•â• HEADER â•â•â• */}
        <div className="rd-header">
          <div className="rd-pills">
            <span className="rd-pill"><Flame size={13} /><b>{streak}</b> day streak</span>
            <span className="rd-pill"><Zap size={13} />Lv. <b>{level}</b></span>
            <span className="rd-pill purple"><Award size={13} /><b>{xp}</b> XP</span>
          </div>

          <div className="rd-top-right">
            <span className="rd-date-pill"><Calendar size={14} />{shortDate}</span>
            <div style={{ position: "relative" }}>
              <button data-rd-notif className="rd-icon-btn"
                onClick={() => { setNotifOpen(p => !p); setProfileOpen(false); }}
                role="button" tabIndex={0} aria-label="Notifications" aria-expanded={notifOpen}
                onKeyDown={e => { if (e.key === "Enter") { setNotifOpen(p => !p); setProfileOpen(false); } }}>
                <Bell size={17} />
                {todayLogCount > 0 && (
                  <span className="rd-notif-badge">{Math.min(todayLogCount, 99)}</span>
                )}
              </button>
              {notifOpen && <NotificationPanel workouts={workouts} nutrition={nutrition} recovery={recovery} badges={badges} water={water} profile={profile} onClose={() => setNotifOpen(false)} />}
            </div>
            <div style={{ position: "relative" }}>
              <button data-rd-avatar className="rd-avatar"
                onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); }}
                role="button" tabIndex={0} aria-label="Profile menu" aria-expanded={profileOpen}
                onKeyDown={e => { if (e.key === "Enter") { setProfileOpen(p => !p); setNotifOpen(false); } }}>
                {(profile.name || "U")[0].toUpperCase()}
              </button>
              {profileOpen && <ProfileDropdown profile={profile} dispatch={dispatch} onClose={() => setProfileOpen(false)} />}
            </div>
          </div>
        </div>

        {/* â•â•â• HERO ROW â•â•â• */}
        <div className="rd-grid">
          <Fade className="rd-span-6 rd-hero" delay={0.02}>
            <div className="rd-hero-grid">
              <div className="rd-hero-copy">
                <span className="rd-kicker"><Zap size={12} />Today's Workout</span>
                <div>
                  <h1 className="rd-hero-title">{greeting}, <span className="accent">{profile.name}</span></h1>
                  <div className="rd-hero-date">
                    {dateStr}
                    {profile.goal && ` · Goal: ${GOAL_LABELS[profile.goal] || profile.goal.replace(/_/g, " ")}`}
                  </div>
                </div>
                <p className="rd-hero-sub">
                  {activeSession ? (
                    <>Session in progress — <b>{activeSession.name || "Active workout"}</b>, {activeSession.exercises?.length || 0} exercises underway</>
                  ) : heroDay ? (
                    <>Next up: <b>{heroDay.name}</b> — {heroFocus || "Full-body session"}</>
                  ) : (
                    <>Pick a program or start a free workout to begin training</>
                  )}
                </p>
                <div className="rd-hero-ai">
                  <Bot size={16} />
                  <span>{aiInsight || defaultInsight}</span>
                </div>
                <div className="rd-hero-stats">
                  <div className="rd-hero-stat-chip">
                    <div className="c-v">{activeSession ? activeSession.exercises?.length || 0 : heroExercises.length}</div>
                    <div className="c-l">Exercises</div>
                  </div>
                  <div className="rd-hero-stat-chip">
                    <div className="c-v">{activeSession
                      ? (activeSession.exercises || []).reduce((s, e) => s + (e.sets?.length || 0), 0)
                      : heroSets}</div>
                    <div className="c-l">Sets</div>
                  </div>
                  <div className="rd-hero-stat-chip">
                    <div className="c-v"><span>~</span>{activeSession ? (activeSession.exercises?.length || 0) * 8 : heroMinutes}<span> min</span></div>
                    <div className="c-l">Est. time</div>
                  </div>
                </div>
                <div className="rd-hero-actions">
                  <button className="rd-btn-primary rd-btn-lg" onClick={startHero} tabIndex={0}>
                    <Play size={16} />
                    {activeSession ? "Continue Workout" : "Start Workout"}
                    <ChevronRight size={16} />
                  </button>
                  {!activeSession && (
                    <button className="rd-btn-secondary rd-btn-lg" onClick={() => NAV("programs")} tabIndex={0}>
                      View Program
                    </button>
                  )}
                </div>
                {currentProgram && !activeSession && (
                  <span className="rd-tip-chip" style={{ alignSelf: "flex-start" }}>
                    <Calendar size={12} />
                    Current program: <b style={{ color: "var(--text)", fontWeight: 700 }}>{currentProgram.name}</b>
                  </span>
                )}
              </div>

              <div className="rd-hero-visual">
                <HumanBody activeMuscles={heroRegions} labels={heroRegionLabels} />
                <div className="rd-hero-readiness" onClick={() => NAV("recovery")} role="button" tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter") NAV("recovery"); }}
                  style={{ cursor: "pointer" }}>
                  <div className="rr-ring">
                    <svg viewBox="0 0 76 76">
                      <circle className="rr-bg" cx={38} cy={38} r={32} strokeWidth={6} />
                      <circle className="rr-fg" cx={38} cy={38} r={32} strokeWidth={6}
                        stroke={readinessColor}
                        strokeDasharray={`${(recoveryPct / 100) * (2 * Math.PI * 32)} ${2 * Math.PI * 32}`} />
                    </svg>
                    <div className="rr-center">
                      <b style={{ color: readinessColor }}>{recoveryScore || 0}</b>
                      <span>Readiness</span>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="rr-status" style={{ color: readinessColor }}>
                      {readinessStatus}
                      <small>
                        {todayRecovery.score
                          ? "Based on your sleep, stress & soreness"
                          : "Log recovery to see your score"}
                      </small>
                    </div>
                    <div className="rr-bars">
                      {subMetrics.slice(0, 3).map(m => {
                        const color = m.pct >= 70 ? "var(--accent)" : m.pct >= 40 ? "#A7B1C2" : "var(--red)";
                        return (
                          <div className="rr-bar-row" key={m.label}>
                            <span className="rr-l">{m.label}</span>
                            <div className="rr-bar"><i style={{ width: `${m.pct}%`, background: color }} /></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Fade>

          {/* â”€â”€ Nutrition (span 2) â”€â”€ */}
          <Fade className="rd-span-2 rd-card rd-card-click" delay={0.08}
            onClick={() => NAV("nutrition")} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === "Enter") NAV("nutrition"); }}>
            <div className="rd-card-head">
              <div className="rd-card-title">
                <div className="rd-card-title-ico lime"><Apple size={16} /></div>
                <div>
                  <div className="rd-card-kicker">Nutrition</div>
                  <div className="rd-card-name">Today's Intake</div>
                </div>
              </div>
              <span className="rd-card-link"><ArrowRight size={13} /></span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 16 }}>
              <span className="rd-big-metric">{Math.round(todayNutrition.calories)}</span>
              <span className="rd-big-metric" style={{ fontSize: 16, color: "rgba(255,255,255,0.35)" }}>/ {profile.calories || 2000} kcal</span>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div className="rd-trend" style={{ color: caloriePct > 90 ? "#FF5A5F" : "#C8FF32" }}>
                  <Flame size={13} />{Math.round(caloriePct)}%
                </div>
                <div className="rd-metric-label">of target</div>
              </div>
            </div>
            <div>
              {macroGoals.map(m => (
                <div className="rd-macro" key={m.label}>
                  <div className="rd-macro-head">
                    <span className="rd-macro-label">{m.label}</span>
                    <span className="rd-macro-val"><b>{Math.round(m.val)}</b> / {m.goal}g</span>
                  </div>
                  <div className="rd-macro-track">
                    <div className="rd-macro-fill" style={{ width: `${m.pct}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Fade>

          {/* â”€â”€ Water (span 2) â”€â”€ */}
          <Fade className="rd-span-2 rd-card rd-card-click" delay={0.1}
            onClick={() => NAV("water-tracker")} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === "Enter") NAV("water-tracker"); }}>
            <div className="rd-card-head">
              <div className="rd-card-title">
                <div className="rd-card-title-ico blue"><Droplet size={16} /></div>
                <div>
                  <div className="rd-card-kicker">Hydration</div>
                  <div className="rd-card-name">Water Intake</div>
                </div>
              </div>
              <button className="rd-water-btn" onClick={(e) => { e.stopPropagation(); dispatch({ type: "LOG_WATER", payload: { date: today(), amount: 250 } }); showToast("+250 ml added"); }} tabIndex={0}>
                <Plus size={13} /> 250 ml
              </button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <span className="rd-big-metric">{fmt(waterLog / 1000, 1)}<span> / {fmt(waterGoal / 1000, 1)} L</span></span>
            </div>
            <div className="rd-water-track">
              <div className="rd-water-fill" style={{ width: `${Math.min((waterLog / waterGoal) * 100, 100)}%` }} />
            </div>
            <div className="rd-metric-label" style={{ marginTop: 10 }}>
              {waterLog >= waterGoal ? "Daily goal reached!" : `${Math.round((waterLog / waterGoal) * 100)}% of daily goal`}
            </div>
          </Fade>

          {/* â”€â”€ Progress Snapshot (span 2) â”€â”€ */}
          <Fade className="rd-span-2 rd-card" delay={0.12}>
            <div className="rd-card-head" style={{ marginBottom: 12 }}>
              <div className="rd-card-title">
                <div className="rd-card-title-ico lime"><Activity size={16} /></div>
                <div>
                  <div className="rd-card-kicker">Progress</div>
                  <div className="rd-card-name">Snapshot</div>
                </div>
              </div>
            </div>
            <div className="rd-snapshot">
              <div className="rd-snapshot-sec rd-card-click" onClick={() => NAV("bodyweight")} role="button" tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter") NAV("bodyweight"); }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                  <span className="rd-big-metric">{latestWeight}<span> kg</span></span>
                  <span className={`rd-trend ${weightChange > 0.05 ? "up" : weightChange < -0.05 ? "down" : "flat"}`}>
                    {weightChange > 0.05 ? <TrendingUp size={13} /> : weightChange < -0.05 ? <TrendingUp size={13} style={{ transform: "rotate(180deg)" }} /> : null}
                    {weightChange !== 0 ? `${weightChange > 0 ? "+" : ""}${fmt(weightChange, 1)} kg` : "No change"}
                  </span>
                </div>
                <div className="rd-metric-label">Body weight · this week</div>
                {sparkData.length >= 2 && (
                  <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none" style={{ marginTop: 4, display: "block" }}>
                    <defs>
                      <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(200,255,50,0.25)" />
                        <stop offset="100%" stopColor="rgba(200,255,50,0)" />
                      </linearGradient>
                    </defs>
                    <polyline
                      points={`0,${30 - ((sparkData[0] - Math.min(...sparkData)) / Math.max(Math.max(...sparkData) - Math.min(...sparkData), 0.1)) * 26 - 2} ${sparkData.map((w, i) => `${(i / (sparkData.length - 1)) * 100},${30 - ((w - Math.min(...sparkData)) / Math.max(Math.max(...sparkData) - Math.min(...sparkData), 0.1)) * 26 - 2}`).join(" ")} 100,30 0,30`}
                      fill="url(#sparkFill)" stroke="none" />
                    <polyline
                      points={sparkData.map((w, i) => `${(i / (sparkData.length - 1)) * 100},${30 - ((w - Math.min(...sparkData)) / Math.max(Math.max(...sparkData) - Math.min(...sparkData), 0.1)) * 26 - 2}`).join(" ")}
                      fill="none" stroke="#C8FF32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="rd-snapshot-divider" />
              <div className="rd-snapshot-sec rd-card-click" onClick={() => NAV("progress")} role="button" tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter") NAV("progress"); }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                  <span className="rd-big-metric">{streak}<span> days</span></span>
                  <span className="rd-trend" style={{ color: streak >= 2 ? "var(--accent)" : "var(--muted)" }}>
                    <Flame size={13} />{streak >= 2 ? "On fire" : streak === 1 ? "Day 1" : "No streak"}
                  </span>
                </div>
                <div className="rd-dots" style={{ height: 14 }}>
                  {consistency.map((on, i) => (
                    <div key={i} className={`rd-dot ${on ? "on" : ""}`} style={{ height: "100%" }} title={on ? "Workout logged" : "Rest day"} />
                  ))}
                </div>
                <div className="rd-metric-label">Last 7 days</div>
              </div>
            </div>
          </Fade>

          {/* â”€â”€ Weekly Overview (span 4) â”€â”€ */}
          <Fade className="rd-span-4 rd-card" delay={0.14}>
            <div className="rd-card-head">
              <div className="rd-card-title">
                <div className="rd-card-title-ico lime"><Activity size={16} /></div>
                <div>
                  <div className="rd-card-kicker">Analytics</div>
                  <div className="rd-card-name">Weekly Overview</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div className="rd-legend">
                  <span className="rd-legend-item"><span className="rd-legend-dot" style={{ background: "#C8FF32" }} />Workouts</span>
                  <span className="rd-legend-item"><span className="rd-legend-dot" style={{ background: "#5AC8FA" }} />Volume</span>
                  <span className="rd-legend-item"><span className="rd-legend-dot" style={{ background: "#FF9F0A" }} />Calories</span>
                </div>
                <ChartFilter value={chartFilter} onChange={setChartFilter} />
              </div>
            </div>
            {hasChartData ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(90,200,250,0.30)" />
                      <stop offset="100%" stopColor="rgba(90,200,250,0)" />
                    </linearGradient>
                    <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,159,10,0.28)" />
                      <stop offset="100%" stopColor="rgba(255,159,10,0)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 10" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "rgba(167,177,194,0.5)" }} axisLine={false} tickLine={false} minTickGap={28} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "rgba(167,177,194,0.5)" }} axisLine={false} tickLine={false} width={42} />
                  <YAxis yAxisId="right" orientation="right" allowDecimals={false} tick={{ fontSize: 10, fill: "rgba(167,177,194,0.5)" }} axisLine={false} tickLine={false} width={22} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.12)", strokeWidth: 1, strokeDasharray: "4 6" }} />
                  <Area yAxisId="left" type="monotone" dataKey="volume" name="Volume" stroke="#5AC8FA" strokeWidth={2.5} fill="url(#volGrad)" dot={false} activeDot={(p) => <GlowDot {...p} stroke="#5AC8FA" />} animationDuration={1000} />
                  <Area yAxisId="right" type="monotone" dataKey="calories" name="Calories" stroke="#FF9F0A" strokeWidth={2.5} fill="url(#calGrad)" dot={false} activeDot={(p) => <GlowDot {...p} stroke="#FF9F0A" />} animationDuration={1000} />
                  <Line yAxisId="left" type="monotone" dataKey="workouts" name="Workouts" stroke="#C8FF32" strokeWidth={3} dot={false} activeDot={(p) => <GlowDot {...p} stroke="#C8FF32" />} animationDuration={1000} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Activity} title="No activity yet"
                subtitle="Complete workouts or log meals to see your weekly overview" />
            )}
          </Fade>

          {/* â”€â”€ Recent Workouts (span 2) â”€â”€ */}
          <Fade className="rd-span-2 rd-card" delay={0.16}>
            <div className="rd-card-head">
              <div className="rd-card-title">
                <div className="rd-card-title-ico lime"><Dumbbell size={16} /></div>
                <div>
                  <div className="rd-card-kicker">Training</div>
                  <div className="rd-card-name">Recent Workouts</div>
                </div>
              </div>
              <button className="rd-card-link" onClick={() => NAV("workout")} tabIndex={0}>View All <ArrowRight size={13} /></button>
            </div>
            {recentWorkouts.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {recentWorkouts.map((w, idx) => {
                  const sets = w.totalSets ?? (w.exercises || []).reduce((s, e) => s + (e.sets?.length || 0), 0);
                  return (
                    <motion.div key={w.id || w.date} className="rd-recent-item" onClick={() => NAV("workout")} role="button" tabIndex={0}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.05, duration: 0.4 }}
                      onKeyDown={e => { if (e.key === "Enter") NAV("workout"); }}>
                      <div className="rd-recent-icon"><Dumbbell size={15} /></div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="rd-recent-name">{w.name || `${w.exercises?.length || 0} exercises`}</div>
                        <div className="rd-recent-meta">{w.exercises?.length || 0} exercises · {Math.round(w.totalVolume || 0)} kg</div>
                      </div>
                      <div className="rd-recent-right">
                        <div className="rd-recent-dur">{w.duration ? `${w.duration}m` : `${sets || 0} sets`}</div>
                        <div className="rd-recent-date">{w.date}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon={Dumbbell} title="No workouts yet"
                subtitle="Start your first workout to see it here"
                action={() => NAV("workout")} actionLabel="Start Workout" />
            )}
          </Fade>

          {/* â”€â”€ AI COACH BANNER (span 6) â”€â”€ */}
          <Fade className="rd-span-6 rd-ai" delay={0.18}>
            <div className="rd-ai-icon"><Bot size={26} /></div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div className="rd-ai-kicker">AI Coach</div>
              <div className="rd-ai-title">
                {aiInsight ? "Coach's recommendation" : "Your weekly insight is ready"}
              </div>
              <div className="rd-ai-text">
                {aiInsight || defaultInsight}
              </div>
            </div>
            <button className="rd-ai-btn" onClick={() => NAV("coach")} tabIndex={0}>
              <Sparkles size={15} className="spark" />
              {aiLoading ? "Analyzing…" : "Ask AI Coach"}
              <ChevronRight size={15} />
            </button>
          </Fade>

        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
