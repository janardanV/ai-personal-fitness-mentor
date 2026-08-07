import { motion } from "framer-motion";
import { FRONT_MUSCLES, BACK_MUSCLES } from "../data/muscleAtlas";

const INACTIVE_FILL = "#262F3D";
const ACTIVE_FILL = "#C8FF32";

const MusclePath = ({ muscle, active }) => (
  <motion.path
    d={muscle.path}
    initial={false}
    animate={{
      opacity: active ? 1 : 0.55,
      fill: active ? ACTIVE_FILL : INACTIVE_FILL,
      stroke: active ? "rgba(200,255,50,0.55)" : "rgba(255,255,255,0.08)",
      strokeWidth: active ? 0.3 : 0.12,
    }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className={active ? "rd-body-active" : undefined}
  />
);

const HumanBody = ({ activeMuscles = [], labels = [] }) => {
  const set = new Set(activeMuscles);
  return (
    <div className="rd-body-wrap">
      <svg viewBox="0 0 72 93" fill="none" role="img" aria-label="Muscle activity map">
        <g>
          {FRONT_MUSCLES.map((m) => (
            <MusclePath key={m.id} muscle={m} active={set.has(m.id)} />
          ))}
        </g>
        <g>
          {BACK_MUSCLES.map((m) => (
            <MusclePath key={m.id} muscle={m} active={set.has(m.id)} />
          ))}
        </g>
      </svg>
      {labels.length > 0 && (
        <div className="rd-body-labels">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default HumanBody;
