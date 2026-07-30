import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const s = {
  container: {
    minHeight: "100vh",
    background: "#0B0B0B",
    color: "#FFFFFF",
    padding: "20px",
    paddingBottom: "100px",
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  header: {
    marginBottom: "30px",
    paddingTop: "10px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#A0A0A0",
  },
  section: {
    background: "#151515",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#A0A0A0",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "16px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 0",
    borderBottom: "1px solid #1E1E1E",
  },
  lastRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 0",
  },
  label: {
    fontSize: "15px",
    color: "#FFFFFF",
    fontWeight: "500",
  },
  sublabel: {
    fontSize: "12px",
    color: "#A0A0A0",
    marginTop: "2px",
  },
  toggle: {
    width: "48px",
    height: "26px",
    borderRadius: "13px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    transition: "background 0.25s ease",
    padding: 0,
  },
  toggleOn: {
    background: "#C8FF00",
  },
  toggleOff: {
    background: "#333333",
  },
  knob: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#FFFFFF",
    position: "absolute",
    top: "3px",
    transition: "left 0.25s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
  },
  input: {
    background: "#1E1E1E",
    border: "1px solid #2A2A2A",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "#FFFFFF",
    fontSize: "14px",
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
  },
  inputReadOnly: {
    background: "#1E1E1E",
    border: "1px solid #2A2A2A",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "#666666",
    fontSize: "14px",
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
    cursor: "not-allowed",
  },
  toggleGroup: {
    display: "flex",
    background: "#1E1E1E",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #2A2A2A",
  },
  toggleBtn: {
    flex: 1,
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    transition: "all 0.25s ease",
    fontFamily: "inherit",
    textAlign: "center",
  },
  toggleBtnActive: {
    background: "#C8FF00",
    color: "#0B0B0B",
  },
  toggleBtnInactive: {
    background: "transparent",
    color: "#A0A0A0",
  },
  accentDot: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "#C8FF00",
    marginRight: "10px",
    flexShrink: 0,
  },
  accentRow: {
    display: "flex",
    alignItems: "center",
    padding: "14px 0",
  },
  btn: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 0.2s ease",
  },
  btnPrimary: {
    background: "#C8FF00",
    color: "#0B0B0B",
  },
  btnSecondary: {
    background: "#1E1E1E",
    color: "#FFFFFF",
    border: "1px solid #2A2A2A",
  },
  btnDanger: {
    background: "#FF3B30",
    color: "#FFFFFF",
  },
  btnOutlineDanger: {
    background: "transparent",
    color: "#FF3B30",
    border: "1px solid #FF3B30",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    background: "#151515",
    borderRadius: "20px",
    padding: "28px",
    width: "100%",
    maxWidth: "380px",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: "8px",
  },
  modalText: {
    fontSize: "14px",
    color: "#A0A0A0",
    lineHeight: "1.5",
    marginBottom: "20px",
  },
  modalBtnRow: {
    display: "flex",
    gap: "12px",
  },
  modalBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  hiddenInput: {
    display: "none",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    background: "#1E1E1E",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "13px",
    color: "#C8FF00",
    fontWeight: "600",
  },
  warningBox: {
    background: "#2A1500",
    border: "1px solid #FF3B30",
    borderRadius: "10px",
    padding: "14px",
    marginBottom: "20px",
  },
  warningText: {
    fontSize: "13px",
    color: "#FF9500",
    lineHeight: "1.5",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 0",
  },
  infoLabel: {
    fontSize: "13px",
    color: "#A0A0A0",
  },
  infoValue: {
    fontSize: "13px",
    color: "#FFFFFF",
    fontWeight: "600",
  },
};

function Toggle({ on, onToggle }) {
  return (
    <button
      style={{
        ...s.toggle,
        ...(on ? s.toggleOn : s.toggleOff),
      }}
      onClick={onToggle}
    >
      <div
        style={{
          ...s.knob,
          left: on ? "25px" : "3px",
        }}
      />
    </button>
  );
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div style={s.toggleGroup}>
      {options.map((opt) => (
        <button
          key={opt.value}
          style={{
            ...s.toggleBtn,
            ...(value === opt.value ? s.toggleBtnActive : s.toggleBtnInactive),
          }}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          style={s.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            style={s.modal}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div style={s.modalTitle}>{title}</div>
            <div style={s.modalText}>{message}</div>
            {children}
            <div style={s.modalBtnRow}>
              <button
                style={{
                  ...s.modalBtn,
                  background: "#1E1E1E",
                  color: "#A0A0A0",
                }}
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                style={{
                  ...s.modalBtn,
                  background: "#FF3B30",
                  color: "#FFFFFF",
                }}
                onClick={onConfirm}
              >
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
    <div style={s.container}>
      <motion.div
        style={s.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div style={s.title}>Settings</div>
        <div style={s.subtitle}>Customize your experience</div>
      </motion.div>

      {/* Appearance */}
      <motion.div
        style={s.section}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <div style={s.sectionTitle}>Appearance</div>
        <div style={s.row}>
          <div>
            <div style={s.label}>Dark Mode</div>
            <div style={s.sublabel}>Currently always on</div>
          </div>
          <Toggle on={darkMode} onToggle={() => setDarkMode(!darkMode)} />
        </div>
        <div style={s.accentRow}>
          <div style={s.accentDot} />
          <div>
            <div style={s.label}>Accent Color</div>
            <div style={{ ...s.sublabel, color: "#C8FF00" }}>#C8FF00</div>
          </div>
        </div>
      </motion.div>

      {/* Units */}
      <motion.div
        style={s.section}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div style={s.sectionTitle}>Units</div>
        <div style={s.row}>
          <div style={s.label}>Weight</div>
          <ToggleGroup
            value={units.weight}
            onChange={(v) => updateUnit("weight", v)}
            options={[
              { value: "kg", label: "kg" },
              { value: "lbs", label: "lbs" },
            ]}
          />
        </div>
        <div style={s.row}>
          <div style={s.label}>Height</div>
          <ToggleGroup
            value={units.height}
            onChange={(v) => updateUnit("height", v)}
            options={[
              { value: "cm", label: "cm" },
              { value: "ft", label: "ft" },
            ]}
          />
        </div>
        <div style={s.lastRow}>
          <div style={s.label}>Distance</div>
          <ToggleGroup
            value={units.distance}
            onChange={(v) => updateUnit("distance", v)}
            options={[
              { value: "km", label: "km" },
              { value: "miles", label: "mi" },
            ]}
          />
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        style={s.section}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <div style={s.sectionTitle}>Notifications</div>
        <div style={s.row}>
          <div style={s.label}>Workout Reminders</div>
          <Toggle
            on={notifications.workoutReminders}
            onToggle={() => updateNotification("workoutReminders", !notifications.workoutReminders)}
          />
        </div>
        <div style={s.row}>
          <div style={s.label}>Water Reminders</div>
          <Toggle
            on={notifications.waterReminders}
            onToggle={() => updateNotification("waterReminders", !notifications.waterReminders)}
          />
        </div>
        <div style={s.lastRow}>
          <div style={s.label}>Goal Reminders</div>
          <Toggle
            on={notifications.goalReminders}
            onToggle={() => updateNotification("goalReminders", !notifications.goalReminders)}
          />
        </div>
      </motion.div>

      {/* Account */}
      <motion.div
        style={s.section}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div style={s.sectionTitle}>Account</div>
        <div style={{ marginBottom: "14px" }}>
          <div style={{ ...s.sublabel, marginBottom: "6px" }}>Display Name</div>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              style={{ ...s.input, flex: 1 }}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={saveProfile}
              placeholder="Enter name"
            />
          </div>
        </div>
        <div style={{ marginBottom: "14px" }}>
          <div style={{ ...s.sublabel, marginBottom: "6px" }}>Email</div>
          <input
            style={s.inputReadOnly}
            value={profile.email || "Not set"}
            readOnly
          />
        </div>
        <div style={s.infoRow}>
          <span style={s.infoLabel}>Member Since</span>
          <span style={s.infoValue}>{memberSince}</span>
        </div>
        <div style={s.infoRow}>
          <span style={s.infoLabel}>Current Level</span>
          <span style={s.badge}>Level {level}</span>
        </div>
        <div style={s.infoRow}>
          <span style={s.infoLabel}>Experience Points</span>
          <span style={{ ...s.badge, color: "#FFFFFF" }}>{xp} XP</span>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        style={s.section}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <div style={s.sectionTitle}>Data Management</div>
        <div style={{ marginBottom: "12px" }}>
          <button
            style={{ ...s.btn, ...s.btnPrimary }}
            onClick={exportData}
          >
            Export All Data
          </button>
        </div>
        <div style={{ marginBottom: "12px" }}>
          <button
            style={{ ...s.btn, ...s.btnSecondary }}
            onClick={() => fileInputRef.current?.click()}
          >
            Import Data
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={s.hiddenInput}
            onChange={importData}
          />
        </div>
        <button
          style={{ ...s.btn, ...s.btnOutlineDanger }}
          onClick={() => setShowResetModal(true)}
        >
          Reset All Data
        </button>
      </motion.div>

      {/* Privacy */}
      <motion.div
        style={s.section}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div style={s.sectionTitle}>Privacy</div>
        <div style={s.row}>
          <div style={s.label}>Activity Tracking</div>
          <Toggle
            on={privacy.activityTracking}
            onToggle={() => updatePrivacy("activityTracking", !privacy.activityTracking)}
          />
        </div>
        <div style={s.row}>
          <div style={s.label}>Data Sharing</div>
          <Toggle
            on={privacy.dataSharing}
            onToggle={() => updatePrivacy("dataSharing", !privacy.dataSharing)}
          />
        </div>
        <div style={s.lastRow}>
          <div style={s.label}>Analytics</div>
          <Toggle
            on={privacy.analytics}
            onToggle={() => updatePrivacy("analytics", !privacy.analytics)}
          />
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        style={{ ...s.section, border: "1px solid #FF3B30" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        <div style={{ ...s.sectionTitle, color: "#FF3B30" }}>Danger Zone</div>
        <div style={s.warningBox}>
          <div style={s.warningText}>
            Deleting your account is permanent. All your data, progress, and settings will be
            permanently removed. This action cannot be undone.
          </div>
        </div>
        <button
          style={{ ...s.btn, ...s.btnDanger }}
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Account
        </button>
      </motion.div>

      {/* Reset Modal */}
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

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            style={s.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              style={s.modal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div style={s.modalTitle}>Delete Account</div>
              <div style={s.modalText}>
                This action is permanent and cannot be undone. To confirm, type your email address
                below.
              </div>
              <div style={s.warningBox}>
                <div style={s.warningText}>
                  All your data including workouts, progress, achievements, and settings will be
                  permanently deleted.
                </div>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <div style={{ ...s.sublabel, marginBottom: "6px" }}>
                  Your email: <span style={{ color: "#FFFFFF" }}>{profile.email}</span>
                </div>
                <input
                  style={{
                    ...s.input,
                    borderColor: deleteEmail && deleteEmail !== profile.email ? "#FF3B30" : "#2A2A2A",
                  }}
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  placeholder="Type your email to confirm"
                />
              </div>
              <div style={s.modalBtnRow}>
                <button
                  style={{
                    ...s.modalBtn,
                    background: "#1E1E1E",
                    color: "#A0A0A0",
                  }}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteEmail("");
                  }}
                >
                  Cancel
                </button>
                <button
                  style={{
                    ...s.modalBtn,
                    background: deleteEmail === profile.email ? "#FF3B30" : "#333333",
                    color: deleteEmail === profile.email ? "#FFFFFF" : "#666666",
                    cursor: deleteEmail === profile.email ? "pointer" : "not-allowed",
                  }}
                  onClick={handleDelete}
                  disabled={deleteEmail !== profile.email}
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
