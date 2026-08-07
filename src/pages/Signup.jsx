import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { signUpWithEmail, signInWithGoogle, setDisplayName, getFriendlyError } from "../firebase/auth";
import { createUserDocument } from "../services/profileService";
import AuthShell, { GoogleIcon } from "../components/AuthShell";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (!acceptTerms) { setError("You must accept the terms and conditions."); return; }

    setLoading(true);
    try {
      const result = await signUpWithEmail(email.trim(), password);
      await setDisplayName(name.trim());
      await createUserDocument(result.user.uid, {
        name: name.trim(),
        email: email.trim(),
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      kicker="Start Training Smarter"
      headline={<>Start your <span className="neon">fitness journey</span> today</>}
      subtitle="Join thousands of athletes using AI to optimize their training, nutrition, and recovery."
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div className="auth-logo"><UserPlus size={24} /></div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>Create your account</h2>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>Start training smarter in seconds</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSignup}>
        <div className="onb-input-wrap">
          <span className="onb-icon"><User size={16} /></span>
          <input type="text" placeholder=" " value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          <label className="onb-float">Full name</label>
        </div>

        <div className="onb-input-wrap">
          <span className="onb-icon"><Mail size={16} /></span>
          <input type="email" placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <label className="onb-float">Email address</label>
        </div>

        <div className="onb-input-wrap" style={{ position: "relative" }}>
          <span className="onb-icon"><Lock size={16} /></span>
          <input type={showPassword ? "text" : "password"} placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          <label className="onb-float">Password</label>
          <button
            type="button" className="onb-eye-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="onb-input-wrap" style={{ position: "relative" }}>
          <span className="onb-icon"><Lock size={16} /></span>
          <input type={showPassword ? "text" : "password"} placeholder=" " value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
          <label className="onb-float">Confirm password</label>
        </div>

        <label style={{
          display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 18,
          cursor: "pointer", fontSize: 13, color: "var(--muted)", lineHeight: 1.5,
        }}>
          <input
            type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: "var(--accent)", marginTop: 2, flexShrink: 0 }}
          />
          <span>I agree to the <span style={{ color: "var(--accent)" }}>Terms of Service</span> and <span style={{ color: "var(--accent)" }}>Privacy Policy</span></span>
        </label>

        <button type="submit" className="onb-grad-btn" disabled={loading} style={{ marginBottom: 16 }}>
          {loading ? (
            <span className="btn-loading"><Loader2 size={17} className="spin" /> Creating account...</span>
          ) : "Create Account"}
        </button>
      </form>

      <div className="auth-divider"><span>or</span></div>

      <button onClick={handleGoogleSignup} disabled={loading} className="btn-google">
        <GoogleIcon /> Continue with Google
      </button>

      <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--muted)" }}>
        Already have an account?{" "}
        <Link to="/login" className="rd-link-btn">Sign in</Link>
      </p>
      <p style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: "var(--muted)" }}>
        Or <Link to="/dashboard" style={{ color: "var(--text)", fontWeight: 600, textDecoration: "none" }}>continue as Guest</Link> — no sign-up needed
      </p>
    </AuthShell>
  );
}
