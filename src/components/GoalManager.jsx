import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Pencil, Plus, Target, Trash2, Trophy, X } from "lucide-react";

const GOAL_TYPES = [
  { type: "Lose Weight", icon: "⚖️", color: "#FF6B6B" },
  { type: "Gain Muscle", icon: "💪", color: "#C8FF00" },
  { type: "Increase Strength", icon: "🏋️", color: "#FFA500" },
  { type: "Run 5K", icon: "🏃", color: "#00C8FF" },
  { type: "Drink Enough Water", icon: "💧", color: "#4FC3F7" },
  { type: "Custom", icon: "🎯", color: "#C8FF00" },
];

const MILESTONES = [25, 50, 75, 100];

function getGoalIcon(type) {
  const found = GOAL_TYPES.find(g => g.type === type);
  return found ? found.icon : "🎯";
}

function getGoalColor(type) {
  const found = GOAL_TYPES.find(g => g.type === type);
  return found ? found.color : "#C8FF00";
}

function getProgressPercent(currentValue, targetValue) {
  if (!targetValue || targetValue <= 0) return 0;
  return Math.min(Math.round((currentValue / targetValue) * 100), 100);
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysRemaining(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function GoalManager({ state, dispatch }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [completedGoal, setCompletedGoal] = useState(null);
  const [showArchive, setShowArchive] = useState(false);
  const [form, setForm] = useState({
    type: "",
    title: "",
    description: "",
    targetValue: "",
    currentValue: "",
    targetDate: "",
  });

  const goals = (state && state.goals) || [];
  const activeGoals = goals.filter(g => !g.completed);
  const archivedGoals = goals.filter(g => g.completed);
  const avgPct = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((acc, g) => acc + getProgressPercent(g.currentValue, g.targetValue), 0) / activeGoals.length)
    : 0;

  function resetForm() {
    setForm({ type: "", title: "", description: "", targetValue: "", currentValue: "", targetDate: "" });
  }

  function handleCreate() {
    if (!form.type || !form.title.trim()) return;
    const goal = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim(),
      targetValue: parseFloat(form.targetValue) || 100,
      currentValue: parseFloat(form.currentValue) || 0,
      startDate: new Date().toISOString().split("T")[0],
      targetDate: form.targetDate || "",
      completed: false,
      completedAt: null,
    };
    dispatch({ type: "ADD_GOAL", payload: goal });
    resetForm();
    setShowCreate(false);
  }

  function handleUpdateProgress(id, newValue) {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const percent = getProgressPercent(newValue, goal.targetValue);
    const updates = { currentValue: newValue };
    if (percent >= 100 && !goal.completed) {
      updates.completed = true;
      updates.completedAt = new Date().toISOString();
      setCompletedGoal(goal);
      setTimeout(() => setCompletedGoal(null), 4000);
    }
    dispatch({ type: "UPDATE_GOAL", payload: { id, updates } });
  }

  function handleDelete(id) {
    dispatch({ type: "DELETE_GOAL", payload: id });
  }

  return (
    <div className="rd-page">
      <div className="rd-page-head">
        <div>
          <span className="rd-kicker"><Target size={13} /> Goals</span>
          <h1 className="rd-title">Goal Manager</h1>
          <p className="rd-sub">Set targets, track progress, and celebrate milestones</p>
        </div>
        <div className="rd-top-right">
          {archivedGoals.length > 0 && (
            <button className="rd-btn-secondary rd-btn-sm" onClick={() => setShowArchive(!showArchive)}>
              {showArchive ? "Hide" : "Completed"} ({archivedGoals.length})
            </button>
          )}
          <motion.button className="rd-btn-primary rd-btn-sm" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(true)}>
            <Plus size={15} /> New Goal
          </motion.button>
        </div>
      </div>

      <div className="rd-nut-stats" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="rd-nut-stat lime">
          <div className="l">Active Goals</div>
          <div className="v">{activeGoals.length}</div>
          <div className="s">In progress right now</div>
        </div>
        <div className="rd-nut-stat green">
          <div className="l">Completed</div>
          <div className="v">{archivedGoals.length}</div>
          <div className="s">Targets reached</div>
        </div>
        <div className="rd-nut-stat blue">
          <div className="l">Avg Progress</div>
          <div className="v">{avgPct}<span>%</span></div>
          <div className="s">Across active goals</div>
        </div>
      </div>

      {activeGoals.length === 0 && archivedGoals.length === 0 && (
        <motion.div className="rd-card rd-empty" style={{ padding: "48px 16px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Target size={30} style={{ color: "rgba(200,255,0,0.3)", marginBottom: 4 }} />
          <div className="rd-empty-title">No goals yet</div>
          <div className="rd-empty-sub">Create your first goal to start tracking progress</div>
        </motion.div>
      )}

      {activeGoals.length > 0 && (
        <div className="rd-tmpl-grid">
          <AnimatePresence>
            {activeGoals.map((goal) => {
              const percent = getProgressPercent(goal.currentValue, goal.targetValue);
              const color = getGoalColor(goal.type);
              const days = daysRemaining(goal.targetDate);
              const daysColor = days !== null && days < 0 ? "red" : days !== null && days < 7 ? "orange" : "muted";
              return (
                <motion.div
                  key={goal.id}
                  className="rd-tmpl-card"
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="rd-card-head" style={{ marginBottom: 0, flexWrap: "wrap" }}>
                    <div className="rd-card-title" style={{ minWidth: 0, flex: 1 }}>
                      <div className="rd-card-title-ico" style={{ background: `${color}15`, color, borderColor: `${color}30` }}>
                        {getGoalIcon(goal.type)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="rd-card-name" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{goal.title}</div>
                      </div>
                    </div>
                    <span className="rd-ex-tag" style={{ color, background: `${color}12`, borderColor: `${color}25` }}>{goal.type}</span>
                  </div>

                  {goal.description && (
                    <div className="rd-tmpl-desc" style={{ lineHeight: 1.55 }}>{goal.description}</div>
                  )}

                  <div>
                    <div className="rd-macro-head">
                      <span className="rd-macro-label">{goal.currentValue} / {goal.targetValue}</span>
                      <span className="rd-macro-val"><b>{percent}%</b></span>
                    </div>
                    <div className="rd-macro-track">
                      <motion.div
                        className="rd-macro-fill"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                    <div className="rd-tmpl-chips" style={{ marginTop: 8 }}>
                      {MILESTONES.map(m => (
                        <span
                          key={m}
                          className={`rd-ex-tag ${percent >= m ? "" : "muted"}`}
                          style={percent >= m ? { color, background: `${color}10`, borderColor: `${color}30` } : {}}
                        >
                          {m === 100 ? "✓" : `${m}%`}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <span className="rd-count" style={{ whiteSpace: "nowrap" }}>Started {formatDate(goal.startDate)}</span>
                    {goal.targetDate && (
                      <span className={`rd-ex-tag ${daysColor}`}>
                        {days !== null && days < 0 ? `${Math.abs(days)}d overdue` : days !== null ? `${days}d left` : ""}
                      </span>
                    )}
                  </div>

                  <div className="rd-tmpl-actions">
                    <button className="rd-btn-sm ghost" style={{ flex: 1 }} onClick={() => { setEditingGoal(goal); }}>
                      <Pencil size={13} /> Update
                    </button>
                    <button className="rd-btn-sm danger" style={{ flex: 1 }} onClick={() => handleDelete(goal.id)}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {showArchive && archivedGoals.length > 0 && (
        <>
          <div className="rd-section-label" style={{ marginTop: 4 }}>Completed Goals</div>
          <div className="rd-tmpl-grid">
            <AnimatePresence>
              {archivedGoals.map((goal) => (
                <motion.div
                  key={goal.id}
                  className="rd-tmpl-card"
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="rd-card-head" style={{ marginBottom: 0 }}>
                    <div className="rd-card-title" style={{ minWidth: 0, flex: 1 }}>
                      <div className="rd-card-title-ico green">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="rd-card-name" style={{ color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{goal.title}</div>
                    </div>
                    <span className="rd-ex-tag green">Done</span>
                  </div>
                  <div className="rd-count">Completed {formatDate(goal.completedAt)}</div>
                  <div className="rd-tmpl-actions">
                    <button className="rd-btn-sm danger" style={{ width: "100%" }} onClick={() => handleDelete(goal.id)}>
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {showCreate && (
        <div className="rd-modal-overlay" onClick={() => { setShowCreate(false); resetForm(); }}>
          <motion.div
            className="rd-modal"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button className="rd-modal-close" onClick={() => { setShowCreate(false); resetForm(); }}><X size={15} /></button>
            <div className="rd-modal-title" style={{ marginBottom: 18 }}>Create New Goal</div>

            <div className="rd-form">
              <div className="rd-field">
                <label>Goal Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {GOAL_TYPES.map(g => {
                    const isActive = form.type === g.type;
                    return (
                      <motion.button
                        key={g.type}
                        type="button"
                        className="rd-btn-sm ghost"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setForm({ ...form, type: g.type })}
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "12px 8px", borderRadius: 12, lineHeight: 1,
                          ...(isActive ? { background: "rgba(200,255,0,0.1)", borderColor: "rgba(200,255,0,0.3)", color: "#C8FF00" } : {}),
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{g.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, lineHeight: 1.25 }}>{g.type}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="rd-field">
                <label>Title</label>
                <input
                  className="rd-input"
                  placeholder="e.g. Lose 5kg by December"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="rd-field">
                <label>Description (optional)</label>
                <textarea
                  className="rd-notes"
                  style={{ minHeight: 70 }}
                  placeholder="Describe your goal..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="rd-2col">
                <div className="rd-field">
                  <label>Target Value</label>
                  <input
                    className="rd-input"
                    type="number"
                    placeholder="100"
                    value={form.targetValue}
                    onChange={e => setForm({ ...form, targetValue: e.target.value })}
                  />
                </div>
                <div className="rd-field">
                  <label>Current Value</label>
                  <input
                    className="rd-input"
                    type="number"
                    placeholder="0"
                    value={form.currentValue}
                    onChange={e => setForm({ ...form, currentValue: e.target.value })}
                  />
                </div>
              </div>

              <div className="rd-field">
                <label>Target Date</label>
                <input
                  className="rd-input"
                  style={{ colorScheme: "dark" }}
                  type="date"
                  value={form.targetDate}
                  onChange={e => setForm({ ...form, targetDate: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button
                type="button"
                className="rd-btn-secondary"
                style={{ flex: 1 }}
                onClick={() => { setShowCreate(false); resetForm(); }}
              >
                Cancel
              </button>
              <motion.button
                type="button"
                className="rd-btn-primary"
                style={{ flex: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
              >
                Create Goal
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {editingGoal && (
        <div className="rd-modal-overlay" onClick={() => setEditingGoal(null)}>
          <motion.div
            className="rd-modal"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button className="rd-modal-close" onClick={() => setEditingGoal(null)}><X size={15} /></button>

            <div className="rd-card-head" style={{ marginBottom: 18 }}>
              <div className="rd-card-title" style={{ minWidth: 0 }}>
                <div className="rd-card-title-ico" style={{ width: 40, height: 40, borderRadius: 12, background: `${getGoalColor(editingGoal.type)}15`, color: getGoalColor(editingGoal.type), borderColor: `${getGoalColor(editingGoal.type)}30` }}>
                  {getGoalIcon(editingGoal.type)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="rd-card-name">{editingGoal.title}</div>
                  <div className="rd-card-kicker">{editingGoal.type}</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div className="rd-macro-head">
                <span className="rd-macro-label">Progress</span>
                <span className="rd-macro-val">
                  <b>{getProgressPercent(editingGoal.currentValue, editingGoal.targetValue)}%</b>
                </span>
              </div>
              <div className="rd-macro-track" style={{ height: 10, borderRadius: 5 }}>
                <motion.div
                  className="rd-macro-fill"
                  style={{ background: getGoalColor(editingGoal.type), height: 10, borderRadius: 5 }}
                  animate={{ width: `${getProgressPercent(editingGoal.currentValue, editingGoal.targetValue)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="rd-tmpl-chips" style={{ marginTop: 8 }}>
                {MILESTONES.map(m => {
                  const reached = getProgressPercent(editingGoal.currentValue, editingGoal.targetValue) >= m;
                  return (
                    <span
                      key={m}
                      className={`rd-ex-tag ${reached ? "" : "muted"}`}
                      style={reached ? { color: getGoalColor(editingGoal.type), background: `${getGoalColor(editingGoal.type)}10`, borderColor: `${getGoalColor(editingGoal.type)}30` } : {}}
                    >
                      {m === 100 ? "✓" : `${m}%`}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="rd-2col" style={{ marginBottom: 18 }}>
              <div className="rd-field">
                <label>Current Value</label>
                <input
                  className="rd-input"
                  type="number"
                  value={editingGoal.currentValue}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    setEditingGoal({ ...editingGoal, currentValue: val });
                  }}
                />
              </div>
              <div className="rd-field">
                <label>Target Value</label>
                <input
                  className="rd-input"
                  type="number"
                  value={editingGoal.targetValue}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    setEditingGoal({ ...editingGoal, targetValue: val });
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="rd-btn-secondary" style={{ flex: 1 }} onClick={() => setEditingGoal(null)}>
                Cancel
              </button>
              <motion.button
                type="button"
                className="rd-btn-primary"
                style={{ flex: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleUpdateProgress(editingGoal.id, editingGoal.currentValue);
                  dispatch({
                    type: "UPDATE_GOAL",
                    payload: { id: editingGoal.id, updates: { targetValue: editingGoal.targetValue } },
                  });
                  setEditingGoal(null);
                }}
              >
                Save Progress
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {completedGoal && (
          <motion.div
            className="rd-modal-overlay"
            style={{ zIndex: 1100 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rd-modal"
              style={{ maxWidth: 380, textAlign: "center" }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
              >
                <Trophy size={64} style={{ color: "#C8FF00" }} />
              </motion.div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#C8FF00" }}>Goal Completed!</div>
              <div className="rd-tmpl-desc" style={{ margin: "8px 0 20px" }}>{completedGoal.title} — amazing work!</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {MILESTONES.map(m => (
                  <motion.span
                    key={m}
                    className="rd-ex-tag"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: m * 0.005 }}
                  >
                    {m}%
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
