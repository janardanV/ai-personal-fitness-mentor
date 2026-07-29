import { useState, useEffect, useRef } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EXERCISE_DB, fmt, calcE1RM, showToast } from "../utils/helpers";

const REST_PRESETS = [60, 90, 120, 180, 300];

const calcCaloriesBurned = (exercises, durationMin, bodyWeight = 75) => {
  const mets = { compound: 6, isolation: 4, bodyweight: 5, plyometric: 8, cardio: 7, olympic: 8 };
  const totalSets = exercises.reduce((s, ex) => s + ex.sets.filter(st => st.done).length, 0);
  const totalReps = exercises.reduce((s, ex) => s + ex.sets.filter(st => st.done).reduce((s2, st) => s2 + (st.reps || 0), 0), 0);
  const avgMet = exercises.length > 0 ? exercises.reduce((s, ex) => {
    const def = EXERCISE_DB.find(e => e.id === ex.exerciseId);
    return s + (mets[def?.cat] || 5);
  }, 0) / Math.max(exercises.length, 1) : 5;
  const dur = Math.max(durationMin || 1, 1);
  return Math.round(avgMet * bodyWeight * (dur / 60));
};

const RestTimer = ({ duration, onDone, onSkip }) => {
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef(null);

  useEffect(() => {
    setRemaining(duration);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          try { const a = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+JkY2Dd2Bwf4eLjIh6YWR3gIaIioh8Zml5g4iJiYd8a21+g4eHh4V+cnB2gIaGhYJ9c3J2gYaGhIJ8c3J1f4WGhIJ8c3J1f4WGhIJ8c3F0f4WGhIJ8c3F0f4WGhIJ8c3F0f4WGhIJ8c3F0f4WGhA=="); a.play().catch(()=>{}); } catch(e) {}
          onDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [duration]);

  useEffect(() => { setRemaining(duration); }, [duration]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;
  const r = 90;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <motion.div className="wm-rest-timer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onSkip}>
      <motion.div className="wm-rest-timer-card" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={e => e.stopPropagation()}>
        <div style={{ marginBottom: 20 }}>
          <svg width={220} height={220}>
            <circle cx={110} cy={110} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
            <circle cx={110} cy={110} r={r} fill="none" stroke="#22C55E" strokeWidth={8} strokeDasharray={`${dash} `} strokeLinecap="round" transform="rotate(-90 110 110)" style={{ transition: "stroke-dasharray 0.5s linear" }} />
          </svg>
          <div style={{ position: "relative", marginTop: -160, textAlign: "center" }}>
            <div className="wm-rest-timer-display">{mins}:{secs.toString().padStart(2, "0")}</div>
          </div>
        </div>
        <div className="wm-rest-timer-label">Rest Timer</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {REST_PRESETS.map(s => (
            <button key={s} className={duration === s ? "neon-btn" : "ghost-btn"} style={{ padding: "8px 16px", fontSize: 12 }}
              onClick={() => { clearInterval(intervalRef.current); setRemaining(s); intervalRef.current = setInterval(() => {
                setRemaining(prev => { if (prev <= 1) { clearInterval(intervalRef.current); try { const alarm = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+JkY2Dd2Bwf4eLjIh6YWR3gIaIioh8Zml5g4iJiYd8a21+g4eHh4V+cnB2gIaGhYJ9c3J2gYaGhIJ8c3J1f4WGhIJ8c3J1f4WGhIJ8c3F0f4WGhIJ8c3F0f4WGhIJ8c3F0f4WGhIJ8c3F0f4WGhA=="); alarm.play().catch(()=>{}); } catch(e) {} onDone(); return 0; } return prev - 1; });
              }, 1000); }}
            >{Math.floor(s / 60)}:{(s % 60).toString().padStart(2, "0")}</button>
          ))}
        </div>
        <button className="ghost-btn" onClick={onSkip} style={{ marginTop: 20, width: "100%", padding: 12 }}>Skip Rest →</button>
      </motion.div>
    </motion.div>
  );
};

const FinishWorkoutSummary = ({ session, duration, onClose, onDiscard }) => {
  const totalVolume = session.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.done).reduce((s, st) => s + (st.weight || 0) * (st.reps || 0), 0), 0);
  const totalSets = session.exercises.reduce((s, ex) => s + ex.sets.filter(st => st.done).length, 0);
  const totalReps = session.exercises.reduce((s, ex) => s + ex.sets.filter(st => st.done).reduce((s2, st) => s2 + (st.reps || 0), 0), 0);
  const calories = calcCaloriesBurned(session.exercises, duration);

  const perExercise = session.exercises.map(ex => {
    const doneSets = ex.sets.filter(s => s.done);
    const vol = doneSets.reduce((s, st) => s + (st.weight || 0) * (st.reps || 0), 0);
    const bestSet = doneSets.reduce((best, st) => {
      const e1rm = calcE1RM(st.weight, st.reps);
      return e1rm > (best?.e1rm || 0) ? { ...st, e1rm } : best;
    }, null);
    return { name: ex.exerciseName, sets: doneSets.length, reps: doneSets.reduce((s, st) => s + (st.reps || 0), 0), volume: vol, bestE1RM: bestSet?.e1rm || 0 };
  });

  return (
    <motion.div className="wm-summary-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="wm-summary-card" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Workout Complete!</h2>
        <p style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 24 }}>{session.name} · {duration} min</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 10, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Volume</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "#22C55E" }}>{fmt(totalVolume)}<span style={{ fontSize: 12, color: "#A0A0A0" }}> kg</span></div>
          </div>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 10, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Calories</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "#22C55E" }}>{calories}<span style={{ fontSize: 12, color: "#A0A0A0" }}> kcal</span></div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 10, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sets</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "#FFFFFF" }}>{totalSets}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 10, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Reps</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "#FFFFFF" }}>{totalReps}</div>
          </div>
        </div>
        <div style={{ textAlign: "left", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#FFFFFF" }}>Exercise Breakdown</div>
          {perExercise.map((ex, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 }}>
              <span style={{ color: "#FFFFFF" }}>{ex.name}</span>
              <span style={{ color: "#A0A0A0", fontFamily: "'JetBrains Mono',monospace" }}>{ex.sets}×{Math.round(ex.volume)}kg · e1RM {fmt(ex.bestE1RM, 1)}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ghost-btn" onClick={onDiscard} style={{ flex: 1, padding: 12, color: "#EF4444", borderColor: "rgba(239,68,68,0.3)" }}>Discard</button>
          <button className="neon-btn" onClick={() => onClose(calories)} style={{ flex: 2, padding: 12 }}>Save +50 XP</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const NAV = (page) => { window.__setPage?.(page); };

const WorkoutSession = ({ state, dispatch }) => {
  const session = state.activeSession;
  const [showSummary, setShowSummary] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [addExOpen, setAddExOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    if (!session) return;
    lastTickRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [session?.startTime]);

  useEffect(() => {
    if (!session) return;
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [session]);

  if (!session) {
    return (
      <div className="wm-empty">
        <div className="wm-empty-title">No Active Workout</div>
        <div className="wm-empty-desc">Start a workout from the Dashboard or Templates tab.</div>
        <button className="neon-btn" onClick={() => NAV("dashboard")}>Go to Dashboard</button>
      </div>
    );
  }

  const totalVolume = session.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.done).reduce((s, st) => s + (st.weight || 0) * (st.reps || 0), 0), 0);
  const totalSets = session.exercises.reduce((s, ex) => s + ex.sets.filter(st => st.done).length, 0);
  const totalReps = session.exercises.reduce((s, ex) => s + ex.sets.filter(st => st.done).reduce((s2, st) => s2 + (st.reps || 0), 0), 0);
  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;

  const allExercises = [...EXERCISE_DB, ...(state.customExercises || [])];
  const filteredExercises = allExercises.filter(ex => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return ex.name.toLowerCase().includes(q) || ex.primary.toLowerCase().includes(q) || ex.equip.toLowerCase().includes(q);
  }).slice(0, 20);

  const addExercise = (exDef) => {
    dispatch({ type: "ADD_EXERCISE_TO_SESSION", payload: { exerciseId: exDef.id, exerciseName: exDef.name, sets: exDef.defaultSets } });
    setAddExOpen(false);
    setSearchQuery("");
  };

  const finishWorkout = () => { setShowSummary(true); };

  const confirmFinish = (calories) => {
    dispatch({ type: "FINISH_SESSION", payload: { calories } });
    showToast("Workout saved! +50 XP");
    setShowSummary(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div className="wm-session-bar">
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF" }}>{session.name}</div>
          <div className="wm-session-timer">{elapsedMin}:{elapsedSec.toString().padStart(2, "0")}</div>
        </div>
        <div className="wm-session-stats">
          <div className="wm-session-stat">Vol: <span>{fmt(totalVolume)}kg</span></div>
          <div className="wm-session-stat">Sets: <span>{totalSets}</span></div>
          <div className="wm-session-stat">Reps: <span>{totalReps}</span></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ghost-btn" onClick={() => { if (confirm("Discard this workout?")) dispatch({ type: "DISCARD_SESSION" }); }} style={{ fontSize: 12, color: "#EF4444" }}>Discard</button>
          <button className="neon-btn" onClick={finishWorkout} style={{ fontSize: 13, padding: "8px 16px" }}>Finish ✓</button>
        </div>
      </div>

      <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: 0 }}>
        {session.exercises.map((ex, ei) => {
          const exDef = EXERCISE_DB.find(e => e.id === ex.exerciseId) || {};
          const prevWorkout = state.workouts.slice().reverse().find(w => w.exercises?.some(e => e.name === ex.exerciseName));
          const prevEx = prevWorkout?.exercises?.find(e => e.name === ex.exerciseName);
          return (
            <motion.div key={ei} className="wm-exercise-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ei * 0.05 }}>
              <div className="wm-exercise-header">
                <div>
                  <div className="wm-exercise-name">{ex.exerciseName}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                    {exDef.primary && <span className="wm-muscle-tag">{exDef.primary}</span>}
                    {exDef.secondary && <span className="wm-muscle-tag" style={{ background: "rgba(255,255,255,0.04)", color: "#22C55E" }}>{exDef.secondary.split(",")[0]}</span>}
                    {exDef.equip && <span className="wm-muscle-tag" style={{ background: "rgba(255,255,255,0.04)", color: "#A0A0A0" }}>{exDef.equip}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="ghost-btn" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => dispatch({ type: "ADD_SET_TO_EXERCISE", payload: { exerciseIndex: ei } })}>+ Set</button>
                  <button className="ghost-btn" style={{ padding: "4px 8px", fontSize: 11, color: "#EF4444", borderColor: "rgba(239,68,68,0.3)" }}
                    onClick={() => { if (confirm("Remove exercise?")) dispatch({ type: "REMOVE_EXERCISE_FROM_SESSION", payload: ei }); }}>✕</button>
                </div>
              </div>
              {prevEx && (
                <div style={{ fontSize: 11, color: "rgba(160,160,160,0.5)", marginBottom: 8 }}>
                  Previous: {prevEx.sets?.length} sets · {prevEx.sets?.[0]?.weight || 0}kg × {prevEx.sets?.[0]?.reps || 0} reps
                </div>
              )}
              <div className="wm-set-header">
                <span>Set</span><span>Weight</span><span>Reps</span><span>RPE</span><span>Est. 1RM</span><span></span>
              </div>
              {ex.sets.map((set, si) => (
                <div key={si} className="wm-set-row" style={{ opacity: set.done ? 0.6 : 1 }}>
                  <div className="wm-set-num" style={{ color: set.done ? "#22C55E" : "#A0A0A0" }}>
                    {set.isWarmup ? "W" : si + 1}
                  </div>
                  <input className="wm-set-input" type="number" value={set.weight} placeholder="kg"
                    onChange={e => dispatch({ type: "UPDATE_SET", payload: { exerciseIndex: ei, setIndex: si, field: "weight", value: +e.target.value } })} />
                  <input className="wm-set-input" type="number" value={set.reps} placeholder="reps"
                    onChange={e => dispatch({ type: "UPDATE_SET", payload: { exerciseIndex: ei, setIndex: si, field: "reps", value: +e.target.value } })} />
                  <input className="wm-set-input rpe" type="number" value={set.rpe || ""} placeholder="RPE" min={1} max={10}
                    onChange={e => dispatch({ type: "UPDATE_SET", payload: { exerciseIndex: ei, setIndex: si, field: "rpe", value: +e.target.value } })} />
                  <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: set.weight > 0 ? "#22C55E" : "rgba(160,160,160,0.3)", textAlign: "center" }}>
                    {set.weight > 0 ? fmt(calcE1RM(set.weight, set.reps), 1) : "—"}
                  </div>
                  <button className={wm-set-done }
                    onClick={() => {
                      dispatch({ type: "TOGGLE_SET_DONE", payload: { exerciseIndex: ei, setIndex: si } });
                      if (!set.done && set.isWarmup === false) { setShowRest(true); }
                    }}>
                    {set.done ? "✓" : ""}
                  </button>
                </div>
              ))}
              <div style={{ marginTop: 8 }}>
                <textarea className="wm-notes-input" placeholder="Notes for this exercise..." value={ex.notes}
                  onChange={e => dispatch({ type: "UPDATE_EXERCISE_NOTES", payload: { index: ei, notes: e.target.value } })} />
              </div>
            </motion.div>
          );
        })}
        <button className="ghost-btn" onClick={() => setAddExOpen(true)}
          style={{ width: "100%", padding: 14, borderStyle: "dashed", fontSize: 14 }}>
          + Add Exercise
        </button>
      </div>

      <AnimatePresence>
        {showRest && <RestTimer duration={restDuration} onDone={() => setShowRest(false)} onSkip={() => setShowRest(false)} />}
        {showSummary && <FinishWorkoutSummary session={session} duration={elapsedMin} onClose={confirmFinish} onDiscard={() => { dispatch({ type: "DISCARD_SESSION" }); setShowSummary(false); }} />}
      </AnimatePresence>

      {addExOpen && (
        <motion.div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900, padding: 20 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAddExOpen(false)}>
          <motion.div style={{ width: "100%", maxWidth: 500, maxHeight: "80vh", background: "rgba(15,15,15,0.98)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}
            initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>Add Exercise</h3>
              <button className="ghost-btn" onClick={() => setAddExOpen(false)} style={{ padding: "4px 8px" }}>✕</button>
            </div>
              <div className="wm-search-bar">
                <input placeholder="Search exercises..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus />
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filteredExercises.map(ex => (
                <div key={ex.id} className="wm-exercise-card" style={{ padding: 12, marginBottom: 8, cursor: "pointer" }}
                  onClick={() => addExercise(ex)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF" }}>{ex.name}</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        <span className="wm-muscle-tag">{ex.primary}</span>
                        <span className="wm-muscle-tag" style={{ background: "rgba(255,255,255,0.04)", color: "#A0A0A0" }}>{ex.equip}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 20, color: "#22C55E" }}>+</span>
                  </div>
                </div>
              ))}
              {filteredExercises.length === 0 && (
                <div style={{ textAlign: "center", padding: 24, color: "#A0A0A0", fontSize: 13 }}>No exercises found</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default WorkoutSession;
