import { useState } from "react";
import {
  User, Weight, Target, CalendarDays, Users, Ruler, Percent, Activity, TrendingUp,
  Dumbbell, Flame, Zap, Timer, Award, Sparkles, ArrowLeft, ArrowRight, Check, Loader2,
} from "lucide-react";
import { fmt, ACTIVITY_MULTIPLIERS, GOAL_LABELS, useAICoach } from "../utils/helpers";
import AuthShell from "../components/AuthShell";

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", age: 25, gender: "male", height: 175, weight: 75, bodyFat: 15,
    activity: "moderate", experience: "intermediate", goal: "muscle"
  });
  const { ask, loading } = useAICoach();

  const steps = [
    { label: "Personal", icon: User, fields: ["name", "age", "gender"] },
    { label: "Body Metrics", icon: Weight, fields: ["height", "weight", "bodyFat"] },
    { label: "Goals", icon: Target, fields: ["activity", "experience", "goal"] },
  ];

  const goalIcons = {
    muscle: Dumbbell, fat_loss: Flame, strength: Zap, endurance: Timer,
    powerlifting: Award, bodybuilding: Sparkles, general: Target,
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validateStep = (s) => {
    setError("");
    if (s === 0 && !form.name.trim()) { setError("Please enter your name."); return false; }
    if (s === 0 && (form.age < 10 || form.age > 120)) { setError("Please enter a valid age (10-120)."); return false; }
    if (s === 1 && (form.height < 50 || form.height > 300)) { setError("Please enter a valid height (50-300 cm)."); return false; }
    if (s === 1 && (form.weight < 20 || form.weight > 500)) { setError("Please enter a valid weight (20-500 kg)."); return false; }
    return true;
  };

  const next = () => { if (validateStep(step)) setStep(p => p + 1); };
  const back = () => { setError(""); setStep(p => p - 1); };

  const handleFinish = async () => {
    if (!validateStep(step)) return;
    const bmi = form.weight / ((form.height / 100) ** 2);
    const mult = ACTIVITY_MULTIPLIERS[form.activity] || 1.55;
    const tdee = form.gender === "male"
      ? (10 * form.weight + 6.25 * form.height - 5 * form.age + 5) * mult
      : (10 * form.weight + 6.25 * form.height - 5 * form.age - 161) * mult;
    const protein = Math.round(form.weight * 2.2);
    const calories = form.goal === "fat_loss" ? Math.round(tdee - 400) : form.goal === "muscle" ? Math.round(tdee + 200) : Math.round(tdee);
    const program = await ask(
      "You are an elite personal trainer. Respond in JSON only. No markdown, no explanation. Just the JSON object.",
      `Create a weekly workout program for this person: Goal: ${form.goal}, Experience: ${form.experience}, Weight: ${form.weight}kg. Return JSON: { "split": string, "days": [{ "name": string, "focus": string, "exercises": [{ "name": string, "sets": number, "reps": string, "notes": string }] }] }`
    );
    let parsedProgram = null;
    if (program) {
      try {
        const clean = program.replace(/```json|```/g, "").trim();
        parsedProgram = JSON.parse(clean);
      } catch { parsedProgram = null; }
    }
    onComplete({ ...form, bmi: fmt(bmi, 1), tdee: Math.round(tdee), protein, calories, currentProgram: parsedProgram });
  };

  return (
    <AuthShell
      kicker="AI-Powered Fitness"
      headline={<>Welcome to <span className="neon">AI Fitness</span> Mentor</>}
      subtitle="Train smarter. Eat better. Recover faster."
      maxWidth={460}
    >
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="auth-logo"><Sparkles size={24} /></div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>Let&apos;s set up your profile</h2>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>Takes about 30 seconds</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 26, justifyContent: "center" }}>
        {steps.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 36, height: 36, borderRadius: 10, fontSize: 12, fontWeight: 700,
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                ...(done ? { background: "var(--accent)", color: "#0B0F14", animation: "stepComplete 0.4s ease" }
                : current ? { background: "var(--accent-soft)", color: "var(--accent)", border: "1.5px solid var(--accent-line)", boxShadow: "0 0 20px rgba(200,255,50,0.1)" }
                : { background: "rgba(255,255,255,0.03)", color: "var(--faint)", border: "1.5px solid rgba(255,255,255,0.05)" }),
              }}>
                {done ? <Check size={16} strokeWidth={2.6} /> : <s.icon size={16} />}
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  width: 32, height: 2, borderRadius: 1,
                  background: i < step ? "var(--accent)" : "rgba(255,255,255,0.05)",
                  transition: "background 0.4s ease",
                }} />
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        background: "var(--surface-2)", border: "1px solid var(--line)",
        borderRadius: 20, padding: "30px 26px",
        boxShadow: "var(--shadow-card)",
        animation: "scaleIn 0.5s ease 0.15s both",
      }}>
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <div className="feat-icon onb-feature-icon" style={{ width: 40, height: 40 }}>
            {(() => { const Icon = steps[step].icon; return <Icon size={18} />; })()}
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>Step {step + 1} of {steps.length}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginTop: 2 }}>{steps[step].label}</div>
          </div>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: 16, padding: "10px 14px", fontSize: 12 }}>{error}</div>}

        {step === 0 && (
          <div style={{ animation: "fadeInUp 0.4s ease both" }}>
            <div className="onb-input-wrap">
              <span className="onb-icon"><User size={16} /></span>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder=" " aria-label="First Name" tabIndex={0} />
              <label className="onb-float">First Name</label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="onb-input-wrap">
                <span className="onb-icon"><CalendarDays size={16} /></span>
                <input type="number" value={form.age} onChange={e => set("age", +e.target.value)} min={13} max={100} placeholder=" " aria-label="Age" tabIndex={0} />
                <label className="onb-float">Age</label>
              </div>
              <div className="onb-input-wrap">
                <span className="onb-icon"><Users size={16} /></span>
                <select value={form.gender} onChange={e => set("gender", e.target.value)} aria-label="Gender" tabIndex={0}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <label className="onb-float">Gender</label>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ animation: "fadeInUp 0.4s ease both" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[["height", "Height", Ruler, "cm"], ["weight", "Weight", Weight, "kg"], ["bodyFat", "Body Fat", Percent, "%"]].map(([k, label, Icon, unit]) => (
                <div className="onb-input-wrap" key={k}>
                  <span className="onb-icon"><Icon size={16} /></span>
                  <input type="number" value={form[k]} onChange={e => set(k, +e.target.value)} min={k === "height" ? 100 : k === "weight" ? 30 : 3} max={k === "height" ? 250 : k === "weight" ? 300 : 60} placeholder=" " aria-label={label} tabIndex={0} />
                  <label className="onb-float">{label} ({unit})</label>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: "fadeInUp 0.4s ease both" }}>
            <div className="onb-input-wrap">
              <span className="onb-icon"><Activity size={16} /></span>
              <select value={form.activity} onChange={e => set("activity", e.target.value)} aria-label="Activity Level" tabIndex={0}>
                {[["sedentary", "Sedentary (desk job)"], ["light", "Lightly Active (1-3x/wk)"], ["moderate", "Moderately Active (3-5x/wk)"], ["active", "Very Active (6-7x/wk)"], ["very_active", "Extremely Active (2x/day)"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <label className="onb-float">Activity Level</label>
            </div>
            <div className="onb-input-wrap">
              <span className="onb-icon"><TrendingUp size={16} /></span>
              <select value={form.experience} onChange={e => set("experience", e.target.value)} aria-label="Training Experience" tabIndex={0}>
                {[["beginner", "Beginner (< 1 year)"], ["intermediate", "Intermediate (1-3 years)"], ["advanced", "Advanced (3-5 years)"], ["elite", "Elite (5+ years)"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <label className="onb-float">Training Experience</label>
            </div>
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12, fontWeight: 500 }}>Primary Goal</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {Object.entries(GOAL_LABELS).map(([v, l]) => {
                  const Icon = goalIcons[v];
                  return (
                    <button key={v} className={`onb-goal-btn ${form.goal === v ? "selected" : ""}`} onClick={() => set("goal", v)} aria-label={l} aria-pressed={form.goal === v} tabIndex={0}>
                      <span className="goal-check">{form.goal === v && <Check size={12} strokeWidth={3} />}</span>
                      <Icon size={16} style={{ flexShrink: 0 }} />
                      <span>{l}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, gap: 12, alignItems: "center" }}>
          {step > 0 ? (
            <button className="onb-back-btn" onClick={back} tabIndex={0} aria-label="Go back">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><ArrowLeft size={15} /> Back</span>
            </button>
          ) : <div />}
          {step < steps.length - 1 ? (
            <button className="onb-grad-btn" style={{ width: "auto", padding: "14px 32px" }} onClick={next} tabIndex={0} aria-label="Continue to next step">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>Continue <ArrowRight size={16} /></span>
            </button>
          ) : (
            <button className="onb-grad-btn" style={{ width: "auto", padding: "14px 32px" }} onClick={handleFinish} disabled={loading} tabIndex={0} aria-label="Start your fitness journey">
              {loading ? (
                <span className="btn-loading"><Loader2 size={17} className="spin" /> Generating your plan...</span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>Start Your Journey <Sparkles size={16} /></span>
              )}
            </button>
          )}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 26 }}>
        <p style={{ fontSize: 12, color: "var(--faint)" }}>Your data is stored securely and privately</p>
      </div>
    </AuthShell>
  );
};

export default Onboarding;
