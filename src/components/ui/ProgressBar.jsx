export default function ProgressBar({ value, max = 100, color, height = 6, showLabel, style }) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  const bg = color || "var(--accent)";
  return (
    <div style={{ width: "100%", ...style }}>
      {showLabel && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
          <span>{Math.round(pct)}%</span>
          <span>{value} / {max}</span>
        </div>
      )}
      <div style={{
        width: "100%", height, borderRadius: height / 2,
        background: "rgba(255,255,255,0.04)", overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          borderRadius: height / 2,
          background: `linear-gradient(90deg, ${bg}, ${bg}88)`,
          transition: "width 1s var(--ease-in-out)",
        }} />
      </div>
    </div>
  );
}
