import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Ruler, Droplets, Trash2, RefreshCw, Scale, Map, Trophy, Database, Download, Upload, Activity, Gauge, Sparkles } from "lucide-react";

function Toggle({ on, onToggle }) {
  return (
    <button
      className="rd-toggle"
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        border: "none",
        cursor: "pointer",
        position: "relative",
        padding: 0,
        flexShrink: 0,
        background: on ? "#C8FF00" : "#262626",
        boxShadow: on ? "0 0 12px rgba(200,255,0,0.25)" : "none",
        transition: "background 0.25s ease",
      }}
      onClick={onToggle}
    >
      <div
        className="rd-toggle-knob"
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: on ? "#0B0B0B" : "#FFFFFF",
          position: "absolute",
          top: 2,
          left: on ? 20 : 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          transition: "left 0.25s ease, background 0.25s ease",
        }}
      />
    </button>
  );
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="rd-tabbar" style={{ padding: 3 }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`rd-tab ${value === opt.value ? "active" : ""}`}
          style={{ padding: "7px 14px", fontSize: 12 }}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SettingRow({ icon: Icon, tone, name, desc, last, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        padding: "12px 2px",
        borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.055)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div
          className={`rd-card-title-ico ${tone}`}
          style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0 }}
        >
          <Icon size={16} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>{name}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{desc}</div>
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function CardHead({ icon: Icon, tone, kicker, name, iconStyle }) {
  return (
    <div className="rd-card-head">
      <div className="rd-card-title">
        <div className={`rd-card-title-ico ${tone}`} style={iconStyle}><Icon size={15} /></div>
        <div>
          <div className="rd-card-kicker">{kicker}</div>
          <div className="rd-card-name">{name}</div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="rd-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="rd-modal"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rd-modal-title">{title}</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: "8px 0 20px" }}>{message}</p>
            {children}
            <div style={{ display: "flex", gap: 12 }}>
              <button className="rd-btn-secondary" style={{ flex: 1 }} onClick={onCancel}>
                Cancel
              </button>
              <button className="rd-btn-primary" style={{ flex: 1 }} onClick={onConfirm}>
                {confirmLabel || "Confirm"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Settings({ state, dispatch }) {
  const { profile = {}, settings = {}, xp = 0, level = 1 } = state || {};
  const fileInputRef = useRef(null);

  const [darkMode, setDarkMode] = useState(true);
  const [units, setUnits] = useState({
    weight: settings.units?.weight || "kg",
    height: settings.units?.height || "cm",
    distance: settings.units?.distance || "km",
  });
  const [notifications, setNotifications] = useState({
    workoutReminders: settings.notifications?.workoutReminders ?? true,
    waterReminders: settings.notifications?.waterReminders ?? true,
    goalReminders: settings.notifications?.goalReminders ?? true,
  });
  const [privacy, setPrivacy] = useState({
    activityTracking: settings.privacy?.activityTracking ?? true,
    dataSharing: settings.privacy?.dataSharing ?? false,
    analytics: settings.privacy?.analytics ?? true,
  });
  const [displayName, setDisplayName] = useState(profile.name || "");
  const [deleteEmail, setDeleteEmail] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("fit_notifications");
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("fit_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const updateUnit = (key, value) => {
    const updated = { ...units, [key]: value };
    setUnits(updated);
    dispatch({ type: "UPDATE_SETTINGS", payload: { units: updated } });
  };

  const updateNotification = (key, value) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    dispatch({ type: "UPDATE_SETTINGS", payload: { notifications: updated } });
  };

  const updatePrivacy = (key, value) => {
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    dispatch({ type: "UPDATE_SETTINGS", payload: { privacy: updated } });
  };

  const saveProfile = () => {
    if (displayName.trim()) {
      dispatch({ type: "UPDATE_PROFILE", payload: { name: displayName.trim() } });
    }
  };

  const exportData = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fit-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        dispatch({ type: "LOAD_DATA", payload: data });
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDelete = () => {
    if (deleteEmail === profile.email) {
      setShowDeleteModal(false);
      setDeleteEmail("");
      dispatch({ type: "RESET" });
    }
  };

  const handleReset = () => {
    setShowResetModal(false);
    dispatch({ type: "RESET" });
  };

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "Unknown";

  return (
    <div className="rd-page">
      <div className="rd-page-head">
        <div>
          <span className="rd-kicker"><SettingsIcon size={13} /> Settings</span>
          <h1 className="rd-title">Settings</h1>
          <p className="rd-sub">Customize your experience</p>
        </div>
      </div>

      <div className="rd-stack">
        <div className="rd-card">
          <CardHead icon={Palette} tone="purple" kicker="Personalize" name="Appearance" />
          <SettingRow
            icon={Palette}
            tone="purple"
            name="Dark Mode"
            desc="Currently always on"
            last={false}
          >
            <Toggle on={darkMode} onToggle={() => setDarkMode(!darkMode)} />
          </SettingRow>
          <SettingRow
            icon={Sparkles}
            tone="purple"
            name="Accent Color"
            desc={<span style={{ color: "#C8FF00" }}>#C8FF00</span>}
            last={true}
          >
            <span className="rd-chip active"><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#C8FF00" }} /> Lime</span>
          </SettingRow>
        </div>

        <div className="rd-card">
          <CardHead icon={Ruler} tone="lime" kicker="Measurement" name="Units" />
          <SettingRow icon={Scale} tone="lime" name="Weight" desc="Barbell and bodyweight" last={false}>
            <ToggleGroup
              value={units.weight}
              onChange={(v) => updateUnit("weight", v)}
              options={[
                { value: "kg", label: "kg" },
                { value: "lbs", label: "lbs" },
              ]}
            />
          </SettingRow>
          <SettingRow icon={Ruler} tone="blue" name="Height" desc="Body height unit" last={false}>
            <ToggleGroup
              value={units.height}
              onChange={(v) => updateUnit("height", v)}
              options={[
                { value: "cm", label: "cm" },
                { value: "ft", label: "ft" },
              ]}
            />
          </SettingRow>
          <SettingRow icon={Map} tone="orange" name="Distance" desc="Run and cardio unit" last={true}>
            <ToggleGroup
              value={units.distance}
              onChange={(v) => updateUnit("distance", v)}
              options={[
                { value: "km", label: "km" },
                { value: "miles", label: "mi" },
              ]}
            />
          </SettingRow>
        </div>

        <div className="rd-card">
          <CardHead icon={Bell} tone="blue" kicker="Alerts" name="Notifications" />
          <SettingRow
            icon={Bell}
            tone="blue"
            name="Workout Reminders"
            desc="Nudge for your training sessions"
            last={false}
          >
            <Toggle
              on={notifications.workoutReminders}
              onToggle={() => updateNotification("workoutReminders", !notifications.workoutReminders)}
            />
          </SettingRow>
          <SettingRow
            icon={Droplets}
            tone="blue"
            name="Water Reminders"
            desc="Hydration check-ins"
            last={false}
          >
            <Toggle
              on={notifications.waterReminders}
              onToggle={() => updateNotification("waterReminders", !notifications.waterReminders)}
            />
          </SettingRow>
          <SettingRow
            icon={Trophy}
            tone="purple"
            name="Goal Reminders"
            desc="Milestone and goal updates"
            last={true}
          >
            <Toggle
              on={notifications.goalReminders}
              onToggle={() => updateNotification("goalReminders", !notifications.goalReminders)}
            />
          </SettingRow>
        </div>

        <div className="rd-card">
          <CardHead icon={User} tone="lime" kicker="Profile" name="Account" />
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 10 }}>
            <div className="rd-field">
              <label>Display Name</label>
              <input
                className="rd-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onBlur={saveProfile}
                placeholder="Enter name"
              />
            </div>
            <div className="rd-field">
              <label>Email</label>
              <input
                className="rd-input"
                style={{ color: "rgba(255,255,255,0.35)", cursor: "not-allowed" }}
                value={profile.email || "Not set"}
                readOnly
              />
            </div>
          </div>
          <div className="rd-break-row">
            <span className="n">Member Since</span>
            <span className="m">{memberSince}</span>
          </div>
          <div className="rd-break-row">
            <span className="n">Current Level</span>
            <span className="m"><b>Level {level}</b></span>
          </div>
          <div className="rd-break-row" style={{ borderBottom: "none" }}>
            <span className="n">Experience Points</span>
            <span className="m" style={{ color: "#FFFFFF" }}><b style={{ color: "#C8FF00" }}>{xp} XP</b></span>
          </div>
        </div>

        <div className="rd-card">
          <CardHead icon={Database} tone="orange" kicker="Backup" name="Data Management" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="rd-btn-primary" style={{ width: "100%" }} onClick={exportData}>
              <Download size={15} /> Export All Data
            </button>
            <button className="rd-btn-secondary" style={{ width: "100%" }} onClick={() => fileInputRef.current?.click()}>
              <Upload size={15} /> Import Data
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={importData}
            />
            <button
              className="rd-btn-secondary"
              style={{ width: "100%", color: "#FF4757", borderColor: "rgba(255,71,87,0.3)" }}
              onClick={() => setShowResetModal(true)}
            >
              <RefreshCw size={15} /> Reset All Data
            </button>
          </div>
        </div>

        <div className="rd-card">
          <CardHead icon={Shield} tone="blue" kicker="Control" name="Privacy" />
          <SettingRow
            icon={Activity}
            tone="blue"
            name="Activity Tracking"
            desc="Record your workout activity"
            last={false}
          >
            <Toggle
              on={privacy.activityTracking}
              onToggle={() => updatePrivacy("activityTracking", !privacy.activityTracking)}
            />
          </SettingRow>
          <SettingRow
            icon={Shield}
            tone="blue"
            name="Data Sharing"
            desc="Share data with partners"
            last={false}
          >
            <Toggle
              on={privacy.dataSharing}
              onToggle={() => updatePrivacy("dataSharing", !privacy.dataSharing)}
            />
          </SettingRow>
          <SettingRow
            icon={Gauge}
            tone="purple"
            name="Analytics"
            desc="Help improve the product"
            last={true}
          >
            <Toggle
              on={privacy.analytics}
              onToggle={() => updatePrivacy("analytics", !privacy.analytics)}
            />
          </SettingRow>
        </div>

        <div className="rd-card" style={{ border: "1px solid rgba(255,71,87,0.35)" }}>
          <CardHead
            icon={Trash2}
            iconStyle={{ background: "rgba(255,71,87,0.1)", borderColor: "rgba(255,71,87,0.2)", color: "#FF4757" }}
            kicker="Irreversible"
            name="Danger Zone"
          />
          <div style={{ background: "rgba(255,71,87,0.06)", border: "1px solid rgba(255,71,87,0.2)", borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#FF9F43", lineHeight: 1.6 }}>
              Deleting your account is permanent. All your data, progress, and settings will be
              permanently removed. This action cannot be undone.
            </div>
          </div>
          <button
            className="rd-btn-secondary"
            style={{ width: "100%", color: "#FF4757", borderColor: "rgba(255,71,87,0.35)" }}
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={15} /> Delete Account
          </button>
        </div>
      </div>

      <ConfirmModal
        open={showResetModal}
        title="Reset All Data?"
        message="This will delete all your workouts, progress, and settings. This action cannot be undone."
        confirmLabel="Reset"
        onConfirm={handleReset}
        onCancel={() => {
          setShowResetModal(false);
        }}
      />

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="rd-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="rd-modal"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="rd-modal-title">Delete Account</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: "8px 0 16px" }}>
                This action is permanent and cannot be undone. To confirm, type your email address
                below.
              </p>
              <div style={{ background: "rgba(255,71,87,0.06)", border: "1px solid rgba(255,71,87,0.2)", borderRadius: 12, padding: 14, marginBottom: 18 }}>
                <div style={{ fontSize: 13, color: "#FF9F43", lineHeight: 1.6 }}>
                  All your data including workouts, progress, achievements, and settings will be
                  permanently deleted.
                </div>
              </div>
              <div className="rd-field" style={{ marginBottom: 18 }}>
                <label>
                  Your email: <span style={{ color: "#FFFFFF", textTransform: "none", letterSpacing: "normal" }}>{profile.email}</span>
                </label>
                <input
                  className="rd-input"
                  style={{ borderColor: deleteEmail && deleteEmail !== profile.email ? "rgba(255,71,87,0.5)" : undefined }}
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  placeholder="Type your email to confirm"
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  className="rd-btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteEmail("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="rd-btn-secondary"
                  style={{
                    flex: 1,
                    background: deleteEmail === profile.email ? "rgba(255,71,87,0.12)" : "rgba(255,255,255,0.03)",
                    color: deleteEmail === profile.email ? "#FF4757" : "rgba(255,255,255,0.3)",
                    borderColor: deleteEmail === profile.email ? "rgba(255,71,87,0.4)" : "rgba(255,255,255,0.07)",
                    cursor: deleteEmail === profile.email ? "pointer" : "not-allowed",
                  }}
                  onClick={handleDelete}
                  disabled={deleteEmail !== profile.email}
                >
                  <Trash2 size={14} /> Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
