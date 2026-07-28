export default function SectionHeader({ title, subtitle, action, children }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
      flexWrap: "wrap",
      gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 4, height: 20, borderRadius: 2, background: "var(--accent)" }} />
        <div>
          <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-weight-bold)", color: "var(--text-primary)" }}>{title}</div>
          {subtitle && <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{subtitle}</div>}
        </div>
      </div>
      {action && <div>{action}</div>}
      {children}
    </div>
  );
}
