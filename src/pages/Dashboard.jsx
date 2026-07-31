import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  fmt, today, EXERCISE_DB, GOAL_LABELS,
  calcStreak, calcWeeklyVolume,
  showToast, showConfirm, useAICoach,
} from "../utils/helpers";
import {
  Bell, Dumbbell, Moon, Flame, Apple, Scale, Droplet, Bot, Target, Zap, Award,
  Sparkles, ChevronRight, Calendar, TrendingUp, Plus, Activity, ArrowRight, User,
} from "lucide-react";

const NAV = (page) => { window.__setPage?.(page); };

const EXERCISE_LOOKUP = new Map((EXERCISE_DB || []).map(e => [e.name, e]));

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
      notifs.push({ id: "rem-workout", icon: Dumbbell, color: "#C8FF00", title: "Workout Reminder", desc: "You haven't trained today. Even 20 minutes counts!", time: "Reminder", page: "workout", type: "reminder" });
    }
    if (todayR && todayR.score < 5) {
      notifs.push({ id: "rem-recovery", icon: Moon, color: "#FF4757", title: "Low Recovery", desc: `Score ${todayR.score}/10 — consider rest or light activity.`, time: "Reminder", page: "recovery", type: "reminder" });
    } else if (!todayR && hour >= 20) {
      notifs.push({ id: "rem-recovery-log", icon: Moon, color: "#C8FF00", title: "Log Recovery", desc: "Don't forget to log your sleep and recovery for today.", time: "Reminder", page: "recovery", type: "reminder" });
    }
    if (waterToday < 1000 && hour >= 12) {
      notifs.push({ id: "rem-water", icon: Droplet, color: "#4D9FFF", title: "Hydration Reminder", desc: `Only ${fmt(waterToday / 1000, 1)}L today. Aim for 2.5L+.`, time: "Reminder", page: "water-tracker", type: "reminder" });
    }
    if (todayCals > (profile?.calories || 2000) * 1.1) {
      notifs.push({ id: "rem-overeat", icon: Flame, color: "#FF4757", title: "Calorie Over Target", desc: `${todayCals} kcal logged — ${Math.round((todayCals / (profile?.calories || 2000)) * 100)}% of target.`, time: "Alert", page: "nutrition", type: "reminder" });
    }
    if (todayProt < (profile?.protein || 150) * 0.4 && hour >= 15) {
      notifs.push({ id: "rem-protein", icon: Apple, color: "#C8FF00", title: "Protein Check", desc: `Only ${Math.round(todayProt)}g protein. Target: ${profile?.protein || 150}g.`, time: "Reminder", page: "nutrition", type: "reminder" });
    }

    const recentW = workouts.slice(-3).reverse();
    recentW.forEach(w => notifs.push({
      id: `w-${w.date}`, icon: Dumbbell, color: "#C8FF00",
      title: "Workout Completed", desc: `${w.exercises?.length || 0} exercises · ${Math.round(w.totalVolume)}kg volume`,
      time: w.date, page: "workout", type: "activity",
    }));
    const recentN = nutrition.slice(-2).reverse();
    recentN.forEach(n => notifs.push({
      id: `n-${n.date}`, icon: Apple, color: "#C8FF00",
      title: "Nutrition Logged", desc: `${n.calories || 0} kcal · ${n.protein || 0}g protein`,
      time: n.date, page: "nutrition", type: "activity",
    }));
    const recentR = recovery.slice(-2).reverse();
    recentR.forEach(r => notifs.push({
      id: `r-${r.date}`, icon: Moon, color: "#C8FF00",
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
        <span style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>Notifications</span>
        <button onClick={onClose} style={{ background: "none", color: "#666", fontSize: 16, padding: 2, cursor: "pointer", border: "none" }} tabIndex={0} aria-label="Close notifications">✕</button>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: "24px 12px", textAlign: "center", color: "#666", fontSize: 13 }}>
          <Bell size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
          No notifications yet
        </div>
      ) : (
        <div>
          {reminders.length > 0 && (
            <div style={{ padding: "4px 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(160,160,160,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Reminders</div>
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
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#FFFFFF" }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 1 }}>{n.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {achievements.length > 0 && (
            <div style={{ padding: "4px 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(160,160,160,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, marginTop: reminders.length > 0 ? 8 : 0 }}>Achievements</div>
              {achievements.map(n => {
                const Icon = n.icon;
                return (
                  <div key={n.id} className="dash-reminder" style={{ borderColor: "rgba(255,215,0,0.15)", background: "rgba(255,215,0,0.04)" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,215,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={14} color="#FFD700" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#FFD700" }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 1 }}>{n.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {activities.length > 0 && (
            <div style={{ padding: "4px 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(160,160,160,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, marginTop: (reminders.length > 0 || achievements.length > 0) ? 8 : 0 }}>Activity</div>
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
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#FFFFFF" }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 1 }}>{n.desc}</div>
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(160,160,160,0.3)", flexShrink: 0 }}>{n.time}</span>
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
      <div style={{ fontSize: 12, color: "#A0A0A0" }}>{GOAL_LABELS[profile.goal] || profile.goal?.replace(/_/g, " ")}</div>
    </div>
    <button className="dash-dropdown-item" onClick={() => { NAV("profile"); onClose(); }} tabIndex={0}>
      <User size={14} /><span>Profile</span>
    </button>
    <button className="dash-dropdown-item" onClick={() => { NAV("profile"); onClose(); }} tabIndex={0}>
      <Target size={14} /><span>Settings</span>
    </button>
    <div className="dash-dropdown-divider" />
    <button className="dash-dropdown-item danger" onClick={async () => { onClose(); if (await showConfirm("Reset all data? This will permanently delete all workouts, nutrition logs, and progress. This cannot be undone.")) dispatch({ type: "RESET" }); }} tabIndex={0}>
      <span>✕</span><span>Reset All Data</span>
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

  // ── Hero: Today's Workout ──
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

  const startHero = () => {
    if (activeSession) { NAV("session"); return; }
    if (heroDay) {
      dispatch({ type: "SET_PENDING_WORKOUT", payload: heroDay });
      NAV("session");
    } else {
      NAV("workout");
    }
  };

  // ── Readiness ──
  const recoveryScore = todayRecovery.score || 0;
  const recoveryPct = Math.round(recoveryScore * 10);
  const readinessStatus = recoveryPct >= 80 ? "Ready to train" : recoveryPct >= 60 ? "Moderate — manageable" : "Take it easy";
  const readinessColor = recoveryPct >= 80 ? "#C8FF00" : recoveryPct >= 60 ? "#FF9F43" : "#FF4757";
  const subMetrics = [
    { label: "Sleep", pct: Math.round(Math.min((todayRecovery.sleep || 0) / 8 * 100, 100)) },
    { label: "Fatigue", pct: Math.max(0, Math.min(100 - (todayRecovery.quality || 5) * 10, 100)) },
    { label: "Soreness", pct: Math.max(0, Math.min(100 - recoveryPct, 100)) },
    { label: "Stress", pct: Math.max(0, Math.min((todayRecovery.stress || 5) * 10, 100)) },
  ];

  // ── Consistency dots (last 7 days) ──
  const consistency = useMemo(() => {
    const dots = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      dots.push(workouts.some(w => w.date === ds));
    }
    return dots;
  }, [workouts]);

  // ── Weekly overview chart ──
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

  // ── Default AI insight (real data only) ──
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
    { label: "Protein", val: todayNutrition.protein || 0, goal: profile.protein || 150, pct: proteinPct, color: "#C8FF00" },
    { label: "Carbs", val: todayNutrition.carbs || 0, goal: carbGoal, pct: Math.min(((todayNutrition.carbs || 0) / carbGoal) * 100, 100), color: "#4D9FFF" },
    { label: "Fat", val: todayNutrition.fat || 0, goal: fatGoal, pct: Math.min(((todayNutrition.fat || 0) / fatGoal) * 100, 100), color: "#FF9F43" },
  ];

  const sparkData = useMemo(() => bodyWeight.slice(-7).map(b => b.weight), [bodyWeight]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="rd-page">

        {/* ═══ HEADER ═══ */}
        <div className="rd-header">
          <div>
            <div className="rd-greeting">
              {greeting}, <span className="rd-greeting-name">{profile.name}</span>
            </div>
            <div className="rd-greeting-sub">
              {dateStr}
              {profile.goal && ` · Goal: ${GOAL_LABELS[profile.goal] || profile.goal.replace(/_/g, " ")}`}
            </div>
            <div className="rd-pills">
              <span className="rd-pill"><Flame size={13} /><b>{streak}</b> day streak</span>
              <span className="rd-pill"><Zap size={13} />Lv. <b>{level}</b></span>
              <span className="rd-pill purple"><Award size={13} /><b>{xp}</b> XP</span>
            </div>
          </div>

          <div className="rd-top-right">
            <span className="rd-date-pill"><Calendar size={14} />{shortDate}</span>
            <div style={{ position: "relative" }}>
              <button data-rd-notif className="rd-icon-btn"
                onClick={() => { setNotifOpen(p => !p); setProfileOpen(false); }}
                role="button" tabIndex={0} aria-label="Notifications" aria-expanded={notifOpen}
                onKeyDown={e => { if (e.key === "Enter") { setNotifOpen(p => !p); setProfileOpen(false); } }}>
                <Bell size={17} />
                {(workouts.length + nutrition.length + recovery.length) > 0 && (
                  <span className="rd-notif-badge">{Math.min(workouts.length + nutrition.length + recovery.length, 99)}</span>
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

        {/* ═══ HERO ROW ═══ */}
        <div className="rd-grid">
          {/* ── Today's Workout (span 4) ── */}
          <div className="rd-span-4 rd-hero">
            <Dumbbell size={200} strokeWidth={1} className="rd-hero-watermark" />
            <span className="rd-hero-tag"><Zap size={12} />Today's Workout</span>
            {heroDay || activeSession ? (
              <>
                <div>
                  <div className="rd-hero-name">{activeSession ? activeSession.name || "Active Session" : heroDay.name}</div>
                  <div className="rd-hero-focus">
                    {activeSession
                      ? `${activeSession.exercises?.length || 0} exercises in progress`
                      : (heroFocus || "Full-body session")}
                  </div>
                </div>
                <div className="rd-hero-stats">
                  <div className="rd-hero-stat">
                    <div className="v">{activeSession ? activeSession.exercises?.length || 0 : heroExercises.length}</div>
                    <div className="l">Exercises</div>
                  </div>
                  <div className="rd-hero-stat">
                    <div className="v">{activeSession
                      ? (activeSession.exercises || []).reduce((s, e) => s + (e.sets?.length || 0), 0)
                      : heroSets}</div>
                    <div className="l">Sets</div>
                  </div>
                  <div className="rd-hero-stat">
                    <div className="v">~{activeSession ? (activeSession.exercises?.length || 0) * 8 : heroMinutes}</div>
                    <div className="l">Minutes</div>
                  </div>
                </div>
                <div className="rd-hero-actions">
                  <button className="rd-btn-primary" onClick={startHero} tabIndex={0}>
                    {activeSession ? "Continue Workout" : heroDay ? "Start Workout" : "Start Workout"}
                    <ChevronRight size={16} />
                  </button>
                  {!activeSession && (
                    <button className="rd-btn-secondary" onClick={() => NAV("programs")} tabIndex={0}>
                      View Program
                    </button>
                  )}
                </div>
              </>
            ) : (
              <EmptyState icon={Dumbbell} title="No active program"
                subtitle="Pick a program or start a free workout to begin training"
                action={() => NAV("programs")} actionLabel="Browse Programs" />
            )}
          </div>

          {/* ── Readiness (span 2) ── */}
          <div className="rd-span-2 rd-card rd-card-click"
            onClick={() => NAV("recovery")} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === "Enter") NAV("recovery"); }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="rd-card-head">
              <div className="rd-card-title">
                <div className="rd-card-title-ico lime"><Moon size={16} /></div>
                <div>
                  <div className="rd-card-kicker">Readiness</div>
                  <div className="rd-card-name">Recovery Score</div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1 }}>
              <div className="rd-ring">
                <svg width="100%" height="100%" viewBox="0 0 132 132">
                  <circle className="rd-ring-bg" cx={66} cy={66} r={54} strokeWidth={8} />
                  <circle className="rd-ring-fg" cx={66} cy={66} r={54} strokeWidth={8}
                    stroke={readinessColor}
                    strokeDasharray={`${(recoveryPct / 100) * (2 * Math.PI * 54)} ${2 * Math.PI * 54}`} />
                </svg>
                <div className="rd-ring-center">
                  <div className="rd-ring-value">{recoveryScore || 0}<span>/10</span></div>
                  <div className="rd-ring-label">Readiness</div>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="rd-readiness-status" style={{ color: readinessColor }}>{readinessStatus}</div>
                <div className="rd-readiness-sub">
                  {todayRecovery.score
                    ? `Based on your sleep, stress & soreness`
                    : "Log recovery to see your score"}
                </div>
              </div>
            </div>
            <div className="rd-divider" style={{ margin: "0 0 4px" }} />
            <div>
              {subMetrics.map(m => {
                const color = m.pct >= 70 ? "#C8FF00" : m.pct >= 40 ? "#888" : "#FF4757";
                return (
                  <div className="rd-recovery-row" key={m.label}>
                    <span className="rd-recovery-label">{m.label}</span>
                    <div className="rd-recovery-track">
                      <div className="rd-recovery-fill" style={{ width: `${m.pct}%`, background: color }} />
                    </div>
                    <span className="rd-recovery-val">{m.pct}%</span>
                  </div>
                );
              })}
            </div>
            <button className="rd-card-link" onClick={(e) => { e.stopPropagation(); NAV("recovery"); }} tabIndex={0}>
              View Recovery <ArrowRight size={13} />
            </button>
          </div>

          {/* ── Nutrition (span 2) ── */}
          <div className="rd-span-2 rd-card rd-card-click"
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
                <div className="rd-trend" style={{ color: caloriePct > 90 ? "#FF4757" : "#C8FF00" }}>
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
          </div>

          {/* ── Water (span 2) ── */}
          <div className="rd-span-2 rd-card rd-card-click"
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
          </div>

          {/* ── Body Weight (span 1) ── */}
          <div className="rd-span-1 rd-card rd-card-click"
            onClick={() => NAV("bodyweight")} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === "Enter") NAV("bodyweight"); }}>
            <div className="rd-card-head" style={{ marginBottom: 12 }}>
              <div className="rd-card-title-ico"><Scale size={16} /></div>
              <span className="rd-card-link"><ArrowRight size={13} /></span>
            </div>
            <span className="rd-big-metric">{latestWeight}<span> kg</span></span>
            <div className="rd-metric-label">Body Weight</div>
            <div style={{ marginTop: 10 }}>
              <span className={`rd-trend ${weightChange > 0.05 ? "up" : weightChange < -0.05 ? "down" : "flat"}`}>
                {weightChange > 0.05 ? <TrendingUp size={13} /> : weightChange < -0.05 ? <TrendingUp size={13} style={{ transform: "rotate(180deg)" }} /> : null}
                {weightChange !== 0 ? `${weightChange > 0 ? "+" : ""}${fmt(weightChange, 1)} kg` : "No change"}
              </span>
              <div className="rd-metric-label">this week</div>
            </div>
            {sparkData.length >= 2 && (
              <svg width="100%" height="26" viewBox="0 0 100 26" preserveAspectRatio="none" style={{ marginTop: 10, display: "block" }}>
                <polyline
                  points={sparkData.map((w, i) => `${(i / (sparkData.length - 1)) * 100},${26 - ((w - Math.min(...sparkData)) / Math.max(Math.max(...sparkData) - Math.min(...sparkData), 0.1)) * 22 - 2}`).join(" ")}
                  fill="none" stroke="#C8FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
              </svg>
            )}
          </div>

          {/* ── Streak (span 1) ── */}
          <div className="rd-span-1 rd-card rd-card-click"
            onClick={() => NAV("progress")} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === "Enter") NAV("progress"); }}>
            <div className="rd-card-head" style={{ marginBottom: 12 }}>
              <div className="rd-card-title-ico lime"><Flame size={16} /></div>
              <span className="rd-card-link"><ArrowRight size={13} /></span>
            </div>
            <span className="rd-big-metric">{streak}<span> days</span></span>
            <div className="rd-metric-label">Current Streak</div>
            <div className="rd-dots" style={{ marginTop: 14, height: 18 }}>
              {consistency.map((on, i) => (
                <div key={i} className={`rd-dot ${on ? "on" : ""}`} style={{ height: "100%" }} title={on ? "Workout logged" : "Rest day"} />
              ))}
            </div>
            <div className="rd-metric-label" style={{ marginTop: 8 }}>Last 7 days</div>
          </div>

          {/* ── Weekly Overview (span 4) ── */}
          <div className="rd-span-4 rd-card" style={{ padding: 22 }}>
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
                  <span className="rd-legend-item"><span className="rd-legend-dot" style={{ background: "#C8FF00" }} />Workouts</span>
                  <span className="rd-legend-item"><span className="rd-legend-dot" style={{ background: "#4D9FFF" }} />Volume</span>
                  <span className="rd-legend-item"><span className="rd-legend-dot" style={{ background: "#FF9F43" }} />Calories</span>
                </div>
                <ChartFilter value={chartFilter} onChange={setChartFilter} />
              </div>
            </div>
            {hasChartData ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} minTickGap={28} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} width={42} />
                  <YAxis yAxisId="right" orientation="right" allowDecimals={false} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} width={22} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line yAxisId="left" type="monotone" dataKey="workouts" name="Workouts" stroke="#C8FF00" strokeWidth={2} dot={false} activeDot={{ r: 4 }} animationDuration={1000} />
                  <Line yAxisId="left" type="monotone" dataKey="volume" name="Volume" stroke="#4D9FFF" strokeWidth={2} dot={false} activeDot={{ r: 4 }} animationDuration={1000} />
                  <Line yAxisId="right" type="monotone" dataKey="calories" name="Calories" stroke="#FF9F43" strokeWidth={2} dot={false} activeDot={{ r: 4 }} animationDuration={1000} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Activity} title="No activity yet"
                subtitle="Complete workouts or log meals to see your weekly overview" />
            )}
          </div>

          {/* ── Recent Workouts (span 2) ── */}
          <div className="rd-span-2 rd-card">
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
                {recentWorkouts.map(w => {
                  const sets = w.totalSets ?? (w.exercises || []).reduce((s, e) => s + (e.sets?.length || 0), 0);
                  return (
                    <div key={w.id || w.date} className="rd-recent-item" onClick={() => NAV("workout")} role="button" tabIndex={0}
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
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon={Dumbbell} title="No workouts yet"
                subtitle="Start your first workout to see it here"
                action={() => NAV("workout")} actionLabel="Start Workout" />
            )}
          </div>

          {/* ── AI COACH BANNER (span 6) ── */}
          <div className="rd-span-6 rd-ai">
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
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
