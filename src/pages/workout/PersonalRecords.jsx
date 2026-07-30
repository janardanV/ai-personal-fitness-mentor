import { useMemo } from "react";
import React from "react";
import { motion } from "framer-motion";
import { EXERCISE_DB, fmt } from "../../utils/helpers";

const PersonalRecords = ({ state }) => {
  const prs = state.personalRecords || {};
  const prEntries = Object.entries(prs).map(([exerciseId, pr]) => {
    const exDef = EXERCISE_DB.find(e => e.id === exerciseId);
    return { exerciseId, name: exDef?.name || exerciseId, primary: exDef?.primary || "", ...pr };
  }).sort((a, b) => (b.e1rm || 0) - (a.e1rm || 0));

  const recentPRs = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    return prEntries.filter(pr => pr.date >= cutoffStr);
  }, [prEntries]);

  const e1rmByMuscle = useMemo(() => {
    const groups = {};
    prEntries.forEach(pr => {
      const m = pr.primary || "Other";
      if (!groups[m]) groups[m] = [];
      groups[m].push(pr);
    });
    return groups;
  }, [prEntries]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="wm-page-header">
        <h2>Personal Records</h2>
        <div style={{ fontSize: 12, color: "#A0A0A0" }}>{prEntries.length} exercise{prEntries.length !== 1 ? "s" : ""} tracked</div>
      </div>

      {recentPRs.length > 0 && (
        <div className="glass" style={{ padding: "20px", borderRadius: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#FFD700", marginBottom: 10 }}>🏆 New PRs This Month</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {recentPRs.map(pr => (
              <span key={pr.exerciseId} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", fontSize: 12, color: "#FFD700" }}>
                {pr.name}: {pr.weight}kg × {pr.reps}
              </span>
            ))}
          </div>
        </div>
      )}

      {prEntries.length === 0 ? (
        <div className="wm-empty">
          <div className="wm-empty-icon">🏆</div>
          <div className="wm-empty-title">No Records Yet</div>
          <div className="wm-empty-desc">Complete workouts to track your personal records automatically.</div>
        </div>
      ) : (
        <>
          {Object.entries(e1rmByMuscle).map(([muscle, exercises]) => (
            <div key={muscle}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#C8FF00", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{muscle}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
                {exercises.map(pr => (
                  <motion.div key={pr.exerciseId} className="wm-pr-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", marginBottom: 6 }}>{pr.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span className="pr-badge" style={{ marginRight: 6 }}>🏆 PR</span>
                        <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "#C8FF00" }}>{pr.weight}<span style={{ fontSize: 12, color: "#A0A0A0" }}>kg</span></span>
                        <span style={{ fontSize: 13, color: "#A0A0A0", marginLeft: 6 }}>×{pr.reps}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(160,160,160,0.4)" }}>{pr.date}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(160,160,160,0.5)", marginTop: 4 }}>Est. 1RM: {fmt(pr.e1rm || 0, 1)}kg</div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default PersonalRecords;
