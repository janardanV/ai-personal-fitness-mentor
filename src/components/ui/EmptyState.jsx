import Button from "./Button";

export default function EmptyState({ icon, title, subtitle, action, actionLabel, secondaryAction, secondaryLabel }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "48px 24px",
      background: "var(--bg-surface)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-3xl)",
    }}>
      {icon && (
        <div style={{
          width: 56, height: 56, borderRadius: "var(--radius-2xl)",
          background: "var(--accent-dim)",
          border: "1px solid var(--accent-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, margin: "0 auto 16px",
        }}>
          {icon}
        </div>
      )}
      <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-weight-bold)", color: "var(--text-primary)", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: "var(--text-base)", color: "var(--text-secondary)", marginBottom: action ? 20 : 0, lineHeight: 1.5, maxWidth: 360, margin: "0 auto 20px" }}>{subtitle}</div>
      {action && (
        <Button variant="primary" size="md" onClick={action}>
          {actionLabel}
        </Button>
      )}
      {secondaryAction && (
        <div style={{ marginTop: 8 }}>
          <Button variant="ghost" size="sm" onClick={secondaryAction}>
            {secondaryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
