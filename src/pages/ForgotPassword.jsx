import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword, getFriendlyError } from "../firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0B0B0F 0%, #111115 40%, #151519 100%)",
      padding: 20, position: "relative", overflow: "hidden",
    }}>
      {/* Background decorations */}
      <div style={{
        position: "absolute", top: "10%", left: "15%", width: 300, height: 300,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "15%", width: 250, height: 250,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)",
        filter: "blur(50px)", pointerEvents: "none",
      }} />

      <div className="glass" style={{
        width: "100%", maxWidth: 440, padding: "40px 36px", position: "relative",
        zIndex: 1, animation: "scaleIn 0.4s ease",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
            }}></div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF", marginBottom: 8 }}>Reset your password</h2>
          <p style={{ fontSize: 14, color: "rgba(160,160,160,0.6)", lineHeight: 1.6 }}>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{
              padding: "16px", borderRadius: 12, marginBottom: 24,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}></div>
              <p style={{ fontSize: 14, color: "#22C55E", fontWeight: 600, marginBottom: 4 }}>Check your email</p>
              <p style={{ fontSize: 13, color: "rgba(160,160,160,0.7)", lineHeight: 1.5 }}>
                We sent a password reset link to <strong style={{ color: "#FFFFFF" }}>{email}</strong>.
                Check your inbox and follow the instructions.
              </p>
            </div>

            <button
              onClick={() => { setSuccess(false); setEmail(""); }}
              className="onb-grad-btn" style={{ marginBottom: 16 }}
            >
              Send another email
            </button>

            <p style={{ textAlign: "center", fontSize: 14, color: "rgba(160,160,160,0.6)" }}>
              <Link to="/login" style={{ color: "#22C55E", fontWeight: 600, textDecoration: "none" }}>Back to Sign In</Link>
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div style={{
                padding: "12px 16px", borderRadius: 12, marginBottom: 20,
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                color: "#EF4444", fontSize: 13, fontWeight: 500, animation: "fadeIn 0.2s ease",
              }}>{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="onb-input-wrap">
                <input type="email" placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <label className="onb-float">Email address</label>
              </div>

              <button type="submit" className="onb-grad-btn" disabled={loading} style={{ marginBottom: 16 }}>
                {loading ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⟳</span>
                    Sending reset link...
                  </span>
                ) : "Send Reset Link"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: 14, color: "rgba(160,160,160,0.6)" }}>
              Remember your password?{" "}
              <Link to="/login" style={{ color: "#22C55E", fontWeight: 600, textDecoration: "none" }}>Back to Sign In</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
