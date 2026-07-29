import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GOAL_TYPES = [
  { type: "Lose Weight", icon: "", color: "#EF4444" },
  { type: "Gain Muscle", icon: "", color: "#22C55E" },
  { type: "Increase Strength", icon: "", color: "#FFA500" },
  { type: "Run 5K", icon: "", color: "#3B82F6" },
  { type: "Drink Enough Water", icon: "", color: "#4FC3F7" },
  { type: "Custom", icon: "", color: "#22C55E" },
];

const MILESTONES = [25, 50, 75, 100];

function getGoalIcon(type) {
  const found = GOAL_TYPES.find(g => g.type === type);
  return found ? found.icon : "";
}

function getGoalColor(type) {
  const found = GOAL_TYPES.find(g => g.type === type);
  return found ? found.color : "#22C55E";
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

  const s = {
    page: { padding: "0 0 24px" },
    header: { marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 },
    title: { fontSize: 22, fontWeight: 800, color: "#FFFFFF", marginBottom: 4 },
    sub: { fontSize: 13, color: "#A0A0A0" },
    statsRow: { display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" },
    statCard: { flex: "1 1 120px", background: "#151515", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 14, padding: 16, textAlign: "center" },
    statValue: { fontSize: 28, fontWeight: 800, color: "#22C55E" },
    statLabel: { fontSize: 11, color: "#A0A0A0", marginTop: 4 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 },
    card: { background: "#151515", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 14, padding: 18, position: "relative" },
    cardHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
    iconWrap: { width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 },
    cardTitle: { fontSize: 15, fontWeight: 700, color: "#FFFFFF", flex: 1 },
    cardType: { fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#22C55E" },
    cardDesc: { fontSize: 12, color: "#A0A0A0", marginBottom: 10, lineHeight: 1.5 },
    progressSection: { marginBottom: 10 },
    progressHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
    progressLabel: { fontSize: 11, color: "#A0A0A0" },
    progressValue: { fontSize: 13, fontWeight: 700, color: "#22C55E" },
    progressBarBg: { width: "100%", height: 8, background: "#1D1D1D", borderRadius: 4, overflow: "hidden", position: "relative" },
    progressBarFill: { height: "100%", borderRadius: 4, transition: "width 0.5s ease" },
    milestones: { display: "flex", justifyContent: "space-between", marginTop: 4, position: "relative" },
    milestoneTick: { width: 1, height: 8, background: "rgba(255,255,255,0.08)" },
    milestoneReached: { background: "rgba(255,255,255,0.12)" },
    milestoneText: { fontSize: 9, color: "#A0A0A0", marginTop: 2, textAlign: "center", flex: 1 },
    milestoneActive: { color: "#22C55E", fontWeight: 700 },
    dateRow: { display: "flex", justifyContent: "space-between", marginTop: 8 },
    dateText: { fontSize: 11, color: "#A0A0A0" },
    daysLeft: { fontSize: 11, fontWeight: 600 },
    cardActions: { display: "flex", gap: 8, marginTop: 12 },
    btnSmall: { padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#22C55E", cursor: "pointer", transition: "all 0.2s" },
    btnDanger: { padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.06)", color: "#EF4444", cursor: "pointer", transition: "all 0.2s" },
    addBtn: { padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 700, background: "#22C55E", color: "#0A0A0A", border: "none", cursor: "pointer", transition: "all 0.2s" },
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20, overflowY: "auto" },
    modal: { width: "100%", maxWidth: 500, background: "rgba(15,15,15,0.98)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 28, maxHeight: "90vh", overflowY: "auto" },
    modalTitle: { fontSize: 20, fontWeight: 800, color: "#FFFFFF", marginBottom: 20 },
    closeBtn: { position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#A0A0A0", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14 },
    label: { fontSize: 12, fontWeight: 600, color: "#A0A0A0", marginBottom: 6, display: "block" },
    input: { width: "100%", padding: "10px 14px", background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, color: "#FFFFFF", fontSize: 14, outline: "none", boxSizing: "border-box" },
    textarea: { width: "100%", padding: "10px 14px", background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, color: "#FFFFFF", fontSize: 14, outline: "none", resize: "vertical", minHeight: 60, boxSizing: "border-box", fontFamily: "inherit" },
    typeGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 },
    typeBtn: { padding: "10px 6px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)", background: "#1D1D1D", cursor: "pointer", textAlign: "center", transition: "all 0.2s", color: "#A0A0A0" },
    typeBtnActive: { borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)", color: "#22C55E" },
    typeIcon: { fontSize: 22, display: "block", marginBottom: 4 },
    typeName: { fontSize: 10, fontWeight: 600 },
    row: { display: "flex", gap: 10 },
    rowField: { flex: 1 },
    celebrateOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 },
    celebrateCard: { background: "#151515", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 40, textAlign: "center", maxWidth: 380, width: "90%" },
    celebrateIcon: { fontSize: 64, marginBottom: 16 },
    celebrateTitle: { fontSize: 24, fontWeight: 800, color: "#22C55E", marginBottom: 8 },
    celebrateSub: { fontSize: 14, color: "#A0A0A0", marginBottom: 24 },
    archiveToggle: { fontSize: 12, color: "#A0A0A0", cursor: "pointer", background: "none", border: "1px solid rgba(160,160,160,0.15)", padding: "6px 14px", borderRadius: 8, transition: "all 0.2s" },
    archiveCard: { background: "#151515", border: "1px solid rgba(255,255,255,0.02)", borderRadius: 12, padding: 14, opacity: 0.7 },
    emptyState: { textAlign: "center", padding: "48px 0", color: "#A0A0A0" },
    emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.4 },
    emptyText: { fontSize: 14, marginBottom: 4 },
    emptySub: { fontSize: 12, color: "#666" },
    sectionLabel: { fontSize: 13, fontWeight: 700, color: "#A0A0A0", marginBottom: 12, marginTop: 8 },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Goal Manager</h2>
          <p style={s.sub}>Set targets, track progress, and celebrate milestones</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {archivedGoals.length > 0 && (
            <button
              style={s.archiveToggle}
              onClick={() => setShowArchive(!showArchive)}
            >
              {showArchive ? "Hide" : "Completed"} ({archivedGoals.length})
            </button>
          )}
          <motion.button
            style={s.addBtn}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
          >
            + New Goal
          </motion.button>
        </div>
      </div>

      <div style={s.statsRow}>
        <div style={s.statCard}>
          <div style={s.statValue}>{activeGoals.length}</div>
          <div style={s.statLabel}>Active Goals</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statValue}>{archivedGoals.length}</div>
          <div style={s.statLabel}>Completed</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statValue}>
            {activeGoals.length > 0
              ? Math.round(activeGoals.reduce((acc, g) => acc + getProgressPercent(g.currentValue, g.targetValue), 0) / activeGoals.length)
              : 0}%
          </div>
          <div style={s.statLabel}>Avg Progress</div>
        </div>
      </div>

      {activeGoals.length === 0 && archivedGoals.length === 0 && (
        <motion.div style={s.emptyState} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={s.emptyIcon}></div>
          <div style={s.emptyText}>No goals yet</div>
          <div style={s.emptySub}>Create your first goal to start tracking progress</div>
        </motion.div>
      )}

      {activeGoals.length > 0 && (
        <div style={s.grid}>
          <AnimatePresence>
            {activeGoals.map((goal) => {
              const percent = getProgressPercent(goal.currentValue, goal.targetValue);
              const color = getGoalColor(goal.type);
              const days = daysRemaining(goal.targetDate);
              return (
                <motion.div
                  key={goal.id}
                  style={s.card}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  <div style={s.cardHeader}>
                    <div style={{ ...s.iconWrap, background: `${color}15` }}>
                      {getGoalIcon(goal.type)}
                    </div>
                    <div style={s.cardTitle}>{goal.title}</div>
                    <span style={{ ...s.cardType, color, background: `${color}12` }}>{goal.type}</span>
                  </div>

                  {goal.description && (
                    <div style={s.cardDesc}>{goal.description}</div>
                  )}

                  <div style={s.progressSection}>
                    <div style={s.progressHeader}>
                      <span style={s.progressLabel}>{goal.currentValue} / {goal.targetValue}</span>
                      <span style={s.progressValue}>{percent}%</span>
                    </div>
                    <div style={s.progressBarBg}>
                      <motion.div
                        style={{ ...s.progressBarFill, background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                    <div style={s.milestones}>
                      {MILESTONES.map(m => (
                        <span
                          key={m}
                          style={{
                            ...s.milestoneText,
                            ...(percent >= m ? s.milestoneActive : {}),
                          }}
                        >
                          {m === 100 ? "✓" : `${m}%`}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={s.dateRow}>
                    <span style={s.dateText}>Started {formatDate(goal.startDate)}</span>
                    {goal.targetDate && (
                      <span style={{ ...s.daysLeft, color: days !== null && days < 0 ? "#EF4444" : days !== null && days < 7 ? "#FFA500" : "#A0A0A0" }}>
                        {days !== null && days < 0 ? `${Math.abs(days)}d overdue` : days !== null ? `${days}d left` : ""}
                      </span>
                    )}
                  </div>

                  <div style={s.cardActions}>
                    <button
                      style={s.btnSmall}
                      onClick={() => {
                        setEditingGoal(goal);
                      }}
                    >
                      Update
                    </button>
                    <button
                      style={s.btnDanger}
                      onClick={() => handleDelete(goal.id)}
                    >
                      Delete
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
          <div style={{ ...s.sectionLabel, marginTop: 20 }}>Completed Goals</div>
          <div style={s.grid}>
            <AnimatePresence>
              {archivedGoals.map((goal) => (
                <motion.div
                  key={goal.id}
                  style={s.archiveCard}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div style={s.cardHeader}>
                    <div style={{ ...s.iconWrap, background: "rgba(255,255,255,0.06)" }}></div>
                    <div style={{ ...s.cardTitle, color: "#A0A0A0" }}>{goal.title}</div>
                    <span style={{ ...s.cardType, color: "#00C853", background: "rgba(0,200,83,0.1)" }}>Done</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#666" }}>
                    Completed {formatDate(goal.completedAt)}
                  </div>
                  <div style={{ ...s.cardActions, marginTop: 8 }}>
                    <button style={s.btnDanger} onClick={() => handleDelete(goal.id)}>Remove</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {showCreate && (
        <div style={s.overlay} onClick={() => { setShowCreate(false); resetForm(); }}>
          <motion.div
            style={{ ...s.modal, position: "relative" }}
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button style={s.closeBtn} onClick={() => { setShowCreate(false); resetForm(); }}>✕</button>
            <div style={s.modalTitle}>Create New Goal</div>

            <div style={s.label}>Goal Type</div>
            <div style={s.typeGrid}>
              {GOAL_TYPES.map(g => (
                <motion.button
                  key={g.type}
                  style={{ ...s.typeBtn, ...(form.type === g.type ? s.typeBtnActive : {}) }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setForm({ ...form, type: g.type })}
                >
                  <span style={s.typeIcon}>{g.icon}</span>
                  <span style={s.typeName}>{g.type}</span>
                </motion.button>
              ))}
            </div>

            <div style={s.label}>Title</div>
            <input
              style={s.input}
              placeholder="e.g. Lose 5kg by December"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />

            <div style={{ ...s.label, marginTop: 12 }}>Description (optional)</div>
            <textarea
              style={s.textarea}
              placeholder="Describe your goal..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />

            <div style={{ ...s.row, marginTop: 12 }}>
              <div style={s.rowField}>
                <div style={s.label}>Target Value</div>
                <input
                  style={s.input}
                  type="number"
                  placeholder="100"
                  value={form.targetValue}
                  onChange={e => setForm({ ...form, targetValue: e.target.value })}
                />
              </div>
              <div style={s.rowField}>
                <div style={s.label}>Current Value</div>
                <input
                  style={s.input}
                  type="number"
                  placeholder="0"
                  value={form.currentValue}
                  onChange={e => setForm({ ...form, currentValue: e.target.value })}
                />
              </div>
            </div>

            <div style={{ ...s.row, marginTop: 12 }}>
              <div style={s.rowField}>
                <div style={s.label}>Target Date</div>
                <input
                  style={{ ...s.input, colorScheme: "dark" }}
                  type="date"
                  value={form.targetDate}
                  onChange={e => setForm({ ...form, targetDate: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                style={{ ...s.btnSmall, flex: 1, padding: "10px 0", background: "rgba(255,255,255,0.04)", fontSize: 13 }}
                onClick={() => { setShowCreate(false); resetForm(); }}
              >
                Cancel
              </button>
              <motion.button
                className="neon-btn"
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
        <div style={s.overlay} onClick={() => setEditingGoal(null)}>
          <motion.div
            style={{ ...s.modal, position: "relative" }}
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button style={s.closeBtn} onClick={() => setEditingGoal(null)}>✕</button>
            <div style={s.cardHeader}>
              <div style={{ ...s.iconWrap, background: `${getGoalColor(editingGoal.type)}15` }}>
                {getGoalIcon(editingGoal.type)}
              </div>
              <div>
                <div style={s.cardTitle}>{editingGoal.title}</div>
                <div style={{ fontSize: 11, color: "#A0A0A0" }}>{editingGoal.type}</div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={s.progressHeader}>
                <span style={s.progressLabel}>Progress</span>
                <span style={s.progressValue}>
                  {getProgressPercent(editingGoal.currentValue, editingGoal.targetValue)}%
                </span>
              </div>
              <div style={{ ...s.progressBarBg, height: 12 }}>
                <motion.div
                  style={{ ...s.progressBarFill, background: getGoalColor(editingGoal.type), height: 12 }}
                  animate={{ width: `${getProgressPercent(editingGoal.currentValue, editingGoal.targetValue)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div style={s.milestones}>
                {MILESTONES.map(m => (
                  <span
                    key={m}
                    style={{
                      ...s.milestoneText,
                      ...(getProgressPercent(editingGoal.currentValue, editingGoal.targetValue) >= m ? s.milestoneActive : {}),
                    }}
                  >
                    {m === 100 ? "✓" : `${m}%`}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ ...s.row, marginTop: 20 }}>
              <div style={s.rowField}>
                <div style={s.label}>Current Value</div>
                <input
                  style={s.input}
                  type="number"
                  value={editingGoal.currentValue}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    setEditingGoal({ ...editingGoal, currentValue: val });
                  }}
                />
              </div>
              <div style={s.rowField}>
                <div style={s.label}>Target Value</div>
                <input
                  style={s.input}
                  type="number"
                  value={editingGoal.targetValue}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    setEditingGoal({ ...editingGoal, targetValue: val });
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                style={{ ...s.btnSmall, flex: 1, padding: "10px 0", background: "rgba(255,255,255,0.04)", fontSize: 13 }}
                onClick={() => setEditingGoal(null)}
              >
                Cancel
              </button>
              <motion.button
                className="neon-btn"
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
            style={s.celebrateOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={s.celebrateCard}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                style={s.celebrateIcon}
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
              >
                  
                </motion.div>
              <div style={s.celebrateTitle}>Goal Completed!</div>
              <div style={s.celebrateSub}>{completedGoal.title} — amazing work!</div>
              <div style={{ display: "flex", gap: 8 }}>
                {MILESTONES.map(m => (
                  <motion.span
                    key={m}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: m * 0.005 }}
                    style={{ fontSize: 11, color: "#22C55E", background: "rgba(255,255,255,0.04)", padding: "4px 10px", borderRadius: 6 }}
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
