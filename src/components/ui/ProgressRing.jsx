export default function ProgressRing({ value, max, size = 80, color, label, sub }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min((value / Math.max(max, 1)) * circ, circ);
  const strokeColor = color || "var(--accent)";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={7} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={strokeColor} strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 1.2s var(--ease-in-out)" }} />
        <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
          fill={strokeColor} fontSize={13} fontWeight={700} fontFamily="var(--font-mono)">
          {typeof value === "number" ? value.toFixed(0) : value}
        </text>
      </svg>
      {label && <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>{label}</span>}
      {sub && <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{sub}</span>}
    </div>
  );
}
