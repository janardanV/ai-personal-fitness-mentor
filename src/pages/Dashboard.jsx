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
      notifs.push({ id: "rem-workout", icon: "🏋️", color: "#C8FF00", title: "Workout Reminder", desc: "You haven't trained today. Even 20 minutes counts!", time: "Reminder", page: "workout", type: "reminder" });
    }
    if (todayR && todayR.score < 5) {
      notifs.push({ id: "rem-recovery", icon: "😴", color: "#FF4757", title: "Low Recovery", desc: `Score ${todayR.score}/10 — consider rest or light activity.`, time: "Reminder", page: "recovery", type: "reminder" });
    } else if (!todayR && hour >= 20) {
      notifs.push({ id: "rem-recovery-log", icon: "😴", color: "#C8FF00", title: "Log Recovery", desc: "Don't forget to log your sleep and recovery for today.", time: "Reminder", page: "recovery", type: "reminder" });
    }
    if (waterToday < 4 && hour >= 12) {
      notifs.push({ id: "rem-water", icon: "💧", color: "#A5E600", title: "Hydration Reminder", desc: `Only ${waterToday} glasses today. Aim for 8+.`, time: "Reminder", page: null, type: "reminder" });
    }
    if (todayCals > (profile?.calories || 2000) * 1.1) {
      notifs.push({ id: "rem-overeat", icon: "🔥", color: "#FF4757", title: "Calorie Over Target", desc: `${todayCals} kcal logged — ${(Math.round((todayCals / (profile?.calories || 2000)) * 100))}% of target.`, time: "Alert", page: "nutrition", type: "reminder" });
    }
    if (todayProt < (profile?.protein || 150) * 0.4 && hour >= 15) {
      notifs.push({ id: "rem-protein", icon: "🥩", color: "#A5E600", title: "Protein Check", desc: `Only ${Math.round(todayProt)}g protein. Target: ${profile?.protein || 150}g.`, time: "Reminder", page: "nutrition", type: "reminder" });
    }

    const recentW = workouts.slice(-3).reverse();
    recentW.forEach(w => notifs.push({
      id: `w-${w.date}`, icon: "🏋️", color: "#C8FF00",
      title: "Workout Completed", desc: `${w.exercises?.length || 0} exercises · ${Math.round(w.totalVolume)}kg volume`,
      time: w.date, page: "workout", type: "activity",
    }));
    const recentN = nutrition.slice(-2).reverse();
    recentN.forEach(n => notifs.push({
      id: `n-${n.date}`, icon: "🥗", color: "#A5E600",
      title: "Nutrition Logged", desc: `${n.calories || 0} kcal · ${n.protein || 0}g protein`,
      time: n.date, page: "nutrition", type: "activity",
    }));
    const recentR = recovery.slice(-2).reverse();
    recentR.forEach(r => notifs.push({
      id: `r-${r.date}`, icon: "😴", color: "#C8FF00",
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
      tips.push({ icon: "🏋️", text: "No workout logged today — aim for at least 30 min of activity.", page: "workout" });
    }
    if (todayNutrition.calories < profile.calories * 0.3 && now.getHours() >= 13) {
      tips.push({ icon: "🔥", text: `Only ${todayNutrition.calories} kcal logged. You need ${Math.max(0, profile.calories - todayNutrition.calories)} more today.`, page: "nutrition" });
    }
    if (todayNutrition.protein < profile.protein * 0.5 && now.getHours() >= 14) {
      tips.push({ icon: "🥩", text: `Protein is low at ${todayNutrition.protein}g. Aim for ${profile.protein}g — add a protein-rich meal.`, page: "nutrition" });
    }
    if (waterLog < 4 && now.getHours() >= 12) {
      tips.push({ icon: "💧", text: `Only ${waterLog} glasses of water today. Aim for 8+ glasses.`, page: null });
    }
    if (todayRecovery.score && todayRecovery.score < 5) {
      tips.push({ icon: "😴", text: `Recovery is low (${todayRecovery.score}/10). Consider a lighter session or extra rest.`, page: "recovery" });
    }
    if (streak >= 3) {
      tips.push({ icon: "🔥", text: `${streak}-day streak! Keep the momentum going.`, page: null });
    }
    if (bodyWeight.length >= 2) {
      const last = bodyWeight[bodyWeight.length - 1];
      const prev = bodyWeight[bodyWeight.length - 2];
      const diff = last.weight - prev.weight;
      if (Math.abs(diff) > 0.5) {
        tips.push({ icon: "⚖️", text: `Weight ${diff > 0 ? "up" : "down"} ${fmt(Math.abs(diff), 1)}kg since last weigh-in.`, page: "bodyweight" });
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
      "You are an elite AI personal trainer. Analyze this data and give 3-4 actionable recommendations. Be specific with numbers. Use emojis. Keep under 150 words.",
      `Review my fitness data: ${summary}`
    );
    if (text) setAiInsight(text);
  };

  const recentActivity = useMemo(() => {
    const items = [];
    workouts.slice(-3).reverse().forEach(w => {
      items.push({ type: "workout", text: `Completed ${w.exercises?.length || 0} exercises`, icon: "🏋️", color: "#C8FF00", time: w.date, page: "workout" });
    });
    nutrition.slice(-2).reverse().forEach(n => {
      if (n.foods?.length) items.push({ type: "nutrition", text: `Logged ${n.foods.length} meal${n.foods.length > 1 ? "s" : ""}`, icon: "🥗", color: "#A5E600", time: n.date, page: "nutrition" });
    });
    recovery.slice(-2).reverse().forEach(r => {
      items.push({ type: "recovery", text: `Recovery score: ${r.score}/10`, icon: "😴", color: "#C8FF00", time: r.date, page: "recovery" });
    });
    bodyWeight.slice(-2).reverse().forEach(b => {
      items.push({ type: "weight", text: `Weighed ${b.weight}kg`, icon: "⚖️", color: "#A5E600", time: b.date, page: "bodyweight" });
    });
    return items.slice(0, 6);
  }, [workouts, nutrition, recovery, bodyWeight]);

  const quickActions = [
    { label: "Start Workout", icon: "🏋️", bg: "rgba(200,255,0,0.1)", border: "rgba(200,255,0,0.15)", page: "workout" },
    { label: "Log Meal", icon: "🥗", bg: "rgba(165,230,0,0.1)", border: "rgba(165,230,0,0.15)", page: "nutrition" },
    { label: "Add Weight", icon: "⚖️", bg: "rgba(200,255,0,0.08)", border: "rgba(200,255,0,0.12)", page: "bodyweight" },
    { label: "Drink Water", icon: "💧", bg: "rgba(165,230,0,0.08)", border: "rgba(165,230,0,0.12)", action: () => { dispatch({ type: "LOG_WATER", payload: { date: today(), amount: 250 } }); showToast("+250ml water logged!"); } },
    { label: "Ask AI Coach", icon: "🤖", bg: "rgba(200,255,0,0.1)", border: "rgba(200,255,0,0.15)", page: "coach" },
  ];

  const summaryCards = [
    { label: "Calories", value: todayNutrition.calories, target: profile.calories, unit: "kcal", icon: "🔥", color: "#C8FF00", pct: caloriePct, page: "nutrition" },
    { label: "Protein", value: todayNutrition.protein, target: profile.protein, unit: "g", icon: "🥩", color: "#A5E600", pct: proteinPct, page: "nutrition" },
    { label: "Workout Time", value: workoutMinutes || 0, target: 60, unit: "min", icon: "⏱️", color: "#C8FF00", pct: workoutMinutes > 0 ? Math.min((workoutMinutes / 60) * 100, 100) : 0, page: "workout" },
    { label: "Sleep", value: todayRecovery.sleep || 0, target: 8, unit: "hrs", icon: "😴", color: "#A5E600", pct: sleepPct, page: "recovery" },
    { label: "Recovery", value: todayRecovery.score || 0, target: 10, unit: "/10", icon: "💚", color: todayRecovery.score >= 7 ? "#A5E600" : todayRecovery.score >= 5 ? "#C8FF00" : "#FF4757", pct: recoveryPct, page: "recovery" },
    { label: "Body Weight", value: latestWeight, target: profile.weight, unit: "kg", icon: "⚖️", color: "#C8FF00", pct: 100, page: "bodyweight", trend: weightChange !== 0 ? `${weightChange > 0 ? "+" : ""}${fmt(weightChange, 1)}kg` : null, trendColor: weightChange > 0 ? "#FF4757" : "#A5E600" },
    { label: "Water", value: waterLog, target: 8, unit: "glasses", icon: "💧", color: "#A5E600", pct: Math.min((waterLog / 8) * 100, 100), page: "nutrition" },
    { label: "Weekly Volume", value: Math.round(weekVol), target: 5000, unit: "kg", icon: "📊", color: "#C8FF00", pct: Math.min((weekVol / 5000) * 100, 100), page: "progress" },
  ];

  const progressBars = [
    { label: "Calories", pct: caloriePct, color: "#C8FF00", current: todayNutrition.calories, target: profile.calories },
    { label: "Protein", pct: proteinPct, color: "#A5E600", current: todayNutrition.protein, target: profile.protein },
    { label: "Water", pct: Math.min((waterLog / 8) * 100, 100), color: "#C8FF00", current: waterLog, target: 8, unit: "glasses" },
    { label: "Workout", pct: workoutMinutes > 0 ? Math.min((workoutMinutes / 60) * 100, 100) : 0, color: "#A5E600", current: workoutMinutes || 0, target: 60, unit: "min" },
    { label: "Sleep", pct: sleepPct, color: "#C8FF00", current: todayRecovery.sleep || 0, target: 8, unit: "hrs" },
  ];

  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
  const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
  const itemFade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  const tooltipStyle = { background: "#1D1D1D", border: "1px solid rgba(200,255,0,0.3)", borderRadius: 10, color: "#FFFFFF", fontSize: 12 };

  return (
    <motion.div style={{ display: "flex", flexDirection: "column", gap: 24 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

      {/* ═══ HEADER ═══ */}
      <div className="dash-header">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <div>
            <motion.h1 {...fadeUp} style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
              {greeting}, <span className="neon">{profile.name}</span> 👋
            </motion.h1>
            <motion.p {...fadeUp} style={{ color: "rgba(160,160,160,0.6)", fontSize: 14, marginBottom: 8 }}>
              "{quote}"
            </motion.p>
            <motion.div {...fadeUp} style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "#A0A0A0", flexWrap: "wrap" }}>
              <span>📅 {dateStr}</span>
              <span>•</span>
              <span>🕐 {timeStr}</span>
              <span>•</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>🔥 <span style={{ color: "#C8FF00", fontWeight: 600 }}>{streak}</span> day streak</span>
              <span>•</span>
              <span>Lv. {level} · {xp} XP</span>
            </motion.div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", position: "relative" }}>
            {/* Notification Bell */}
            <div data-notif-btn style={{
              width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.04)",
              border: `1px solid ${notifOpen ? "rgba(200,255,0,0.3)" : "rgba(255,255,255,0.06)"}`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 16, cursor: "pointer", transition: "all 0.2s", position: "relative",
            }} onClick={() => { setNotifOpen(p => !p); setProfileOpen(false); }}
              role="button" tabIndex={0} aria-label="Notifications" aria-expanded={notifOpen}
              onKeyDown={e => { if (e.key === "Enter") { setNotifOpen(p => !p); setProfileOpen(false); } }}>
              🔔
              {workouts.length + nutrition.length + recovery.length > 0 && (
                <div style={{ position: "absolute", top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8, background: "#C8FF00", border: "2px solid #0B0B0B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#0B0B0B", padding: "0 3px" }}>
                  {Math.min(workouts.length + nutrition.length + recovery.length, 99)}
                </div>
              )}
            </div>
            {notifOpen && <NotificationPanel workouts={workouts} nutrition={nutrition} recovery={recovery} badges={badges} water={water} profile={profile} onClose={() => setNotifOpen(false)} />}

            {/* Profile Avatar */}
            <div data-profile-btn style={{
              width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #C8FF00, #A5E600)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#0B0B0B", cursor: "pointer", transition: "all 0.2s",
              border: `2px solid ${profileOpen ? "#C8FF00" : "transparent"}`,
            }} onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); }}
              role="button" tabIndex={0} aria-label="Profile menu" aria-expanded={profileOpen}
              onKeyDown={e => { if (e.key === "Enter") { setProfileOpen(p => !p); setNotifOpen(false); } }}>
              {(profile.name || "U")[0].toUpperCase()}
            </div>
            {profileOpen && <ProfileDropdown profile={profile} dispatch={dispatch} onClose={() => setProfileOpen(false)} />}
          </div>
        </div>
      </div>

      {/* ═══ QUICK ACTIONS ═══ */}
      <div>
        <div className="dash-section-title"><div className="st-dot" />Quick Actions</div>
        <motion.div className="dash-quick-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }} variants={stagger} initial="initial" animate="animate">
          {quickActions.map((a, i) => (
            <motion.div key={i} className="dash-quick" variants={itemFade} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ background: a.bg, borderColor: a.border }}
              onClick={() => a.action ? a.action() : NAV(a.page)} role="button" tabIndex={0}
              aria-label={a.label}
              onKeyDown={e => { if (e.key === "Enter") a.action ? a.action() : NAV(a.page); }}>
              <div className="q-icon" style={{ background: a.border }}>{a.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>{a.label}</div>
                <div style={{ fontSize: 11, color: "rgba(160,160,160,0.5)" }}>{a.action ? "Tap to add" : "Tap to open"}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ═══ TODAY'S GOAL ═══ */}
      <div className="dash-metric" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          {/* Overall ring */}
          {(() => {
            const goals = [
              { met: todayWorkouts.length > 0, label: "Workout", icon: "🏋️", page: "workout" },
              { met: caloriePct >= 80 && caloriePct <= 110, label: "Calories", icon: "🔥", page: "nutrition" },
              { met: proteinPct >= 80, label: "Protein", icon: "🥩", page: "nutrition" },
              { met: waterLog >= 6, label: "Water", icon: "💧", page: "nutrition" },
            ];
            const metCount = goals.filter(g => g.met).length;
            const pct = Math.round((metCount / goals.length) * 100);
            const r = 42;
            const circ = 2 * Math.PI * r;
            const dash = (pct / 100) * circ;
            return (
              <>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <svg width={100} height={100}>
                    <circle cx={50} cy={50} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
                    <circle cx={50} cy={50} r={r} fill="none" stroke={pct === 100 ? "#A5E600" : "#C8FF00"} strokeWidth={7}
                      strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 50 50)"
                      style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }} />
                    <text x={50} y={46} textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize={20} fontWeight={700} fontFamily="'JetBrains Mono',monospace">{pct}%</text>
                    <text x={50} y={62} textAnchor="middle" dominantBaseline="middle" fill="#A0A0A0" fontSize={10}>Daily Goal</text>
                  </svg>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1 }}>
                  {goals.map((g, i) => (
                    <div key={i} className={`dash-goal-indicator ${g.met ? "met" : ""}`}
                      onClick={() => NAV(g.page)} role="button" tabIndex={0}
                      onKeyDown={e => { if (e.key === "Enter") NAV(g.page); }}
                      style={{ flex: "1 1 120px", minWidth: 120 }}>
                      <span style={{ fontSize: 18 }}>{g.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: "#FFFFFF", fontWeight: 500 }}>{g.label}</div>
                        <div style={{ fontSize: 11, color: g.met ? "#A5E600" : "rgba(160,160,160,0.5)" }}>{g.met ? "Completed" : "Pending"}</div>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: g.met ? "linear-gradient(135deg, #A5E600, #C8FF00)" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: g.met ? "#0B0B0B" : "rgba(160,160,160,0.3)", fontWeight: 700, flexShrink: 0 }}>
                        {g.met ? "✓" : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* ═══ TODAY'S SUMMARY ═══ */}
      <div>
        <div className="dash-section-title"><div className="st-dot" />Today's Summary</div>
        <motion.div className="dash-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} variants={stagger} initial="initial" animate="animate">
          {summaryCards.map((mc, i) => (
            <motion.div key={i} className="dash-metric dash-clickable" variants={itemFade} whileHover={{ y: -2 }} style={{ "--accent": mc.color }}
              onClick={() => NAV(mc.page)} role="button" tabIndex={0}
              aria-label={`${mc.label}: ${mc.value} ${mc.unit}`}
              onKeyDown={e => { if (e.key === "Enter") NAV(mc.page); }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{mc.icon}</span>
                  <span style={{ fontSize: 12, color: "#A0A0A0", fontWeight: 500 }}>{mc.label}</span>
                </div>
                {mc.trend && (
                  <span style={{ fontSize: 11, color: mc.trendColor, fontWeight: 600 }}>{mc.trend}</span>
                )}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#FFFFFF", marginBottom: 4, lineHeight: 1 }}>
                {mc.value}<span style={{ fontSize: 13, fontWeight: 400, color: "#A0A0A0", marginLeft: 4 }}>{mc.unit}</span>
              </div>
              <div className="dash-progress" style={{ marginTop: 12 }}>
                <div className="dash-progress-fill" style={{ width: `${mc.pct}%`, background: `linear-gradient(90deg, ${mc.color}, ${mc.color}88)` }} />
              </div>
              <div style={{ fontSize: 11, color: "rgba(160,160,160,0.5)", marginTop: 6 }}>
                {mc.label === "Body Weight" ? `Target: ${mc.target}kg` : mc.label === "Weekly Volume" ? `Goal: ${mc.target}kg` : `${Math.round(mc.pct)}% of ${mc.target}${mc.unit}`}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ═══ TODAY'S PROGRESS ═══ */}
      <div>
        <div className="dash-section-title"><div className="st-dot" />Today's Progress</div>
        <motion.div className="dash-metric" variants={itemFade}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {progressBars.map((p, i) => (
              <div key={i} style={{ cursor: "pointer" }} onClick={() => {
                if (p.label === "Calories" || p.label === "Protein" || p.label === "Water") NAV("nutrition");
                else if (p.label === "Workout") NAV("workout");
                else if (p.label === "Sleep") NAV("recovery");
              }} role="button" tabIndex={0}
              onKeyDown={e => { if (e.key === "Enter") {
                if (p.label === "Calories" || p.label === "Protein" || p.label === "Water") NAV("nutrition");
                else if (p.label === "Workout") NAV("workout");
                else if (p.label === "Sleep") NAV("recovery");
              } }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "#A0A0A0", fontWeight: 500 }}>{p.label}</span>
                  <span style={{ fontSize: 12, color: "#FFFFFF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{p.current}{p.unit ? ` ${p.unit}` : ""} <span style={{ color: "#A0A0A0", fontWeight: 400 }}>/ {p.target}{p.unit ? ` ${p.unit}` : ""}</span></span>
                </div>
                <div className="dash-progress" style={{ height: 8 }}>
                  <div className="dash-progress-fill" style={{ width: `${p.pct}%`, background: `linear-gradient(90deg, ${p.color}, ${p.color}66)` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══ WORKOUT + RECENT ACTIVITY ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="dash-charts-grid">
        {/* Continue Workout */}
        <motion.div className="dash-upcoming-card" variants={itemFade}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(200,255,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏋️</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF" }}>Continue Workout</div>
              <div style={{ fontSize: 12, color: "rgba(160,160,160,0.6)" }}>Pick up where you left off</div>
            </div>
          </div>
          {currentProgram ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#C8FF00", marginBottom: 8 }}>{currentProgram.split?.toUpperCase() || "Current Program"}</div>
              {currentProgram.days?.slice(0, 3).map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#FFFFFF", fontWeight: 500 }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: "#A0A0A0" }}>{d.exercises?.length || 0} exercises · ~{d.exercises?.length * 8 || 0} min</div>
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(160,160,160,0.4)" }}>Day {i + 1}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="📋" title="No active program" subtitle="Start a program to track your workouts"
              action={() => NAV("programs")} actionLabel="Browse Programs" />
          )}
          <button className="onb-grad-btn" style={{ width: "100%", marginTop: 16, padding: "12px", fontSize: 13, borderRadius: 10 }}
            onClick={() => {
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
            {state.activeSession ? "Continue Workout →" : currentProgram ? "Resume Workout →" : "Start Workout →"}
          </button>
        </motion.div>

        {/* Recent Activity */}
        <motion.div className="dash-metric" variants={itemFade}>
          <div className="dash-section-title"><div className="st-dot" />Recent Activity</div>
          {recentActivity.length > 0 ? (
            <div>
              {recentActivity.map((item, i) => (
                <div key={i} className="dash-timeline-item" style={{ cursor: item.page ? "pointer" : "default" }}
                  onClick={() => item.page && NAV(item.page)} role={item.page ? "button" : undefined} tabIndex={item.page ? 0 : undefined}
                  onKeyDown={e => { if (e.key === "Enter" && item.page) NAV(item.page); }}>
                  <div className="dash-activity-dot" style={{ background: item.color, borderColor: item.color }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#FFFFFF", fontWeight: 500 }}>{item.text}</div>
                    <div style={{ fontSize: 11, color: "rgba(160,160,160,0.4)" }}>{item.time}</div>
                  </div>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="📝" title="No recent activity" subtitle="Start your first workout!"
              action={() => NAV("workout")} actionLabel="Start Workout" />
          )}
        </motion.div>
      </div>

      {/* ═══ AI COACH ═══ */}
      <div className="dash-ai-card">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, rgba(200,255,0,0.15), rgba(165,230,0,0.1))",
                border: "1px solid rgba(200,255,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                animation: "glowPulse 3s ease infinite",
              }}>🤖</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF" }}>AI Coach</div>
                <div style={{ fontSize: 13, color: "rgba(160,160,160,0.6)" }}>Your personalized fitness intelligence</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="onb-grad-btn" onClick={getInsight} disabled={aiLoading} style={{ width: "auto", padding: "12px 24px", fontSize: 13 }}
                tabIndex={0} aria-label="Get AI insight">
                {aiLoading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(11,11,11,0.3)", borderTopColor: "#0B0B0B", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                    Analyzing…
                  </span>
                ) : "Get AI Insight ⚡"}
              </button>
              <button className="ghost-btn" onClick={() => NAV("coach")} tabIndex={0} aria-label="Open AI Coach"
                style={{ fontSize: 13, padding: "12px 16px", borderRadius: 10 }}>
                Open Coach →
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }} className="dash-metrics-grid">
            {[
              { label: "Recovery Score", value: todayRecovery.score || "—", sub: todayRecovery.score ? "/10" : "No data", icon: "💚", page: "recovery" },
              { label: "Suggested Focus", value: [...muscleGroups].sort((a, b) => b.recovery - a.recovery)[0]?.name || "—", sub: "Most recovered", icon: "🎯" },
              { label: "Calories Left", value: `${Math.max(0, profile.calories - todayNutrition.calories)}`, sub: "Remaining today", icon: "🥗", page: "nutrition" },
              { label: "Hydration", value: `${waterLog}/8`, sub: "Glasses today", icon: "💧", page: "nutrition" },
            ].map((t, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 12, padding: "14px 16px", cursor: t.page ? "pointer" : "default",
                transition: "border-color 0.2s",
              }} onClick={() => t.page && NAV(t.page)} role={t.page ? "button" : undefined} tabIndex={t.page ? 0 : undefined}
                onKeyDown={e => { if (e.key === "Enter" && t.page) NAV(t.page); }}>
                <div style={{ fontSize: 11, color: "rgba(160,160,160,0.5)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{t.icon}</span>{t.label}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", fontFamily: "'JetBrains Mono', monospace" }}>{t.value}</div>
                <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 2 }}>{t.sub}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: "rgba(200,255,0,0.04)", border: "1px solid rgba(200,255,0,0.08)",
            borderRadius: 14, padding: "18px 20px", minHeight: 60,
          }}>
            {aiInsight ? (
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "#FFFFFF", whiteSpace: "pre-wrap" }}>{aiInsight}</p>
            ) : aiQuickTips.length > 0 ? (
              <div>
                <div style={{ fontSize: 12, color: "rgba(160,160,160,0.5)", marginBottom: 10, fontWeight: 500 }}>Personalized Insights</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {aiQuickTips.map((tip, i) => (
                    <div key={i} className="dash-tip-chip" style={{ cursor: tip.page ? "pointer" : "default", width: "100%" }}
                      onClick={() => tip.page && NAV(tip.page)} role={tip.page ? "button" : undefined} tabIndex={tip.page ? 0 : undefined}
                      onKeyDown={e => { if (e.key === "Enter" && tip.page) NAV(tip.page); }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{tip.icon}</span>
                      <span style={{ lineHeight: 1.5 }}>{tip.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 20, opacity: 0.5 }}>💬</div>
                <div>
                  <div style={{ fontSize: 13, color: "#FFFFFF", fontWeight: 500, marginBottom: 2 }}>Ready to analyze your training</div>
                  <div style={{ fontSize: 12, color: "rgba(160,160,160,0.5)" }}>Click "Get AI Insight" for a personalized review based on your workouts, nutrition, and recovery data.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ CHARTS ═══ */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="dash-section-title" style={{ marginBottom: 0 }}><div className="st-dot" />Analytics</div>
          <ChartFilter value={chartFilter} onChange={setChartFilter} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="dash-charts-grid">
          <motion.div className="dash-metric" variants={itemFade} style={{ cursor: "pointer" }} onClick={() => NAV("bodyweight")}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "#A0A0A0", fontWeight: 500 }}>Weight Trend</span>
              <ChartFilter value={chartFilter} onChange={setChartFilter} />
            </div>
            {weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={weightData}>
                  <defs><linearGradient id="wg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C8FF00" stopOpacity={0.25} /><stop offset="95%" stopColor="#C8FF00" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0A0A0" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} domain={["auto", "auto"]} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} kg`, "Weight"]} />
                  <Area type="monotone" dataKey="weight" stroke="#C8FF00" fill="url(#wg2)" strokeWidth={2} dot={false} animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyState icon="⚖️" title="No weight data" subtitle="Log your weight to see trends" action={() => NAV("bodyweight")} actionLabel="Add Weight" />}
          </motion.div>

          <motion.div className="dash-metric" variants={itemFade} style={{ cursor: "pointer" }} onClick={() => NAV("workout")}>
            <div style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 12, fontWeight: 500 }}>Training Volume</div>
            {volumeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0A0A0" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} kg`, "Volume"]} />
                  <Bar dataKey="volume" fill="#C8FF00" radius={[6, 6, 0, 0]} animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState icon="📊" title="No volume data" subtitle="Complete workouts to see volume" action={() => NAV("workout")} actionLabel="Start Workout" />}
          </motion.div>

          <motion.div className="dash-metric" variants={itemFade} style={{ cursor: "pointer" }} onClick={() => NAV("recovery")}>
            <div style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 12, fontWeight: 500 }}>Recovery & Sleep</div>
            {recoveryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={recoveryData}>
                  <defs>
                    <linearGradient id="recG2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#A5E600" stopOpacity={0.3} /><stop offset="95%" stopColor="#A5E600" stopOpacity={0} /></linearGradient>
                    <linearGradient id="sleepG2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C8FF00" stopOpacity={0.2} /><stop offset="95%" stopColor="#C8FF00" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0A0A0" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} domain={[0, 10]} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="score" stroke="#A5E600" fill="url(#recG2)" strokeWidth={2} dot={false} name="Score" animationDuration={1200} />
                  <Area type="monotone" dataKey="sleep" stroke="#C8FF00" fill="url(#sleepG2)" strokeWidth={2} dot={false} name="Sleep (hrs)" animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyState icon="😴" title="No recovery data" subtitle="Log your recovery to see trends" action={() => NAV("recovery")} actionLabel="Log Recovery" />}
          </motion.div>

          <motion.div className="dash-metric" variants={itemFade} style={{ cursor: "pointer" }} onClick={() => NAV("progress")}>
            <div style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 12, fontWeight: 500 }}>Workout Frequency</div>
            {frequencyData.some(d => d.workouts > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={frequencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0A0A0" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#A0A0A0" }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} workouts`, "Sessions"]} />
                  <Bar dataKey="workouts" fill="#A5E600" radius={[6, 6, 0, 0]} animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState icon="🏋️" title="No workouts yet" subtitle="Start training to see frequency" action={() => NAV("workout")} actionLabel="Start Workout" />}
          </motion.div>
        </div>
      </div>

      {/* ═══ MUSCLE RECOVERY ═══ */}
      <div>
        <div className="dash-section-title"><div className="st-dot" />Muscle Recovery</div>
        <motion.div className="dash-metric" variants={itemFade}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {muscleGroups.map((mg, i) => {
              const color = mg.recovery > 80 ? "#A5E600" : mg.recovery > 50 ? "#C8FF00" : "#FF4757";
              return (
                <div key={i}>
                  <div className="dash-recovery-bar">
                    <span style={{ fontSize: 18 }}>{mg.emoji}</span>
                    <span className="dash-recovery-label">{mg.name}</span>
                    <div className="dash-recovery-track">
                      <div className="dash-recovery-fill" style={{ width: `${mg.recovery}%`, background: `linear-gradient(90deg, ${color}, ${color}66)` }} />
                    </div>
                    <span className="dash-recovery-val" style={{ color }}>{mg.recovery}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: "rgba(160,160,160,0.4)" }}>
            Based on exercises performed in the last 7 days. Higher % = more recovered.
          </div>
        </motion.div>
      </div>

      {/* ═══ ACHIEVEMENTS ═══ */}
      <div>
        <div className="dash-section-title"><div className="st-dot" />Achievements</div>
        <motion.div className="dash-badge-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }} variants={stagger} initial="initial" animate="animate">
          {BADGE_DEFS.map((b) => {
            const earned = badges.includes(b.id);
            return (
              <motion.div key={b.id} className={`dash-badge ${earned ? "earned" : ""}`} variants={itemFade}
                whileHover={{ scale: 1.05, y: -2 }} style={{ position: "relative", opacity: earned ? 1 : 0.4 }}>
                <div className="badge-glow" />
                <span style={{ fontSize: 28, filter: earned ? "none" : "grayscale(1)", position: "relative", zIndex: 1 }}>{b.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 12, color: earned ? "#C8FF00" : "#A0A0A0", position: "relative", zIndex: 1 }}>{b.label}</span>
                <span style={{ fontSize: 10, color: "rgba(160,160,160,0.5)", position: "relative", zIndex: 1 }}>{b.desc}</span>
                {earned && (
                  <div style={{
                    position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: "50%",
                    background: "linear-gradient(135deg, #C8FF00, #A5E600)", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 10, color: "#0B0B0B", fontWeight: 700,
                  }}>✓</div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

    </motion.div>
  );
};

export default Dashboard;
