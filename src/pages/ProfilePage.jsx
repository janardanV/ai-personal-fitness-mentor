import { useState } from "react";
import React from "react";
import { COLORS, GOAL_LABELS, showConfirm, showToast } from "../utils/helpers";

const StatCard = ({ label, value, unit, color = COLORS.primary, sub }) => (
  <div style={{ background: "#151515", border: `1px solid ${color}18`, borderRadius: 16, padding: "18px 16px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(${color}20, transparent)`, borderRadius: "0 0 0 100%" }} />
    <div style={{ fontSize: 11, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 500 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em" }}>{value}<span style={{ fontSize: 13, fontWeight: 400, marginLeft: 4, color: "#A0A0A0" }}>{unit}</span></div>
    {sub && <div style={{ fontSize: 11, color: "#A0A0A0", marginTop: 4 }}>{sub}</div>}
  </div>
);

const Card = ({ children, style, className = "" }) => (
  <div className={`glass ${className}`} style={{ padding: "20px", ...style }}>{children}</div>
);

const ProfilePage = ({ state, dispatch }) => {
  const { profile } = state;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });

  const handleSave = () => {
    dispatch({ type: "UPDATE_PROFILE", payload: form });
    setEditing(false);
    showToast("Profile updated!");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Profile</h2>
        <button className={editing ? "neon-btn" : "ghost-btn"} onClick={editing ? handleSave : () => setEditing(true)}>{editing ? "Save Changes" : "Edit Profile"}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20 }}>
        <div style={{ textAlign: "center" }}>
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, #151515, #252525)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, marginBottom: 12 }}>
            {profile.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{profile.name}</div>
          <div style={{ fontSize: 12, color: "#A0A0A0" }}>Level {state.level} · {state.xp} XP</div>
        </div>

        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {[["name", "Name", "text"], ["age", "Age", "number"], ["weight", "Weight (kg)", "number"], ["height", "Height (cm)", "number"], ["bodyFat", "Body Fat (%)", "number"]].map(([k, l, t]) => (
              <div key={k}>
                <label style={{ fontSize: 11, color: "#A0A0A0", display: "block", marginBottom: 4 }}>{l}</label>
                {editing
                  ? <input type={t} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: t === "number" ? +e.target.value : e.target.value }))} />
                  : <div style={{ fontSize: 15, fontWeight: 500 }}>{profile[k]}</div>}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <StatCard label="TDEE" value={profile.tdee} unit="kcal" color={COLORS.amber} />
        <StatCard label="Target Calories" value={profile.calories} unit="kcal" color="var(--green)" />
        <StatCard label="Protein Target" value={profile.protein} unit="g" color={COLORS.primary} />
        <StatCard label="Goal" value={GOAL_LABELS[profile.goal]} color={COLORS.cyan} />
      </div>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Reset All Data</div>
        <p style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 12 }}>This will permanently delete all your workouts, nutrition logs, and progress data.</p>
        <button style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: COLORS.red, borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }} onClick={async () => { if (await showConfirm("Are you sure? This will permanently delete all your workouts, nutrition logs, and progress data. This cannot be undone.")) dispatch({ type: "RESET" }); }}>Reset All Data</button>
      </Card>
    </div>
  );
};

export default ProfilePage;
