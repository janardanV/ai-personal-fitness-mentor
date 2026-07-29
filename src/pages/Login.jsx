import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmail, signInWithGoogle, getFriendlyError } from "../firebase/auth";
import { createUserDocument } from "../services/profileService";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

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
    <div className="onb-split" style={{ minHeight: "100vh", display: "flex", position: "relative", overflow: "hidden" }}>
      {/* Left: Hero */}
      <div className="onb-hero" style={{
        flex: "1 1 50%", maxWidth: "50%", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px 64px", position: "relative",
        background: "linear-gradient(135deg, #0B0B0F 0%, #111115 40%, #151519 100%)",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.5,
          background: "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.02) 0%, transparent 50%)",
          animation: "gradientShift 12s ease infinite", backgroundSize: "200% 200%",
        }} />
        <div style={{
          position: "absolute", top: "10%", left: "8%", width: 200, height: 200,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
          filter: "blur(40px)", animation: "float 8s ease-in-out infinite", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "10%", width: 160, height: 160,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)",
          filter: "blur(35px)", animation: "float2 10s ease-in-out infinite", pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 1, animation: "fadeInLeft 0.8s ease both" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px",
            borderRadius: 100, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: 32,
          }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#22C55E", letterSpacing: "0.05em", textTransform: "uppercase" }}>AI-Powered Fitness</span>
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 20, color: "#FFFFFF" }}>
            Welcome back to{" "}
            <span style={{ background: "linear-gradient(135deg, #22C55E 0%, #22C55E 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Fitness</span>{" "}
            <span style={{ background: "linear-gradient(135deg, #22C55E 0%, #22C55E 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Mentor</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(160,160,160,0.7)", lineHeight: 1.6, marginBottom: 48, maxWidth: 440, fontWeight: 400 }}>
            Track workouts, optimize nutrition, and accelerate recovery with your AI-powered coach.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, animation: "fadeInUp 0.8s ease 0.5s both" }}>
            {[
              { icon: "", title: "Smart Workout Tracking", desc: "Generate adaptive workouts and monitor strength progression.", color: "#22C55E" },
              { icon: "", title: "AI Nutrition Coach", desc: "Track calories and macros with intelligent recommendations.", color: "#22C55E" },
              { icon: "", title: "Progress Analytics", desc: "Visualize your fitness journey with interactive insights.", color: "#22C55E" },
            ].map((f, i) => (
              <div className="onb-feature-card" key={i} style={{ animation: `fadeInUp 0.6s ease ${0.6 + i * 0.1}s both` }}>
                <div className="feat-icon" style={{ background: `${f.color}10` }}><span>{f.icon}</span></div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="onb-card-side" style={{
        flex: "1 1 50%", maxWidth: "50%", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "48px 40px", position: "relative",
        background: "linear-gradient(180deg, #0B0B0F 0%, #111115 100%)",
      }}>
        <div style={{ width: "100%", maxWidth: 420, animation: "fadeInRight 0.8s ease 0.2s both" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
            }}></div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF", marginBottom: 6 }}>Sign in to your account</h2>
            <p style={{ fontSize: 14, color: "rgba(160,160,160,0.6)" }}>Enter your credentials to continue</p>
          </div>

          {error && (
            <div style={{
              padding: "12px 16px", borderRadius: 12, marginBottom: 20,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#EF4444", fontSize: 13, fontWeight: 500, animation: "fadeIn 0.2s ease",
            }}>{error}</div>
          )}

          <form onSubmit={handleEmailLogin}>
            <div className="onb-input-wrap">
              <input
                type="email" placeholder=" " value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <label className="onb-float">Email address</label>
            </div>

            <div className="onb-input-wrap" style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"} placeholder=" " value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <label className="onb-float">Password</label>
              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "#A0A0A0", fontSize: 13, cursor: "pointer", zIndex: 2,
                  padding: "4px 8px",
                }}
              >{showPassword ? "Hide" : "Show"}</button>
            </div>

            <div style={{ textAlign: "right", marginBottom: 20 }}>
              <Link to="/forgot-password" style={{ color: "#22C55E", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit" className="onb-grad-btn" disabled={loading}
              style={{ marginBottom: 16 }}
            >
              {loading ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⟳</span>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize: 12, color: "rgba(160,160,160,0.4)", fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>

          <button
            onClick={handleGoogleLogin} disabled={loading}
            style={{
              width: "100%", padding: "14px 20px", borderRadius: 14, fontSize: 14, fontWeight: 600,
              background: "#1D1D1D", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF",
              cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif",
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "#252525"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#1D1D1D"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            <GoogleIcon /> Continue with Google
          </button>

          <p style={{ textAlign: "center", marginTop: 28, fontSize: 14, color: "rgba(160,160,160,0.6)" }}>
            Don&apos;t have an account?{" "}
            <Link to="/signup" style={{ color: "#22C55E", fontWeight: 600, textDecoration: "none" }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
