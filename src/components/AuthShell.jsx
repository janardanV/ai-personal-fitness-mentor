import { Activity, Sparkles, Dumbbell, Utensils, BarChart3 } from "lucide-react";

export const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const FEATURES = [
  { icon: Dumbbell, title: "Smart Workout Tracking", desc: "Adaptive workouts that monitor your strength progression." },
  { icon: Utensils, title: "AI Nutrition Coach", desc: "Track calories and macros with intelligent recommendations." },
  { icon: BarChart3, title: "Progress Analytics", desc: "Visualize your fitness journey with interactive insights." },
];

const ORBS = [
  { top: "10%", left: "8%", size: 200, delay: "0s", dur: "8s" },
  { bottom: "15%", right: "10%", size: 160, delay: "0s", dur: "10s" },
  { top: "62%", left: "48%", size: 120, delay: "2s", dur: "12s" },
];

export default function AuthShell({ kicker = "AI-Powered Fitness", headline, subtitle, children, maxWidth = 420 }) {
  return (
    <div className="onb-split">
      <div className="onb-hero" style={{ flex: "1 1 50%", maxWidth: "50%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 64px" }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.5,
          background: "radial-gradient(ellipse at 20% 50%, rgba(200,255,50,0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(90,200,250,0.04) 0%, transparent 50%)",
          animation: "gradientShift 12s ease infinite", backgroundSize: "200% 200%",
        }} />
        {ORBS.map((o, i) => (
          <div key={i} style={{
            position: "absolute", width: o.size, height: o.size, borderRadius: "50%",
            background: i === 2
              ? "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(200,255,50,0.05) 0%, transparent 70%)",
            filter: "blur(40px)", animation: `float ${o.dur} ease-in-out infinite ${o.delay}`, pointerEvents: "none",
            ...(o.top ? { top: o.top } : {}), ...(o.left ? { left: o.left } : {}),
            ...(o.bottom ? { bottom: o.bottom } : {}), ...(o.right ? { right: o.right } : {}),
          }} />
        ))}

        <div style={{ position: "relative", zIndex: 1, animation: "fadeInLeft 0.7s ease both" }}>
          <div className="onb-brand">
            <div className="onb-brand-tile"><Activity size={22} strokeWidth={2.4} /></div>
            <div>
              <div className="onb-brand-name">AI Fitness</div>
              <div className="onb-brand-tag">Mentor</div>
            </div>
          </div>

          <div className="onb-kicker"><Sparkles size={14} />{kicker}</div>
          <h1 style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 18, color: "var(--text)" }}>
            {headline}
          </h1>
          <p className="onb-hero-sub">{subtitle}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, animation: "fadeInUp 0.7s ease 0.45s both" }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div className="onb-feature-card" key={i} style={{ animation: `fadeInUp 0.5s ease ${0.55 + i * 0.1}s both` }}>
                  <div className="feat-icon onb-feature-icon"><Icon size={18} /></div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="onb-card-side" style={{ flex: "1 1 50%", maxWidth: "50%", padding: "48px 40px" }}>
        <div style={{ width: "100%", maxWidth, animation: "fadeInRight 0.7s ease 0.15s both" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
