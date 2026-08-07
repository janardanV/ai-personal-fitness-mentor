import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { signInWithEmail, signInWithGoogle, getFriendlyError } from "../firebase/auth";
import { createUserDocument } from "../services/profileService";
import AuthShell, { GoogleIcon } from "../components/AuthShell";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      await createUserDocument(user.uid, {
        name: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
      });
      navigate("/", { replace: true });
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(getFriendlyError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      kicker="AI-Powered Fitness"
      headline={<>Welcome back to <span className="neon">AI Fitness</span></>}
      subtitle="Track workouts, optimize nutrition, and accelerate recovery with your AI-powered coach."
    >
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="auth-logo"><LogIn size={24} /></div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>Sign in to your account</h2>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>Enter your credentials to continue</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleEmailLogin}>
        <div className="onb-input-wrap">
          <span className="onb-icon"><Mail size={16} /></span>
          <input
            type="email" placeholder=" " value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <label className="onb-float">Email address</label>
        </div>

        <div className="onb-input-wrap" style={{ position: "relative" }}>
          <span className="onb-icon"><Lock size={16} /></span>
          <input
            type={showPassword ? "text" : "password"} placeholder=" " value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <label className="onb-float">Password</label>
          <button
            type="button" className="onb-eye-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div style={{ textAlign: "right", marginBottom: 20 }}>
          <Link to="/forgot-password" className="rd-link-btn">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="onb-grad-btn" disabled={loading} style={{ marginBottom: 16 }}>
          {loading ? (
            <span className="btn-loading"><Loader2 size={17} className="spin" /> Signing in...</span>
          ) : "Sign In"}
        </button>
      </form>

      <div className="auth-divider"><span>or</span></div>

      <button onClick={handleGoogleLogin} disabled={loading} className="btn-google">
        <GoogleIcon /> Continue with Google
      </button>

      <p style={{ textAlign: "center", marginTop: 28, fontSize: 14, color: "var(--muted)" }}>
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="rd-link-btn">Create account</Link>
      </p>
      <p style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: "var(--muted)" }}>
        Or <Link to="/dashboard" style={{ color: "var(--text)", fontWeight: 600, textDecoration: "none" }}>continue as Guest</Link> — no sign-up needed
      </p>
    </AuthShell>
  );
}
