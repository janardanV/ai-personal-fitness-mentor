import { useState, useEffect, useRef } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EXERCISE_DB, fmt, calcE1RM, showToast } from "../utils/helpers";
import { Timer, History, Plus, X, Check, Trash2, CheckCircle2, Trophy, Search, LayoutDashboard, Dumbbell, Target, Zap, HeartPulse, PersonStanding, Flame } from "lucide-react";

const REST_PRESETS = [60, 90, 120, 180, 300];

const CAT_ICONS = {
  compound: Dumbbell,
  isolation: Target,
  plyometric: Zap,
  cardio: HeartPulse,
  bodyweight: PersonStanding,
};

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
    <motion.div className="rd-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onSkip}>
      <motion.div className="rd-modal" style={{ maxWidth: 420, textAlign: "center" }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
        <div style={{ marginBottom: 16 }}>
          <svg width={220} height={220}>
            <circle cx={110} cy={110} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
            <circle cx={110} cy={110} r={r} fill="none" stroke="#C8FF32" strokeWidth={8} strokeDasharray={`${dash} `} strokeLinecap="round" transform="rotate(-90 110 110)" style={{ transition: "stroke-dasharray 0.5s linear" }} />
          </svg>
          <div style={{ position: "relative", marginTop: -164, textAlign: "center" }}>
            <div className="rd-timer-display">{mins}:{secs.toString().padStart(2, "0")}</div>
          </div>
        </div>
        <div className="rd-timer-label">Rest · tap anywhere to skip</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 18 }}>
          {REST_PRESETS.map(s => (
            <button key={s} className={`rd-chip ${duration === s ? "active" : ""}`}
              onClick={() => { clearInterval(intervalRef.current); setRemaining(s); intervalRef.current = setInterval(() => {
                setRemaining(prev => { if (prev <= 1) { clearInterval(intervalRef.current); try { const alarm = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+JkY2Dd2Bwf4eLjIh6YWR3gIaIioh8Zml5g4iJiYd8a21+g4eHh4V+cnB2gIaGhYJ9c3J2gYaGhIJ8c3J1f4WGhIJ8c3J1f4WGhIJ8c3F0f4WGhIJ8c3F0f4WGhIJ8c3F0f4WGhIJ8c3F0f4WGhA=="); alarm.play().catch(()=>{}); } catch(e) {} onDone(); return 0; } return prev - 1; });
              }, 1000); }}
            >{Math.floor(s / 60)}:{(s % 60).toString().padStart(2, "0")}</button>
          ))}
        </div>
        <button className="rd-btn-secondary" onClick={onSkip} style={{ width: "100%", marginTop: 18 }}>Skip Rest</button>
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
    <motion.div className="rd-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="rd-modal" style={{ maxWidth: 480 }} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
        <div className="rd-ex-tile" style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 14px" }}>
          <Trophy size={26} />
        </div>
        <div className="rd-modal-title" style={{ textAlign: "center" }}>Workout Complete</div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: 4 }}>{session.name} · {duration} min</p>
        <div className="rd-stats-grid">
          <div className="rd-stat-box lime">
            <div className="l">Volume</div>
            <div className="v">{fmt(totalVolume)}<span> kg</span></div>
          </div>
          <div className="rd-stat-box lime">
            <div className="l">Calories</div>
            <div className="v">{calories}<span> kcal</span></div>
          </div>
          <div className="rd-stat-box">
            <div className="l">Sets</div>
            <div className="v">{totalSets}</div>
          </div>
          <div className="rd-stat-box">
            <div className="l">Total Reps</div>
            <div className="v">{totalReps}</div>
          </div>
        </div>
        <div style={{ textAlign: "left", marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Exercise Breakdown</div>
          {perExercise.map((ex, i) => (
            <div key={i} className="rd-break-row">
              <span className="n">{ex.name}</span>
              <span className="m">{ex.sets} sets · {fmt(ex.volume)}kg · e1RM <b>{fmt(ex.bestE1RM, 1)}</b></span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="rd-btn-secondary" onClick={onDiscard} style={{ flex: 1, color: "#FF5A5F", borderColor: "rgba(255,90,95,0.3)" }}>Discard</button>
          <button className="rd-btn-primary" onClick={() => onClose(calories)} style={{ flex: 2 }}><CheckCircle2 size={15} /> Save +50 XP</button>
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
      <div className="rd-card rd-empty" style={{ padding: "48px 24px" }}>
        <div className="rd-ex-tile" style={{ width: 52, height: 52, borderRadius: 14, margin: "0 auto 14px" }}>
          <Dumbbell size={24} />
        </div>
        <div className="rd-empty-title">No Active Workout</div>
        <div className="rd-empty-sub">Start a workout from the Dashboard or Templates tab.</div>
        <button className="rd-btn-primary" style={{ marginTop: 12 }} onClick={() => NAV("dashboard")}><LayoutDashboard size={15} /> Go to Dashboard</button>
      </div>
    );
  }

  const totalVolume = session.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.done).reduce((s, st) => s + (st.weight || 0) * (st.reps || 0), 0), 0);
  const totalSets = session.exercises.reduce((s, ex) => s + ex.sets.filter(st => st.done).length, 0);
  const totalReps = session.exercises.reduce((s, ex) => s + ex.sets.filter(st => st.done).reduce((s2, st) => s2 + (st.reps || 0), 0), 0);
  const totalPlannedSets = session.exercises.reduce((s, ex) => s + ex.sets.length, 0);
  const progressPct = totalPlannedSets > 0 ? Math.round((totalSets / totalPlannedSets) * 100) : 0;
  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;

  let currentExerciseIndex = -1;
  for (let i = 0; i < session.exercises.length; i++) {
    if (session.exercises[i].sets.some(st => !st.done)) { currentExerciseIndex = i; break; }
  }
  const currentSetIndex = currentExerciseIndex >= 0 ? session.exercises[currentExerciseIndex].sets.findIndex(st => !st.done) : -1;

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
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="rd-session-bar">
        <div style={{ minWidth: 0 }}>
          <div className="rd-session-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.name}</div>
          <div className="rd-session-timer"><Timer size={14} /> {elapsedMin}:{elapsedSec.toString().padStart(2, "0")}</div>
        </div>
        <div className="rd-progress-track"><div className="rd-progress-fill" style={{ width: `${progressPct}%` }} /></div>
        <div className="rd-session-stats">
          <div className="rd-session-stat"><span className="v">{fmt(totalVolume)}</span><span className="l">Volume kg</span></div>
          <div className="rd-session-stat"><span className="v">{totalSets}<span style={{ opacity: 0.4, fontSize: 11 }}>/{totalPlannedSets}</span></span><span className="l">Sets</span></div>
          <div className="rd-session-stat"><span className="v">{totalReps}</span><span className="l">Reps</span></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="rd-mini-btn danger" onClick={() => { if (confirm("Discard this workout?")) dispatch({ type: "DISCARD_SESSION" }); }}><Trash2 size={13} /> Discard</button>
          <button className="rd-btn-primary" style={{ padding: "9px 18px" }} onClick={finishWorkout}><CheckCircle2 size={15} /> Finish</button>
        </div>
      </div>

      <div className="rd-session-grid">
        {session.exercises.map((ex, ei) => {
          const exDef = EXERCISE_DB.find(e => e.id === ex.exerciseId) || {};
          const prevWorkout = state.workouts.slice().reverse().find(w => w.exercises?.some(e => e.name === ex.exerciseName));
          const prevEx = prevWorkout?.exercises?.find(e => e.name === ex.exerciseName);
          const CatIcon = CAT_ICONS[exDef.cat] || Dumbbell;
          const isCurrent = currentExerciseIndex === ei;
          return (
            <motion.div key={ei} className={`rd-ex-session ${isCurrent ? "current" : ""}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ei * 0.05 }}>
              <div className="rd-ex-session-head">
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <div className="rd-ex-tile" style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0 }}>
                    <CatIcon size={19} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="rd-ex-session-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.exerciseName}</div>
                    <div className="rd-ex-session-sub">{exDef.primary || "Exercise"}{exDef.equip ? ` · ${exDef.equip}` : ""}</div>
                  </div>
                </div>
                <div className="rd-ex-session-actions">
                  {isCurrent && <span className="rd-hero-tag" style={{ fontSize: 10 }}>CURRENT</span>}
                  <button className="rd-mini-btn" onClick={() => dispatch({ type: "ADD_SET_TO_EXERCISE", payload: { exerciseIndex: ei } })}><Plus size={12} /> Set</button>
                  <button className="rd-mini-btn danger"
                    onClick={() => { if (confirm("Remove exercise?")) dispatch({ type: "REMOVE_EXERCISE_FROM_SESSION", payload: ei }); }}><X size={13} /></button>
                </div>
              </div>
              {prevEx && (
                <div className="rd-prev">
                  <History size={12} /> Previous · <b>{prevEx.sets?.length} sets · {prevEx.sets?.[0]?.weight || 0}kg × {prevEx.sets?.[0]?.reps || 0}</b>
                </div>
              )}
              <div>
                <div className="rd-set-header">
                  <span>Set</span><span>Weight</span><span>Reps</span><span>RPE</span><span>Est. 1RM</span><span></span>
                </div>
                {ex.sets.map((set, si) => {
                  const isCurSet = isCurrent && currentSetIndex === si;
                  return (
                    <div key={si} className={`rd-set-row ${set.done ? "done" : ""} ${isCurSet ? "current" : ""}`}>
                      <div className="rd-set-num">{set.isWarmup ? "W" : si + 1}</div>
                      <input className="rd-set-input" type="number" value={set.weight} placeholder="kg"
                        onChange={e => dispatch({ type: "UPDATE_SET", payload: { exerciseIndex: ei, setIndex: si, field: "weight", value: +e.target.value } })} />
                      <input className="rd-set-input" type="number" value={set.reps} placeholder="reps"
                        onChange={e => dispatch({ type: "UPDATE_SET", payload: { exerciseIndex: ei, setIndex: si, field: "reps", value: +e.target.value } })} />
                      <input className="rd-set-input" type="number" value={set.rpe || ""} placeholder="RPE" min={1} max={10}
                        onChange={e => dispatch({ type: "UPDATE_SET", payload: { exerciseIndex: ei, setIndex: si, field: "rpe", value: +e.target.value } })} />
                      <div className="rd-set-e1rm" style={{ color: set.weight > 0 ? undefined : "rgba(255,255,255,0.15)" }}>
                        {set.weight > 0 ? fmt(calcE1RM(set.weight, set.reps), 1) : "—"}
                      </div>
                      <button className={`rd-set-check ${set.done ? "checked" : ""}`}
                        onClick={() => {
                          dispatch({ type: "TOGGLE_SET_DONE", payload: { exerciseIndex: ei, setIndex: si } });
                          if (!set.done && set.isWarmup === false) { setShowRest(true); }
                        }}>
                        {set.done && <Check size={15} />}
                      </button>
                    </div>
                  );
                })}
              </div>
              <textarea className="rd-notes" placeholder="Notes for this exercise..." value={ex.notes}
                onChange={e => dispatch({ type: "UPDATE_EXERCISE_NOTES", payload: { index: ei, notes: e.target.value } })} />
            </motion.div>
          );
        })}
        <button className="rd-add-dashed" onClick={() => setAddExOpen(true)}>
          <Plus size={15} /> Add Exercise
        </button>
      </div>

      <AnimatePresence>
        {showRest && <RestTimer duration={restDuration} onDone={() => setShowRest(false)} onSkip={() => setShowRest(false)} />}
        {showSummary && <FinishWorkoutSummary session={session} duration={elapsedMin} onClose={confirmFinish} onDiscard={() => { dispatch({ type: "DISCARD_SESSION" }); setShowSummary(false); }} />}
      </AnimatePresence>

      {addExOpen && (
        <motion.div className="rd-modal-overlay" style={{ zIndex: 900 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAddExOpen(false)}>
          <motion.div className="rd-modal rd-modal-lg" style={{ maxWidth: 520, maxHeight: "80vh", display: "flex", flexDirection: "column" }}
            initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
            <button className="rd-modal-close" onClick={() => setAddExOpen(false)}><X size={16} /></button>
            <div className="rd-modal-title" style={{ marginBottom: 14 }}>Add Exercise</div>
            <div className="rd-search" style={{ marginBottom: 12 }}>
              <Search size={15} />
              <input placeholder="Search exercises..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus />
            </div>
            <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 8, paddingRight: 2 }}>
              {filteredExercises.map(ex => {
                const Icon = CAT_ICONS[ex.cat] || Dumbbell;
                return (
                  <div key={ex.id} className="rd-ex-row" onClick={() => addExercise(ex)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <div className="rd-ex-tile" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }}>
                        <Icon size={16} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{ex.primary} · {ex.equip}</div>
                      </div>
                    </div>
                    <Plus size={16} style={{ color: "#C8FF32", flexShrink: 0 }} />
                  </div>
                );
              })}
              {filteredExercises.length === 0 && (
                <div className="rd-empty" style={{ padding: 24 }}>No exercises found</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default WorkoutSession;
