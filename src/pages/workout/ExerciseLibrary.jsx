import { useState } from "react";
import React from "react";
import { motion } from "framer-motion";
import { EXERCISE_DB, MUSCLE_GROUPS, EQUIPMENT_TYPES, EXERCISE_CATEGORIES, showToast } from "../../utils/helpers";

const ExerciseLibraryBase = ({ state, dispatch }) => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [equipFilter, setEquipFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newEx, setNewEx] = useState({ name: "", primary: "", secondary: "", equip: "Bodyweight", cat: "compound", type: "strength" });

  const allExercises = [...EXERCISE_DB, ...(state.customExercises || [])];
  const filtered = allExercises.filter(ex => {
    if (catFilter !== "all" && ex.cat !== catFilter) return false;
    if (muscleFilter !== "all" && ex.primary !== muscleFilter) return false;
    if (equipFilter !== "all" && ex.equip !== equipFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return ex.name.toLowerCase().includes(q) || ex.primary.toLowerCase().includes(q) || (ex.secondary || "").toLowerCase().includes(q) || ex.equip.toLowerCase().includes(q);
    }
    return true;
  });

  const addCustomExercise = () => {
    if (!newEx.name.trim()) return;
    dispatch({ type: "ADD_CUSTOM_EXERCISE", payload: { ...newEx, id: `custom_${Date.now()}`, name: newEx.name.trim() } });
    setNewEx({ name: "", primary: "", secondary: "", equip: "Bodyweight", cat: "compound", type: "strength" });
    setShowAdd(false);
    showToast("Exercise added to library");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="wm-page-header">
        <h2>Exercise Library</h2>
        <button className="neon-btn" onClick={() => setShowAdd(true)} style={{ fontSize: 13 }}>+ Custom Exercise</button>
      </div>

      <div className="wm-search-bar">
        <span className="search-icon">🔍</span>
        <input placeholder="Search exercises by name, muscle, or equipment..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="wm-filter-chips">
        <span style={{ fontSize: 11, color: "rgba(160,160,160,0.5)", alignSelf: "center", marginRight: 4 }}>Muscle:</span>
        <button className={`wm-chip ${muscleFilter === "all" ? "active" : ""}`} onClick={() => setMuscleFilter("all")}>All</button>
        {MUSCLE_GROUPS.map(m => (
          <button key={m} className={`wm-chip ${muscleFilter === m ? "active" : ""}`} onClick={() => setMuscleFilter(m)}>{m}</button>
        ))}
      </div>
      <div className="wm-filter-chips">
        <span style={{ fontSize: 11, color: "rgba(160,160,160,0.5)", alignSelf: "center", marginRight: 4 }}>Category:</span>
        <button className={`wm-chip ${catFilter === "all" ? "active" : ""}`} onClick={() => setCatFilter("all")}>All</button>
        {EXERCISE_CATEGORIES.map(c => (
          <button key={c} className={`wm-chip ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(c)}>{c.charAt(0).toUpperCase() + c.slice(1)}</button>
        ))}
      </div>
      <div className="wm-filter-chips">
        <span style={{ fontSize: 11, color: "rgba(160,160,160,0.5)", alignSelf: "center", marginRight: 4 }}>Equipment:</span>
        <button className={`wm-chip ${equipFilter === "all" ? "active" : ""}`} onClick={() => setEquipFilter("all")}>All</button>
        {EQUIPMENT_TYPES.map(e => (
          <button key={e} className={`wm-chip ${equipFilter === e ? "active" : ""}`} onClick={() => setEquipFilter(e)}>{e}</button>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "#A0A0A0", marginBottom: 4 }}>{filtered.length} exercise{filtered.length !== 1 ? "s" : ""}</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
        {filtered.map(ex => (
          <motion.div key={ex.id} className="wm-exercise-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ borderColor: "rgba(200,255,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF", marginBottom: 4 }}>{ex.name}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <span className="wm-muscle-tag">{ex.primary}</span>
                  {ex.secondary && <span className="wm-muscle-tag" style={{ background: "rgba(165,230,0,0.1)", color: "#A5E600" }}>{ex.secondary.split(",")[0]}</span>}
                </div>
              </div>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.04)", color: "#A0A0A0" }}>{ex.equip}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "rgba(160,160,160,0.5)" }}>
              <span>{ex.defaultSets} sets × {ex.defaultReps} reps</span>
              <span>{ex.type}</span>
            </div>
            {ex.id?.startsWith("custom_") && (
              <button className="ghost-btn" style={{ marginTop: 8, fontSize: 11, color: "#FF4757", padding: "4px 8px" }}
                onClick={() => { if (confirm(`Delete ${ex.name}?`)) dispatch({ type: "DELETE_CUSTOM_EXERCISE", payload: ex.id }); }}>Delete</button>
            )}
          </motion.div>
        ))}
      </div>

      {showAdd && (
        <motion.div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900, padding: 20 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowAdd(false)}>
          <motion.div style={{ width: "100%", maxWidth: 420, background: "rgba(15,15,15,0.98)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}
            initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", marginBottom: 16 }}>Add Custom Exercise</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input placeholder="Exercise name" value={newEx.name} onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))} autoFocus />
              <input placeholder="Primary muscle (e.g., Chest)" value={newEx.primary} onChange={e => setNewEx(p => ({ ...p, primary: e.target.value }))} />
              <input placeholder="Secondary muscles (optional)" value={newEx.secondary} onChange={e => setNewEx(p => ({ ...p, secondary: e.target.value }))} />
              <select value={newEx.equip} onChange={e => setNewEx(p => ({ ...p, equip: e.target.value }))}>
                {EQUIPMENT_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <select value={newEx.cat} onChange={e => setNewEx(p => ({ ...p, cat: e.target.value }))}>
                {EXERCISE_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="ghost-btn" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 12 }}>Cancel</button>
                <button className="neon-btn" onClick={addCustomExercise} style={{ flex: 1, padding: 12 }}>Add Exercise</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ExerciseLibraryBase;
