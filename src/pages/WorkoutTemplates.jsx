import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, ListChecks, Pencil, Play, Plus, Search, Timer, Trash2, X } from "lucide-react";
import { EXERCISE_DB, showConfirm, showToast } from "../utils/helpers";

const WorkoutTemplates = ({ state, dispatch }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [tmplName, setTmplName] = useState("");
  const [tmplDesc, setTmplDesc] = useState("");
  const [tmplExercises, setTmplExercises] = useState([]);
  const [addExSearch, setAddExSearch] = useState("");
  const [addExOpen, setAddExOpen] = useState(false);

  const templates = state.workoutTemplates || [];

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
      name: template.name,
      exercises: template.exercises.map(e => {
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

  const deleteTemplate = async (t) => {
    if (await showConfirm(`Delete "${t.name}"? This can't be undone.`)) {
      dispatch({ type: "DELETE_TEMPLATE", payload: t.id });
      showToast("Template deleted");
    }
  };

  const allExercises = [...EXERCISE_DB, ...(state.customExercises || [])];
  const searchResults = allExercises.filter(ex =>
    addExSearch ? ex.name.toLowerCase().includes(addExSearch.toLowerCase()) || ex.primary.toLowerCase().includes(addExSearch.toLowerCase()) : false
  ).slice(0, 10);

  const totalSets = (t) => t.exercises?.reduce((s, e) => s + (e.sets || 3), 0) || 0;

  return (
    <div className="rd-stack">
      <div className="rd-tab-head">
        <div className="rd-count"><ClipboardList size={13} /> <b>{templates.length}</b> template{templates.length !== 1 ? "s" : ""}</div>
        <button className="rd-btn-primary rd-btn-sm" onClick={() => openCreate()}>
          <Plus size={15} /> Create Template
        </button>
      </div>

      {templates.length === 0 && !showCreate ? (
        <div className="rd-empty" style={{ padding: "44px 16px" }}>
          <ClipboardList size={30} style={{ color: "rgba(255,255,255,0.2)", marginBottom: 4 }} />
          <div className="rd-empty-title">No Templates Yet</div>
          <div className="rd-empty-sub">Create reusable workout templates to start sessions quickly.</div>
          <button className="rd-btn-primary rd-btn-sm" onClick={() => openCreate()} style={{ marginTop: 10 }}>
            <Plus size={15} /> Create Your First Template
          </button>
        </div>
      ) : !showCreate && (
        <div className="rd-tmpl-grid">
          {templates.map(t => (
            <motion.div key={t.id} className="rd-tmpl-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rd-tmpl-name">{t.name}</div>
              {t.description && <div className="rd-tmpl-desc">{t.description}</div>}
              <div className="rd-tmpl-meta">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><ListChecks size={12} /> {t.exercises?.length || 0} exercises</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Timer size={12} /> {totalSets(t)} sets</span>
              </div>
              <div className="rd-tmpl-chips">
                {t.exercises?.slice(0, 5).map((e, i) => (
                  <span key={i} className="rd-ex-tag">{e.exerciseName}</span>
                ))}
                {(t.exercises?.length || 0) > 5 && <span className="rd-ex-tag muted">+{t.exercises.length - 5} more</span>}
              </div>
              <div className="rd-tmpl-actions">
                <button className="rd-btn-sm primary" onClick={() => startFromTemplate(t)} style={{ flex: 1 }}>
                  <Play size={14} /> Start Workout
                </button>
                <button className="rd-btn-sm ghost" onClick={() => openCreate(t)}><Pencil size={13} /> Edit</button>
                <button className="rd-btn-sm danger" onClick={() => deleteTemplate(t)} aria-label="Delete template"><Trash2 size={13} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="rd-modal-overlay" onClick={() => setShowCreate(false)}>
          <motion.div className="rd-modal rd-modal-lg" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}>
            <button className="rd-modal-close" onClick={() => setShowCreate(false)}><X size={16} /></button>
            <div className="rd-modal-title" style={{ marginBottom: 18 }}>{editTemplate ? "Edit Template" : "Create Template"}</div>

            <div className="rd-form">
              <div className="rd-field">
                <label>Template name</label>
                <input className="rd-input" placeholder="Push Day A" value={tmplName} onChange={e => setTmplName(e.target.value)} autoFocus />
              </div>
              <div className="rd-field">
                <label>Description (optional)</label>
                <input className="rd-input" placeholder="Chest, shoulders & triceps" value={tmplDesc} onChange={e => setTmplDesc(e.target.value)} />
              </div>
            </div>

            <div className="rd-section-label" style={{ margin: "18px 0 10px" }}>Exercises ({tmplExercises.length})</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {tmplExercises.map((ex, i) => (
                <div key={i} className="rd-ex-edit">
                  <span className="num">{i + 1}</span>
                  <span className="n">{ex.exerciseName}</span>
                  <div className="sets-cell">
                    <label>Sets</label>
                    <input className="rd-set-input" type="number" min={1} value={ex.sets || 3}
                      onChange={e => setTmplExercises(p => p.map((x, j) => j === i ? { ...x, sets: Math.max(1, +e.target.value || 1) } : x))} />
                  </div>
                  <div className="sets-cell">
                    <label>Reps</label>
                    <input className="rd-set-input" type="number" min={1} value={ex.defaultReps || 10}
                      onChange={e => setTmplExercises(p => p.map((x, j) => j === i ? { ...x, defaultReps: Math.max(1, +e.target.value || 1) } : x))} />
                  </div>
                  <button className="rd-iconbtn danger" onClick={() => setTmplExercises(p => p.filter((_, j) => j !== i))} aria-label="Remove exercise"><X size={15} /></button>
                </div>
              ))}
              {tmplExercises.length === 0 && (
                <div style={{ textAlign: "center", padding: 16, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>No exercises yet — add one below.</div>
              )}
            </div>

            <div style={{ position: "relative", marginTop: 10 }}>
              <button className="rd-add-dashed" onClick={() => setAddExOpen(!addExOpen)}>
                <Plus size={15} /> Add Exercise
              </button>
              {addExOpen && (
                <div className="rd-search-dropdown">
                  <div className="rd-search" style={{ padding: 8 }}>
                    <Search size={14} />
                    <input placeholder="Search exercises..." value={addExSearch} onChange={e => setAddExSearch(e.target.value)} autoFocus style={{ height: 40 }} />
                  </div>
                  {searchResults.map(ex => (
                    <div key={ex.id} className="rd-search-item" onClick={() => addExerciseToTemplate(ex)}>
                      {ex.name} <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>({ex.primary})</span>
                    </div>
                  ))}
                  {addExSearch && searchResults.length === 0 && (
                    <div style={{ padding: 12, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>No results</div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button className="rd-btn-secondary" onClick={() => setShowCreate(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="rd-btn-primary" onClick={saveTemplate} disabled={!tmplName.trim() || tmplExercises.length === 0} style={{ flex: 2 }}>
                {editTemplate ? "Update Template" : "Save Template"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default WorkoutTemplates;
