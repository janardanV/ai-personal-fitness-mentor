import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
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
    <div className="rd-stack">
      <div className="rd-tab-head">
        <div className="rd-count"><Trophy size={13} /> <b>{prEntries.length}</b> exercise{prEntries.length !== 1 ? "s" : ""} tracked</div>
      </div>

      {recentPRs.length > 0 && (
        <div className="rd-card">
          <div className="rd-card-head">
            <div className="rd-card-title">
              <div className="rd-card-title-ico orange"><Trophy size={15} /></div>
              <div>
                <div className="rd-card-kicker">Last 30 days</div>
                <div className="rd-card-name">New PRs This Month</div>
              </div>
            </div>
          </div>
          <div className="rd-pr-new-chips">
            {recentPRs.map(pr => (
              <span key={pr.exerciseId} className="rd-pr-new-chip">
                <Trophy size={12} /> {pr.name}: <b>{pr.weight}kg × {pr.reps}</b>
              </span>
            ))}
          </div>
        </div>
      )}

      {prEntries.length === 0 ? (
        <div className="rd-empty" style={{ padding: "44px 16px" }}>
          <Trophy size={30} style={{ color: "rgba(255,255,255,0.2)", marginBottom: 4 }} />
          <div className="rd-empty-title">No Records Yet</div>
          <div className="rd-empty-sub">Complete workouts to track your personal records automatically.</div>
        </div>
      ) : (
        Object.entries(e1rmByMuscle).map(([muscle, exercises]) => (
          <div key={muscle}>
            <div className="rd-pr-section-label"><Trophy size={12} /> {muscle}</div>
            <div className="rd-pr-grid">
              {exercises.map(pr => (
                <motion.div key={pr.exerciseId} className="rd-pr-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="rd-pr-name" style={{ marginBottom: 10 }}>{pr.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                      <span className="rd-pr-badge"><Trophy size={11} /> PR</span>
                      <span className="rd-pr-val">{pr.weight}<span>kg</span></span>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>×{pr.reps}</span>
                    </div>
                    <div className="rd-pr-date">{pr.date}</div>
                  </div>
                  <div className="rd-pr-e1rm">Est. 1RM <b>{fmt(pr.e1rm || 0, 1)}kg</b></div>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PersonalRecords;
