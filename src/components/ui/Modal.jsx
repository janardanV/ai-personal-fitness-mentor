import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, width = 480 }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            padding: 20,
          }}
          onClick={() => onClose?.()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: width,
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-4xl)",
              padding: "var(--space-8)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            {title && (
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 20,
              }}>
                <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-weight-bold)", color: "var(--text-primary)" }}>{title}</div>
                <button
                  onClick={() => onClose?.()}
                  style={{
                    width: 32, height: 32, borderRadius: "var(--radius-md)",
                    background: "var(--bg-hover)", border: "1px solid var(--border-subtle)",
                    color: "var(--text-secondary)", fontSize: 16, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
