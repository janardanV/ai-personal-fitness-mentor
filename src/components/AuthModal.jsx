import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithEmail, signInWithGoogle, signUpWithEmail, getFriendlyError } from "../firebase/auth";
import { createUserDocument } from "../services/profileService";
import { ChevronLeft, Eye, EyeOff, Lock, LogIn, Mail, Sparkles, User, UserPlus, X } from "lucide-react";

const MODES = { SELECT: 0, EMAIL: 1, SIGNUP: 2 };

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function AuthModal({ open, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState(MODES.SELECT);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const reset = () => { setMode(MODES.SELECT); setEmail(""); setPassword(""); setName(""); setError(""); setBusy(false); setShowPassword(false); };

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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="rd-modal-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ zIndex: 10000 }}
          onClick={handleClose}
        >
          <motion.div
            className="rd-modal"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 400, background: "#131313", borderRadius: 18 }}
          >
            <button className="rd-modal-close" onClick={handleClose}><X size={16} /></button>

            <div style={{
              width: 52, height: 52, borderRadius: 16, margin: "0 auto 16px",
              background: "rgba(200,255,0,0.1)", border: "1px solid rgba(200,255,0,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#C8FF00",
            }}>
              <Sparkles size={24} />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF", textAlign: "center", marginBottom: 6 }}>
              Sign in to save your progress
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textAlign: "center", marginBottom: 24, lineHeight: 1.5 }}>
              Your data will be securely saved to the cloud and synced across all your devices.
            </p>

            {mode === MODES.SELECT && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={handleGoogle} disabled={busy} className="rd-btn-secondary" style={{ opacity: busy ? 0.6 : 1 }}>
                  <GoogleIcon /> Continue with Google
                </button>

                <div className="rd-tabbar" style={{ padding: 3, borderRadius: 12 }}>
                  <button className="rd-tab" style={{ flex: 1, justifyContent: "center" }} onClick={() => { setMode(MODES.EMAIL); setError(""); }}>
                    <Mail size={15} /> Sign In
                  </button>
                  <button className="rd-tab" style={{ flex: 1, justifyContent: "center" }} onClick={() => { setMode(MODES.SIGNUP); setError(""); }}>
                    <UserPlus size={15} /> Create Account
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>or</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                </div>

                <button
                  onClick={handleClose}
                  style={{
                    background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", padding: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    transition: "color 0.15s", fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#FFFFFF"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                >
                  <LogIn size={14} /> Continue as Guest
                </button>
              </div>
            )}

            {mode === MODES.EMAIL && (
              <form onSubmit={handleEmailLogin}>
                <button type="button" onClick={() => setMode(MODES.SELECT)} className="rd-mini-btn" style={{ marginBottom: 16 }}>
                  <ChevronLeft size={14} /> Back
                </button>

                {error && (
                  <div style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 20, background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.2)", color: "#FF4757", fontSize: 13, fontWeight: 500 }}>{error}</div>
                )}

                <div className="rd-field" style={{ marginBottom: 16 }}>
                  <label>Email address</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", pointerEvents: "none" }} />
                    <input className="rd-input" style={{ paddingLeft: 40 }} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                  </div>
                </div>
                <div className="rd-field" style={{ marginBottom: 20 }}>
                  <label>Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", pointerEvents: "none" }} />
                    <input className="rd-input" style={{ paddingLeft: 40, paddingRight: 42 }} type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" />
                    <button type="button" className="rd-iconbtn" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={busy} className="rd-btn-primary" style={{ width: "100%", padding: "14px", opacity: busy ? 0.6 : 1 }}>
                  {busy ? "Signing in..." : "Sign In"}
                </button>
              </form>
            )}

            {mode === MODES.SIGNUP && (
              <form onSubmit={handleSignUp}>
                <button type="button" onClick={() => setMode(MODES.SELECT)} className="rd-mini-btn" style={{ marginBottom: 16 }}>
                  <ChevronLeft size={14} /> Back
                </button>

                {error && (
                  <div style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 20, background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.2)", color: "#FF4757", fontSize: 13, fontWeight: 500 }}>{error}</div>
                )}

                <div className="rd-field" style={{ marginBottom: 16 }}>
                  <label>Full name</label>
                  <div style={{ position: "relative" }}>
                    <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", pointerEvents: "none" }} />
                    <input className="rd-input" style={{ paddingLeft: 40 }} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
                  </div>
                </div>
                <div className="rd-field" style={{ marginBottom: 16 }}>
                  <label>Email address</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", pointerEvents: "none" }} />
                    <input className="rd-input" style={{ paddingLeft: 40 }} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                  </div>
                </div>
                <div className="rd-field" style={{ marginBottom: 20 }}>
                  <label>Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", pointerEvents: "none" }} />
                    <input className="rd-input" style={{ paddingLeft: 40, paddingRight: 42 }} type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password" />
                    <button type="button" className="rd-iconbtn" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={busy} className="rd-btn-primary" style={{ width: "100%", padding: "14px", opacity: busy ? 0.6 : 1 }}>
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
