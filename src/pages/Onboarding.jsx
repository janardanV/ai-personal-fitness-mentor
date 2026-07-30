import { useState } from "react";
import React from "react";
import { fmt, ACTIVITY_MULTIPLIERS, GOAL_LABELS, useAICoach } from "../utils/helpers";

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", age: 25, gender: "male", height: 175, weight: 75, bodyFat: 15,
    activity: "moderate", experience: "intermediate", goal: "muscle"
  });
  const { ask, loading } = useAICoach();

  const steps = [
    { label: "Personal", icon: "01", fields: ["name", "age", "gender"] },
    { label: "Body Metrics", icon: "02", fields: ["height", "weight", "bodyFat"] },
    { label: "Goals", icon: "03", fields: ["activity", "experience", "goal"] },
  ];

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleFinish = async () => {
    if (!form.name.trim()) { alert("Please enter your name."); return; }
    if (form.age < 10 || form.age > 120) { alert("Please enter a valid age (10-120)."); return; }
    if (form.height < 50 || form.height > 300) { alert("Please enter a valid height (50-300 cm)."); return; }
    if (form.weight < 20 || form.weight > 500) { alert("Please enter a valid weight (20-500 kg)."); return; }
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

  const stepIcons = ["👤", "💪", "🎯"];
  const goalIcons = {
    muscle: "💪", fat_loss: "🔥", strength: "🏋️", endurance: "🏃",
    powerlifting: "⚡", bodybuilding: "💎", general: "✨"
  };

  return (
    <div className="onb-split" style={{ minHeight: "100vh", display: "flex", position: "relative", overflow: "hidden" }}>
      <div className="onb-hero" style={{
        flex: "1 1 50%", maxWidth: "50%", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px 64px", position: "relative",
        background: "linear-gradient(135deg, #0B0B0B 0%, #111111 40%, #151515 100%)",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.5,
          background: "radial-gradient(ellipse at 20% 50%, rgba(200,255,0,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(165,230,0,0.04) 0%, transparent 50%)",
          animation: "gradientShift 12s ease infinite", backgroundSize: "200% 200%",
        }} />
        <div style={{
          position: "absolute", top: "10%", left: "8%", width: 200, height: 200,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(200,255,0,0.05) 0%, transparent 70%)",
          filter: "blur(40px)", animation: "float 8s ease-in-out infinite", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "10%", width: 160, height: 160,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(165,230,0,0.04) 0%, transparent 70%)",
          filter: "blur(35px)", animation: "float2 10s ease-in-out infinite", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "60%", left: "50%", width: 120, height: 120,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(200,255,0,0.03) 0%, transparent 70%)",
          filter: "blur(30px)", animation: "float 12s ease-in-out infinite 2s", pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 1, animation: "fadeInLeft 0.8s ease both" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px",
            borderRadius: 100, background: "rgba(200,255,0,0.06)", border: "1px solid rgba(200,255,0,0.12)",
            marginBottom: 32, animation: "fadeIn 1s ease 0.3s both",
          }}>
            <span style={{ fontSize: 14 }}>⚡</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#C8FF00", letterSpacing: "0.05em", textTransform: "uppercase" }}>AI-Powered Fitness</span>
          </div>
          <h1 style={{
            fontSize: 44, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em",
            marginBottom: 20, color: "#FFFFFF",
          }}>
            Welcome to{" "}
            <span style={{
              background: "linear-gradient(135deg, #C8FF00 0%, #A5E600 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>AI Fitness</span>{" "}
            <span style={{
              background: "linear-gradient(135deg, #A5E600 0%, #C8FF00 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Mentor</span>
          </h1>
          <p className="onb-subtitle" style={{
            fontSize: 17, color: "rgba(160,160,160,0.7)", lineHeight: 1.6,
            marginBottom: 48, maxWidth: 440, fontWeight: 400,
          }}>
            Train smarter. Eat better. Recover faster.
          </p>
          <div className="feat-grid" style={{
            display: "grid", gridTemplateColumns: "1fr", gap: 12, animation: "fadeInUp 0.8s ease 0.5s both",
          }}>
            {[
              { icon: "🏋️", title: "Smart Workout Tracking", desc: "Generate adaptive workouts and monitor strength progression.", color: "#C8FF00" },
              { icon: "🥗", title: "AI Nutrition Coach", desc: "Track calories and macros with intelligent recommendations.", color: "#A5E600" },
              { icon: "📈", title: "Progress Analytics", desc: "Visualize your fitness journey with interactive insights.", color: "#C8FF00" },
            ].map((f, i) => (
              <div className="onb-feature-card" key={i} style={{ animation: `fadeInUp 0.6s ease ${0.6 + i * 0.1}s both` }}>
                <div className="feat-icon" style={{ background: `${f.color}10` }}>
                  <span>{f.icon}</span>
                </div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="onb-card-side" style={{
        flex: "1 1 50%", maxWidth: "50%", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "48px 40px", position: "relative",
        background: "linear-gradient(180deg, #0B0B0B 0%, #111111 100%)",
      }}>
        <div style={{ width: "100%", maxWidth: 460, animation: "fadeInRight 0.8s ease 0.2s both" }}>
          <div style={{ textAlign: "center", marginBottom: 36, animation: "fadeIn 0.6s ease 0.4s both" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
              background: "rgba(200,255,0,0.1)",
              border: "1px solid rgba(200,255,0,0.2)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 24,
              animation: "glowPulse 3s ease infinite",
            }}>⚡</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF", marginBottom: 6 }}>Let's set up your profile</h2>
            <p style={{ fontSize: 14, color: "rgba(160,160,160,0.6)" }}>Takes about 30 seconds</p>
          </div>
          <div style={{
            display: "flex", gap: 8, marginBottom: 32, justifyContent: "center",
            animation: "fadeIn 0.6s ease 0.5s both",
          }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 36, height: 36, borderRadius: 10, fontSize: 12, fontWeight: 700,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  ...(i < step ? { background: "#C8FF00", color: "#0B0B0B", animation: "stepComplete 0.4s ease" }
                  : i === step ? { background: "rgba(200,255,0,0.1)", color: "#C8FF00", border: "1.5px solid rgba(200,255,0,0.35)", boxShadow: "0 0 20px rgba(200,255,0,0.1)" }
                  : { background: "rgba(255,255,255,0.03)", color: "rgba(160,160,160,0.35)", border: "1.5px solid rgba(255,255,255,0.04)" }),
                }}>
                  {i < step ? "✓" : s.icon}
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    width: 32, height: 2, borderRadius: 1,
                    background: i < step ? "#C8FF00" : "rgba(255,255,255,0.04)",
                    transition: "background 0.4s ease",
                  }} />
                )}
              </div>
            ))}
          </div>
          <div style={{
            background: "#151515", border: "1px solid rgba(200,255,0,0.08)",
            borderRadius: 20, padding: "32px 28px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            animation: "scaleIn 0.5s ease 0.6s both",
          }}>
            <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 18,
                background: "rgba(200,255,0,0.08)", border: "1px solid rgba(200,255,0,0.12)",
              }}>
                {stepIcons[step]}
              </div>
              <div>
                <div style={{ fontSize: 11, color: "rgba(160,160,160,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>Step {step + 1} of {steps.length}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>{steps[step].label}</div>
              </div>
            </div>

            {step === 0 && (
              <div style={{ animation: "fadeInUp 0.4s ease both" }}>
                <div className="onb-input-wrap">
                  <span className="onb-icon">👤</span>
                  <input value={form.name} onChange={e => set("name", e.target.value)} placeholder=" " aria-label="First Name" tabIndex={0} />
                  <label className="onb-float">First Name</label>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="onb-input-wrap">
                    <span className="onb-icon">📅</span>
                    <input type="number" value={form.age} onChange={e => set("age", +e.target.value)} min={13} max={100} placeholder=" " aria-label="Age" tabIndex={0} />
                    <label className="onb-float">Age</label>
                  </div>
                  <div className="onb-input-wrap">
                    <span className="onb-icon">⚧</span>
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
                  {[["height", "Height", "📏", "cm"], ["weight", "Weight", "⚖️", "kg"], ["bodyFat", "Body Fat", "📊", "%"]].map(([k, label, icon, unit]) => (
                    <div className="onb-input-wrap" key={k}>
                      <span className="onb-icon">{icon}</span>
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
                  <span className="onb-icon">🏃</span>
                  <select value={form.activity} onChange={e => set("activity", e.target.value)} aria-label="Activity Level" tabIndex={0}>
                    {[["sedentary", "Sedentary (desk job)"], ["light", "Lightly Active (1-3x/wk)"], ["moderate", "Moderately Active (3-5x/wk)"], ["active", "Very Active (6-7x/wk)"], ["very_active", "Extremely Active (2x/day)"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <label className="onb-float">Activity Level</label>
                </div>
                <div className="onb-input-wrap">
                  <span className="onb-icon">🏋️</span>
                  <select value={form.experience} onChange={e => set("experience", e.target.value)} aria-label="Training Experience" tabIndex={0}>
                    {[["beginner", "Beginner (< 1 year)"], ["intermediate", "Intermediate (1-3 years)"], ["advanced", "Advanced (3-5 years)"], ["elite", "Elite (5+ years)"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <label className="onb-float">Training Experience</label>
                </div>
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 13, color: "rgba(160,160,160,0.55)", marginBottom: 12, fontWeight: 500 }}>Primary Goal</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {Object.entries(GOAL_LABELS).map(([v, l]) => (
                      <button key={v} className={`onb-goal-btn ${form.goal === v ? "selected" : ""}`} onClick={() => set("goal", v)} aria-label={l} aria-pressed={form.goal === v} tabIndex={0}>
                        <span className="goal-check">{form.goal === v && <span style={{ fontSize: 10, color: "#0B0B0B" }}>✓</span>}</span>
                        <span style={{ fontSize: 16 }}>{goalIcons[v]}</span>
                        <span>{l}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, gap: 12, alignItems: "center" }}>
              {step > 0 ? (
                <button className="onb-back-btn" onClick={() => setStep(p => p - 1)} tabIndex={0} aria-label="Go back">← Back</button>
              ) : <div />}
              {step < steps.length - 1 ? (
                <button className="onb-grad-btn" style={{ width: "auto", padding: "14px 36px" }} onClick={() => setStep(p => p + 1)} tabIndex={0} aria-label="Continue to next step">Continue →</button>
              ) : (
                <button className="onb-grad-btn" style={{ width: "auto", padding: "14px 36px" }} onClick={handleFinish} disabled={loading} tabIndex={0} aria-label="Start your fitness journey">
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                      <span style={{ width: 18, height: 18, border: "2.5px solid rgba(11,11,11,0.3)", borderTopColor: "#0B0B0B", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Generating your plan…
                    </span>
                  ) : "Start Your Journey ⚡"}
                </button>
              )}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 28, animation: "fadeIn 0.6s ease 1s both" }}>
            <p style={{ fontSize: 12, color: "rgba(160,160,160,0.3)" }}>Your data is stored locally on this device</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
