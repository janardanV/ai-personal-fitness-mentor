import { useState } from "react";
import { User, UserCog, Pencil, Check, Trash2 } from "lucide-react";
import { GOAL_LABELS, showConfirm, showToast } from "../utils/helpers";

const StatCard = ({ label, value, unit, color = "lime", sub }) => (
  <div className={`rd-nut-stat ${color}`}>
    <div className="l">{label}</div>
    <div className="v">{value}{unit && <span> {unit}</span>}</div>
    {sub && <div className="s">{sub}</div>}
  </div>
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

  const fields = [["name", "Name", "text"], ["age", "Age", "number"], ["weight", "Weight (kg)", "number"], ["height", "Height (cm)", "number"], ["bodyFat", "Body Fat (%)", "number"]];

  return (
    <div className="rd-page">
      <div className="rd-page-head">
        <div>
          <span className="rd-kicker"><User size={13} /> Profile</span>
          <h1 className="rd-title">My Profile</h1>
          <p className="rd-sub">Manage your personal details, goals, and daily targets.</p>
        </div>
        <button className={editing ? "rd-btn-primary" : "rd-btn-secondary"} onClick={editing ? handleSave : () => setEditing(true)} style={{ alignSelf: "center" }}>
          {editing ? <><Check size={16} /> Save Changes</> : <><Pencil size={16} /> Edit Profile</>}
        </button>
      </div>

      <div className="rd-2col">
        <div className="rd-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
          <div className="rd-card-head" style={{ width: "100%", justifyContent: "center", marginBottom: 4 }}>
            <div className="rd-card-title">
              <div className="rd-card-title-ico lime"><User size={15} /></div>
              <div>
                <div className="rd-card-kicker">Identity</div>
                <div className="rd-card-name">Overview</div>
              </div>
            </div>
          </div>
          <div style={{ width: 96, height: 96, borderRadius: "50%", background: "linear-gradient(135deg, #C8FF00, #A5E600)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 40, fontWeight: 800, color: "#0B0B0B", boxShadow: "0 10px 32px rgba(200,255,0,0.22)" }}>
            {profile.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>{profile.name}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            Level <span style={{ color: "#C8FF00", fontWeight: 700 }}>{state.level}</span> · <span style={{ color: "#C8FF00", fontWeight: 700 }}>{state.xp}</span> XP
          </div>
        </div>

        <div className="rd-card">
          <div className="rd-card-head">
            <div className="rd-card-title">
              <div className="rd-card-title-ico blue"><UserCog size={15} /></div>
              <div>
                <div className="rd-card-kicker">Details</div>
                <div className="rd-card-name">Personal Details</div>
              </div>
            </div>
          </div>
          <div className="rd-form">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 14 }}>
              {fields.map(([k, l, t]) => (
                <div className="rd-field" key={k}>
                  <label>{l}</label>
                  {editing
                    ? <input className="rd-input" type={t} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: t === "number" ? +e.target.value : e.target.value }))} />
                    : <div style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF", padding: "10px 0" }}>{profile[k]}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rd-nut-stats">
        <StatCard label="TDEE" value={profile.tdee} unit="kcal" color="orange" />
        <StatCard label="Target Calories" value={profile.calories} unit="kcal" color="green" />
        <StatCard label="Protein Target" value={profile.protein} unit="g" color="lime" />
        <StatCard label="Goal" value={GOAL_LABELS[profile.goal]} color="purple" />
      </div>

      <div className="rd-card" style={{ borderColor: "rgba(255,71,87,0.14)" }}>
        <div className="rd-card-head">
          <div className="rd-card-title">
            <div className="rd-card-title-ico" style={{ background: "rgba(255,71,87,0.1)", borderColor: "rgba(255,71,87,0.2)", color: "#FF4757" }}><Trash2 size={15} /></div>
            <div>
              <div className="rd-card-kicker">Danger zone</div>
              <div className="rd-card-name">Reset All Data</div>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 16, lineHeight: 1.6, maxWidth: 560 }}>
          This will permanently delete all your workouts, nutrition logs, and progress data.
        </p>
        <button className="rd-btn-sm danger" onClick={async () => { if (await showConfirm("Are you sure? This will permanently delete all your workouts, nutrition logs, and progress data. This cannot be undone.")) dispatch({ type: "RESET" }); }}>
          <Trash2 size={14} /> Reset All Data
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
