import { motion } from "framer-motion";

const variants = {
  primary: {
    background: "var(--accent)",
    color: "var(--text-inverse)",
    fontWeight: "var(--font-weight-bold)",
    border: "none",
  },
  secondary: {
    background: "var(--bg-elevated)",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-default)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid transparent",
  },
  danger: {
    background: "var(--red-dim)",
    color: "var(--red)",
    border: "1px solid rgba(239,68,68,0.2)",
  },
  accent: {
    background: "var(--accent-dim)",
    color: "var(--accent)",
    border: "1px solid var(--accent-border)",
  },
};

const sizes = {
  sm: { padding: "6px 12px", fontSize: "var(--text-sm)" },
  md: { padding: "10px 20px", fontSize: "var(--text-base)" },
  lg: { padding: "14px 28px", fontSize: "var(--text-md)" },
};

export default function Button({
  children, variant = "primary", size = "md", fullWidth, loading, disabled, onClick, style, className, type = "button", ...props
}) {
  const varStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;
  return (
    <motion.button
      whileHover={!disabled ? { y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      className={className}
      style={{
        borderRadius: "var(--radius-lg)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all var(--duration-fast) var(--ease-in-out)",
        whiteSpace: "nowrap",
        fontFamily: "var(--font-sans)",
        ...varStyles,
        ...sizeStyles,
        ...(fullWidth ? { width: "100%" } : {}),
        ...style,
      }}
      {...props}
    >
      {loading && (
        <span style={{
          width: 14, height: 14, borderRadius: "50%",
          border: "2px solid currentColor",
          borderTopColor: "transparent",
          animation: "spin 0.6s linear infinite",
          display: "inline-block",
        }} />
      )}
      {children}
    </motion.button>
  );
}
