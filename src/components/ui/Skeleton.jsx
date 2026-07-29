export function SkeletonBlock({ width = "100%", height = 20, radius, style }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width, height,
        borderRadius: radius || "var(--radius-md)",
        background: "rgba(255,255,255,0.03)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)",
        animation: "shimmer 1.5s ease-in-out infinite",
      }} />
    </div>
  );
}

export function SkeletonCard({ rows = 3 }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-3xl)",
      padding: "var(--space-5)",
    }}>
      <SkeletonBlock width="40%" height={16} style={{ marginBottom: 12 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBlock key={i} height={12} style={{ marginBottom: i < rows - 1 ? 8 : 0 }} />
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 200 }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-3xl)",
      padding: "var(--space-5)",
    }}>
      <SkeletonBlock width="30%" height={14} style={{ marginBottom: 16 }} />
      <SkeletonBlock width="100%" height={height} radius="var(--radius-lg)" />
    </div>
  );
}
