import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithEmail, signInWithGoogle, signUpWithEmail, getFriendlyError } from "../firebase/auth";
import { createUserDocument } from "../services/profileService";

const MODES = { SELECT: 0, EMAIL: 1, SIGNUP: 2 };

export default function AuthModal({ open, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState(MODES.SELECT);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => { setMode(MODES.SELECT); setEmail(""); setPassword(""); setName(""); setError(""); setBusy(false); };

  const handleClose = () => { reset(); onClose(); };

  const handleGoogle = async () => {
    setError(""); setBusy(true);
    try {
      const result = await signInWithGoogle();
      const u = result.user;
      await createUserDocument(u.uid, { name: u.displayName || "", email: u.email || "", photoURL: u.photoURL || "" });
      reset();
      onAuthSuccess();
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") setError(getFriendlyError(err));
    } finally { setBusy(false); }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Please fill in all fields."); return; }
    setBusy(true);
    try {
      await signInWithEmail(email.trim(), password);
      reset();
      onAuthSuccess();
    } catch (err) { setError(getFriendlyError(err)); } finally { setBusy(false); }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setBusy(true);
    try {
      const result = await signUpWithEmail(email.trim(), password);
      const u = result.user;
      await createUserDocument(u.uid, { name: name.trim(), email: email.trim(), photoURL: "" });
      reset();
      onAuthSuccess();
    } catch (err) { setError(getFriendlyError(err)); } finally { setBusy(false); }
  };

  const btnBase = {
    width: "100%", padding: "14px 20px", borderRadius: 14, fontSize: 14, fontWeight: 600,
    cursor: "pointer", transition: "all 0.2s", fontFamily: "'Inter', sans-serif",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed", inset: 0, zIndex: 10000,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
            padding: 20,
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 400,
              background: "rgba(15,15,15,0.98)", border: "1px solid rgba(200,255,0,0.1)",
              borderRadius: 20, padding: 32,
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 14, margin: "0 auto 16px",
              background: "rgba(200,255,0,0.1)", border: "1px solid rgba(200,255,0,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            }}>⚡</div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", textAlign: "center", marginBottom: 6 }}>
              Sign in to save your progress
            </h2>
            <p style={{ fontSize: 13, color: "rgba(160,160,160,0.6)", textAlign: "center", marginBottom: 24, lineHeight: 1.5 }}>
              Your data will be securely saved to the cloud and synced across all your devices.
            </p>

            {mode === MODES.SELECT && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={handleGoogle} disabled={busy} style={{ ...btnBase, background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF", opacity: busy ? 0.6 : 1 }}
                  onMouseEnter={e => { if (!busy) { e.currentTarget.style.background = "#252525"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#1D1D1D"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </button>

                <button onClick={() => { setMode(MODES.EMAIL); setError(""); }} style={{ ...btnBase, background: "transparent", border: "1px solid rgba(200,255,0,0.2)", color: "#C8FF00" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,255,0,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  Sign in with Email
                </button>

                <button onClick={() => { setMode(MODES.SIGNUP); setError(""); }} style={{ ...btnBase, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#A0A0A0", fontSize: 13 }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "#FFFFFF"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#A0A0A0"; }}
                >
                  Create Account
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                  <span style={{ fontSize: 12, color: "rgba(160,160,160,0.3)" }}>or</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                </div>

                <button onClick={handleClose} style={{ ...btnBase, background: "transparent", border: "none", color: "#A0A0A0", fontSize: 13, fontWeight: 500 }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#FFFFFF"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#A0A0A0"; }}
                >
                  Continue as Guest
                </button>
              </div>
            )}

            {mode === MODES.EMAIL && (
              <form onSubmit={handleEmailLogin}>
                <button type="button" onClick={() => setMode(MODES.SELECT)} style={{ background: "none", border: "none", color: "#A0A0A0", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 16, display: "flex", alignItems: "center", gap: 4 }}>
                  ← Back
                </button>

                {error && (
                  <div style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 20, background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.2)", color: "#FF4757", fontSize: 13, fontWeight: 500 }}>{error}</div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: "#A0A0A0", display: "block", marginBottom: 6 }}>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(200,255,0,0.1)", background: "#1D1D1D", color: "#FFFFFF", fontSize: 14, outline: "none" }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, color: "#A0A0A0", display: "block", marginBottom: 6 }}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(200,255,0,0.1)", background: "#1D1D1D", color: "#FFFFFF", fontSize: 14, outline: "none" }} />
                </div>

                <button type="submit" disabled={busy} style={{
                  width: "100%", padding: "14px", borderRadius: 14, fontSize: 14, fontWeight: 700,
                  background: "#C8FF00", color: "#0B0B0B", border: "none", cursor: busy ? "not-allowed" : "pointer",
                  opacity: busy ? 0.6 : 1, fontFamily: "'Inter', sans-serif",
                }}>
                  {busy ? "Signing in..." : "Sign In"}
                </button>
              </form>
            )}

            {mode === MODES.SIGNUP && (
              <form onSubmit={handleSignUp}>
                <button type="button" onClick={() => setMode(MODES.SELECT)} style={{ background: "none", border: "none", color: "#A0A0A0", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 16, display: "flex", alignItems: "center", gap: 4 }}>
                  ← Back
                </button>

                {error && (
                  <div style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 20, background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.2)", color: "#FF4757", fontSize: 13, fontWeight: 500 }}>{error}</div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: "#A0A0A0", display: "block", marginBottom: 6 }}>Full name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(200,255,0,0.1)", background: "#1D1D1D", color: "#FFFFFF", fontSize: 14, outline: "none" }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: "#A0A0A0", display: "block", marginBottom: 6 }}>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(200,255,0,0.1)", background: "#1D1D1D", color: "#FFFFFF", fontSize: 14, outline: "none" }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, color: "#A0A0A0", display: "block", marginBottom: 6 }}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(200,255,0,0.1)", background: "#1D1D1D", color: "#FFFFFF", fontSize: 14, outline: "none" }} />
                </div>

                <button type="submit" disabled={busy} style={{
                  width: "100%", padding: "14px", borderRadius: 14, fontSize: 14, fontWeight: 700,
                  background: "#C8FF00", color: "#0B0B0B", border: "none", cursor: busy ? "not-allowed" : "pointer",
                  opacity: busy ? 0.6 : 1, fontFamily: "'Inter', sans-serif",
                }}>
                  {busy ? "Creating account..." : "Create Account"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
