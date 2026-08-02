import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, Dumbbell, Droplets, Target, Settings2, Trash2, Zap } from "lucide-react";

const TYPE_ICONS = {
  workout: "\uD83C\uDFCB\uFE0F",
  water: "\uD83D\uDCA7",
  goal: "\uD83C\uDFAF",
  system: "\uD83D\uDD14",
};

const TYPE_LUCIDE = {
  workout: Dumbbell,
  water: Droplets,
  goal: Target,
  system: BellRing,
};

const TAB_ICONS = {
  all: Bell,
  workout: Dumbbell,
  water: Droplets,
  goal: Target,
  system: BellRing,
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
    <div className="rd-page" style={{ maxWidth: 800, width: "100%", margin: "0 auto" }}>
      <div className="rd-page-head">
        <div>
          <span className="rd-kicker"><Bell size={13} /> Notifications</span>
          <h1 className="rd-title">Notification Center</h1>
          <p className="rd-sub">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignSelf: "center", flexWrap: "wrap" }}>
          {permission !== "granted" && permission !== "unsupported" && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={requestPermission}
              className="rd-btn-primary"
              style={{ padding: "11px 18px", fontSize: 13 }}
            >
              <BellRing size={15} /> Enable Notifications
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={sendTestNotification}
            className="rd-btn-secondary"
            style={{ padding: "11px 18px", fontSize: 13 }}
          >
            <Zap size={15} /> Test
          </motion.button>
        </div>
      </div>

      {permission === "unsupported" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 13, color: "rgba(255,255,255,0.55)" }}
        >
          Browser notifications are not supported in this environment. Reminders will still appear in-app.
        </motion.div>
      )}

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div className="rd-card-title-ico lime"><Settings2 size={15} /></div>
          <div>
            <div className="rd-card-kicker">Control</div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", margin: 0 }}>Reminder Settings</h2>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <motion.div
            whileHover={{ translateY: -1 }}
            className="rd-card"
            style={{ padding: "18px 20px", border: settings.workout.enabled ? "1px solid rgba(200,255,0,0.28)" : undefined, boxShadow: settings.workout.enabled ? "0 8px 24px rgba(200,255,0,0.07)" : undefined }}
          >
            <div className="rd-card-head" style={{ marginBottom: 0 }}>
              <div className="rd-card-title">
                <div className="rd-card-title-ico lime"><Dumbbell size={15} /></div>
                <div>
                  <div className="rd-card-kicker">Training</div>
                  <div className="rd-card-name">Workout Reminder</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Get reminded to exercise</div>
                </div>
              </div>
              <div onClick={() => toggleReminder("workout")} style={{ width: 46, height: 26, borderRadius: 13, background: settings.workout.enabled ? "#C8FF00" : "rgba(255,255,255,0.08)", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background-color 0.2s" }}>
                <motion.div
                  animate={{ x: settings.workout.enabled ? 22 : 3 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{ width: 20, height: 20, borderRadius: 10, background: settings.workout.enabled ? "#0B0B0B" : "#FFFFFF", position: "absolute", top: 3 }}
                />
              </div>
            </div>
            {settings.workout.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Remind at</span>
                  <input
                    type="time"
                    value={settings.workout.time}
                    onChange={(e) => updateWorkoutTime(e.target.value)}
                    className="rd-input"
                    style={{ width: 140 }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            whileHover={{ translateY: -1 }}
            className="rd-card"
            style={{ padding: "18px 20px", border: settings.water.enabled ? "1px solid rgba(200,255,0,0.28)" : undefined, boxShadow: settings.water.enabled ? "0 8px 24px rgba(200,255,0,0.07)" : undefined }}
          >
            <div className="rd-card-head" style={{ marginBottom: 0 }}>
              <div className="rd-card-title">
                <div className="rd-card-title-ico blue"><Droplets size={15} /></div>
                <div>
                  <div className="rd-card-kicker">Hydration</div>
                  <div className="rd-card-name">Water Reminder</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Stay hydrated throughout the day</div>
                </div>
              </div>
              <div onClick={() => toggleReminder("water")} style={{ width: 46, height: 26, borderRadius: 13, background: settings.water.enabled ? "#C8FF00" : "rgba(255,255,255,0.08)", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background-color 0.2s" }}>
                <motion.div
                  animate={{ x: settings.water.enabled ? 22 : 3 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{ width: 20, height: 20, borderRadius: 10, background: settings.water.enabled ? "#0B0B0B" : "#FFFFFF", position: "absolute", top: 3 }}
                />
              </div>
            </div>
            {settings.water.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginRight: 4 }}>Every</span>
                  {WATER_INTERVALS.map((w) => (
                    <motion.button
                      key={w.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateWaterInterval(w.value)}
                      className={`rd-chip ${settings.water.interval === w.value ? "active" : ""}`}
                      style={{ padding: "7px 14px", fontSize: 12 }}
                    >
                      {w.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            whileHover={{ translateY: -1 }}
            className="rd-card"
            style={{ padding: "18px 20px", border: settings.goal.enabled ? "1px solid rgba(200,255,0,0.28)" : undefined, boxShadow: settings.goal.enabled ? "0 8px 24px rgba(200,255,0,0.07)" : undefined }}
          >
            <div className="rd-card-head" style={{ marginBottom: 0 }}>
              <div className="rd-card-title">
                <div className="rd-card-title-ico purple"><Target size={15} /></div>
                <div>
                  <div className="rd-card-kicker">Goals</div>
                  <div className="rd-card-name">Goal Check-in</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Review your fitness goals</div>
                </div>
              </div>
              <div onClick={() => toggleReminder("goal")} style={{ width: 46, height: 26, borderRadius: 13, background: settings.goal.enabled ? "#C8FF00" : "rgba(255,255,255,0.08)", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background-color 0.2s" }}>
                <motion.div
                  animate={{ x: settings.goal.enabled ? 22 : 3 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{ width: 20, height: 20, borderRadius: 10, background: settings.goal.enabled ? "#0B0B0B" : "#FFFFFF", position: "absolute", top: 3 }}
                />
              </div>
            </div>
            {settings.goal.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginRight: 4 }}>Frequency</span>
                  {GOAL_FREQUENCIES.map((g) => (
                    <motion.button
                      key={g.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateGoalFrequency(g.value)}
                      className={`rd-chip ${settings.goal.frequency === g.value ? "active" : ""}`}
                      style={{ padding: "7px 14px", fontSize: 12 }}
                    >
                      {g.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {activeReminders.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div className="rd-card-title-ico blue"><BellRing size={15} /></div>
            <div>
              <div className="rd-card-kicker">Scheduled</div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", margin: 0 }}>Active Reminders</h2>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <AnimatePresence>
              {activeReminders.map((r) => {
                const Icon = TYPE_LUCIDE[r.type] || BellRing;
                return (
                  <motion.div
                    key={r.type}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="rd-card"
                    style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <div className="rd-card-title-ico lime" style={{ flexShrink: 0 }}><Icon size={15} /></div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF" }}>{r.label}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>{r.detail}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div className="rd-card-kicker" style={{ marginBottom: 2 }}>Next</div>
                      <div style={{ fontSize: 12, color: "#C8FF00", fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>
                        {new Date(r.nextTrigger).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="rd-card-title-ico purple"><Bell size={15} /></div>
            <div>
              <div className="rd-card-kicker">Activity</div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", margin: 0 }}>History</h2>
            </div>
          </div>
          {notifications.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={clearHistory}
              className="rd-btn-sm danger"
            >
              <Trash2 size={13} /> Clear All
            </motion.button>
          )}
        </div>

        <div className="rd-tabbar" style={{ marginBottom: 14 }}>
          {["all", "workout", "water", "goal", "system"].map((tab) => {
            const TabIcon = TAB_ICONS[tab];
            return (
              <button
                key={tab}
                className={`rd-tab ${historyTab === tab ? "active" : ""}`}
                onClick={() => setHistoryTab(tab)}
                style={{ textTransform: "capitalize" }}
              >
                <TabIcon size={14} /> {tab}
              </button>
            );
          })}
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="rd-card rd-empty" style={{ padding: "48px 20px" }}>
            <BellRing size={30} style={{ opacity: 0.3 }} />
            <div className="rd-empty-title">No notifications yet</div>
            <div className="rd-empty-sub">Enable reminders above to get started</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <AnimatePresence>
              {filteredNotifications.map((n) => {
                const Icon = TYPE_LUCIDE[n.type] || BellRing;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    layout
                    onClick={() => !n.read && markRead(n.id)}
                    className="rd-card"
                    style={{
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      cursor: n.read ? "default" : "pointer",
                      background: n.read ? undefined : "linear-gradient(180deg, rgba(200,255,0,0.045) 0%, rgba(19,19,19,0.7) 100%)",
                      border: n.read ? undefined : "1px solid rgba(200,255,0,0.2)",
                      opacity: n.read ? 0.65 : 1,
                    }}
                  >
                    <div className="rd-card-title-ico lime" style={{ flexShrink: 0 }}><Icon size={15} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: n.read ? "rgba(255,255,255,0.5)" : "#FFFFFF", lineHeight: 1.4 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 5, fontFamily: "'JetBrains Mono',monospace" }}>{formatTimestamp(n.timestamp)}</div>
                    </div>
                    {!n.read && (
                      <span className="rd-ex-tag" style={{ flexShrink: 0, alignSelf: "flex-start" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C8FF00", display: "inline-block" }} /> New
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
