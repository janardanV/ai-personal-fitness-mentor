export default function Badge({ children, variant = "default", color, style }) {
  const colors = {
    default: { bg: "var(--accent-dim)", text: "var(--accent)" },
    success: { bg: "var(--green-dim)", text: "var(--green)" },
    error: { bg: "var(--red-dim)", text: "var(--red)" },
    gold: { bg: "var(--gold-dim)", text: "var(--gold)" },
  };
  const c = colors[variant] || colors.default;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 8px",
      borderRadius: "var(--radius-sm)",
      fontSize: "var(--text-xs)",
      fontWeight: "var(--font-weight-semibold)",
      background: c.bg,
      color: c.text,
      whiteSpace: "nowrap",
      ...style,
    }}>
      {children}
    </span>
  );
}
