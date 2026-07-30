export function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, ...style }}
    />
  );
}

export function SkeletonCard({ height = 120, children }) {
  return (
    <div style={{ background: "#151515", border: "1px solid rgba(200,255,0,0.06)", borderRadius: 14, padding: 20 }}>
      {children || <Skeleton height={height} />}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 24 }}>
      <Skeleton height={140} borderRadius={20} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} height={100} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <SkeletonCard height={200} />
        <SkeletonCard height={200} />
      </div>
    </div>
  );
}
