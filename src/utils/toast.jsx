import { useState, useEffect } from "react";
import { motion } from "framer-motion";

let _toastFn = null;
export const showToast = (msg) => { _toastFn?.(msg); };

let _confirmFn = null;
export const showConfirm = (msg) => new Promise(resolve => { _confirmFn?.(msg, resolve); });

export const Toast = () => {
  const [toast, setToast] = useState(null);
  useEffect(() => { _toastFn = setToast; return () => { _toastFn = null; }; }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); } }, [toast]);
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: "#C8FF00", color: "#0B0B0B", padding: "12px 24px", borderRadius: 12, fontWeight: 700, fontSize: 14, boxShadow: "0 8px 32px rgba(200,255,0,0.2)", animation: "slideUp 0.3s ease-out" }}>
      {toast}
    </div>
  );
};

export const ConfirmDialog = () => {
  const [state, setState] = useState({ open: false, msg: "", resolve: null });
  useEffect(() => { _confirmFn = (msg, resolve) => setState({ open: true, msg, resolve }); return () => { _confirmFn = null; }; }, []);
  const close = (val) => { state.resolve?.(val); setState({ open: false, msg: "", resolve: null }); };
  if (!state.open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }} onClick={() => close(false)}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        style={{ background: "#151515", border: "1px solid rgba(200,255,0,0.1)", borderRadius: 16, padding: 28, maxWidth: 380, width: "90%", backdropFilter: "blur(20px)", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", marginBottom: 8 }}>Confirm Action</div>
        <p style={{ fontSize: 14, color: "#A0A0A0", lineHeight: 1.6, marginBottom: 24 }}>{state.msg}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="ghost-btn" onClick={() => close(false)} style={{ padding: "10px 18px" }}>Cancel</button>
          <button onClick={() => close(true)} style={{ background: "rgba(255,71,87,0.12)", border: "1px solid rgba(255,71,87,0.3)", color: "#FF4757", borderRadius: 10, padding: "10px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,71,87,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,71,87,0.12)"; }}>Confirm</button>
        </div>
      </motion.div>
    </div>
  );
};
