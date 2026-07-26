import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = {
  bg: "#0B0B0B",
  surface: "#151515",
  surfaceHover: "#1C1C1C",
  accent: "#C8FF00",
  accentDim: "rgba(200,255,0,0.15)",
  text: "#FFFFFF",
  secondary: "#A0A0A0",
  danger: "#FF4D4D",
  surfaceElevated: "#1A1A1A",
};

const WATER_INTERVALS = [
  { label: "30 min", value: 30 * 60 * 1000 },
  { label: "1 hour", value: 60 * 60 * 1000 },
  { label: "2 hours", value: 120 * 60 * 1000 },
];

const GOAL_FREQUENCIES = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
];

const TYPE_ICONS = {
  workout: "\uD83C\uDFCB\uFE0F",
  water: "\uD83D\uDCA7",
  goal: "\uD83C\uDFAF",
  system: "\uD83D\uDD14",
};

const DEFAULT_SETTINGS = {
  workout: { enabled: false, time: "08:00" },
  water: { enabled: false, interval: 3600000 },
  goal: { enabled: false, frequency: "daily" },
};

function loadSettings() {
  try {
    const raw = localStorage.getItem("notification_settings");
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s) {
  try {
    localStorage.setItem("notification_settings", JSON.stringify(s));
  } catch {}
}

function formatTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getPermissionStatus() {
  if (typeof window === "undefined" || !window.Notification) return "unsupported";
  return window.Notification.permission;
}

function sendBrowserNotification(title, body, type) {
  if (typeof window === "undefined" || !window.Notification || window.Notification.permission !== "granted") return;
  try {
    new window.Notification(title, { body, icon: TYPE_ICONS[type] ? undefined : undefined, tag: "fit-app-" + Date.now() });
  } catch {}
}

export default function NotificationCenter({ state, dispatch }) {
  const [settings, setSettings] = useState(loadSettings);
  const [permission, setPermission] = useState(getPermissionStatus);
  const [activeReminders, setActiveReminders] = useState([]);
  const [historyTab, setHistoryTab] = useState("all");
  const intervalsRef = useRef([]);

  const notifications = (state && state.notifications) || [];

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const clearIntervals = useCallback(() => {
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
  }, []);

  useEffect(() => {
    clearIntervals();
    const reminders = [];

    if (settings.workout.enabled) {
      reminders.push({
        type: "workout",
        label: "Workout Reminder",
        detail: `Daily at ${settings.workout.time}`,
        nextTrigger: getNextWorkoutTime(settings.workout.time),
      });

      const workoutInterval = setInterval(() => {
        const now = new Date();
        const [h, m] = settings.workout.time.split(":").map(Number);
        if (now.getHours() === h && now.getMinutes() === m) {
          sendBrowserNotification("Workout Time!", "Time to get moving. Let's crush it!", "workout");
          dispatch({
            type: "ADD_NOTIFICATION",
            payload: {
              id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
              type: "workout",
              message: "Time for your workout! Let's crush it today.",
              timestamp: new Date().toISOString(),
              read: false,
            },
          });
        }
      }, 60000);
      intervalsRef.current.push(workoutInterval);
    }

    if (settings.water.enabled) {
      const intervalLabel = WATER_INTERVALS.find((w) => w.value === settings.water.interval)?.label || "1 hour";
      reminders.push({
        type: "water",
        label: "Water Reminder",
        detail: `Every ${intervalLabel}`,
        nextTrigger: new Date(Date.now() + settings.water.interval).toISOString(),
      });

      const waterInterval = setInterval(() => {
        sendBrowserNotification("Stay Hydrated!", "Time to drink some water. Stay hydrated!", "water");
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            type: "water",
            message: "Time to drink some water. Stay hydrated!",
            timestamp: new Date().toISOString(),
            read: false,
          },
        });
      }, settings.water.interval);
      intervalsRef.current.push(waterInterval);
    }

    if (settings.goal.enabled) {
      const freqLabel = settings.goal.frequency === "daily" ? "Daily" : "Weekly";
      reminders.push({
        type: "goal",
        label: "Goal Check-in",
        detail: `${freqLabel} review`,
        nextTrigger: getNextGoalCheckTime(settings.goal.frequency),
      });

      const goalMs = settings.goal.frequency === "daily" ? 86400000 : 604800000;
      const goalInterval = setInterval(() => {
        sendBrowserNotification("Goal Check-in", "Time to review your goals and track progress!", "goal");
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            type: "goal",
            message: "Time to review your goals and track your progress!",
            timestamp: new Date().toISOString(),
            read: false,
          },
        });
      }, goalMs);
      intervalsRef.current.push(goalInterval);
    }

    setActiveReminders(reminders);
    return clearIntervals;
  }, [settings, dispatch, clearIntervals]);

  function getNextWorkoutTime(time) {
    const [h, m] = time.split(":").map(Number);
    const next = new Date();
    next.setHours(h, m, 0, 0);
    if (next <= new Date()) next.setDate(next.getDate() + 1);
    return next.toISOString();
  }

  function getNextGoalCheckTime(freq) {
    const next = new Date();
    if (freq === "daily") {
      next.setDate(next.getDate() + 1);
      next.setHours(9, 0, 0, 0);
    } else {
      next.setDate(next.getDate() + ((7 - next.getDay()) % 7 || 7));
      next.setHours(9, 0, 0, 0);
    }
    return next.toISOString();
  }

  function toggleReminder(type) {
    setSettings((prev) => ({
      ...prev,
      [type]: { ...prev[type], enabled: !prev[type].enabled },
    }));
  }

  function updateWorkoutTime(time) {
    setSettings((prev) => ({ ...prev, workout: { ...prev.workout, time } }));
  }

  function updateWaterInterval(value) {
    setSettings((prev) => ({ ...prev, water: { ...prev.water, interval: value } }));
  }

  function updateGoalFrequency(value) {
    setSettings((prev) => ({ ...prev, goal: { ...prev.goal, frequency: value } }));
  }

  async function requestPermission() {
    if (typeof window === "undefined" || !window.Notification) return;
    try {
      const result = await window.Notification.requestPermission();
      setPermission(result);
    } catch {}
  }

  function sendTestNotification() {
    sendBrowserNotification("Test Notification", "Notifications are working correctly!", "system");
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        type: "system",
        message: "Test notification sent successfully!",
        timestamp: new Date().toISOString(),
        read: false,
      },
    });
  }

  function markRead(id) {
    dispatch({ type: "MARK_NOTIFICATION_READ", payload: id });
  }

  function clearHistory() {
    dispatch({ type: "CLEAR_NOTIFICATIONS" });
  }

  const filteredNotifications =
    historyTab === "all"
      ? notifications
      : notifications.filter((n) => n.type === historyTab);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.bg, color: COLORS.text, fontFamily: "'Inter', -apple-system, sans-serif", padding: "24px", maxWidth: 800, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
              {"\uD83D\uDD14"}
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: COLORS.text }}>Notification Center</h1>
              <p style={{ fontSize: 13, color: COLORS.secondary, margin: 0 }}>
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up"}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {permission !== "granted" && permission !== "unsupported" && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={requestPermission}
                style={{ padding: "10px 18px", borderRadius: 10, border: "none", backgroundColor: COLORS.accent, color: COLORS.bg, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
              >
                Enable Notifications
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={sendTestNotification}
              style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${COLORS.secondary}`, backgroundColor: "transparent", color: COLORS.secondary, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              Test
            </motion.button>
          </div>
        </div>

        {permission === "unsupported" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: "14px 18px", borderRadius: 12, backgroundColor: COLORS.surface, border: `1px solid ${COLORS.secondary}33`, marginBottom: 24, fontSize: 13, color: COLORS.secondary }}
          >
            Browser notifications are not supported in this environment. Reminders will still appear in-app.
          </motion.div>
        )}

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, color: COLORS.text }}>Reminder Settings</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            <motion.div
              whileHover={{ backgroundColor: COLORS.surfaceHover }}
              style={{ backgroundColor: COLORS.surface, borderRadius: 14, padding: "18px 20px", border: settings.workout.enabled ? `1px solid ${COLORS.accent}44` : `1px solid transparent`, transition: "border-color 0.2s" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{TYPE_ICONS.workout}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Workout Reminder</div>
                    <div style={{ fontSize: 12, color: COLORS.secondary }}>Get reminded to exercise</div>
                  </div>
                </div>
                <div onClick={() => toggleReminder("workout")} style={{ width: 46, height: 26, borderRadius: 13, backgroundColor: settings.workout.enabled ? COLORS.accent : "#333", cursor: "pointer", position: "relative", transition: "background-color 0.2s" }}>
                  <motion.div
                    animate={{ x: settings.workout.enabled ? 22 : 3 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: settings.workout.enabled ? COLORS.bg : "#666", position: "absolute", top: 3 }}
                  />
                </div>
              </div>
              {settings.workout.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}
                >
                  <span style={{ fontSize: 13, color: COLORS.secondary }}>Remind at</span>
                  <input
                    type="time"
                    value={settings.workout.time}
                    onChange={(e) => updateWorkoutTime(e.target.value)}
                    style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid #333`, backgroundColor: COLORS.surfaceElevated, color: COLORS.text, fontSize: 13, outline: "none" }}
                  />
                </motion.div>
              )}
            </motion.div>

            <motion.div
              whileHover={{ backgroundColor: COLORS.surfaceHover }}
              style={{ backgroundColor: COLORS.surface, borderRadius: 14, padding: "18px 20px", border: settings.water.enabled ? `1px solid ${COLORS.accent}44` : `1px solid transparent`, transition: "border-color 0.2s" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{TYPE_ICONS.water}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Water Reminder</div>
                    <div style={{ fontSize: 12, color: COLORS.secondary }}>Stay hydrated throughout the day</div>
                  </div>
                </div>
                <div onClick={() => toggleReminder("water")} style={{ width: 46, height: 26, borderRadius: 13, backgroundColor: settings.water.enabled ? COLORS.accent : "#333", cursor: "pointer", position: "relative", transition: "background-color 0.2s" }}>
                  <motion.div
                    animate={{ x: settings.water.enabled ? 22 : 3 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: settings.water.enabled ? COLORS.bg : "#666", position: "absolute", top: 3 }}
                  />
                </div>
              </div>
              {settings.water.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}
                >
                  <span style={{ fontSize: 13, color: COLORS.secondary, marginRight: 4 }}>Every</span>
                  {WATER_INTERVALS.map((w) => (
                    <motion.button
                      key={w.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateWaterInterval(w.value)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: settings.water.interval === w.value ? `1px solid ${COLORS.accent}` : `1px solid #333`,
                        backgroundColor: settings.water.interval === w.value ? COLORS.accentDim : "transparent",
                        color: settings.water.interval === w.value ? COLORS.accent : COLORS.secondary,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      {w.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>

            <motion.div
              whileHover={{ backgroundColor: COLORS.surfaceHover }}
              style={{ backgroundColor: COLORS.surface, borderRadius: 14, padding: "18px 20px", border: settings.goal.enabled ? `1px solid ${COLORS.accent}44` : `1px solid transparent`, transition: "border-color 0.2s" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{TYPE_ICONS.goal}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Goal Check-in</div>
                    <div style={{ fontSize: 12, color: COLORS.secondary }}>Review your fitness goals</div>
                  </div>
                </div>
                <div onClick={() => toggleReminder("goal")} style={{ width: 46, height: 26, borderRadius: 13, backgroundColor: settings.goal.enabled ? COLORS.accent : "#333", cursor: "pointer", position: "relative", transition: "background-color 0.2s" }}>
                  <motion.div
                    animate={{ x: settings.goal.enabled ? 22 : 3 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: settings.goal.enabled ? COLORS.bg : "#666", position: "absolute", top: 3 }}
                  />
                </div>
              </div>
              {settings.goal.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span style={{ fontSize: 13, color: COLORS.secondary, marginRight: 4 }}>Frequency</span>
                  {GOAL_FREQUENCIES.map((g) => (
                    <motion.button
                      key={g.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateGoalFrequency(g.value)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: settings.goal.frequency === g.value ? `1px solid ${COLORS.accent}` : `1px solid #333`,
                        backgroundColor: settings.goal.frequency === g.value ? COLORS.accentDim : "transparent",
                        color: settings.goal.frequency === g.value ? COLORS.accent : COLORS.secondary,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      {g.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {activeReminders.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, color: COLORS.text }}>Active Reminders</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <AnimatePresence>
                {activeReminders.map((r) => (
                  <motion.div
                    key={r.type}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.surface, borderRadius: 12, padding: "14px 18px" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 18 }}>{TYPE_ICONS[r.type]}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{r.label}</div>
                        <div style={{ fontSize: 12, color: COLORS.secondary }}>{r.detail}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: COLORS.secondary }}>Next</div>
                      <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 500 }}>
                        {new Date(r.nextTrigger).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: COLORS.text, margin: 0 }}>History</h2>
            {notifications.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={clearHistory}
                style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${COLORS.danger}44`, backgroundColor: "transparent", color: COLORS.danger, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
              >
                Clear All
              </motion.button>
            )}
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {["all", "workout", "water", "goal", "system"].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setHistoryTab(tab)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: historyTab === tab ? `1px solid ${COLORS.accent}` : `1px solid #333`,
                  backgroundColor: historyTab === tab ? COLORS.accentDim : "transparent",
                  color: historyTab === tab ? COLORS.accent : COLORS.secondary,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {tab}
              </motion.button>
            ))}
          </div>

          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: "center", padding: "48px 20px", backgroundColor: COLORS.surface, borderRadius: 14 }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>{TYPE_ICONS.system}</div>
              <p style={{ color: COLORS.secondary, fontSize: 14, margin: 0 }}>No notifications yet</p>
              <p style={{ color: "#555", fontSize: 12, margin: "6px 0 0" }}>Enable reminders above to get started</p>
            </motion.div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <AnimatePresence>
                {filteredNotifications.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    layout
                    onClick={() => !n.read && markRead(n.id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      backgroundColor: n.read ? COLORS.surface : COLORS.surfaceElevated,
                      borderRadius: 12,
                      padding: "14px 18px",
                      cursor: n.read ? "default" : "pointer",
                      border: n.read ? `1px solid transparent` : `1px solid ${COLORS.accent}22`,
                      transition: "background-color 0.2s, border-color 0.2s",
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                      {TYPE_ICONS[n.type] || TYPE_ICONS.system}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: n.read ? COLORS.secondary : COLORS.text, lineHeight: 1.4 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{formatTimestamp(n.timestamp)}</div>
                    </div>
                    {!n.read && (
                      <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent, flexShrink: 0, marginTop: 6 }} />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </motion.div>
    </div>
  );
}
