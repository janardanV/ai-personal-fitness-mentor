import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Droplets, Plus, Bell, Settings2, CalendarDays } from "lucide-react";

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

const ProgressRing = ({ progress, size = 220, stroke = 12 }) => {
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
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#C8FF32"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ filter: progress > 0 ? "drop-shadow(0 0 8px rgba(200,255,50,0.55))" : "none" }}
      />
    </svg>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(15,15,15,0.98)",
        border: "1px solid rgba(200,255,50,0.3)",
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 12,
        color: "#FFFFFF",
        fontFamily: "'JetBrains Mono',monospace",
        fontWeight: 600,
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
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
    <div className="rd-page" style={{ maxWidth: 680, width: "100%", margin: "0 auto" }}>
      <div className="rd-page-head">
        <div>
          <span className="rd-kicker"><Droplets size={13} /> Health</span>
          <h1 className="rd-title">Water Tracker</h1>
          <p className="rd-sub">Stay hydrated — log your intake throughout the day.</p>
        </div>
      </div>

      <div className="rd-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px" }}>
        <div style={{ position: "relative", width: 220, height: 220, marginBottom: 16 }}>
          <ProgressRing progress={progress} />
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: "#FFFFFF", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "-0.03em", lineHeight: 1 }}>
              {todayTotal}
            </span>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
              / {goal} ml
            </span>
            <span style={{ fontSize: 12, color: "#C8FF32", marginTop: 8, fontWeight: 700 }}>
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>

        <p style={{
          fontSize: 13,
          color: progress >= 1 ? "#C8FF32" : "rgba(255,255,255,0.45)",
          textAlign: "center",
          marginBottom: 4,
          fontWeight: 500,
        }}>
          {motivationalMessages(progress * 100)}
        </p>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {[
          { label: "+250 ml", amount: 250 },
          { label: "+500 ml", amount: 500 },
        ].map((btn) => (
          <motion.button
            key={btn.amount}
            whileTap={{ scale: 0.95 }}
            onClick={() => logWater(btn.amount)}
            className="rd-btn-primary"
            style={{ flex: 1 }}
          >
            <Plus size={15} /> {btn.label}
          </motion.button>
        ))}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCustom(true)}
          className="rd-btn-secondary"
          style={{ flex: 1 }}
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
            style={{ overflow: "hidden" }}
          >
            <div className="rd-card" style={{ padding: 14, display: "flex", gap: 10, alignItems: "center" }}>
              <input
                className="rd-input"
                type="number"
                placeholder="Amount in ml"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCustomAdd()}
                style={{ flex: 1 }}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCustomAdd}
                className="rd-btn-primary"
              >
                Add
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setShowCustom(false); setCustomAmount(""); }}
                style={{
                  background: "transparent",
                  color: "rgba(255,255,255,0.45)",
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

      <div className="rd-card">
        <div className="rd-card-head">
          <div className="rd-card-title">
            <div className="rd-card-title-ico blue"><Droplets size={15} /></div>
            <div>
              <div className="rd-card-kicker">Intake</div>
              <div className="rd-card-name">Today's Log</div>
            </div>
          </div>
          <span className="rd-count"><b>{todayEntries.length}</b> entries</span>
        </div>

        {sortedEntries.length === 0 ? (
          <div className="rd-empty">
            <div className="rd-empty-title">No entries yet today</div>
            <div className="rd-empty-sub">Start hydrating!</div>
          </div>
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
                  padding: "9px 0",
                  borderBottom: i < sortedEntries.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
                  {entry.time}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#C8FF32", fontFamily: "'JetBrains Mono',monospace" }}>
                  +{entry.amount} ml
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="rd-card">
        <div className="rd-card-head">
          <div className="rd-card-title">
            <div className="rd-card-title-ico lime"><Settings2 size={15} /></div>
            <div>
              <div className="rd-card-kicker">Target</div>
              <div className="rd-card-name">Daily Goal</div>
            </div>
          </div>
          {!showGoalEdit ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowGoalEdit(true); setGoalInput(String(goal)); }}
              className="rd-chip active"
            >
              {goal} ml
            </motion.button>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                className="rd-input"
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveGoal()}
                style={{ width: 90, textAlign: "right" }}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={saveGoal}
                className="rd-btn-primary"
                style={{ padding: "9px 14px", fontSize: 12 }}
              >
                Save
              </motion.button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[1500, 2000, 2500, 3000, 3500].map((g) => (
            <motion.button
              key={g}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setGoal(g);
                localStorage.setItem("water_goal", String(g));
              }}
              className={`rd-chip ${goal === g ? "active" : ""}`}
            >
              {g} ml
            </motion.button>
          ))}
        </div>
      </div>

      <div className="rd-card">
        <div className="rd-card-head">
          <div className="rd-card-title">
            <div className="rd-card-title-ico blue"><CalendarDays size={15} /></div>
            <div>
              <div className="rd-card-kicker">Trend</div>
              <div className="rd-card-name">Past 7 Days</div>
            </div>
          </div>
        </div>
        <div style={{ width: "100%", height: 170 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barCategoryGap="20%">
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#A7B1C2", fontSize: 11 }}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar
                dataKey="amount"
                fill="#C8FF32"
                radius={[5, 5, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rd-card">
        <div className="rd-card-head">
          <div className="rd-card-title">
            <div className="rd-card-title-ico purple"><Bell size={15} /></div>
            <div>
              <div className="rd-card-kicker">Notifications</div>
              <div className="rd-card-name">Reminders</div>
            </div>
          </div>
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
              flexShrink: 0,
              background: reminderEnabled ? "#C8FF32" : "rgba(255,255,255,0.08)",
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
                background: reminderEnabled ? "#0B0F14" : "#FFFFFF",
                position: "absolute",
                top: 2,
              }}
            />
          </motion.button>
        </div>

        <AnimatePresence>
          {reminderEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden" }}
            >
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>
                Remind every:
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "30 min", value: 30 },
                  { label: "1 hr", value: 60 },
                  { label: "2 hr", value: 120 },
                ].map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setReminderInterval(opt.value)}
                    className={`rd-chip ${reminderInterval === opt.value ? "active" : ""}`}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
