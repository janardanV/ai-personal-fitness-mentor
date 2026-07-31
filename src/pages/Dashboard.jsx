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
import { Bell, Dumbbell, Moon, Flame, Apple, Scale, Droplet, Bot, Target, BarChart3, Activity, TrendingUp, Trophy, Heart, Check, Plus, ChevronRight, MoreHorizontal, User, Calendar, Clock, Zap, Award, Sparkles } from "lucide-react";

const NAV = (page) => { window.__setPage?.(page); };

const ChartFilter = ({ value, onChange }) => (
  <div style={{ display: "flex", gap: 4 }}>
    {["7D", "30D", "90D"].map(f => (
      <button key={f} className={`bento-filter-btn ${value === f ? "active" : ""}`}
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
      notifs.push({ id: "rem-workout", icon: Dumbbell, color: "#C8FF00", title: "Workout Reminder", desc: "You haven't trained today. Even 20 minutes counts!", time: "Reminder", page: "workout", type: "reminder" });
    }
    if (todayR && todayR.score < 5) {
      notifs.push({ id: "rem-recovery", icon: Moon, color: "#FF4757", title: "Low Recovery", desc: `Score ${todayR.score}/10 — consider rest or light activity.`, time: "Reminder", page: "recovery", type: "reminder" });
    } else if (!todayR && hour >= 20) {
      notifs.push({ id: "rem-recovery-log", icon: Moon, color: "#C8FF00", title: "Log Recovery", desc: "Don't forget to log your sleep and recovery for today.", time: "Reminder", page: "recovery", type: "reminder" });
    }
    if (waterToday < 4 && hour >= 12) {
      notifs.push({ id: "rem-water", icon: Droplet, color: "#5B9BD5", title: "Hydration Reminder", desc: `Only ${waterToday} glasses today. Aim for 8+.`, time: "Reminder", page: null, type: "reminder" });
    }
    if (todayCals > (profile?.calories || 2000) * 1.1) {
      notifs.push({ id: "rem-overeat", icon: Flame, color: "#FF4757", title: "Calorie Over Target", desc: `${todayCals} kcal logged — ${(Math.round((todayCals / (profile?.calories || 2000)) * 100))}% of target.`, time: "Alert", page: "nutrition", type: "reminder" });
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
      <div style={{ fontSize: 12, color: "#A0A0A0" }}>{profile.goal?.replace(/_/g, " ")}</div>
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
  <div style={{ textAlign: "center", padding: "24px 16px" }}>
    <div style={{ marginBottom: 12, opacity: 0.3 }}>{Icon && <Icon size={32} color="#666" />}</div>
    <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF", marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 12, color: "#666", marginBottom: action ? 16 : 0 }}>{subtitle}</div>
    {action && <button className="bento-btn bento-btn-primary" onClick={action} style={{ padding: "10px 20px", fontSize: 13 }}>{actionLabel}</button>}
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
    const todayWorkouts = workouts.filter(w => w.date === today());
    if (todayWorkouts.length === 0 && now.getHours() >= 10) {
      tips.push({ icon: Dumbbell, text: "No workout logged today — aim for at least 30 min of activity.", page: "workout" });
    }
    if (todayNutrition.calories < profile.calories * 0.3 && now.getHours() >= 13) {
      tips.push({ icon: Flame, text: `Only ${todayNutrition.calories} kcal logged. You need ${Math.max(0, profile.calories - todayNutrition.calories)} more today.`, page: "nutrition" });
    }
    if (todayNutrition.protein < profile.protein * 0.5 && now.getHours() >= 14) {
      tips.push({ icon: Apple, text: `Protein is low at ${todayNutrition.protein}g. Aim for ${profile.protein}g — add a protein-rich meal.`, page: "nutrition" });
    }
    if (waterLog < 4 && now.getHours() >= 12) {
      tips.push({ icon: Droplet, text: `Only ${waterLog} glasses of water today. Aim for 8+ glasses.`, page: null });
    }
    if (todayRecovery.score && todayRecovery.score < 5) {
      tips.push({ icon: Moon, text: `Recovery is low (${todayRecovery.score}/10). Consider a lighter session or extra rest.`, page: "recovery" });
    }
    if (streak >= 3) {
      tips.push({ icon: Flame, text: `${streak}-day streak! Keep the momentum going.`, page: null });
    }
    if (bodyWeight.length >= 2) {
      const last = bodyWeight[bodyWeight.length - 1];
      const prev = bodyWeight[bodyWeight.length - 2];
      const diff = last.weight - prev.weight;
      if (Math.abs(diff) > 0.5) {
        tips.push({ icon: Scale, text: `Weight ${diff > 0 ? "up" : "down"} ${fmt(Math.abs(diff), 1)}kg since last weigh-in.`, page: "bodyweight" });
      }
    }
    setAiQuickTips(tips.slice(0, 4));
  }, [state, now]);

  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const filterDays = chartFilter === "7D" ? 7 : chartFilter === "90D" ? 90 : 30;

  const weightData = useMemo(() =>
    bodyWeight.slice(-filterDays).map(w => ({ date: w.date.slice(5), weight: w.weight })),
    [bodyWeight, filterDays]
  );
  const volumeData = useMemo(() =>
    workouts.slice(-filterDays).map(w => ({ date: w.date.slice(5), volume: Math.round(w.totalVolume) })),
    [workouts, filterDays]
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
      { name: "Chest", icon: "chest", recovery: hasExercise(["bench", "chest", "push", "dip"]) ? 30 : 100 },
      { name: "Back", icon: "back", recovery: hasExercise(["row", "pull", "deadlift", "lat"]) ? 35 : 100 },
      { name: "Shoulders", icon: "shoulders", recovery: hasExercise(["press", "lateral", "shoulder", "ohp"]) ? 25 : 100 },
      { name: "Arms", icon: "arms", recovery: hasExercise(["curl", "tricep", "extension"]) ? 40 : 100 },
      { name: "Legs", icon: "legs", recovery: hasExercise(["squat", "leg", "lunge", "deadlift"]) ? 20 : 100 },
      { name: "Core", icon: "core", recovery: hasExercise(["plank", "crunch", "sit"]) ? 45 : 100 },
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
      items.push({ type: "workout", text: `Completed ${w.exercises?.length || 0} exercises · ${Math.round(w.totalVolume)}kg`, icon: Dumbbell, color: "#C8FF00", time: w.date, page: "workout" });
    });
    nutrition.slice(-2).reverse().forEach(n => {
      if (n.foods?.length) items.push({ type: "nutrition", text: `Logged ${n.foods.length} meal${n.foods.length > 1 ? "s" : ""} · ${n.calories || 0} kcal`, icon: Apple, color: "#C8FF00", time: n.date, page: "nutrition" });
    });
    recovery.slice(-2).reverse().forEach(r => {
      items.push({ type: "recovery", text: `Recovery: ${r.score}/10 · ${r.sleep}h sleep`, icon: Moon, color: "#C8FF00", time: r.date, page: "recovery" });
    });
    bodyWeight.slice(-2).reverse().forEach(b => {
      items.push({ type: "weight", text: `Weighed ${b.weight}kg`, icon: Scale, color: "#C8FF00", time: b.date, page: "bodyweight" });
    });
    return items.slice(0, 6);
  }, [workouts, nutrition, recovery, bodyWeight]);

  const tooltipStyle = { background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "#FFFFFF", fontSize: 12, padding: "10px 14px" };

  const r = 34;
  const circ = 2 * Math.PI * r;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

      {/* ═══ HEADER ═══ */}
      <div className="bento-header" style={{ marginBottom: 24 }}>
        <div className="bento-header-left">
          <div>
            <div className="bento-greeting">{greeting}, {profile.name}</div>
            <div className="bento-greeting-sub">
              <Calendar size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle", opacity: 0.4 }} />
              {dateStr}
            </div>
          </div>
        </div>
        <div className="bento-header-actions">
          <div data-notif-btn className="bento-icon-btn"
            onClick={() => { setNotifOpen(p => !p); setProfileOpen(false); }}
            role="button" tabIndex={0} aria-label="Notifications" aria-expanded={notifOpen}
            onKeyDown={e => { if (e.key === "Enter") { setNotifOpen(p => !p); setProfileOpen(false); } }}
            style={{ borderColor: notifOpen ? "rgba(200,255,0,0.2)" : undefined, color: notifOpen ? "#C8FF00" : undefined }}>
            <Bell size={16} />
            {(workouts.length + nutrition.length + recovery.length) > 0 && (
              <div style={{ position: "absolute", top: 3, right: 3, minWidth: 14, height: 14, borderRadius: 7, background: "#C8FF00", border: "2px solid #0B0B0B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#0B0B0B", padding: "0 3px" }}>
                {Math.min(workouts.length + nutrition.length + recovery.length, 99)}
              </div>
            )}
          </div>
          {notifOpen && <NotificationPanel workouts={workouts} nutrition={nutrition} recovery={recovery} badges={badges} water={water} profile={profile} onClose={() => setNotifOpen(false)} />}
          <div data-profile-btn className="bento-avatar"
            onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); }}
            role="button" tabIndex={0} aria-label="Profile menu" aria-expanded={profileOpen}
            onKeyDown={e => { if (e.key === "Enter") { setProfileOpen(p => !p); setNotifOpen(false); } }}>
            {(profile.name || "U")[0].toUpperCase()}
          </div>
          {profileOpen && <ProfileDropdown profile={profile} dispatch={dispatch} onClose={() => setProfileOpen(false)} />}
        </div>
      </div>

      {/* ═══ BENTO GRID ═══ */}
      <div className="bento-grid">

        {/* ── HERO: Today's Workout (span 2) ── */}
        <div className="bento-span-2 bento-card-hero">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20, position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(200,255,0,0.1)", border: "1px solid rgba(200,255,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Dumbbell size={20} color="#C8FF00" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>Today's Workout</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                  {todayWorkouts.length > 0
                    ? `${todayWorkouts.length} session${todayWorkouts.length > 1 ? "s" : ""} completed · ${workoutMinutes} min`
                    : "No session logged yet today"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="bento-badge">
                <Zap size={12} style={{ marginRight: 3 }} />
                Lv.{level}
              </span>
              <span className="bento-badge">
                <Flame size={12} style={{ marginRight: 3, color: "#C8FF00" }} />
                {streak} day streak
              </span>
            </div>
          </div>

          {currentProgram ? (
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#C8FF00", marginBottom: 12, letterSpacing: "0.03em", textTransform: "uppercase" }}>
                {currentProgram.name || "Current Program"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {currentProgram.days?.slice(0, 3).map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 10, background: i === 0 ? "rgba(200,255,0,0.04)" : "transparent", border: i === 0 ? "1px solid rgba(200,255,0,0.08)" : "1px solid transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: i === 0 ? "rgba(200,255,0,0.12)" : "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: i === 0 ? "#C8FF00" : "#555" }}>{i + 1}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? "#FFFFFF" : "#A0A0A0" }}>{d.name}</div>
                        <div style={{ fontSize: 11, color: "#555" }}>{d.exercises?.length || 0} exercises · ~{d.exercises?.length * 8 || 0} min</div>
                      </div>
                    </div>
                    {i === 0 && <span style={{ fontSize: 11, color: "#C8FF00", fontWeight: 500 }}>NEXT</span>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState icon={Dumbbell} title="No active program" subtitle="Start a program to track your workouts"
              action={() => NAV("programs")} actionLabel="Browse Programs" />
          )}

          <button className="bento-btn bento-btn-primary" style={{ width: "100%", marginTop: 16, padding: "12px 20px", justifyContent: "center", fontSize: 14, position: "relative", zIndex: 1 }}
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
            {state.activeSession ? "Continue Workout" : currentProgram ? "Resume Workout" : "Start Workout"}
            <ChevronRight size={16} />
          </button>
        </div>

        {/* ── RECOVERY ── */}
        <div className="bento-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 20px", cursor: "pointer" }}
          onClick={() => NAV("recovery")} role="button" tabIndex={0}
          onKeyDown={e => { if (e.key === "Enter") NAV("recovery"); }}>
          <div className="bento-ring" style={{ width: 100, height: 100 }}>
            <svg width={100} height={100} viewBox="0 0 100 100">
              <circle className="bento-ring-bg" cx={50} cy={50} r={r} strokeWidth={5} />
              <circle className="bento-ring-fg" cx={50} cy={50} r={r} strokeWidth={5}
                stroke={recoveryPct >= 70 ? "#C8FF00" : recoveryPct >= 40 ? "#A0A0A0" : "#FF4757"}
                strokeDasharray={`${(recoveryPct / 100) * circ} ${circ}`} />
            </svg>
            <div className="bento-ring-value" style={{ fontSize: 22 }}>{todayRecovery.score || "—"}</div>
            <div className="bento-ring-label" style={{ fontSize: 10 }}>Recovery</div>
          </div>
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>Readiness</div>
            <div style={{ fontSize: 13, color: recoveryPct >= 70 ? "#C8FF00" : recoveryPct >= 40 ? "#A0A0A0" : "#FF4757", marginTop: 2, fontWeight: 600 }}>
              {recoveryPct >= 70 ? "Ready to train" : recoveryPct >= 40 ? "Moderate recovery" : "Need rest"}
            </div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Moon size={11} /> {todayRecovery.sleep || 0}h sleep
            </div>
          </div>
        </div>

        {/* ── STREAK / XP ── */}
        <div className="bento-card" style={{ padding: "28px 20px", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center" }}
          onClick={() => NAV("progress")} role="button" tabIndex={0}
          onKeyDown={e => { if (e.key === "Enter") NAV("progress"); }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div className="bento-stat-icon" style={{ background: "rgba(200,255,0,0.1)" }}>
              <Flame size={18} color="#C8FF00" />
            </div>
            <div>
              <div className="bento-stat-value" style={{ fontSize: 28 }}>{streak}</div>
              <div className="bento-stat-label">Day streak</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(200,255,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={16} color="#C8FF00" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>Level {level}</div>
              <div style={{ fontSize: 11, color: "#555" }}>{xp} XP</div>
            </div>
            <div className="bento-progress" style={{ flex: 1, marginTop: 0 }}>
              <div className="bento-progress-fill" style={{ width: `${Math.min((xp % 100) / 100 * 100, 100)}%`, background: "#C8FF00" }} />
            </div>
          </div>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#555" }}>
            <Activity size={11} /> {workouts.length} total workouts
          </div>
        </div>

        {/* ── NUTRITION / MACROS (span 2) ── */}
        <div className="bento-span-2 bento-card" style={{ cursor: "pointer" }}
          onClick={() => NAV("nutrition")} role="button" tabIndex={0}
          onKeyDown={e => { if (e.key === "Enter") NAV("nutrition"); }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="bento-stat-icon" style={{ background: "rgba(200,255,0,0.1)", marginBottom: 0 }}>
                <Apple size={18} color="#C8FF00" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF" }}>Nutrition</span>
            </div>
            <span style={{ fontSize: 12, color: "#666" }}>
              {Math.round(todayNutrition.calories)} / {profile.calories} kcal
            </span>
          </div>

          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <div className="bento-ring" style={{ width: 72, height: 72 }}>
              <svg width={72} height={72} viewBox="0 0 72 72">
                <circle className="bento-ring-bg" cx={36} cy={36} r={28} strokeWidth={4} />
                <circle className="bento-ring-fg" cx={36} cy={36} r={28} strokeWidth={4}
                  stroke="#C8FF00" strokeDasharray={`${(caloriePct / 100) * (2 * Math.PI * 28)} ${2 * Math.PI * 28}`} />
              </svg>
              <div className="bento-ring-value" style={{ fontSize: 16 }}>{Math.round(caloriePct)}%</div>
              <div className="bento-ring-label" style={{ fontSize: 8 }}>kcal</div>
            </div>

            <div style={{ flex: 1 }}>
              <div className="bento-macro-row">
                <span className="bento-macro-label">Protein</span>
                <div className="bento-macro-bar">
                  <div className="bento-macro-fill" style={{ width: `${proteinPct}%`, background: "#C8FF00" }} />
                </div>
                <span className="bento-macro-value">{Math.round(todayNutrition.protein)} / {profile.protein}g</span>
              </div>
              <div className="bento-macro-row">
                <span className="bento-macro-label">Carbs</span>
                <div className="bento-macro-bar">
                  <div className="bento-macro-fill" style={{ width: `${Math.min((todayNutrition.carbs || 0) / Math.max(profile.calories * 0.05, 1) * 100, 100)}%`, background: "#888" }} />
                </div>
                <span className="bento-macro-value">{Math.round(todayNutrition.carbs || 0)}g</span>
              </div>
              <div className="bento-macro-row">
                <span className="bento-macro-label">Fat</span>
                <div className="bento-macro-bar">
                  <div className="bento-macro-fill" style={{ width: `${Math.min((todayNutrition.fat || 0) / Math.max(profile.calories * 0.03, 1) * 100, 100)}%`, background: "#666" }} />
                </div>
                <span className="bento-macro-value">{Math.round(todayNutrition.fat || 0)}g</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#666" }}>Calories left</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#FFFFFF", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{Math.max(0, profile.calories - todayNutrition.calories)}</div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#666" }}>Protein left</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#FFFFFF", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{Math.max(0, profile.protein - (todayNutrition.protein || 0))}g</div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#666" }}>Remaining %</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#C8FF00", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{Math.round(100 - caloriePct)}%</div>
            </div>
          </div>
        </div>

        {/* ── BODY WEIGHT ── */}
        <div className="bento-stat"
          onClick={() => NAV("bodyweight")} role="button" tabIndex={0}
          onKeyDown={e => { if (e.key === "Enter") NAV("bodyweight"); }}>
          <div className="bento-stat-icon" style={{ background: "rgba(255,255,255,0.04)" }}>
            <Scale size={18} color="#A0A0A0" />
          </div>
          <div className="bento-stat-value">{latestWeight}<span style={{ fontSize: 13, color: "#666", fontWeight: 400, marginLeft: 4 }}>kg</span></div>
          <div className="bento-stat-label">Body Weight</div>
          {weightChange !== 0 && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, color: weightChange > 0 ? "#FF4757" : "#C8FF00" }}>
              <TrendingUp size={12} />
              {weightChange > 0 ? "+" : ""}{fmt(weightChange, 1)}kg
            </div>
          )}
        </div>

        {/* ── WATER ── */}
        <div className="bento-stat"
          onClick={() => dispatch({ type: "LOG_WATER", payload: { date: today(), amount: 250 } })}
          role="button" tabIndex={0}
          onKeyDown={e => { if (e.key === "Enter") dispatch({ type: "LOG_WATER", payload: { date: today(), amount: 250 } }); }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div className="bento-stat-icon" style={{ background: "rgba(91,155,213,0.1)", marginBottom: 0 }}>
              <Droplet size={18} color="#5B9BD5" />
            </div>
            <Plus size={14} color="#555" style={{ cursor: "pointer" }} />
          </div>
          <div className="bento-stat-value">{waterLog}<span style={{ fontSize: 13, color: "#666", fontWeight: 400, marginLeft: 4 }}>/ 8</span></div>
          <div className="bento-stat-label">Water (glasses)</div>
          <div className="bento-water-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`bento-water-cup ${i < waterLog ? "filled" : ""}`}
                onClick={(e) => { e.stopPropagation(); dispatch({ type: "LOG_WATER", payload: { date: today(), amount: 250 } }); }}>
                {i < waterLog && <Droplet size={10} color="#5B9BD5" />}
              </div>
            ))}
          </div>
        </div>

        {/* ── LARGE CHART (span 4) ── */}
        <div className="bento-span-4 bento-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="bento-stat-icon" style={{ background: "rgba(200,255,0,0.1)", marginBottom: 0 }}>
                <BarChart3 size={18} color="#C8FF00" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF" }}>Weekly Performance</span>
            </div>
            <ChartFilter value={chartFilter} onChange={setChartFilter} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Weight Trend */}
            <div style={{ cursor: "pointer" }} onClick={() => NAV("bodyweight")}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 12, fontWeight: 500 }}>Weight Trend</div>
              {weightData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={weightData}>
                    <defs><linearGradient id="wgb" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C8FF00" stopOpacity={0.2} /><stop offset="95%" stopColor="#C8FF00" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#555" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#555" }} domain={["auto", "auto"]} axisLine={false} tickLine={false} width={40} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} kg`, "Weight"]} />
                    <Area type="monotone" dataKey="weight" stroke="#C8FF00" fill="url(#wgb)" strokeWidth={2} dot={false} animationDuration={1200} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <EmptyState icon={Scale} title="No weight data" subtitle="Log your weight to see trends" action={() => NAV("bodyweight")} actionLabel="Add Weight" />}
            </div>

            {/* Training Volume */}
            <div style={{ cursor: "pointer" }} onClick={() => NAV("workout")}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 12, fontWeight: 500 }}>Training Volume</div>
              {volumeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#555" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#555" }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} kg`, "Volume"]} />
                    <Bar dataKey="volume" fill="#C8FF00" radius={[4, 4, 0, 0]} animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyState icon={BarChart3} title="No volume data" subtitle="Complete workouts to see volume" action={() => NAV("workout")} actionLabel="Start Workout" />}
            </div>

            {/* Workout Frequency */}
            <div style={{ cursor: "pointer" }} onClick={() => NAV("progress")}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 12, fontWeight: 500 }}>Workout Frequency</div>
              {frequencyData.some(d => d.workouts > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={frequencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#555" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#555" }} allowDecimals={false} axisLine={false} tickLine={false} width={40} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} workouts`, "Sessions"]} />
                    <Bar dataKey="workouts" fill="#888" radius={[4, 4, 0, 0]} animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyState icon={Activity} title="No workouts yet" subtitle="Start training to see frequency" action={() => NAV("workout")} actionLabel="Start Workout" />}
            </div>

            {/* Weekly Volume Summary */}
            <div style={{ cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 12px" }} onClick={() => NAV("progress")}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 8, fontWeight: 500 }}>Weekly Volume</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#FFFFFF", fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(weekVol).toLocaleString()}<span style={{ fontSize: 16, color: "#666", fontWeight: 400, marginLeft: 6 }}>kg</span></div>
              <div className="bento-progress" style={{ marginTop: 12 }}>
                <div className="bento-progress-fill" style={{ width: `${Math.min((weekVol / 5000) * 100, 100)}%`, background: "#C8FF00" }} />
              </div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 6 }}>
                {Math.round(Math.min((weekVol / 5000) * 100, 100))}% of weekly goal
              </div>
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "Volume", value: `${Math.round(weekVol).toLocaleString()} kg` },
                  { label: "Sessions", value: `${workouts.length}` },
                  { label: "Avg/session", value: workouts.length ? `${Math.round(weekVol / Math.max(workouts.slice(-7).length, 1))} kg` : "—" },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#555" }}>{s.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#D0D0D0", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── RECENT ACTIVITY (span 2) ── */}
        <div className="bento-span-2 bento-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="bento-stat-icon" style={{ background: "rgba(255,255,255,0.04)", marginBottom: 0 }}>
                <Activity size={18} color="#A0A0A0" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF" }}>Recent Activity</span>
            </div>
          </div>
          {recentActivity.length > 0 ? (
            <div>
              {recentActivity.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="bento-activity-item" style={{ cursor: item.page ? "pointer" : "default" }}
                    onClick={() => item.page && NAV(item.page)} role={item.page ? "button" : undefined} tabIndex={item.page ? 0 : undefined}
                    onKeyDown={e => { if (e.key === "Enter" && item.page) NAV(item.page); }}>
                    <div className="bento-activity-dot" style={{ background: item.color }} />
                    <div className="bento-activity-text">{item.text}</div>
                    <div className="bento-activity-time">{item.time}</div>
                    <Icon size={14} color="#555" style={{ flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={Activity} title="No recent activity" subtitle="Start your first workout!"
              action={() => NAV("workout")} actionLabel="Start Workout" />
          )}
        </div>

        {/* ── AI COACH INSIGHT (span 2) ── */}
        <div className="bento-span-2 bento-card" style={{ background: "#0E0E0E", border: "1px solid rgba(200,255,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="bento-stat-icon" style={{ background: "rgba(200,255,0,0.08)", marginBottom: 0 }}>
                <Bot size={18} color="#C8FF00" />
              </div>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF" }}>AI Coach</span>
                <span style={{ fontSize: 11, color: "#C8FF00", marginLeft: 8, opacity: 0.6 }}>Premium Insight</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="bento-btn bento-btn-primary" onClick={getInsight} disabled={aiLoading} style={{ padding: "8px 16px", fontSize: 12 }}
                tabIndex={0} aria-label="Get AI insight">
                {aiLoading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 14, height: 14, border: "2px solid rgba(11,11,11,0.3)", borderTopColor: "#0B0B0B", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                    Analyzing
                  </span>
                ) : (
                  <><Sparkles size={14} /> Insight</>
                )}
              </button>
              <button className="bento-btn bento-btn-secondary" onClick={() => NAV("coach")} style={{ padding: "8px 16px", fontSize: 12 }} tabIndex={0} aria-label="Open AI Coach">
                Chat
              </button>
            </div>
          </div>

          <div className="bento-coach-area">
            {aiInsight ? (
              <p className="bento-coach-text">{aiInsight}</p>
            ) : aiQuickTips.length > 0 ? (
              <div>
                <div style={{ fontSize: 11, color: "#555", marginBottom: 10, fontWeight: 500, letterSpacing: "0.03em", textTransform: "uppercase" }}>Personalized insights</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {aiQuickTips.map((tip, i) => {
                    const TipIcon = tip.icon;
                    return (
                      <div key={i} className="bento-coach-tip" style={{ cursor: tip.page ? "pointer" : "default" }}
                        onClick={() => tip.page && NAV(tip.page)} role={tip.page ? "button" : undefined} tabIndex={tip.page ? 0 : undefined}
                        onKeyDown={e => { if (e.key === "Enter" && tip.page) NAV(tip.page); }}>
                        <TipIcon size={14} color="#C8FF00" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{tip.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(200,255,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={16} color="#C8FF00" />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "#D0D0D0", fontWeight: 500, marginBottom: 2 }}>Tap for AI analysis</div>
                    <div style={{ fontSize: 12, color: "#555" }}>Your workouts, nutrition, and recovery analyzed instantly.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MUSCLE RECOVERY (span 4) ── */}
        <div className="bento-span-4 bento-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="bento-stat-icon" style={{ background: "rgba(255,255,255,0.04)", marginBottom: 0 }}>
                <Heart size={18} color="#A0A0A0" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF" }}>Muscle Recovery</span>
            </div>
            <span style={{ fontSize: 11, color: "#555" }}>Last 7 days</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
            {muscleGroups.map((mg, i) => {
              const color = mg.recovery > 80 ? "#C8FF00" : mg.recovery > 50 ? "#888" : "#FF4757";
              return (
                <div key={i}>
                  <div style={{ fontSize: 11, color: "#666", marginBottom: 8, fontWeight: 500, textAlign: "center" }}>{mg.name}</div>
                  <div className="bento-recovery-track" style={{ height: 6, borderRadius: 3 }}>
                    <div className="bento-recovery-fill" style={{ width: `${mg.recovery}%`, background: color, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 11, color, textAlign: "center", marginTop: 6, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{mg.recovery}%</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </motion.div>
  );
};

export default Dashboard;
