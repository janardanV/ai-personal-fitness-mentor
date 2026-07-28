export default function MetricCard({ label, value, unit, sub, color, trend, trendColor, icon, onClick, style }) {
  const accent = color || "var(--accent)";
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(); } : undefined}
      style={{
        position: "relative",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-3xl)",
        padding: "var(--space-5)",
        cursor: onClick ? "pointer" : "default",
        transition: "all var(--duration-fast) var(--ease-in-out)",
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        opacity: 0.6,
      }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon && <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{icon}</span>}
          <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", fontWeight: "var(--font-weight-medium)" }}>{label}</span>
        </div>
        {trend && (
          <span style={{ fontSize: "var(--text-xs)", color: trendColor || accent, fontWeight: "var(--font-weight-semibold)" }}>{trend}</span>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: "var(--font-weight-extrabold)", fontFamily: "var(--font-mono)", color: "var(--text-primary)", lineHeight: 1.2 }}>
        {value}<span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-tertiary)", marginLeft: 4 }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
