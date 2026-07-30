import { useState } from "react";
import React from "react";
import { motion } from "framer-motion";
import { EXERCISE_DB, showToast } from "../utils/helpers";

const Card = ({ children, style, className = "" }) => (
    <div className={glass} style={{ padding: "20px", ...style }}>{children}</div>
);

const WorkoutTemplates = ({ state, dispatch }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [tmplName, setTmplName] = useState("");
  const [tmplDesc, setTmplDesc] = useState("");
  const [tmplExercises, setTmplExercises] = useState([]);
  const [addExSearch, setAddExSearch] = useState("");
  const [addExOpen, setAddExOpen] = useState(false);

  const openCreate = (template = null) => {
    if (template) {
      setEditTemplate(template);
      setTmplName(template.name);
      setTmplDesc(template.description || "");
      setTmplExercises(template.exercises.map(e => ({ ...e })));
    } else {
      setEditTemplate(null);
      setTmplName("");
      setTmplDesc("");
      setTmplExercises([]);
    }
    setShowCreate(true);
  };

  const saveTemplate = () => {
    if (!tmplName.trim() || tmplExercises.length === 0) return;
    const payload = { name: tmplName.trim(), description: tmplDesc.trim(), exercises: tmplExercises };
    if (editTemplate) {
      dispatch({ type: "UPDATE_TEMPLATE", payload: { ...payload, id: editTemplate.id } });
      showToast("Template updated");
    } else {
      dispatch({ type: "SAVE_TEMPLATE", payload });
      showToast("Template saved");
    }
    setShowCreate(false);
  };

  const startFromTemplate = (template) => {
    if (state.activeSession) { showToast("Finish your current workout first"); return; }
    const session = {
      id: Date.now(), date: new Date().toISOString().split("T")[0], startTime: new Date().toISOString(),
      name: template.name, exercises: template.exercises.map(e => {
        const exDef = EXERCISE_DB.find(d => d.id === e.exerciseId) || {};
        return {
          exerciseId: e.exerciseId, exerciseName: e.exerciseName || exDef.name || "Unknown", notes: "",
          prevWeight: 0, prevReps: 0,
          sets: Array.from({ length: e.sets || exDef.defaultSets || 3 }, (_, i) => ({
            setNum: i + 1, weight: e.lastWeight || 0, reps: e.defaultReps || exDef.defaultReps || 10, rpe: 0, done: false, isWarmup: false, isDropset: false,
          })),
        };
      }),
    };
    dispatch({ type: "START_SESSION", payload: session });
    window.__setPage?.("session");
  };

  const addExerciseToTemplate = (exDef) => {
    setTmplExercises(p => [...p, { exerciseId: exDef.id, exerciseName: exDef.name, sets: exDef.defaultSets, defaultReps: exDef.defaultReps, lastWeight: 0 }]);
    setAddExOpen(false);
    setAddExSearch("");
  };

  const allExercises = [...EXERCISE_DB, ...(state.customExercises || [])];
  const searchResults = allExercises.filter(ex => addExSearch ? ex.name.toLowerCase().includes(addExSearch.toLowerCase()) || ex.primary.toLowerCase().includes(addExSearch.toLowerCase()) : false).slice(0, 10);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="wm-page-header">
        <h2>Workout Templates</h2>
        <button className="neon-btn" onClick={() => openCreate()} style={{ fontSize: 13 }}>+ Create Template</button>
      </div>

      {(state.workoutTemplates || []).length === 0 && !showCreate ? (
        <div className="wm-empty">
          <div className="wm-empty-icon">📋</div>
          <div className="wm-empty-title">No Templates Yet</div>
          <div className="wm-empty-desc">Create reusable workout templates to start sessions quickly.</div>
          <button className="neon-btn" onClick={() => openCreate()}>Create Your First Template</button>
        </div>
      ) : !showCreate && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {(state.workoutTemplates || []).map(t => (
            <motion.div key={t.id} className="wm-template-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF", marginBottom: 4 }}>{t.name}</div>
              {t.description && <div style={{ fontSize: 12, color: "#A0A0A0", marginBottom: 8 }}>{t.description}</div>}
              <div style={{ fontSize: 12, color: "rgba(160,160,160,0.5)", marginBottom: 12 }}>
                {t.exercises?.length || 0} exercise{t.exercises?.length !== 1 ? "s" : ""} · {t.exercises?.reduce((s, e) => s + (e.sets || 3), 0) || 0} sets
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                {t.exercises?.slice(0, 5).map((e, i) => (
                  <span key={i} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(200,255,0,0.08)", color: "#C8FF00" }}>{e.exerciseName}</span>
                ))}
                {(t.exercises?.length || 0) > 5 && <span style={{ fontSize: 10, color: "#A0A0A0" }}>+{t.exercises.length - 5} more</span>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="neon-btn" onClick={() => startFromTemplate(t)} style={{ flex: 1, fontSize: 12, padding: "8px 0" }}>Start Workout</button>
                <button className="ghost-btn" onClick={() => openCreate(t)} style={{ fontSize: 12, padding: "8px 12px" }}>Edit</button>
                <button className="ghost-btn" onClick={() => { if (confirm('Delete "' + t.name + '"?')) dispatch({ type: "DELETE_TEMPLATE", payload: t.id }); }}
                  style={{ fontSize: 12, padding: "8px 10px", color: "#FF4757", borderColor: "rgba(255,71,87,0.3)" }}>✕</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>{editTemplate ? "Edit Template" : "Create Template"}</h3>
              <button className="ghost-btn" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <input placeholder="Template name (e.g., Push Day A)" value={tmplName} onChange={e => setTmplName(e.target.value)} autoFocus />
              <input placeholder="Description (optional)" value={tmplDesc} onChange={e => setTmplDesc(e.target.value)} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", marginBottom: 10 }}>Exercises ({tmplExercises.length})</div>
            {tmplExercises.map((ex, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#A0A0A0", width: 20, textAlign: "center" }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: "#FFFFFF", flex: 1 }}>{ex.exerciseName}</span>
                <input className="wm-set-input" type="number" value={ex.sets} style={{ width: 50 }} placeholder="Sets"
                  onChange={e => setTmplExercises(p => p.map((x, j) => j === i ? { ...x, sets: +e.target.value } : x))} />
                <span style={{ fontSize: 11, color: "#A0A0A0" }}>× </span>
                <input className="wm-set-input" type="number" value={ex.defaultReps} style={{ width: 50 }} placeholder="Reps"
                  onChange={e => setTmplExercises(p => p.map((x, j) => j === i ? { ...x, defaultReps: +e.target.value } : x))} />
                <button onClick={() => setTmplExercises(p => p.filter((_, j) => j !== i))} style={{ background: "none", color: "#FF4757", fontSize: 16, padding: 4 }}>×</button>
              </div>
            ))}
            <div style={{ position: "relative", marginTop: 8 }}>
              <button className="ghost-btn" onClick={() => setAddExOpen(!addExOpen)} style={{ width: "100%", padding: 10, borderStyle: "dashed", fontSize: 13 }}>+ Add Exercise</button>
              {addExOpen && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "rgba(15,15,15,0.98)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 8, zIndex: 10, maxHeight: 250, overflowY: "auto" }}>
                  <input placeholder="Search..." value={addExSearch} onChange={e => setAddExSearch(e.target.value)} autoFocus style={{ marginBottom: 6 }} />
                  {searchResults.map(ex => (
                    <div key={ex.id} style={{ padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#FFFFFF", transition: "background 0.15s" }}
                      className="wm-exercise-card" onClick={() => addExerciseToTemplate(ex)}>
                      {ex.name} <span style={{ fontSize: 11, color: "#A0A0A0" }}>({ex.primary})</span>
                    </div>
                  ))}
                  {addExSearch && searchResults.length === 0 && (
                    <div style={{ padding: 12, textAlign: "center", fontSize: 12, color: "#A0A0A0" }}>No results</div>
                  )}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="ghost-btn" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: 12 }}>Cancel</button>
              <button className="neon-btn" onClick={saveTemplate} disabled={!tmplName.trim() || tmplExercises.length === 0} style={{ flex: 2, padding: 12 }}>
                {editTemplate ? "Update Template" : "Save Template"}
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default WorkoutTemplates;
