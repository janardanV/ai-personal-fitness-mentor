import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, KeyRound, MailCheck, ArrowLeft } from "lucide-react";
import { resetPassword, getFriendlyError } from "../firebase/auth";
import AuthShell from "../components/AuthShell";

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
    <AuthShell
      kicker="Account Recovery"
      headline={<>Reset your <span className="neon">password</span></>}
      subtitle="We'll send you a secure link to reset your password. Check your inbox in a few minutes."
    >
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="auth-logo"><KeyRound size={24} /></div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>Forgot your password?</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
          Enter your email address and we&apos;ll send you a link to reset it.
        </p>
      </div>

      {success ? (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div className="auth-success">
            <div className="auth-logo" style={{ width: 48, height: 48, marginBottom: 12 }}><MailCheck size={22} /></div>
            <p style={{ fontSize: 14, color: "var(--green)", fontWeight: 700, marginBottom: 4 }}>Check your email</p>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
              We sent a password reset link to <strong style={{ color: "var(--text)" }}>{email}</strong>.
              Check your inbox and follow the instructions.
            </p>
          </div>

          <button
            onClick={() => { setSuccess(false); setEmail(""); }}
            className="onb-grad-btn" style={{ marginBottom: 16 }}
          >
            Send another email
          </button>

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--muted)" }}>
            <Link to="/login" className="rd-link-btn">Back to Sign In</Link>
          </p>
        </div>
      ) : (
        <>
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="onb-input-wrap">
              <span className="onb-icon"><Mail size={16} /></span>
              <input type="email" placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <label className="onb-float">Email address</label>
            </div>

            <button type="submit" className="onb-grad-btn" disabled={loading} style={{ marginBottom: 16 }}>
              {loading ? (
                <span className="btn-loading"><Loader2 size={17} className="spin" /> Sending reset link...</span>
              ) : "Send Reset Link"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--muted)" }}>
            Remember your password?{" "}
            <Link to="/login" className="rd-link-btn">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><ArrowLeft size={13} /> Back to Sign In</span>
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
