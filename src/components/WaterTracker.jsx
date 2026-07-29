import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
  bg: "#0A0A0A",
  surface: "#151515",
  surfaceHover: "#1C1C1C",
  accent: "#22C55E",
  accentDim: "rgba(255,255,255,0.06)",
  text: "#FFFFFF",
  secondary: "#A0A0A0",
  danger: "#FF4D4D",
  surfaceElevated: "#1A1A1A",
};

const TODAY = () => new Date().toISOString().split("T")[0];

const getGoal = () => {
  try {
    return parseInt(localStorage.getItem("water_goal"), 10) || 2500;
  } catch {
    return 2500;
  }
};

const formatTime = (t) => t;

const motivationalMessages = (pct) => {
  if (pct >= 100) return "Goal reached! You're a hydration hero.";
  if (pct >= 75) return "Almost there! Keep sipping.";
  if (pct >= 50) return "Halfway done. Great progress!";
  if (pct >= 25) return "Good start! Stay consistent.";
  return "Time to hydrate! Your body will thank you.";
};

const getBarData = (water) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const entries = water[key] || [];
    const total = entries.reduce((s, e) => s + e.amount, 0);
    days.push({
      day: d.toLocaleDateString("en", { weekday: "short" }),
      amount: total,
      date: key,
    });
  }
  return days;
};

const ProgressRing = ({ progress, size = 240, stroke = 12 }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 1) * circumference);

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={COLORS.surface}
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={progress >= 1 ? COLORS.accent : COLORS.accent}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ filter: progress > 0 ? `drop-shadow(0 0 8px ${COLORS.accent})` : "none" }}
      />
    </svg>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: COLORS.surfaceElevated,
        border: `1px solid ${COLORS.accent}33`,
        borderRadius: 8,
        padding: "6px 10px",
        fontSize: 12,
        color: COLORS.text,
      }}>
        {payload[0].value} ml
      </div>
    );
  }
  return null;
};

export default function WaterTracker({ state, dispatch }) {
  const [goal, setGoal] = useState(getGoal);
  const [showCustom, setShowCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(60);
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [goalInput, setGoalInput] = useState(String(goal));
  const timerRef = useRef(null);

  const today = TODAY();
  const todayEntries = state.water?.[today] || [];
  const todayTotal = todayEntries.reduce((s, e) => s + e.amount, 0);
  const progress = todayTotal / goal;
  const barData = getBarData(state.water || {});

  const logWater = useCallback((amount) => {
    const entry = {
      time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: true }),
      amount,
    };
    dispatch({ type: "LOG_WATER", payload: { date: today, entry } });
  }, [dispatch, today]);

  const handleCustomAdd = () => {
    const val = parseInt(customAmount, 10);
    if (val > 0 && val <= 5000) {
      logWater(val);
      setCustomAmount("");
      setShowCustom(false);
    }
  };

  const saveGoal = () => {
    const val = parseInt(goalInput, 10);
    if (val >= 500 && val <= 10000) {
      setGoal(val);
      localStorage.setItem("water_goal", String(val));
      setShowGoalEdit(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    const result = await Notification.requestPermission();
    return result === "granted";
  };

  const startReminder = useCallback((intervalMin) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const ms = intervalMin * 60 * 1000;
    timerRef.current = setInterval(() => {
      if (Notification.permission === "granted") {
        new Notification("Stay Hydrated!", {
          body: `You've had ${todayTotal}ml today. Goal: ${goal}ml. Time for a drink!`,
          icon: "💧",
        });
      }
    }, ms);
  }, [todayTotal, goal]);

  const stopReminder = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const toggleReminder = async () => {
    if (reminderEnabled) {
      stopReminder();
      setReminderEnabled(false);
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        setReminderEnabled(true);
        startReminder(reminderInterval);
      }
    }
  };

  useEffect(() => {
    if (reminderEnabled) {
      startReminder(reminderInterval);
    }
    return () => stopReminder();
  }, [reminderInterval, reminderEnabled, startReminder, stopReminder]);

  const sortedEntries = [...todayEntries].reverse();

  return (
    <div style={{
      background: COLORS.bg,
      minHeight: "100vh",
      padding: "24px 16px",
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: COLORS.text,
      maxWidth: 600,
      margin: "0 auto",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 24,
          color: COLORS.text,
          letterSpacing: "-0.5px",
        }}>
          Water Tracker
        </h1>

        <div style={{
          background: COLORS.surface,
          borderRadius: 20,
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 16,
        }}>
          <div style={{ position: "relative", width: 240, height: 240, marginBottom: 16 }}>
            <ProgressRing progress={progress} />
            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: COLORS.text }}>
                {todayTotal}
              </span>
              <span style={{ fontSize: 14, color: COLORS.secondary, marginTop: 2 }}>
                / {goal} ml
              </span>
              <span style={{ fontSize: 12, color: COLORS.accent, marginTop: 8, fontWeight: 500 }}>
                {Math.round(progress * 100)}%
              </span>
            </div>
          </div>

          <p style={{
            fontSize: 13,
            color: progress >= 1 ? COLORS.accent : COLORS.secondary,
            textAlign: "center",
            marginBottom: 4,
            fontWeight: 500,
          }}>
            {motivationalMessages(progress * 100)}
          </p>
        </div>

        <div style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
        }}>
          {[
            { label: "+250 ml", amount: 250 },
            { label: "+500 ml", amount: 500 },
          ].map((btn) => (
            <motion.button
              key={btn.amount}
              whileTap={{ scale: 0.95 }}
              onClick={() => logWater(btn.amount)}
              style={{
                flex: 1,
                background: COLORS.accent,
                color: COLORS.bg,
                border: "none",
                borderRadius: 14,
                padding: "14px 0",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "-0.3px",
              }}
            >
              {btn.label}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCustom(true)}
            style={{
              flex: 1,
              background: COLORS.surfaceHover,
              color: COLORS.text,
              border: `1px solid ${COLORS.accent}33`,
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Custom
          </motion.button>
        </div>

        <AnimatePresence>
          {showCustom && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden", marginBottom: 16 }}
            >
              <div style={{
                background: COLORS.surface,
                borderRadius: 14,
                padding: 16,
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}>
                <input
                  type="number"
                  placeholder="Amount in ml"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomAdd()}
                  style={{
                    flex: 1,
                    background: COLORS.bg,
                    border: `1px solid ${COLORS.accent}33`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    color: COLORS.text,
                    fontSize: 14,
                    outline: "none",
                  }}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCustomAdd}
                  style={{
                    background: COLORS.accent,
                    color: COLORS.bg,
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 18px",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Add
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setShowCustom(false); setCustomAmount(""); }}
                  style={{
                    background: "transparent",
                    color: COLORS.secondary,
                    border: "none",
                    padding: "10px 8px",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{
          background: COLORS.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>
              Today's Log
            </span>
            <span style={{ fontSize: 12, color: COLORS.secondary }}>
              {todayEntries.length} entries
            </span>
          </div>

          {sortedEntries.length === 0 ? (
            <p style={{ fontSize: 13, color: COLORS.secondary, textAlign: "center", padding: "12px 0" }}>
              No entries yet today. Start hydrating!
            </p>
          ) : (
            <div style={{ maxHeight: 160, overflowY: "auto" }}>
              {sortedEntries.map((entry, i) => (
                <motion.div
                  key={`${entry.time}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: i < sortedEntries.length - 1 ? `1px solid ${COLORS.surfaceHover}` : "none",
                  }}
                >
                  <span style={{ fontSize: 13, color: COLORS.secondary }}>
                    {entry.time}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent }}>
                    +{entry.amount} ml
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          background: COLORS.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>
              Daily Goal
            </span>
            {!showGoalEdit ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setShowGoalEdit(true); setGoalInput(String(goal)); }}
                style={{
                  background: COLORS.surfaceHover,
                  color: COLORS.accent,
                  border: `1px solid ${COLORS.accent}33`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {goal} ml
              </motion.button>
            ) : (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveGoal()}
                  style={{
                    width: 80,
                    background: COLORS.bg,
                    border: `1px solid ${COLORS.accent}33`,
                    borderRadius: 8,
                    padding: "6px 8px",
                    color: COLORS.text,
                    fontSize: 13,
                    outline: "none",
                    textAlign: "right",
                  }}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={saveGoal}
                  style={{
                    background: COLORS.accent,
                    color: COLORS.bg,
                    border: "none",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Save
                </motion.button>
              </div>
            )}
          </div>
          {[1500, 2000, 2500, 3000, 3500].map((g) => (
            <motion.button
              key={g}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setGoal(g);
                localStorage.setItem("water_goal", String(g));
              }}
              style={{
                background: goal === g ? COLORS.accentDim : "transparent",
                color: goal === g ? COLORS.accent : COLORS.secondary,
                border: goal === g ? `1px solid ${COLORS.accent}44` : `1px solid transparent`,
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: goal === g ? 700 : 500,
                cursor: "pointer",
                marginRight: 8,
                marginBottom: 8,
                display: "inline-block",
              }}
            >
              {g} ml
            </motion.button>
          ))}
        </div>

        <div style={{
          background: COLORS.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, display: "block", marginBottom: 12 }}>
            Past 7 Days
          </span>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barCategoryGap="20%">
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: COLORS.secondary, fontSize: 11 }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar
                  dataKey="amount"
                  fill={COLORS.accent}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{
          background: COLORS.surface,
          borderRadius: 16,
          padding: 16,
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>
              Reminders
            </span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleReminder}
              style={{
                width: 48,
                height: 26,
                borderRadius: 13,
                border: "none",
                cursor: "pointer",
                position: "relative",
                background: reminderEnabled ? COLORS.accent : COLORS.surfaceHover,
                transition: "background 0.2s",
              }}
            >
              <motion.div
                animate={{ x: reminderEnabled ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: reminderEnabled ? COLORS.bg : COLORS.secondary,
                  position: "absolute",
                  top: 2,
                }}
              />
            </motion.button>
          </div>

          {reminderEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              style={{ overflow: "hidden" }}
            >
              <p style={{ fontSize: 12, color: COLORS.secondary, marginBottom: 10 }}>
                Remind every:
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { label: "30 min", value: 30 },
                  { label: "1 hr", value: 60 },
                  { label: "2 hr", value: 120 },
                ].map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setReminderInterval(opt.value)}
                    style={{
                      background: reminderInterval === opt.value ? COLORS.accentDim : COLORS.bg,
                      color: reminderInterval === opt.value ? COLORS.accent : COLORS.secondary,
                      border: reminderInterval === opt.value ? `1px solid ${COLORS.accent}44` : `1px solid ${COLORS.surfaceHover}`,
                      borderRadius: 10,
                      padding: "8px 16px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
