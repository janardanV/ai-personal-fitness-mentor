import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  fmt, today, weekAgo, uid, EXERCISE_DB, EXERCISES, GOAL_LABELS, BADGE_DEFS, COLORS,
  calcStreak, calcWeeklyVolume, calcVolume, calcE1RM, ACTIVITY_MULTIPLIERS,
  showToast, showConfirm, useAICoach, MOCK_COACHING, pick
} from "../utils/helpers";
import {
  Sparkles, Dumbbell, Target, TrendingUp, BarChart3, HeartPulse,
  Flame, Droplets, UtensilsCrossed, Activity, ChevronRight,
  Trophy, Bell, Plus, Play, Zap, CheckCircle2, Clock,
  ArrowUp, ArrowDown
} from "lucide-react";

const NAV = (page) => { window.__setPage?.(page); };

const ChartFilter = ({ value, onChange }) => (
  <div style={{ display: "flex", gap: 4 }}>
    {["7D", "30D", "90D"].map(f => (
      <button key={f} className={`dash-filter-btn ${value === f ? "active" : ""}`}
        onClick={() => onChange(f)} tabIndex={0} aria-label={`Filter ${f}`}>{f}</button>
    ))}
  </div>
);

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
      notifs.push({ id: "rem-workout", icon: "", color: "#22C55E", title: "Workout Reminder", desc: "You haven't trained today. Even 20 minutes counts!", time: "Reminder", page: "workout", type: "reminder" });
    }
    if (todayR && todayR.score < 5) {
      notifs.push({ id: "rem-recovery", icon: "", color: "#EF4444", title: "Low Recovery", desc: `Score ${todayR.score}/10 — consider rest or light activity.`, time: "Reminder", page: "recovery", type: "reminder" });
    } else if (!todayR && hour >= 20) {
      notifs.push({ id: "rem-recovery-log", icon: "", color: "#22C55E", title: "Log Recovery", desc: "Don't forget to log your sleep and recovery for today.", time: "Reminder", page: "recovery", type: "reminder" });
    }
    if (waterToday < 4 && hour >= 12) {
      notifs.push({ id: "rem-water", icon: "", color: "#22C55E", title: "Hydration Reminder", desc: `Only ${waterToday} glasses today. Aim for 8+.`, time: "Reminder", page: null, type: "reminder" });
    }
    if (todayCals > (profile?.calories || 2000) * 1.1) {
      notifs.push({ id: "rem-overeat", icon: "", color: "#EF4444", title: "Calorie Over Target", desc: `${todayCals} kcal logged — ${(Math.round((todayCals / (profile?.calories || 2000)) * 100))}% of target.`, time: "Alert", page: "nutrition", type: "reminder" });
    }
    if (todayProt < (profile?.protein || 150) * 0.4 && hour >= 15) {
      notifs.push({ id: "rem-protein", icon: "", color: "#22C55E", title: "Protein Check", desc: `Only ${Math.round(todayProt)}g protein. Target: ${profile?.protein || 150}g.`, time: "Reminder", page: "nutrition", type: "reminder" });
    }

    const recentW = workouts.slice(-3).reverse();
    recentW.forEach(w => notifs.push({
      id: `w-${w.date}`, icon: "", color: "#22C55E",
      title: "Workout Completed", desc: `${w.exercises?.length || 0} exercises · ${Math.round(w.totalVolume)}kg volume`,
      time: w.date, page: "workout", type: "activity",
    }));
    const recentN = nutrition.slice(-2).reverse();
    recentN.forEach(n => notifs.push({
      id: `n-${n.date}`, icon: "", color: "#22C55E",
      title: "Nutrition Logged", desc: `${n.calories || 0} kcal · ${n.protein || 0}g protein`,
      time: n.date, page: "nutrition", type: "activity",
    }));
    const recentR = recovery.slice(-2).reverse();
    recentR.forEach(r => notifs.push({
      id: `r-${r.date}`, icon: "", color: "#22C55E",
      title: "Recovery Logged", desc: `Score: ${r.score}/10 · Sleep: ${r.sleep}h`,
      time: r.date, page: "recovery", type: "activity",
    }));
    const newBadges = badges.slice(-3);
    newBadges.forEach(b => notifs.push({
      id: `b-${b}`, icon: "🏆", color: "#FFD700",
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
        <button onClick={onClose} style={{ background: "none", color: "#A0A0A0", fontSize: 16, padding: 2 }} tabIndex={0} aria-label="Close notifications">✕</button>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: "24px 12px", textAlign: "center", color: "#A0A0A0", fontSize: 13 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔔</div>
          No notifications yet
        </div>
      ) : (
        <div>
          {reminders.length > 0 && (
            <div style={{ padding: "4px 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(160,160,160,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Reminders</div>
              {reminders.map(n => (
                <div key={n.id} className="dash-reminder" onClick={() => { if (n.page) NAV(n.page); onClose(); }}
                  style={{ cursor: n.page ? "pointer" : "default" }} role="button" tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter" && n.page) { NAV(n.page); onClose(); } }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${n.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{n.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#FFFFFF" }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 1 }}>{n.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {achievements.length > 0 && (
            <div style={{ padding: "4px 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(160,160,160,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, marginTop: reminders.length > 0 ? 8 : 0 }}>Achievements</div>
              {achievements.map(n => (
                <div key={n.id} className="dash-reminder" style={{ borderColor: "rgba(255,215,0,0.15)", background: "rgba(255,215,0,0.04)" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,215,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{n.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#FFD700" }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 1 }}>{n.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activities.length > 0 && (
            <div style={{ padding: "4px 8px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(160,160,160,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, marginTop: (reminders.length > 0 || achievements.length > 0) ? 8 : 0 }}>Activity</div>
              {activities.map(n => (
                <div key={n.id} className="dash-notif-item" onClick={() => { if (n.page) NAV(n.page); onClose(); }}
                  style={{ cursor: n.page ? "pointer" : "default" }} role="button" tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter" && n.page) { NAV(n.page); onClose(); } }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${n.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{n.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#FFFFFF" }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 1 }}>{n.desc}</div>
                  </div>
                  <span style={{ fontSize: 10, color: "rgba(160,160,160,0.4)", flexShrink: 0 }}>{n.time}</span>
                </div>
              ))}
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
      <div style={{ fontSize: 12, color: "#A0A0A0" }}>{profile.goal?.replace(/_/g, " ")}</div>
    </div>
    <button className="dash-dropdown-item" onClick={() => { NAV("profile"); onClose(); }} tabIndex={0}>
      <span>👤</span><span>Profile</span>
    </button>
    <button className="dash-dropdown-item" onClick={() => { NAV("profile"); onClose(); }} tabIndex={0}>
      <span>⚙️</span><span>Settings</span>
    </button>
    <div className="dash-dropdown-divider" />
    <button className="dash-dropdown-item danger" onClick={async () => { onClose(); if (await showConfirm("Reset all data? This will permanently delete all workouts, nutrition logs, and progress. This cannot be undone.")) dispatch({ type: "RESET" }); }} tabIndex={0}>
      <span>🚪</span><span>Reset All Data</span>
    </button>
  </div>
);

const EmptyState = ({ icon, title, subtitle, action, actionLabel }) => (
  <div style={{ textAlign: "center", padding: "32px 16px" }}>
    <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.6 }}>{icon}</div>
    <div style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF", marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 13, color: "#A0A0A0", marginBottom: action ? 16 : 0 }}>{subtitle}</div>
    {action && <button className="onb-grad-btn" onClick={action} style={{ width: "auto", padding: "10px 20px", fontSize: 13 }}>{actionLabel}</button>}
  </div>
);

const Dashboard = ({ state, dispatch, page }) => {
  const { profile, workouts, nutrition, recovery, bodyWeight, water, badges, xp, level, currentProgram } = state;
  const { ask, loading: aiLoading } = useAICoach();
  const [aiInsight, setAiInsight] = useState("");
  const [aiQuickTips, setAiQuickTips] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [chartFilter, setChartFilter] = useState("30D");

  const weekVol = calcWeeklyVolume(workouts);
  const streak = calcStreak(workouts);
  const todayNutrition = nutrition.find(n => n.date === today()) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const todayRecovery = recovery.find(r => r.date === today()) || { sleep: 0, quality: 5, stress: 5, score: 0 };
  const latestWeight = bodyWeight.length > 0 ? bodyWeight[bodyWeight.length - 1].weight : profile.weight;
  const weightChange = bodyWeight.length > 1 ? latestWeight - bodyWeight[0].weight : 0;
  const waterLog = (water || {})[today()] || 0;

  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const handler = (e) => { if (notifOpen && !e.target.closest(".dash-notif-panel") && !e.target.closest("[data-notif-btn]")) setNotifOpen(false); if (profileOpen && !e.target.closest(".dash-dropdown") && !e.target.closest("[data-profile-btn]")) setProfileOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen, profileOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") { setNotifOpen(false); setProfileOpen(false); } };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const tips = [];
    if (todayWorkouts.length === 0 && now.getHours() >= 10) {
      tips.push({ icon: "", text: "No workout logged today — aim for at least 30 min of activity.", page: "workout" });
    }
    if (todayNutrition.calories < profile.calories * 0.3 && now.getHours() >= 13) {
      tips.push({ icon: "", text: `Only ${todayNutrition.calories} kcal logged. You need ${Math.max(0, profile.calories - todayNutrition.calories)} more today.`, page: "nutrition" });
    }
    if (todayNutrition.protein < profile.protein * 0.5 && now.getHours() >= 14) {
      tips.push({ icon: "", text: `Protein is low at ${todayNutrition.protein}g. Aim for ${profile.protein}g — add a protein-rich meal.`, page: "nutrition" });
    }
    if (waterLog < 4 && now.getHours() >= 12) {
      tips.push({ icon: "", text: `Only ${waterLog} glasses of water today. Aim for 8+ glasses.`, page: null });
    }
    if (todayRecovery.score && todayRecovery.score < 5) {
      tips.push({ icon: "", text: `Recovery is low (${todayRecovery.score}/10). Consider a lighter session or extra rest.`, page: "recovery" });
    }
    if (streak >= 3) {
      tips.push({ icon: "", text: `${streak}-day streak! Keep the momentum going.`, page: null });
    }
    if (bodyWeight.length >= 2) {
      const last = bodyWeight[bodyWeight.length - 1];
      const prev = bodyWeight[bodyWeight.length - 2];
      const diff = last.weight - prev.weight;
      if (Math.abs(diff) > 0.5) {
        tips.push({ icon: "", text: `Weight ${diff > 0 ? "up" : "down"} ${fmt(Math.abs(diff), 1)}kg since last weigh-in.`, page: "bodyweight" });
      }
    }
    setAiQuickTips(tips.slice(0, 4));
  }, [state, now]);

  const greeting = now.getHours() < 12 ? "Good Morning" : now.getHours() < 17 ? "Good Afternoon" : "Good Evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const quotes = [
    "Consistency beats motivation.",
    "The body achieves what the mind believes.",
    "Discipline is choosing between what you want now and what you want most.",
    "Strength does not come from physical capacity. It comes from an indomitable will.",
    "The only bad workout is the one that didn't happen.",
    "Take care of your body. It's the only place you have to live.",
  ];
  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  const filterDays = chartFilter === "7D" ? 7 : chartFilter === "90D" ? 90 : 30;

  const weightData = useMemo(() =>
    bodyWeight.slice(-filterDays).map(w => ({ date: w.date.slice(5), weight: w.weight })),
    [bodyWeight, filterDays]
  );
  const volumeData = useMemo(() =>
    workouts.slice(-filterDays).map(w => ({ date: w.date.slice(5), volume: Math.round(w.totalVolume) })),
    [workouts, filterDays]
  );
  const recoveryData = useMemo(() =>
    recovery.slice(-filterDays).map(r => ({ date: r.date.slice(5), score: r.score, sleep: r.sleep })),
    [recovery, filterDays]
  );
  const frequencyData = useMemo(() => {
    const data = [];
    for (let i = filterDays - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      data.push({ date: ds.slice(5), workouts: workouts.filter(w => w.date === ds).length });
    }
    return data;
  }, [workouts, filterDays]);

  const caloriePct = Math.min((todayNutrition.calories / Math.max(profile.calories, 1)) * 100, 100);
  const proteinPct = Math.min((todayNutrition.protein / Math.max(profile.protein, 1)) * 100, 100);
  const sleepPct = Math.min((todayRecovery.sleep / 8) * 100, 100);
  const recoveryPct = (todayRecovery.score || 0) * 10;

  const todayWorkouts = workouts.filter(w => w.date === today());
  const workoutMinutes = todayWorkouts.reduce((sum, w) => sum + (w.duration || w.exercises?.length * 8 || 0), 0);

  const muscleGroups = useMemo(() => {
    const recentExercises = workouts.slice(-7).flatMap(w => w.exercises?.map(e => e.name) || []);
    const hasExercise = (names) => names.some(n => recentExercises.some(re => re?.toLowerCase().includes(n.toLowerCase())));
    return [
      { name: "Chest", emoji: "🫁", recovery: hasExercise(["bench", "chest", "push", "dip"]) ? 30 : 100 },
      { name: "Back", emoji: "🔙", recovery: hasExercise(["row", "pull", "deadlift", "lat"]) ? 35 : 100 },
      { name: "Shoulders", emoji: "💪", recovery: hasExercise(["press", "lateral", "shoulder", "ohp"]) ? 25 : 100 },
      { name: "Arms", emoji: "🦾", recovery: hasExercise(["curl", "tricep", "extension"]) ? 40 : 100 },
      { name: "Legs", emoji: "🦵", recovery: hasExercise(["squat", "leg", "lunge", "deadlift"]) ? 20 : 100 },
      { name: "Core", emoji: "🎯", recovery: hasExercise(["plank", "crunch", "sit"]) ? 45 : 100 },
    ];
  }, [workouts]);

  const getInsight = async () => {
    const recent = workouts.slice(-5);
    const avgVolume = recent.length ? recent.reduce((s, w) => s + w.totalVolume, 0) / recent.length : 0;
    const proteinAvg = nutrition.slice(-7).reduce((s, n) => s + (n.protein || 0), 0) / Math.max(nutrition.slice(-7).length, 1);
    const avgSleep = recovery.slice(-7).reduce((s, r) => s + (r.sleep || 0), 0) / Math.max(recovery.slice(-7).length, 1);
    const summary = [
      `User: ${profile.name}, Goal: ${GOAL_LABELS[profile.goal] || profile.goal}, Experience: ${profile.experience || "unknown"}.`,
      `Recent workouts: ${recent.map(w => `${w.date}: ${w.exercises?.map(e => e.name).join(", ")} (vol: ${Math.round(w.totalVolume)}kg)`).join(" | ")}.`,
      `Weekly volume: ${Math.round(weekVol)}kg. Average: ${Math.round(avgVolume)}kg/session.`,
      `Streak: ${streak} days. Total workouts: ${workouts.length}.`,
      `Today: ${todayNutrition.calories}/${profile.calories} kcal, ${todayNutrition.protein}/${profile.protein}g protein.`,
      `7-day avg protein: ${Math.round(proteinAvg)}g. 7-day avg sleep: ${fmt(avgSleep, 1)}h.`,
      `Recovery score: ${todayRecovery.score || "not logged"}/10. Weight: ${latestWeight}kg (started: ${profile.weight}kg).`,
    ].join(" ");
    const text = await ask(
      "You are an elite AI personal trainer. Analyze this data and give 3-4 actionable recommendations. Be specific with numbers. Keep under 150 words.",
      `Review my fitness data: ${summary}`
    );
    if (text) setAiInsight(text);
  };

  const recentActivity = useMemo(() => {
    const items = [];
    workouts.slice(-3).reverse().forEach(w => {
      items.push({ type: "workout", text: `Completed ${w.exercises?.length || 0} exercises`, icon: "", color: "#22C55E", time: w.date, page: "workout" });
    });
    nutrition.slice(-2).reverse().forEach(n => {
      if (n.foods?.length) items.push({ type: "nutrition", text: `Logged ${n.foods.length} meal${n.foods.length > 1 ? "s" : ""}`, icon: "", color: "#22C55E", time: n.date, page: "nutrition" });
    });
    recovery.slice(-2).reverse().forEach(r => {
      items.push({ type: "recovery", text: `Recovery score: ${r.score}/10`, icon: "", color: "#22C55E", time: r.date, page: "recovery" });
    });
    bodyWeight.slice(-2).reverse().forEach(b => {
      items.push({ type: "weight", text: `Weighed ${b.weight}kg`, icon: "", color: "#22C55E", time: b.date, page: "bodyweight" });
    });
    return items.slice(0, 6);
  }, [workouts, nutrition, recovery, bodyWeight]);

  const quickActions = [
    { label: "Start Workout", icon: "", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.06)", page: "workout" },
    { label: "Log Meal", icon: "", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.05)", page: "nutrition" },
    { label: "Add Weight", icon: "", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.06)", page: "bodyweight" },
    { label: "Drink Water", icon: "", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.05)", action: () => { dispatch({ type: "LOG_WATER", payload: { date: today(), amount: 250 } }); showToast("+250ml water logged!"); } },
    { label: "AI Coach", icon: "", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.06)", page: "coach" },
  ];

  const summaryCards = [
    { label: "Calories", value: todayNutrition.calories, target: profile.calories, unit: "kcal", icon: "", color: "#22C55E", pct: caloriePct, page: "nutrition" },
    { label: "Protein", value: todayNutrition.protein, target: profile.protein, unit: "g", icon: "", color: "#22C55E", pct: proteinPct, page: "nutrition" },
    { label: "Workout Time", value: workoutMinutes || 0, target: 60, unit: "min", icon: "", color: "#22C55E", pct: workoutMinutes > 0 ? Math.min((workoutMinutes / 60) * 100, 100) : 0, page: "workout" },
    { label: "Sleep", value: todayRecovery.sleep || 0, target: 8, unit: "hrs", icon: "", color: "#3B82F6", pct: sleepPct, page: "recovery" },
    { label: "Recovery", value: todayRecovery.score || 0, target: 10, unit: "/10", icon: "", color: todayRecovery.score >= 7 ? "#22C55E" : todayRecovery.score >= 5 ? "#22C55E" : "#EF4444", pct: recoveryPct, page: "recovery" },
    { label: "Body Weight", value: latestWeight, target: profile.weight, unit: "kg", icon: "", color: "#22C55E", pct: 100, page: "bodyweight", trend: weightChange !== 0 ? `${weightChange > 0 ? "+" : ""}${fmt(weightChange, 1)}kg` : null, trendColor: weightChange > 0 ? "#EF4444" : "#22C55E" },
    { label: "Water", value: waterLog, target: 8, unit: "glasses", icon: "", color: "#3B82F6", pct: Math.min((waterLog / 8) * 100, 100), page: "nutrition" },
    { label: "Weekly Volume", value: Math.round(weekVol), target: 5000, unit: "kg", icon: "", color: "#22C55E", pct: Math.min((weekVol / 5000) * 100, 100), page: "progress" },
  ];

  const progressBars = [
    { label: "Calories", pct: caloriePct, color: "#22C55E", current: todayNutrition.calories, target: profile.calories },
    { label: "Protein", pct: proteinPct, color: "#22C55E", current: todayNutrition.protein, target: profile.protein },
    { label: "Water", pct: Math.min((waterLog / 8) * 100, 100), color: "#3B82F6", current: waterLog, target: 8, unit: "glasses" },
    { label: "Workout", pct: workoutMinutes > 0 ? Math.min((workoutMinutes / 60) * 100, 100) : 0, color: "#22C55E", current: workoutMinutes || 0, target: 60, unit: "min" },
    { label: "Sleep", pct: sleepPct, color: "#3B82F6", current: todayRecovery.sleep || 0, target: 8, unit: "hrs" },
  ];

  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
  const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
  const itemFade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  const tooltipStyle = { background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#FFFFFF", fontSize: 12 };

  const ac = "#22C55E";
  const cardBase = { background: "#0F0F0F", borderRadius: 16, border: "1px solid rgba(255,255,255,0.04)", padding: "20px 24px" };
  const cardSecondary = { background: "#0E0E0E", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", padding: "16px 18px" };
  const sectionTitle = { fontSize: 12, fontWeight: 600, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 };
  const metricValue = { fontSize: 28, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#FFFFFF", lineHeight: 1 };
  const metricLabel = { fontSize: 11, color: "#A0A0A0", fontWeight: 500 };
  const greenDot = { width: 6, height: 6, borderRadius: "50%", background: ac, flexShrink: 0 };

  const bestVolume = useMemo(() => {
    if (workouts.length === 0) return null;
    return workouts.reduce((best, w) => (w.totalVolume > (best?.totalVolume || 0) ? w : best), workouts[0]);
  }, [workouts]);

  const recoveryScore = Math.round(
    ((calcRecovery?.(state.userProfile?.lastSleep) || 50) / 100) * 0.4 +
    ((calcRecovery?.(state.userProfile?.lastStress) || 50) / 100) * 0.3 +
    0.3
  );

  return (
    <motion.div style={{ maxWidth: 1100, margin: "0 auto" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

      {/* ════════════════════════════════════════════ */}
      {/* HERO SECTION                               */}
      {/* ════════════════════════════════════════════ */}
      <div className="card-primary" style={{
        ...cardBase, padding: "24px 32px", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #0F0F0F 0%, #121212 100%)",
      }}>
        <div style={{
          position: "absolute", top: -80, right: -80, width: 300, height: 300,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <div style={{ flex: 1 }}>
            <motion.div {...fadeUp} style={{ fontSize: 16, fontWeight: 500, color: "#A0A0A0", marginBottom: 4 }}>
              {greeting}
            </motion.div>
            <motion.div {...fadeUp} style={{ fontSize: 24, fontWeight: 700, color: "#FFFFFF", marginBottom: 2 }}>
              {profile.name || "Guest"}
            </motion.div>
            <motion.div {...fadeUp} style={{ fontSize: 14, color: "#707070" }}>
              Ready to move today?
            </motion.div>
            <motion.p {...fadeUp} style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginBottom: 18, fontStyle: "italic" }}>
              "{quote}"
            </motion.p>
            <motion.div {...fadeUp} style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <button className="btn btn-primary" style={{
                background: ac, color: "#0A0A0A", border: "none", borderRadius: 10, padding: "12px 24px",
                fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
              }} onClick={() => {
                if (state.activeSession) { NAV("session"); return; }
                if (currentProgram) {
                  const nextDayIdx = workouts.length > 0 ? (workouts.length % currentProgram.days.length) : 0;
                  const dayToLoad = currentProgram.days[nextDayIdx] || currentProgram.days[0];
                  dispatch({ type: "SET_PENDING_WORKOUT", payload: dayToLoad });
                  NAV("session");
                } else {
                  NAV("workout");
                }
              }} tabIndex={0} aria-label="Start workout">
                <Play size={16} /> Start Workout
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#707070" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Flame size={14} color={ac} /> <span style={{ color: "#FFFFFF", fontWeight: 600 }}>{streak}</span> day streak
                </span>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Trophy size={14} color="#F59E0B" /> Lv.{level}
                </span>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
                <span>{xp} XP</span>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
                <span style={{ color: "#A0A0A0" }}>{dateStr}</span>
              </div>
            </motion.div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", position: "relative", flexShrink: 0 }}>
            <div data-notif-btn style={{
              width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.04)",
              border: `1px solid ${notifOpen ? "rgba(255,255,255,0.26)" : "rgba(255,255,255,0.06)"}`, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", transition: "all 0.2s", position: "relative",
            }} onClick={() => { setNotifOpen(p => !p); setProfileOpen(false); }}
              role="button" tabIndex={0} aria-label="Notifications" aria-expanded={notifOpen}
              onKeyDown={e => { if (e.key === "Enter") { setNotifOpen(p => !p); setProfileOpen(false); } }}>
              <Bell size={16} color="#A0A0A0" />
              {workouts.length + nutrition.length + recovery.length > 0 && (
                <div style={{ position: "absolute", top: 3, right: 3, minWidth: 15, height: 15, borderRadius: "50%", background: ac, border: "2px solid #0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#0A0A0A", padding: "0 2px" }}>
                  {Math.min(workouts.length + nutrition.length + recovery.length, 99)}
                </div>
              )}
            </div>
            {notifOpen && <NotificationPanel workouts={workouts} nutrition={nutrition} recovery={recovery} badges={badges} water={water} profile={profile} onClose={() => setNotifOpen(false)} />}

            <div data-profile-btn style={{
              width: 38, height: 38, borderRadius: 10, background: ac,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#0A0A0A", cursor: "pointer", transition: "all 0.2s",
              border: `2px solid ${profileOpen ? ac : "transparent"}`,
            }} onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); }}
              role="button" tabIndex={0} aria-label="Profile menu" aria-expanded={profileOpen}
              onKeyDown={e => { if (e.key === "Enter") { setProfileOpen(p => !p); setNotifOpen(false); } }}>
              {(profile.name || "U")[0].toUpperCase()}
            </div>
            {profileOpen && <ProfileDropdown profile={profile} dispatch={dispatch} onClose={() => setProfileOpen(false)} />}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* BENTO MAIN GRID                           */}
      {/* ════════════════════════════════════════════ */}
      <div className="bento-grid" style={{
        display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16,
      }}>

        {/* ─── TODAY'S TRAINING (big primary card) ─── */}
        <div className="card-primary bento-primary" style={{
          ...cardBase, display: "flex", flexDirection: "column",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Dumbbell size={20} color={ac} />
            </div>
            <div>
              <div className="section-title" style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF" }}>Today's Training</div>
              <div style={{ fontSize: 11, color: "#707070" }}>{currentProgram ? currentProgram.split?.toUpperCase() || "Active program" : "Quick workout"}</div>
            </div>
            {currentProgram && (
              <div style={{ marginLeft: "auto", fontSize: 10, color: "#707070", background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "4px 8px" }}>
                Day {((workouts.length % (currentProgram.days?.length || 1)) + 1) || 1}/{currentProgram.days?.length || 1}
              </div>
            )}
          </div>

          {/* Daily goals ring */}
          {(() => {
            const goals = [
              { met: todayWorkouts.length > 0, label: "Workout", icon: "", page: "workout" },
              { met: caloriePct >= 80 && caloriePct <= 110, label: "Calories", icon: "", page: "nutrition" },
              { met: proteinPct >= 80, label: "Protein", icon: "", page: "nutrition" },
              { met: waterLog >= 6, label: "Water", icon: "", page: "nutrition" },
            ];
            const metCount = goals.filter(g => g.met).length;
            const gPct = Math.round((metCount / goals.length) * 100);
            const r = 32;
            const circ = 2 * Math.PI * r;
            const dash = (gPct / 100) * circ;
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18, background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <svg width={76} height={76}>
                    <circle cx={38} cy={38} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
                    <circle cx={38} cy={38} r={r} fill="none" stroke={ac} strokeWidth={5}
                      strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 38 38)"
                      style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }} />
                    <text x={38} y={34} textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize={16} fontWeight={700} fontFamily="'JetBrains Mono',monospace">{gPct}%</text>
                    <text x={38} y={50} textAnchor="middle" dominantBaseline="middle" fill="#999999" fontSize={8}>Today</text>
                  </svg>
                </div>
                <div style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap" }}>
                  {goals.map((g, i) => (
                    <div key={i} onClick={() => NAV(g.page)} role="button" tabIndex={0}
                      onKeyDown={e => { if (e.key === "Enter") NAV(g.page); }}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: g.met ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", border: `1px solid ${g.met ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)"}` }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: g.met ? ac : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: g.met ? "#0A0A0A" : "rgba(255,255,255,0.15)", fontWeight: 700, flexShrink: 0 }}>
                        {g.met ? <CheckCircle2 size={12} /> : ""}
                      </div>
                      <span style={{ fontSize: 11, color: "#FFFFFF", fontWeight: 500 }}>{g.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Program / exercises */}
          {currentProgram ? (
            <div style={{ flex: 1 }}>
              {currentProgram.days?.slice(0, 3).map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                      <Dumbbell size={14} color={ac} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: "#FFFFFF", fontWeight: 500 }}>{d.name}</div>
                      <div style={{ fontSize: 11, color: "#707070" }}>{d.exercises?.length || 0} exercises · ~{d.exercises?.length * 8 || 0} min</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "#707070" }}>Day {i + 1}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1 }}>
              <EmptyState icon={<Dumbbell size={36} color="#707070" />} title="No active program" subtitle="Start a program to track your workouts"
                action={() => NAV("programs")} actionLabel="Browse Programs" />
            </div>
          )}

          {/* Workout progress bar */}
          <div style={{ marginTop: "auto", paddingTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#707070" }}>Today's Activity</span>
              <span style={{ fontSize: 11, color: "#A0A0A0", fontFamily: "'JetBrains Mono', monospace" }}>{workoutMinutes} / 60 min</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden" }}>
              <div style={{ width: `${Math.min((workoutMinutes / 60) * 100, 100)}%`, height: "100%", background: `linear-gradient(90deg, ${ac}, ${ac}88)`, borderRadius: 6, transition: "width 1s ease" }} />
            </div>
          </div>

          <button className="btn btn-primary" style={{
            width: "100%", marginTop: 16, padding: "12px", fontSize: 13, borderRadius: 8,
            background: ac, color: "#0A0A0A", fontWeight: 600, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }} onClick={() => {
            if (state.activeSession) { NAV("session"); return; }
            if (currentProgram) {
              const nextDayIdx = workouts.length > 0 ? (workouts.length % currentProgram.days.length) : 0;
              const dayToLoad = currentProgram.days[nextDayIdx] || currentProgram.days[0];
              dispatch({ type: "SET_PENDING_WORKOUT", payload: dayToLoad });
              NAV("session");
            } else {
              NAV("workout");
            }
          }} tabIndex={0} aria-label={currentProgram ? "Resume workout" : "Start workout"}>
            <Play size={16} /> {state.activeSession ? "Continue Workout" : currentProgram ? "Resume Workout" : "Start Workout"}
          </button>
        </div>

        {/* ─── RIGHT COLUMN (stacked) ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* RECOVERY CARD */}
          <div className="card-secondary" style={cardSecondary}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <HeartPulse size={18} color={ac} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.06em" }}>Recovery</span>
              </div>
              <span style={{ fontSize: 11, color: "#707070", cursor: "pointer" }} onClick={() => NAV("recovery")} role="button" tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter") NAV("recovery"); }}>
                Details <ChevronRight size={12} style={{ display: "inline", verticalAlign: "middle" }} />
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 12 }}>
              <div>
                <div className="metric-value" style={{ ...metricValue, fontSize: 36, lineHeight: 1 }}>
                  {todayRecovery.score || "—"}
                </div>
                <div className="metric-label" style={metricLabel}>Readiness Score</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{
                    width: `${recoveryPct}%`, height: "100%",
                    background: `linear-gradient(90deg, ${todayRecovery.score >= 7 ? ac : todayRecovery.score >= 5 ? "#F59E0B" : "#EF4444"}, ${todayRecovery.score >= 7 ? ac : todayRecovery.score >= 5 ? "#F59E0B" : "#EF4444"}88)`,
                    borderRadius: 6, transition: "width 1s ease",
                  }} />
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 10, color: "#707070", marginBottom: 2 }}>Sleep</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#FFFFFF" }}>{todayRecovery.sleep || 0}<span style={{ fontSize: 10, color: "#707070", marginLeft: 2 }}>h</span></div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 10, color: "#707070", marginBottom: 2 }}>Quality</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#FFFFFF" }}>{todayRecovery.quality || 0}<span style={{ fontSize: 10, color: "#707070", marginLeft: 2 }}>/10</span></div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 10, color: "#707070", marginBottom: 2 }}>Stress</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: todayRecovery.stress > 7 ? "#EF4444" : "#FFFFFF" }}>{todayRecovery.stress || 0}<span style={{ fontSize: 10, color: "#707070", marginLeft: 2 }}>/10</span></div>
              </div>
            </div>
          </div>

          {/* NUTRITION CARD */}
          <div className="card-secondary" style={cardSecondary}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <UtensilsCrossed size={16} color={ac} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nutrition</span>
            </div>
            {[
              { label: "Calories", pct: caloriePct, current: todayNutrition.calories, target: profile.calories, color: ac, unit: "kcal" },
              { label: "Protein", pct: proteinPct, current: todayNutrition.protein, target: profile.protein, color: ac, unit: "g" },
              { label: "Water", pct: Math.min((waterLog / 8) * 100, 100), current: waterLog, target: 8, color: "#3B82F6", unit: "glasses" },
            ].map((p, i) => (
              <div key={i} style={{ cursor: "pointer", marginBottom: i < 2 ? 8 : 0 }} onClick={() => NAV("nutrition")} role="button" tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter") NAV("nutrition"); }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#707070", fontWeight: 500 }}>{p.label}</span>
                  <span style={{ fontSize: 11, color: "#FFFFFF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                    {p.current}<span style={{ color: "#707070", fontWeight: 400 }}>/{p.target}</span>
                  </span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${p.pct}%`, height: "100%", background: `linear-gradient(90deg, ${p.color}, ${p.color}66)`, borderRadius: 4, transition: "width 1s ease" }} />
                </div>
              </div>
            ))}
          </div>

          {/* AI INSIGHT SNIPPET */}
          <div className="card-secondary" style={{
            ...cardSecondary, border: "1px solid rgba(34,197,94,0.1)",
            background: "linear-gradient(135deg, rgba(34,197,94,0.03) 0%, #0E0E0E 100%)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Sparkles size={16} color={ac} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.06em" }}>AI Coach</span>
            </div>
            <div style={{ minHeight: 40 }}>
              {aiInsight ? (
                <p style={{ fontSize: 12, lineHeight: 1.7, color: "#A0A0A0" }}>{aiInsight.length > 120 ? aiInsight.slice(0, 120) + "…" : aiInsight}</p>
              ) : aiQuickTips.length > 0 ? (
                <div style={{ fontSize: 12, color: "#A0A0A0", lineHeight: 1.6 }}>
                  {aiQuickTips[0].text}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles size={14} color="#707070" />
                  <span style={{ fontSize: 12, color: "#707070", lineHeight: 1.5 }}>
                    Tap "Get Insight" for personalized AI coaching.
                  </span>
                </div>
              )}
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
              <button className="btn btn-ghost btn-sm" style={{
                fontSize: 11, padding: "6px 12px", borderRadius: 6, background: "rgba(255,255,255,0.04)",
                color: "#A0A0A0", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
              }} onClick={getInsight} disabled={aiLoading} tabIndex={0} aria-label="Get AI insight">
                {aiLoading ? "..." : "Get Insight"}
              </button>
              <button className="btn btn-ghost btn-sm" style={{
                fontSize: 11, padding: "6px 12px", borderRadius: 6, background: "rgba(255,255,255,0.04)",
                color: "#A0A0A0", border: "none", cursor: "pointer",
              }} onClick={() => NAV("coach")} tabIndex={0} aria-label="Open AI Coach">
                Open Coach
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* WEEKLY ACTIVITY (full width chart)         */}
      {/* ════════════════════════════════════════════ */}
      <div className="card" style={{
        ...cardBase, padding: "20px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BarChart3 size={18} color={ac} />
            <span className="section-title" style={{ ...sectionTitle, marginBottom: 0 }}>Weekly Activity</span>
          </div>
          <ChartFilter value={chartFilter} onChange={setChartFilter} />
        </div>
        {frequencyData.some(d => d.workouts > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={frequencyData} barCategoryGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0A0A0" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} workouts`, "Sessions"]} />
              <Bar dataKey="workouts" fill={ac} radius={[4, 4, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={<Activity size={36} color="#707070" />} title="No activity data yet" subtitle="Complete workouts to see your weekly activity" action={() => NAV("workout")} actionLabel="Start Workout" />
        )}
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* BOTTOM 4-COL GRID                          */}
      {/* ════════════════════════════════════════════ */}
      <div className="bento-bottom-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16,
      }}>
        {/* BODY WEIGHT */}
        <div className="card-secondary" style={{ ...cardSecondary, cursor: "pointer" }}
          onClick={() => NAV("bodyweight")} role="button" tabIndex={0}
          onKeyDown={e => { if (e.key === "Enter") NAV("bodyweight"); }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Target size={16} color={ac} />
            </div>
            <span className="metric-label" style={{ fontSize: 11, color: "#A0A0A0", fontWeight: 500 }}>Body Weight</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#FFFFFF", lineHeight: 1 }}>
              {latestWeight}
            </div>
            <span style={{ fontSize: 13, color: "#707070", marginBottom: 2 }}>kg</span>
            {weightChange !== 0 && (
              <span style={{
                fontSize: 11, fontWeight: 600, marginLeft: "auto", marginBottom: 2,
                color: weightChange > 0 ? "#EF4444" : ac, display: "flex", alignItems: "center", gap: 2,
              }}>
                {weightChange > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {fmt(Math.abs(weightChange), 1)}kg
              </span>
            )}
          </div>
          {bodyWeight.length > 1 && (
            <div style={{ marginTop: 8, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                width: `${Math.min(Math.abs(weightChange) / Math.max(latestWeight, 1) * 500, 100)}%`, height: "100%",
                background: weightChange > 0 ? "#EF4444" : ac, borderRadius: 3,
              }} />
            </div>
          )}
        </div>

        {/* STREAK */}
        <div className="card-secondary" style={{ ...cardSecondary }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Flame size={16} color="#F59E0B" />
            </div>
            <span className="metric-label" style={{ fontSize: 11, color: "#A0A0A0", fontWeight: 500 }}>Streak</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#FFFFFF", lineHeight: 1 }}>
              {streak}
            </div>
            <span style={{ fontSize: 13, color: "#707070", marginBottom: 2 }}>days</span>
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
            <span style={{ fontSize: 11, color: "#707070" }}>Lv.{level}</span>
            <span style={{ color: "rgba(255,255,255,0.08)" }}>·</span>
            <span style={{ fontSize: 11, color: "#707070" }}>{xp} XP</span>
          </div>
        </div>

        {/* PERSONAL RECORD */}
        <div className="card-secondary" style={{ ...cardSecondary, cursor: "pointer" }}
          onClick={() => NAV("progress")} role="button" tabIndex={0}
          onKeyDown={e => { if (e.key === "Enter") NAV("progress"); }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,215,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Trophy size={16} color="#FFD700" />
            </div>
            <span className="metric-label" style={{ fontSize: 11, color: "#A0A0A0", fontWeight: 500 }}>Best Volume</span>
          </div>
          {bestVolume ? (
            <>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#FFFFFF", lineHeight: 1 }}>
                  {Math.round(bestVolume.totalVolume)}
                </div>
                <span style={{ fontSize: 13, color: "#707070", marginBottom: 2 }}>kg</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: "#707070" }}>
                {bestVolume.date?.slice(5)}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "#707070" }}>No data yet</div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="card-secondary" style={cardSecondary}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={16} color="#A0A0A0" />
            </div>
            <span className="metric-label" style={{ fontSize: 11, color: "#A0A0A0", fontWeight: 500 }}>Quick Actions</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {quickActions.map((a, i) => (
              <button key={i} className="btn btn-ghost btn-sm" style={{
                fontSize: 11, padding: "6px 12px", borderRadius: 6, background: "rgba(255,255,255,0.04)",
                color: "#A0A0A0", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s",
              }} onClick={() => a.action ? a.action() : NAV(a.page)}
                tabIndex={0} aria-label={a.label}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
                <Zap size={11} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* TODAY'S SUMMARY (metric cards)            */}
      {/* ════════════════════════════════════════════ */}
      <div>
        <div className="section-title" style={sectionTitle}>Today's Summary</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {summaryCards.map((mc, i) => (
            <div key={i} style={{
              ...cardSecondary, cursor: "pointer", transition: "all 0.15s",
            }} onClick={() => NAV(mc.page)} role="button" tabIndex={0}
              aria-label={`${mc.label}: ${mc.value} ${mc.unit}`}
              onKeyDown={e => { if (e.key === "Enter") NAV(mc.page); }}
              onMouseEnter={e => e.currentTarget.style.background = "#121212"}
              onMouseLeave={e => e.currentTarget.style.background = "#0E0E0E"}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "#A0A0A0", fontWeight: 500 }}>{mc.label}</span>
                {mc.trend && (
                  <span style={{ fontSize: 10, color: mc.trendColor, fontWeight: 600, display: "flex", alignItems: "center", gap: 2 }}>
                    {mc.trendColor === "#EF4444" ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    {mc.trend}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#FFFFFF", marginBottom: 2, lineHeight: 1 }}>
                {mc.value}<span style={{ fontSize: 11, fontWeight: 400, color: "#707070", marginLeft: 3 }}>{mc.unit}</span>
              </div>
              <div style={{ marginTop: 8, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${mc.pct}%`, height: "100%", background: `linear-gradient(90deg, ${mc.color}, ${mc.color}88)`, borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 10, color: "rgba(160,160,160,0.4)", marginTop: 4 }}>
                {mc.label === "Body Weight" ? `Target: ${mc.target}kg` : mc.label === "Weekly Volume" ? `Goal: ${mc.target}kg` : `${Math.round(mc.pct)}% of ${mc.target}${mc.unit}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* ANALYTICS CHARTS (2×2)                    */}
      {/* ════════════════════════════════════════════ */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="section-title" style={{ ...sectionTitle, marginBottom: 0 }}>Analytics</div>
          <ChartFilter value={chartFilter} onChange={setChartFilter} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {/* Weight Trend */}
          <div className="card" style={{
            ...cardBase, padding: "16px 18px", cursor: "pointer",
          }} onClick={() => NAV("bodyweight")} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === "Enter") NAV("bodyweight"); }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "#A0A0A0", fontWeight: 500 }}>Weight Trend</span>
            </div>
            {weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={weightData}>
                  <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={ac} stopOpacity={0.25} /><stop offset="95%" stopColor={ac} stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#A0A0A0" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#A0A0A0" }} domain={["auto", "auto"]} axisLine={false} tickLine={false} width={35} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} kg`, "Weight"]} />
                  <Area type="monotone" dataKey="weight" stroke={ac} fill="url(#wg)" strokeWidth={2} dot={false} animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyState icon="⚖️" title="No weight data" subtitle="Log your weight to see trends" action={() => NAV("bodyweight")} actionLabel="Add Weight" />}
          </div>

          {/* Training Volume */}
          <div className="card" style={{
            ...cardBase, padding: "16px 18px", cursor: "pointer",
          }} onClick={() => NAV("workout")} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === "Enter") NAV("workout"); }}>
            <div style={{ fontSize: 12, color: "#A0A0A0", marginBottom: 10, fontWeight: 500 }}>Training Volume</div>
            {volumeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#A0A0A0" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#A0A0A0" }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} kg`, "Volume"]} />
                  <Bar dataKey="volume" fill={ac} radius={[4, 4, 0, 0]} animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState icon="📊" title="No volume data" subtitle="Complete workouts to see volume" action={() => NAV("workout")} actionLabel="Start Workout" />}
          </div>

          {/* Recovery & Sleep */}
          <div className="card" style={{
            ...cardBase, padding: "16px 18px", cursor: "pointer",
          }} onClick={() => NAV("recovery")} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === "Enter") NAV("recovery"); }}>
            <div style={{ fontSize: 12, color: "#A0A0A0", marginBottom: 10, fontWeight: 500 }}>Recovery & Sleep</div>
            {recoveryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={recoveryData}>
                  <defs>
                    <linearGradient id="recG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={ac} stopOpacity={0.3} /><stop offset="95%" stopColor={ac} stopOpacity={0} /></linearGradient>
                    <linearGradient id="sleepG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#A0A0A0" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#A0A0A0" }} domain={[0, 10]} axisLine={false} tickLine={false} width={25} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="score" stroke={ac} fill="url(#recG)" strokeWidth={2} dot={false} name="Score" animationDuration={1200} />
                  <Area type="monotone" dataKey="sleep" stroke="#3B82F6" fill="url(#sleepG)" strokeWidth={2} dot={false} name="Sleep (hrs)" animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyState icon="😴" title="No recovery data" subtitle="Log your recovery to see trends" action={() => NAV("recovery")} actionLabel="Log Recovery" />}
          </div>

          {/* Workout Frequency */}
          <div className="card" style={{
            ...cardBase, padding: "16px 18px", cursor: "pointer",
          }} onClick={() => NAV("progress")} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === "Enter") NAV("progress"); }}>
            <div style={{ fontSize: 12, color: "#A0A0A0", marginBottom: 10, fontWeight: 500 }}>Workout Frequency</div>
            {frequencyData.some(d => d.workouts > 0) ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={frequencyData} barCategoryGap={1}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#A0A0A0" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#A0A0A0" }} allowDecimals={false} axisLine={false} tickLine={false} width={25} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} workouts`, "Sessions"]} />
                  <Bar dataKey="workouts" fill={ac} radius={[4, 4, 0, 0]} animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState icon="🏋️" title="No workouts yet" subtitle="Start training to see frequency" action={() => NAV("workout")} actionLabel="Start Workout" />}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* RECENT ACTIVITY + FULL AI COACH           */}
      {/* ════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recent Activity */}
        <div className="card" style={cardBase}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Activity size={16} color={ac} />
            <span className="section-title" style={{ ...sectionTitle, marginBottom: 0 }}>Recent Activity</span>
          </div>
          {recentActivity.length > 0 ? (
            <div>
              {recentActivity.map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                  cursor: item.page ? "pointer" : "default", borderBottom: i < recentActivity.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }} onClick={() => item.page && NAV(item.page)} role={item.page ? "button" : undefined} tabIndex={item.page ? 0 : undefined}
                  onKeyDown={e => { if (e.key === "Enter" && item.page) NAV(item.page); }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#FFFFFF", fontWeight: 500 }}>{item.text}</div>
                    <div style={{ fontSize: 11, color: "#707070" }}>{item.time}</div>
                  </div>
                  <ChevronRight size={14} color="#707070" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Activity size={32} color="#707070" />} title="No recent activity" subtitle="Start your first workout!"
              action={() => NAV("workout")} actionLabel="Start Workout" />
          )}
        </div>

        {/* Full AI Coach */}
        <div className="card" style={{
          ...cardBase, border: "1px solid rgba(34,197,94,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={18} color={ac} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF" }}>AI Coach</div>
                <div style={{ fontSize: 11, color: "#707070" }}>Personalized fitness intelligence</div>
              </div>
            </div>
            <button className="btn" style={{
              fontSize: 11, padding: "6px 14px", borderRadius: 6, background: ac, color: "#0A0A0A",
              fontWeight: 600, border: "none", cursor: "pointer",
            }} onClick={getInsight} disabled={aiLoading} tabIndex={0} aria-label="Get AI insight">
              {aiLoading ? "..." : "Get AI Insight"}
            </button>
          </div>

          {/* 4 mini metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 12 }}>
            {[
              { label: "Recovery", value: todayRecovery.score || "—", sub: todayRecovery.score ? "/10" : "No data", icon: <HeartPulse size={14} />, page: "recovery" },
              { label: "Best Focus", value: [...muscleGroups].sort((a, b) => b.recovery - a.recovery)[0]?.name || "—", sub: "Most recovered", icon: <Target size={14} /> },
              { label: "Calories Left", value: `${Math.max(0, profile.calories - todayNutrition.calories)}`, sub: "Remaining today", icon: <Flame size={14} />, page: "nutrition" },
              { label: "Hydration", value: `${waterLog}/8`, sub: "Glasses today", icon: <Droplets size={14} />, page: "nutrition" },
            ].map((t, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 8, padding: "10px 12px", cursor: t.page ? "pointer" : "default",
              }} onClick={() => t.page && NAV(t.page)} role={t.page ? "button" : undefined} tabIndex={t.page ? 0 : undefined}
                onKeyDown={e => { if (e.key === "Enter" && t.page) NAV(t.page); }}>
                <div style={{ fontSize: 10, color: "#707070", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  {t.icon}{t.label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: "'JetBrains Mono', monospace" }}>{t.value}</div>
                <div style={{ fontSize: 10, color: "#707070", marginTop: 1 }}>{t.sub}</div>
              </div>
            ))}
          </div>

          {/* Insight area */}
          <div style={{
            background: "rgba(34,197,94,0.03)", border: "1px solid rgba(34,197,94,0.08)",
            borderRadius: 10, padding: "12px 14px", minHeight: 40,
          }}>
            {aiInsight ? (
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "#A0A0A0", whiteSpace: "pre-wrap" }}>{aiInsight}</p>
            ) : aiQuickTips.length > 0 ? (
              <div>
                <div style={{ fontSize: 10, color: "#707070", marginBottom: 6, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>Insights</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {aiQuickTips.map((tip, i) => (
                    <div key={i} style={{
                      cursor: tip.page ? "pointer" : "default", display: "flex", alignItems: "center", gap: 8,
                      padding: "4px 0", fontSize: 12, color: "#A0A0A0", lineHeight: 1.5,
                    }} onClick={() => tip.page && NAV(tip.page)} role={tip.page ? "button" : undefined} tabIndex={tip.page ? 0 : undefined}
                      onKeyDown={e => { if (e.key === "Enter" && tip.page) NAV(tip.page); }}>
                      <Sparkles size={12} color={ac} style={{ flexShrink: 0 }} />
                      <span>{tip.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Sparkles size={18} color="#707070" />
                <div>
                  <div style={{ fontSize: 12, color: "#FFFFFF", fontWeight: 500, marginBottom: 1 }}>Ready to analyze your training</div>
                  <div style={{ fontSize: 11, color: "#707070" }}>Click "Get AI Insight" for a personalized review.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* MUSCLE RECOVERY                           */}
      {/* ════════════════════════════════════════════ */}
      <div className="card" style={cardBase}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <HeartPulse size={16} color={ac} />
          <span className="section-title" style={{ ...sectionTitle, marginBottom: 0 }}>Muscle Recovery</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {muscleGroups.map((mg, i) => {
            const color = mg.recovery > 80 ? ac : mg.recovery > 50 ? ac : "#EF4444";
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{mg.emoji}</span>
                <span style={{ fontSize: 12, color: "#A0A0A0", fontWeight: 500, minWidth: 60 }}>{mg.name}</span>
                <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ width: `${mg.recovery}%`, height: "100%", background: `linear-gradient(90deg, ${color}, ${color}66)`, borderRadius: 6, transition: "width 0.8s ease" }} />
                </div>
                <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color, minWidth: 32, textAlign: "right" }}>{mg.recovery}%</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: "rgba(160,160,160,0.3)" }}>
          Based on exercises performed in the last 7 days. Higher % = more recovered.
        </div>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* ACHIEVEMENTS / BADGES                     */}
      {/* ════════════════════════════════════════════ */}
      <div className="card" style={cardBase}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Trophy size={16} color="#FFD700" />
          <span className="section-title" style={{ ...sectionTitle, marginBottom: 0 }}>Achievements</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
          {BADGE_DEFS.map((b) => {
            const earned = badges.includes(b.id);
            return (
              <div key={b.id} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "14px 8px", borderRadius: 12, background: earned ? "rgba(34,197,94,0.04)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${earned ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)"}`,
                opacity: earned ? 1 : 0.4, cursor: "default", transition: "all 0.2s", position: "relative",
              }}>
                <span style={{ fontSize: 28, filter: earned ? "none" : "grayscale(1)" }}>{b.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 11, color: earned ? ac : "#A0A0A0" }}>{b.label}</span>
                <span style={{ fontSize: 9, color: "rgba(160,160,160,0.5)", textAlign: "center" }}>{b.desc}</span>
                {earned && (
                  <div style={{
                    position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: "50%",
                    background: ac, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <CheckCircle2 size={10} color="#0A0A0A" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </motion.div>
  );
};

export default Dashboard;
