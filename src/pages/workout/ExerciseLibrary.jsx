import { useState } from "react";
import { EXERCISE_DB, MUSCLE_GROUPS, EQUIPMENT_TYPES, EXERCISE_CATEGORIES, showToast } from "../../utils/helpers";
import { Search, Plus, X, Trash2, ChevronDown, Dumbbell, Target, Zap, HeartPulse, PersonStanding, Repeat, Activity } from "lucide-react";

const CAT_ICONS = {
  compound: Dumbbell,
  isolation: Target,
  plyometric: Zap,
  cardio: HeartPulse,
  bodyweight: PersonStanding,
};

const catTitle = c => c.charAt(0).toUpperCase() + c.slice(1);

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

  const hasFilters = catFilter !== "all" || muscleFilter !== "all" || equipFilter !== "all" || search;

  const clearFilters = () => {
    setSearch("");
    setCatFilter("all");
    setMuscleFilter("all");
    setEquipFilter("all");
  };

  const addCustomExercise = () => {
    if (!newEx.name.trim()) return;
    dispatch({ type: "ADD_CUSTOM_EXERCISE", payload: { ...newEx, id: `custom_${Date.now()}`, name: newEx.name.trim() } });
    setNewEx({ name: "", primary: "", secondary: "", equip: "Bodyweight", cat: "compound", type: "strength" });
    setShowAdd(false);
    showToast("Exercise added to library");
  };

  const chip = (key, active, onClick, children) => (
    <button key={key} className={`rd-chip ${active ? "active" : ""}`} onClick={onClick}>{children}</button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
        <div className="rd-search" style={{ flex: 1 }}>
          <Search size={16} />
          <input placeholder="Search exercises by name, muscle, or equipment..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="rd-btn-secondary" onClick={() => setShowAdd(true)} style={{ padding: "0 18px", flexShrink: 0 }}>
          <Plus size={15} /> Custom Exercise
        </button>
      </div>

      <div className="rd-card rd-filter-card" style={{ padding: "16px 18px" }}>
        <div className="rd-filter-row">
          <span className="rd-filter-label">Muscle</span>
          {chip("m-all", muscleFilter === "all", () => setMuscleFilter("all"), "All")}
          {MUSCLE_GROUPS.map(m => chip(`m-${m}`, muscleFilter === m, () => setMuscleFilter(muscleFilter === m ? "all" : m), m))}
        </div>
        <div className="rd-filter-row">
          <span className="rd-filter-label">Category</span>
          {chip("c-all", catFilter === "all", () => setCatFilter("all"), "All")}
          {EXERCISE_CATEGORIES.map(c => chip(`c-${c}`, catFilter === c, () => setCatFilter(catFilter === c ? "all" : c), catTitle(c)))}
        </div>
        <div className="rd-filter-row">
          <span className="rd-filter-label">Equipment</span>
          {chip("e-all", equipFilter === "all", () => setEquipFilter("all"), "All")}
          {EQUIPMENT_TYPES.map(e => chip(`e-${e}`, equipFilter === e, () => setEquipFilter(equipFilter === e ? "all" : e), e))}
        </div>
      </div>

      <div className="rd-count"><b>{filtered.length}</b> exercise{filtered.length !== 1 ? "s" : ""}</div>

      {filtered.length === 0 ? (
        <div className="rd-card rd-empty" style={{ padding: "48px 16px" }}>
          <div className="rd-empty-title">No exercises found</div>
          <div className="rd-empty-sub">Try adjusting your search or clearing the active filters.</div>
          {hasFilters && <button className="rd-btn-secondary" onClick={clearFilters} style={{ marginTop: 8, padding: "10px 18px" }}>Clear Filters</button>}
        </div>
      ) : (
        <div className="rd-ex-grid">
          {filtered.map(ex => {
            const Icon = CAT_ICONS[ex.cat] || Dumbbell;
            return (
              <div key={ex.id} className="rd-ex-card">
                <div className="rd-ex-top">
                  <div className="rd-ex-tile"><Icon size={20} /></div>
                  <div className="rd-ex-body">
                    <div className="rd-ex-name">{ex.name}</div>
                    <div className="rd-ex-sub">{ex.primary}{ex.secondary ? ` · ${ex.secondary.split(",")[0]}` : ""}</div>
                  </div>
                </div>
                <div className="rd-ex-tags">
                  <span className="rd-ex-tag">{ex.primary}</span>
                  {ex.secondary && <span className="rd-ex-tag muted">{ex.secondary.split(",")[0]}</span>}
                  <span className="rd-ex-tag blue">{catTitle(ex.cat)}</span>
                </div>
                <div className="rd-ex-meta">
                  <span className="rd-ex-meta-item"><Repeat size={14} /> <b>{ex.defaultSets} × {ex.defaultReps}</b></span>
                  <span className="rd-ex-meta-item"><Activity size={14} /> {ex.type}</span>
                  {ex.id?.startsWith("custom_") && (
                    <button className="rd-ex-del" onClick={() => { if (confirm(`Delete ${ex.name}?`)) dispatch({ type: "DELETE_CUSTOM_EXERCISE", payload: ex.id }); }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div className="rd-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="rd-modal" onClick={e => e.stopPropagation()}>
            <button className="rd-modal-close" onClick={() => setShowAdd(false)}><X size={15} /></button>
            <div className="rd-modal-title" style={{ marginBottom: 18 }}>Add Custom Exercise</div>
            <div className="rd-form">
              <div className="rd-field">
                <label>Exercise Name</label>
                <input className="rd-input" placeholder="e.g., Landmine Press" value={newEx.name} onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))} autoFocus />
              </div>
              <div className="rd-field">
                <label>Primary Muscle</label>
                <input className="rd-input" placeholder="e.g., Chest" value={newEx.primary} onChange={e => setNewEx(p => ({ ...p, primary: e.target.value }))} />
              </div>
              <div className="rd-field">
                <label>Secondary Muscles</label>
                <input className="rd-input" placeholder="Optional" value={newEx.secondary} onChange={e => setNewEx(p => ({ ...p, secondary: e.target.value }))} />
              </div>
              <div className="rd-field">
                <label>Equipment</label>
                <div className="rd-select-wrap">
                  <select className="rd-select" value={newEx.equip} onChange={e => setNewEx(p => ({ ...p, equip: e.target.value }))}>
                    {EQUIPMENT_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <ChevronDown size={15} />
                </div>
              </div>
              <div className="rd-field">
                <label>Category</label>
                <div className="rd-select-wrap">
                  <select className="rd-select" value={newEx.cat} onChange={e => setNewEx(p => ({ ...p, cat: e.target.value }))}>
                    {EXERCISE_CATEGORIES.map(c => <option key={c} value={c}>{catTitle(c)}</option>)}
                  </select>
                  <ChevronDown size={15} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button className="rd-btn-secondary" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="rd-btn-primary" onClick={addCustomExercise} style={{ flex: 1 }}>Add Exercise</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibraryBase;
