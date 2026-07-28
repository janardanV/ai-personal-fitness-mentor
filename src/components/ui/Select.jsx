export default function Select({ label, error, children, style, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{
          display: "block",
          fontSize: "var(--text-sm)",
          color: "var(--text-secondary)",
          marginBottom: 6,
          fontWeight: "var(--font-weight-medium)",
        }}>
          {label}
        </label>
      )}
      <select
        style={{
          ...(error ? { borderColor: "var(--red)" } : {}),
          ...style,
        }}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p style={{ fontSize: "var(--text-xs)", color: "var(--red)", marginTop: 4 }}>{error}</p>
      )}
    </div>
  );
}
