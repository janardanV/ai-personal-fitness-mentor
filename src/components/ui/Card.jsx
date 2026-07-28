export default function Card({ children, hover, onClick, style, className, ...props }) {
  return (
    <div
      className={className}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(); } : undefined}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-3xl)",
        padding: "var(--space-5)",
        transition: "all var(--duration-fast) var(--ease-in-out)",
        cursor: hover || onClick ? "pointer" : "default",
        ...(hover || onClick ? {
          ":hover": {
            borderColor: "var(--accent-border)",
          }
        } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
      <style>{`
        [role="button"]:hover { border-color: var(--accent-border) !important; }
        [role="button"]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
      `}</style>
    </div>
  );
}
