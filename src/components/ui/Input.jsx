import { forwardRef } from "react";

const Input = forwardRef(({ label, error, icon, style, ...props }, ref) => {
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
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            color: "var(--text-muted)", fontSize: 16, pointerEvents: "none", zIndex: 1,
          }}>
            {icon}
          </span>
        )}
        <input
          ref={ref}
          style={{
            ...(icon ? { paddingLeft: 44 } : {}),
            ...(error ? { borderColor: "var(--red)" } : {}),
            ...style,
          }}
          {...props}
        />
      </div>
      {error && (
        <p style={{ fontSize: "var(--text-xs)", color: "var(--red)", marginTop: 4 }}>{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
