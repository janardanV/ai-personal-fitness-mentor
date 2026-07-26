import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";

// ── helpers ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "ai_fitness_mentor_v1";
const load = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; } };
const save = (d) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} };

const fmt = (n, dec = 0) => Number(n).toFixed(dec);
const today = () => new Date().toISOString().split("T")[0];
const weekAgo = () => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split("T")[0]; };

const EXERCISES = ["Squat", "Bench Press", "Deadlift", "Overhead Press", "Barbell Row", "Pull-Up", "Dip", "Lunge", "Leg Press", "Cable Row", "Lat Pulldown", "Bicep Curl", "Tricep Extension", "Lateral Raise", "Romanian Deadlift", "Hip Thrust", "Plank", "Face Pull", "Shrug", "Leg Curl"];
const GOAL_LABELS = { muscle: "Build Muscle", fat_loss: "Fat Loss", strength: "Strength", endurance: "Endurance", powerlifting: "Powerlifting", bodybuilding: "Bodybuilding", general: "General Fitness" };
const BADGE_DEFS = [
  { id: "first_workout", icon: "🏋️", label: "First Workout", desc: "Logged your first session" },
  { id: "week_streak", icon: "🔥", label: "7-Day Streak", desc: "7 consecutive active days" },
  { id: "ten_workouts", icon: "💪", label: "10 Workouts", desc: "Completed 10 workouts" },
  { id: "hundred_workouts", icon: "🏆", label: "100 Workouts", desc: "Century club" },
  { id: "volume_1000", icon: "⚡", label: "1000kg Volume", desc: "1000kg in a single session" },
  { id: "nutrition_week", icon: "🥗", label: "Nutrition Week", desc: "7 days of nutrition tracking" },
];

const COLORS = { primary: "#6C63FF", cyan: "#00D4FF", green: "#00E5A0", amber: "#FFB800", red: "#FF4757", surface: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.08)" };

// ── Initial state factory ──────────────────────────────────────────────────
const mkInitial = () => ({
  profile: null, // null = not onboarded
  workouts: [],
  nutrition: [],
  recovery: [],
  bodyWeight: [],
  badges: [],
  xp: 0,
  level: 1,
  currentProgram: null,
  aiHistory: [],
});

// ── Coaching logic (local, no AI call needed for calculations) ─────────────
const calcE1RM = (w, r) => r === 1 ? w : w * (1 + r / 30);
const calcVolume = (sets) => sets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);
const calcWeeklyVolume = (workouts) => {
  const wa = weekAgo();
  return workouts.filter(w => w.date >= wa).reduce((sum, w) => sum + w.totalVolume, 0);
};
const calcStreak = (workouts) => {
  const days = [...new Set(workouts.map(w => w.date))].sort().reverse();
  let streak = 0;
  const now = new Date(); now.setHours(0,0,0,0);
  for (let i = 0; i < days.length; i++) {
    const d = new Date(days[i]); d.setHours(0,0,0,0);
    const diff = Math.round((now - d) / 86400000);
    if (diff === streak) streak++;
    else break;
  }
  return streak;
};

// ── Theme / CSS ─────────────────────────────────────────────────────────────
const G_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body, #root { min-height: 100vh; font-family: 'Inter', sans-serif; background: #080B14; color: #E6F1FF; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(108,99,255,0.4); border-radius: 2px; }
  input, select, textarea { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #E6F1FF; padding: 8px 12px; font-family: 'Inter',sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; width: 100%; }
  input:focus, select:focus, textarea:focus { border-color: #6C63FF; }
  input[type=range] { padding: 0; height: 4px; cursor: pointer; accent-color: #6C63FF; }
  select option { background: #0F1629; }
  button { font-family: 'Inter', sans-serif; cursor: pointer; border: none; outline: none; }
  .glass { background: rgba(15,22,41,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; backdrop-filter: blur(12px); }
  .glass-sm { background: rgba(15,22,41,0.5); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; }
  .glow { box-shadow: 0 0 20px rgba(108,99,255,0.3); }
  .neon { background: linear-gradient(135deg, #6C63FF, #00D4FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .neon-btn { background: linear-gradient(135deg, #6C63FF, #9C53FF); color: white; border-radius: 10px; padding: 10px 20px; font-weight: 600; font-size: 14px; transition: opacity 0.2s, transform 0.1s; }
  .neon-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .neon-btn:active { transform: scale(0.98); }
  .ghost-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #8892B0; border-radius: 8px; padding: 8px 14px; font-size: 13px; transition: background 0.2s, color 0.2s; }
  .ghost-btn:hover { background: rgba(108,99,255,0.15); color: #E6F1FF; border-color: rgba(108,99,255,0.4); }
  .tab-btn { background: none; color: #8892B0; padding: 8px 16px; font-size: 13px; font-weight: 500; border-radius: 8px; transition: all 0.2s; }
  .tab-btn.active { background: rgba(108,99,255,0.2); color: #6C63FF; }
  .mono { font-family: 'JetBrains Mono', monospace; }
  .badge-card { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px; border-radius: 12px; background: rgba(15,22,41,0.5); border: 1px solid rgba(255,255,255,0.07); text-align: center; font-size: 11px; color: #8892B0; }
  .badge-card.earned { border-color: rgba(108,99,255,0.5); background: rgba(108,99,255,0.1); color: #B0A8FF; }
`;

// ── Reusable Components ─────────────────────────────────────────────────────
const Card = ({ children, style, className = "" }) => (
  <div className={`glass ${className}`} style={{ padding: "20px", ...style }}>{children}</div>
);

const StatCard = ({ label, value, unit, color = COLORS.primary, sub }) => (
  <div style={{ background: "rgba(15,22,41,0.5)", border: `1px solid ${color}30`, borderRadius: 12, padding: "16px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(${color}30, transparent)`, borderRadius: "0 0 0 100%" }} />
    <div style={{ fontSize: 11, color: "#8892B0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}<span style={{ fontSize: 13, fontWeight: 400, marginLeft: 4, color: "#8892B0" }}>{unit}</span></div>
    {sub && <div style={{ fontSize: 11, color: "#8892B0", marginTop: 4 }}>{sub}</div>}
  </div>
);

const ProgressRing = ({ value, max, size = 80, color = COLORS.primary, label }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / max) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
        <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={13} fontWeight={700} fontFamily="'JetBrains Mono',monospace">{fmt(value)}</text>
      </svg>
      <span style={{ fontSize: 11, color: "#8892B0" }}>{label}</span>
    </div>
  );
};

// ── AI Coach Hook ───────────────────────────────────────────────────────────
const useAICoach = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ask = useCallback(async (systemPrompt, userMsg, history = []) => {
    setLoading(true); setError(null);
    try {
      const messages = [...history, { role: "user", content: userMsg }];
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: systemPrompt, messages })
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "No response.";
      setLoading(false);
      return text;
    } catch (e) {
      setError(e.message);
      setLoading(false);
      return null;
    }
  }, []);

  return { ask, loading, error };
};

// ═══════════════════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════════════════

// ── Onboarding ──────────────────────────────────────────────────────────────
const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", age: 25, gender: "male", height: 175, weight: 75, bodyFat: 15,
    activity: "moderate", experience: "intermediate", goal: "muscle"
  });
  const { ask, loading } = useAICoach();

  const steps = [
    { title: "Who are you?", fields: ["name","age","gender"] },
    { title: "Your body", fields: ["height","weight","bodyFat"] },
    { title: "Your lifestyle", fields: ["activity","experience","goal"] },
  ];

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleFinish = async () => {
    const bmi = form.weight / ((form.height / 100) ** 2);
    const tdee = form.gender === "male"
      ? (10 * form.weight + 6.25 * form.height - 5 * form.age + 5) * { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 }[form.activity]
      : (10 * form.weight + 6.25 * form.height - 5 * form.age - 161) * { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 }[form.activity];
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "linear-gradient(135deg, #080B14 0%, #0D1B3E 50%, #080B14 100%)" }}>
      <div style={{ maxWidth: 480, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, background: "linear-gradient(135deg, #6C63FF, #00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>AI Fitness Mentor</h1>
          <p style={{ color: "#8892B0", fontSize: 15 }}>Your personal AI coach, powered by science</p>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? "linear-gradient(90deg, #6C63FF, #00D4FF)" : "rgba(255,255,255,0.08)" }} />
            ))}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>{steps[step].title}</h2>

          {step === 0 && (<>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "#8892B0", display: "block", marginBottom: 6 }}>First Name</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Enter your name" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "#8892B0", display: "block", marginBottom: 6 }}>Age</label>
                <input type="number" value={form.age} onChange={e => set("age", +e.target.value)} min={13} max={100} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#8892B0", display: "block", marginBottom: 6 }}>Gender</label>
                <select value={form.gender} onChange={e => set("gender", e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </>)}

          {step === 1 && (<>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[["height", "Height (cm)", 100, 250], ["weight", "Weight (kg)", 30, 300], ["bodyFat", "Body Fat (%)", 3, 60]].map(([k, l, min, max]) => (
                <div key={k}>
                  <label style={{ fontSize: 12, color: "#8892B0", display: "block", marginBottom: 6 }}>{l}</label>
                  <input type="number" value={form[k]} onChange={e => set(k, +e.target.value)} min={min} max={max} />
                </div>
              ))}
            </div>
          </>)}

          {step === 2 && (<>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: "#8892B0", display: "block", marginBottom: 6 }}>Activity Level</label>
              <select value={form.activity} onChange={e => set("activity", e.target.value)}>
                {[["sedentary","Sedentary (desk job)"],["light","Lightly Active (1-3x/wk)"],["moderate","Moderately Active (3-5x/wk)"],["active","Very Active (6-7x/wk)"],["very_active","Extremely Active (2x/day)"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: "#8892B0", display: "block", marginBottom: 6 }}>Training Experience</label>
              <select value={form.experience} onChange={e => set("experience", e.target.value)}>
                {[["beginner","Beginner (< 1 year)"],["intermediate","Intermediate (1-3 years)"],["advanced","Advanced (3-5 years)"],["elite","Elite (5+ years)"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#8892B0", display: "block", marginBottom: 8 }}>Primary Goal</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {Object.entries(GOAL_LABELS).map(([v, l]) => (
                  <button key={v} onClick={() => set("goal", v)} style={{ padding: "10px 12px", borderRadius: 8, fontSize: 13, background: form.goal === v ? "rgba(108,99,255,0.25)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.goal === v ? "#6C63FF" : "rgba(255,255,255,0.08)"}`, color: form.goal === v ? "#9C8FFF" : "#8892B0", transition: "all 0.2s", textAlign: "left" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </>)}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
            {step > 0 && <button className="ghost-btn" onClick={() => setStep(p => p - 1)}>← Back</button>}
            <div style={{ flex: 1 }} />
            {step < steps.length - 1
              ? <button className="neon-btn" onClick={() => setStep(p => p + 1)}>Continue →</button>
              : <button className="neon-btn" onClick={handleFinish} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Generating your plan..." : "Start Your Journey ⚡"}
                </button>}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── Dashboard ───────────────────────────────────────────────────────────────
const Dashboard = ({ state, dispatch }) => {
  const { profile, workouts, nutrition, recovery, bodyWeight, badges, xp, level } = state;
  const { ask, loading } = useAICoach();
  const [aiInsight, setAiInsight] = useState("");

  const weekVol = calcWeeklyVolume(workouts);
  const streak = calcStreak(workouts);
  const todayNutrition = nutrition.find(n => n.date === today()) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const todayRecovery = recovery.find(r => r.date === today()) || { sleep: 0, quality: 5, stress: 5, score: 0 };

  const weightData = bodyWeight.slice(-30).map(w => ({ date: w.date.slice(5), weight: w.weight }));
  const volumeData = workouts.slice(-12).map(w => ({ date: w.date.slice(5), volume: Math.round(w.totalVolume) }));

  const getInsight = async () => {
    const recent = workouts.slice(-5);
    const summary = `User: ${profile.name}, Goal: ${profile.goal}, Recent workouts: ${recent.map(w => `${w.date}: ${w.exercises?.map(e=>e.name).join(", ")} (vol: ${Math.round(w.totalVolume)}kg)`).join(" | ")}. Weekly volume: ${Math.round(weekVol)}kg. Streak: ${streak} days. Today calories: ${todayNutrition.calories}/${profile.calories}. Recovery score: ${todayRecovery.score}/10.`;
    const text = await ask(
      "You are an elite AI personal trainer giving a concise weekly review. Be specific, data-driven, and motivating. Keep it under 120 words. Use emojis sparingly.",
      `Review my training: ${summary}`
    );
    if (text) setAiInsight(text);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Welcome back, <span className="neon">{profile.name}</span></h1>
          <p style={{ color: "#8892B0", fontSize: 14, marginTop: 4 }}>Level {level} · {xp} XP · {GOAL_LABELS[profile.goal]}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <ProgressRing value={streak} max={30} size={70} color={COLORS.amber} label="Day streak" />
          <ProgressRing value={Math.min(todayNutrition.calories, profile.calories)} max={profile.calories} size={70} color={COLORS.green} label="Calories" />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Weekly Volume" value={Math.round(weekVol)} unit="kg" color={COLORS.primary} sub="This week's total" />
        <StatCard label="Daily Calories" value={todayNutrition.calories} unit={`/ ${profile.calories}`} color={COLORS.green} sub={`${profile.calories - todayNutrition.calories} remaining`} />
        <StatCard label="Body Weight" value={bodyWeight.length > 0 ? bodyWeight[bodyWeight.length-1].weight : profile.weight} unit="kg" color={COLORS.cyan} sub={bodyWeight.length > 1 ? `${(bodyWeight[bodyWeight.length-1].weight - profile.weight > 0 ? "+" : "")}${fmt(bodyWeight[bodyWeight.length-1].weight - profile.weight, 1)}kg since start` : "Starting weight"} />
        <StatCard label="Recovery Score" value={todayRecovery.score || "—"} unit={todayRecovery.score ? "/10" : ""} color={todayRecovery.score >= 7 ? COLORS.green : todayRecovery.score >= 5 ? COLORS.amber : COLORS.red} sub="Today's readiness" />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 13, color: "#8892B0", marginBottom: 12 }}>Weight trend (30 days)</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weightData.length ? weightData : [{ date: today().slice(5), weight: profile.weight }]}>
              <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3}/><stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8892B0" }} />
              <YAxis tick={{ fontSize: 10, fill: "#8892B0" }} domain={["auto","auto"]} />
              <Tooltip contentStyle={{ background: "#0F1629", border: "1px solid rgba(108,99,255,0.3)", borderRadius: 8, color: "#E6F1FF", fontSize: 12 }} />
              <Area type="monotone" dataKey="weight" stroke="#6C63FF" fill="url(#wg)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div style={{ fontSize: 13, color: "#8892B0", marginBottom: 12 }}>Weekly training volume</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={volumeData.length ? volumeData : [{ date: today().slice(5), volume: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8892B0" }} />
              <YAxis tick={{ fontSize: 10, fill: "#8892B0" }} />
              <Tooltip contentStyle={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#E6F1FF", fontSize: 12 }} />
              <Bar dataKey="volume" fill="#00D4FF" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* AI Coaching insight */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #6C63FF, #00D4FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>AI Coach Analysis</div>
              <div style={{ fontSize: 12, color: "#8892B0" }}>Personalized feedback</div>
            </div>
          </div>
          <button className="neon-btn" onClick={getInsight} disabled={loading} style={{ fontSize: 12, padding: "8px 16px" }}>
            {loading ? "Analyzing..." : "Get Insight ⚡"}
          </button>
        </div>
        <div style={{ background: "rgba(108,99,255,0.06)", borderRadius: 10, padding: "14px 16px", minHeight: 60 }}>
          {aiInsight
            ? <p style={{ fontSize: 14, lineHeight: 1.7, color: "#C8D6F0" }}>{aiInsight}</p>
            : <p style={{ fontSize: 13, color: "#8892B0" }}>Click "Get Insight" to receive your personalized AI coaching review based on your recent training data.</p>}
        </div>
      </Card>

      {/* Badges */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Achievements</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
          {BADGE_DEFS.map(b => (
            <div key={b.id} className={`badge-card ${badges.includes(b.id) ? "earned" : ""}`}>
              <span style={{ fontSize: 24, filter: badges.includes(b.id) ? "none" : "grayscale(1) opacity(0.3)" }}>{b.icon}</span>
              <span style={{ fontWeight: 500 }}>{b.label}</span>
              <span style={{ fontSize: 10 }}>{b.desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ── Workout Tracker ─────────────────────────────────────────────────────────
const WorkoutTracker = ({ state, dispatch }) => {
  const [exercises, setExercises] = useState([{ name: EXERCISES[0], sets: [{ weight: 60, reps: 8, rpe: 7 }] }]);
  const [workoutNote, setWorkoutNote] = useState("");
  const [history, setHistory] = useState(false);
  const [aiTip, setAiTip] = useState("");
  const { ask, loading } = useAICoach();

  const addEx = () => setExercises(p => [...p, { name: EXERCISES[0], sets: [{ weight: 60, reps: 8, rpe: 7 }] }]);
  const removeEx = (i) => setExercises(p => p.filter((_,j) => j !== i));
  const setEx = (i, k, v) => setExercises(p => p.map((e,j) => j===i ? {...e, [k]:v} : e));
  const addSet = (i) => setExercises(p => p.map((e,j) => j===i ? {...e, sets:[...e.sets, {...e.sets[e.sets.length-1]}]} : e));
  const removeSet = (i, s) => setExercises(p => p.map((e,j) => j===i ? {...e, sets:e.sets.filter((_,k)=>k!==s)} : e));
  const setSet = (i, s, k, v) => setExercises(p => p.map((e,j) => j===i ? {...e, sets:e.sets.map((st,k2)=>k2===s?{...st,[k]:+v}:st)} : e));

  const totalVolume = exercises.reduce((sum, e) => sum + calcVolume(e.sets), 0);
  const best1RM = exercises.map(e => ({ name: e.name, e1rm: Math.max(...e.sets.map(s => calcE1RM(s.weight, s.reps))) }));

  const save_workout = () => {
    const w = {
      id: Date.now(), date: today(), exercises, totalVolume, note: workoutNote,
      e1rms: best1RM.reduce((acc, e) => ({ ...acc, [e.name]: e.e1rm }), {})
    };
    dispatch({ type: "ADD_WORKOUT", payload: w });
    setExercises([{ name: EXERCISES[0], sets: [{ weight: 60, reps: 8, rpe: 7 }] }]);
    setWorkoutNote("");
    setAiTip("✅ Workout logged! Great session.");
  };

  const getTip = async () => {
    const recent = state.workouts.slice(-3);
    const tip = await ask(
      "You are a strength coach. Give ONE specific, actionable tip. Max 2 sentences.",
      `I just logged: ${exercises.map(e => `${e.name} ${e.sets.length}x${e.sets[0]?.reps}@${e.sets[0]?.weight}kg`).join(", ")}. Recent sessions: ${recent.map(w => w.exercises?.map(e=>e.name).join("+")).join(", ")}.`
    );
    if (tip) setAiTip(tip);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Workout Tracker</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ghost-btn" onClick={() => setHistory(!history)}>{history ? "← Log" : "History 📋"}</button>
          <button className="neon-btn" onClick={save_workout} style={{ fontSize: 13 }}>Save Workout ✓</button>
        </div>
      </div>

      {history ? (
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Workout History</div>
          {state.workouts.length === 0 ? <p style={{ color: "#8892B0", fontSize: 13 }}>No workouts logged yet.</p> :
            state.workouts.slice().reverse().map(w => (
              <div key={w.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{w.date}</span>
                  <span style={{ fontSize: 12, color: COLORS.cyan, fontFamily: "'JetBrains Mono',monospace" }}>{Math.round(w.totalVolume)} kg total</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {w.exercises?.map((e, i) => (
                    <span key={i} style={{ fontSize: 11, padding: "3px 8px", background: "rgba(108,99,255,0.15)", borderRadius: 4, color: "#B0A8FF" }}>{e.name} {e.sets.length}×{e.sets[0]?.reps}@{e.sets[0]?.weight}kg</span>
                  ))}
                </div>
              </div>
            ))}
        </Card>
      ) : (<>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          <StatCard label="Total Volume" value={Math.round(totalVolume)} unit="kg" color={COLORS.primary} />
          <StatCard label="Exercises" value={exercises.length} unit="" color={COLORS.cyan} />
          <StatCard label="Total Sets" value={exercises.reduce((s,e)=>s+e.sets.length,0)} unit="" color={COLORS.green} />
        </div>

        {exercises.map((ex, i) => (
          <Card key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <select value={ex.name} onChange={e => setEx(i, "name", e.target.value)} style={{ maxWidth: 200 }}>
                {EXERCISES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <input placeholder="Custom exercise" value={EXERCISES.includes(ex.name) ? "" : ex.name} onChange={e => setEx(i, "name", e.target.value)} style={{ maxWidth: 160 }} />
              <button className="ghost-btn" onClick={() => removeEx(i)} style={{ color: COLORS.red, borderColor: "rgba(255,71,87,0.3)", marginLeft: "auto" }}>Remove</button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ color: "#8892B0" }}>
                  {["Set", "Weight (kg)", "Reps", "RPE", "Est. 1RM", ""].map(h => <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 500 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {ex.sets.map((s, j) => (
                    <tr key={j} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "8px", color: "#8892B0" }}>{j+1}</td>
                      <td style={{ padding: "8px" }}><input type="number" value={s.weight} onChange={e => setSet(i,j,"weight",e.target.value)} style={{ width: 80 }} /></td>
                      <td style={{ padding: "8px" }}><input type="number" value={s.reps} onChange={e => setSet(i,j,"reps",e.target.value)} style={{ width: 60 }} /></td>
                      <td style={{ padding: "8px" }}><input type="number" value={s.rpe} onChange={e => setSet(i,j,"rpe",e.target.value)} min={1} max={10} style={{ width: 60 }} /></td>
                      <td style={{ padding: "8px", color: COLORS.cyan, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(calcE1RM(s.weight,s.reps),1)}</td>
                      <td style={{ padding: "8px" }}><button onClick={() => removeSet(i,j)} style={{ background: "none", color: "#FF4757", fontSize: 16 }}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="ghost-btn" onClick={() => addSet(i)} style={{ marginTop: 10, fontSize: 12 }}>+ Add Set</button>
          </Card>
        ))}

        <button className="ghost-btn" onClick={addEx} style={{ width: "100%", padding: "12px", borderStyle: "dashed" }}>+ Add Exercise</button>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>AI Coaching Tip</span>
            <button className="ghost-btn" onClick={getTip} disabled={loading} style={{ fontSize: 12 }}>{loading ? "..." : "Get Tip ⚡"}</button>
          </div>
          {aiTip ? <p style={{ fontSize: 13, color: "#C8D6F0", lineHeight: 1.6 }}>{aiTip}</p> : <p style={{ fontSize: 13, color: "#8892B0" }}>Get AI feedback on your current workout.</p>}
        </Card>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Workout Notes</div>
          <textarea value={workoutNote} onChange={e => setWorkoutNote(e.target.value)} placeholder="How did the session feel? Any PRs? Notes for next time..." style={{ width: "100%", minHeight: 80, resize: "vertical" }} />
        </Card>
      </>)}
    </div>
  );
};

// ── Nutrition ───────────────────────────────────────────────────────────────
const Nutrition = ({ state, dispatch }) => {
  const { profile, nutrition } = state;
  const [form, setForm] = useState({ food: "", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  const [aiRec, setAiRec] = useState("");
  const { ask, loading } = useAICoach();

  const todayLog = nutrition.filter(n => n.date === today());
  const totals = todayLog.reduce((acc, n) => ({ calories: acc.calories + n.calories, protein: acc.protein + n.protein, carbs: acc.carbs + n.carbs, fat: acc.fat + n.fat }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const logFood = () => {
    dispatch({ type: "ADD_NUTRITION", payload: { ...form, id: Date.now(), date: today() } });
    setForm({ food: "", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  };

  const getNutritionAdvice = async () => {
    const advice = await ask(
      "You are a sports nutritionist. Give practical, specific meal advice. Max 100 words.",
      `Goal: ${profile.goal}, Target: ${profile.calories} cal / ${profile.protein}g protein. Today eaten: ${totals.calories} cal, ${totals.protein}g protein, ${totals.carbs}g carbs, ${totals.fat}g fat. What should I eat for the rest of today?`
    );
    if (advice) setAiRec(advice);
  };

  const macroData = [
    { name: "Protein", value: totals.protein, target: profile.protein, color: COLORS.primary },
    { name: "Carbs", value: totals.carbs, target: Math.round((profile.calories * 0.45) / 4), color: COLORS.cyan },
    { name: "Fat", value: totals.fat, target: Math.round((profile.calories * 0.25) / 9), color: COLORS.amber },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Nutrition Tracker</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <StatCard label="Calories" value={totals.calories} unit={`/ ${profile.calories}`} color={totals.calories > profile.calories ? COLORS.red : COLORS.green} />
        {macroData.map(m => <StatCard key={m.name} label={m.name} value={totals[m.name.toLowerCase()]} unit={`g / ${m.target}g`} color={m.color} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Macro Progress</div>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {macroData.map(m => <ProgressRing key={m.name} value={Math.min(m.value, m.target)} max={m.target} size={90} color={m.color} label={m.name} />)}
          </div>
        </Card>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>AI Nutrition Advice</div>
            <button className="ghost-btn" onClick={getNutritionAdvice} disabled={loading} style={{ fontSize: 12 }}>{loading ? "..." : "Advise ⚡"}</button>
          </div>
          {aiRec ? <p style={{ fontSize: 13, color: "#C8D6F0", lineHeight: 1.6 }}>{aiRec}</p> : <p style={{ fontSize: 13, color: "#8892B0" }}>Get meal recommendations based on your remaining macros.</p>}
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Log Food</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
          {[["food","Food name","text"],["calories","Calories","number"],["protein","Protein (g)","number"],["carbs","Carbs (g)","number"],["fat","Fat (g)","number"]].map(([k,l,t]) => (
            <div key={k}>
              <label style={{ fontSize: 11, color: "#8892B0", display: "block", marginBottom: 4 }}>{l}</label>
              <input type={t} value={form[k]} onChange={e => setForm(p => ({...p,[k]:t==="number"?+e.target.value:e.target.value}))} placeholder={l} />
            </div>
          ))}
        </div>
        <button className="neon-btn" onClick={logFood}>Log Food Entry</button>
      </Card>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Today's Food Log</div>
        {todayLog.length === 0 ? <p style={{ color: "#8892B0", fontSize: 13 }}>No food logged yet today.</p> :
          todayLog.map((n, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13 }}>
              <span style={{ fontWeight: 500 }}>{n.food || "Food entry"}</span>
              <div style={{ display: "flex", gap: 16, color: "#8892B0" }}>
                <span style={{ color: COLORS.green }}>{n.calories} kcal</span>
                <span>P: {n.protein}g</span>
                <span>C: {n.carbs}g</span>
                <span>F: {n.fat}g</span>
              </div>
            </div>
          ))}
      </Card>
    </div>
  );
};

// ── Recovery ────────────────────────────────────────────────────────────────
const Recovery = ({ state, dispatch }) => {
  const [form, setForm] = useState({ sleep: 7, quality: 7, stress: 3, heartRate: 60 });
  const [aiRec, setAiRec] = useState("");
  const { ask, loading } = useAICoach();

  const todayRec = state.recovery.find(r => r.date === today());
  const score = todayRec ? todayRec.score : null;

  const logRecovery = () => {
    const s = Math.round((form.sleep/9*3 + form.quality/10*4 + (10-form.stress)/10*3) * 10) / 10;
    dispatch({ type: "ADD_RECOVERY", payload: { ...form, score: s, id: Date.now(), date: today() } });
  };

  const getRecAdvice = async () => {
    const recHistory = state.recovery.slice(-7);
    const advice = await ask(
      "You are a recovery and sports science coach. Be specific and data-driven. Max 80 words.",
      `Recent recovery scores: ${recHistory.map(r=>`${r.date}: ${r.score}/10`).join(", ")}. Today's metrics: sleep ${form.sleep}hrs, quality ${form.quality}/10, stress ${form.stress}/10. Recent training volume: ${Math.round(calcWeeklyVolume(state.workouts))}kg. Should I train today or recover? What's your recommendation?`
    );
    if (advice) setAiRec(advice);
  };

  const recData = state.recovery.slice(-14).map(r => ({ date: r.date.slice(5), score: r.score, sleep: r.sleep }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Recovery & Sleep</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Log Today's Recovery</div>
          {[["sleep","Sleep Duration (hrs)", 0, 12, 0.5], ["quality","Sleep Quality (1-10)", 1, 10, 1], ["stress","Stress Level (1-10)", 1, 10, 1], ["heartRate","Resting Heart Rate", 40, 120, 1]].map(([k,l,min,max,step]) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <label style={{ fontSize: 12, color: "#8892B0" }}>{l}</label>
                <span style={{ fontSize: 12, color: COLORS.cyan, fontFamily: "'JetBrains Mono',monospace" }}>{form[k]}{k === "sleep" ? "h" : k === "heartRate" ? " bpm" : ""}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={form[k]} onChange={e => setForm(p => ({...p,[k]:+e.target.value}))} />
            </div>
          ))}
          <button className="neon-btn" onClick={logRecovery} style={{ width: "100%", marginTop: 4 }}>Log Recovery</button>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#8892B0", marginBottom: 8 }}>Today's Recovery Score</div>
            <div style={{ fontSize: 56, fontWeight: 700, color: score !== null ? (score >= 7 ? COLORS.green : score >= 5 ? COLORS.amber : COLORS.red) : "#8892B0", fontFamily: "'JetBrains Mono',monospace" }}>
              {score !== null ? score.toFixed(1) : "—"}
            </div>
            <div style={{ fontSize: 12, color: "#8892B0", marginTop: 4 }}>{score !== null ? (score >= 7 ? "High readiness — Train hard" : score >= 5 ? "Moderate — Normal training" : "Low — Consider deload") : "Not logged yet"}</div>
          </Card>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>AI Recovery Coach</span>
              <button className="ghost-btn" onClick={getRecAdvice} disabled={loading} style={{ fontSize: 12 }}>{loading ? "..." : "Advise ⚡"}</button>
            </div>
            {aiRec ? <p style={{ fontSize: 13, color: "#C8D6F0", lineHeight: 1.6 }}>{aiRec}</p> : <p style={{ fontSize: 13, color: "#8892B0" }}>Get AI-powered recovery recommendations.</p>}
          </Card>
        </div>
      </div>

      <Card>
        <div style={{ fontSize: 13, color: "#8892B0", marginBottom: 12 }}>Recovery score & sleep (14 days)</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={recData.length ? recData : [{ date: today().slice(5), score: 0, sleep: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8892B0" }} />
            <YAxis tick={{ fontSize: 10, fill: "#8892B0" }} />
            <Tooltip contentStyle={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#E6F1FF", fontSize: 12 }} />
            <Line type="monotone" dataKey="score" stroke={COLORS.green} strokeWidth={2} dot={false} name="Recovery" />
            <Line type="monotone" dataKey="sleep" stroke={COLORS.cyan} strokeWidth={2} dot={false} name="Sleep hrs" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

// ── Programs ─────────────────────────────────────────────────────────────────
const Programs = ({ state, dispatch }) => {
  const [aiProgram, setAiProgram] = useState(null);
  const [genLoading, setGenLoading] = useState(false);
  const { ask } = useAICoach();
  const [split, setSplit] = useState("ppl");

  const splits = [
    { id: "ppl", label: "Push Pull Legs" },
    { id: "ul", label: "Upper Lower" },
    { id: "fb", label: "Full Body" },
    { id: "bb", label: "Bodybuilding" },
    { id: "pl", label: "Powerlifting" },
  ];

  const generateProgram = async () => {
    setGenLoading(true);
    const weeklyVol = Math.round(calcWeeklyVolume(state.workouts));
    const program = await ask(
      "You are an elite strength coach. Respond ONLY with valid JSON. No markdown, no backticks, no explanation.",
      `Create a ${splits.find(s=>s.id===split)?.label} program for: Goal: ${state.profile.goal}, Experience: ${state.profile.experience}, Weekly volume last week: ${weeklyVol}kg. Return JSON: { "split": "${split}", "name": string, "description": string, "days": [{ "name": string, "focus": string, "exercises": [{ "name": string, "sets": number, "reps": string, "rest": string, "notes": string }] }] }`
    );
    if (program) {
      try {
        const clean = program.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        setAiProgram(parsed);
        dispatch({ type: "SET_PROGRAM", payload: parsed });
      } catch { setAiProgram({ error: true }); }
    }
    setGenLoading(false);
  };

  const prog = aiProgram || state.profile?.currentProgram;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Adaptive Programs</h2>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Generate AI Program</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {splits.map(s => (
            <button key={s.id} onClick={() => setSplit(s.id)} className="tab-btn" style={{ background: split===s.id ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.04)", color: split===s.id ? COLORS.primary : "#8892B0", border: `1px solid ${split===s.id ? "rgba(108,99,255,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8 }}>{s.label}</button>
          ))}
        </div>
        <button className="neon-btn" onClick={generateProgram} disabled={genLoading}>{genLoading ? "AI generating program..." : `Generate ${splits.find(s=>s.id===split)?.label} Program ⚡`}</button>
      </Card>

      {prog && !prog.error && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.3)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{prog.name || "Your Program"}</div>
              <div style={{ fontSize: 13, color: "#8892B0" }}>{prog.description || `${splits.find(s=>s.id===split)?.label} split`}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {prog.days?.map((day, i) => (
              <Card key={i} style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{i+1}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{day.name}</div>
                    <div style={{ fontSize: 11, color: "#8892B0" }}>{day.focus}</div>
                  </div>
                </div>
                {day.exercises?.map((ex, j) => (
                  <div key={j} style={{ padding: "8px 0", borderBottom: j < day.exercises.length-1 ? "1px solid rgba(255,255,255,0.05)" : "none", fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 500 }}>{ex.name}</span>
                      <span style={{ color: COLORS.cyan, fontFamily: "'JetBrains Mono',monospace" }}>{ex.sets}×{ex.reps}</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 3, fontSize: 11, color: "#8892B0" }}>
                      {ex.rest && <span>Rest: {ex.rest}</span>}
                      {ex.notes && <span>{ex.notes}</span>}
                    </div>
                  </div>
                ))}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Progress ─────────────────────────────────────────────────────────────────
const Progress = ({ state }) => {
  const { workouts, profile } = state;

  const e1rmHistory = {};
  workouts.forEach(w => {
    w.exercises?.forEach(ex => {
      if (!e1rmHistory[ex.name]) e1rmHistory[ex.name] = [];
      const best = Math.max(...ex.sets.map(s => calcE1RM(s.weight, s.reps)));
      e1rmHistory[ex.name].push({ date: w.date.slice(5), e1rm: +best.toFixed(1) });
    });
  });

  const topExercises = Object.entries(e1rmHistory).sort((a,b) => b[1].length - a[1].length).slice(0, 4);

  const volumeByWeek = (() => {
    const byWeek = {};
    workouts.forEach(w => {
      const d = new Date(w.date);
      const week = `W${Math.ceil(d.getDate()/7)} ${d.toLocaleDateString("en", { month: "short" })}`;
      byWeek[week] = (byWeek[week] || 0) + w.totalVolume;
    });
    return Object.entries(byWeek).slice(-8).map(([w,v]) => ({ week: w, volume: Math.round(v) }));
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Progress Tracker</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <StatCard label="Total Workouts" value={workouts.length} color={COLORS.primary} />
        <StatCard label="Total Volume" value={Math.round(workouts.reduce((s,w)=>s+w.totalVolume,0))} unit="kg" color={COLORS.cyan} />
        <StatCard label="Avg Volume/Session" value={workouts.length ? Math.round(workouts.reduce((s,w)=>s+w.totalVolume,0)/workouts.length) : 0} unit="kg" color={COLORS.green} />
        <StatCard label="Best Streak" value={calcStreak(workouts)} unit="days" color={COLORS.amber} />
      </div>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Weekly Volume Trend</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={volumeByWeek.length ? volumeByWeek : [{ week: "No data", volume: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#8892B0" }} />
            <YAxis tick={{ fontSize: 10, fill: "#8892B0" }} />
            <Tooltip contentStyle={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#E6F1FF", fontSize: 12 }} />
            <Bar dataKey="volume" fill="#6C63FF" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {topExercises.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Estimated 1RM Progression</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {topExercises.map(([name, data]) => (
              <Card key={name} style={{ padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{name}</div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#8892B0" }} />
                    <YAxis tick={{ fontSize: 9, fill: "#8892B0" }} domain={["auto","auto"]} />
                    <Tooltip contentStyle={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#E6F1FF", fontSize: 11 }} />
                    <Line type="monotone" dataKey="e1rm" stroke={COLORS.cyan} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "#8892B0" }}>
                  <span>Start: <span style={{ color: "#E6F1FF" }}>{data[0]?.e1rm}kg</span></span>
                  <span>Current: <span style={{ color: COLORS.cyan }}>{data[data.length-1]?.e1rm}kg</span></span>
                  <span style={{ color: data[data.length-1]?.e1rm > data[0]?.e1rm ? COLORS.green : COLORS.red }}>
                    {data[data.length-1]?.e1rm > data[0]?.e1rm ? "▲" : "▼"} {fmt(Math.abs(data[data.length-1]?.e1rm - data[0]?.e1rm), 1)}kg
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Body Weight Log ──────────────────────────────────────────────────────────
const BodyWeightLog = ({ state, dispatch }) => {
  const [weight, setWeight] = useState(state.profile?.weight || 75);
  const [date, setDate] = useState(today());

  const log = () => {
    dispatch({ type: "ADD_WEIGHT", payload: { weight: +weight, date } });
  };

  const data = state.bodyWeight.slice(-60).map(w => ({ date: w.date.slice(5), weight: w.weight }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Body Weight</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Log Weight</div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: "#8892B0", display: "block", marginBottom: 6 }}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#8892B0", display: "block", marginBottom: 6 }}>Weight (kg)</label>
            <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
          <button className="neon-btn" onClick={log} style={{ width: "100%" }}>Log Weight</button>
        </Card>
        <Card>
          <div style={{ fontSize: 13, color: "#8892B0", marginBottom: 12 }}>Weight history (60 days)</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.length ? data : [{ date: today().slice(5), weight: state.profile?.weight || 75 }]}>
              <defs><linearGradient id="bwg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3}/><stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8892B0" }} />
              <YAxis tick={{ fontSize: 10, fill: "#8892B0" }} domain={["auto","auto"]} />
              <Tooltip contentStyle={{ background: "#0F1629", border: "1px solid rgba(108,99,255,0.3)", borderRadius: 8, color: "#E6F1FF", fontSize: 12 }} />
              <Area type="monotone" dataKey="weight" stroke="#6C63FF" fill="url(#bwg)" strokeWidth={2} dot={{ fill: "#6C63FF", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

// ── AI Chat Coach ─────────────────────────────────────────────────────────────
const AIChat = ({ state }) => {
  const [messages, setMessages] = useState([{ role: "assistant", content: `Hi ${state.profile?.name}! 👋 I'm your AI fitness coach. Ask me anything about your training, nutrition, recovery, or program. I have access to your data and can give personalized advice.` }]);
  const [input, setInput] = useState("");
  const { ask, loading } = useAICoach();
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMsg = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(p => [...p, { role: "user", content: userMsg }]);

    const context = `User profile: ${JSON.stringify({ name: state.profile?.name, goal: state.profile?.goal, weight: state.profile?.weight, tdee: state.profile?.tdee, calories: state.profile?.calories, protein: state.profile?.protein })}. Recent workouts: ${state.workouts.slice(-3).map(w=>`${w.date}: ${w.exercises?.map(e=>e.name).join(",")} vol:${Math.round(w.totalVolume)}kg`).join(" | ")}. Weekly volume: ${Math.round(calcWeeklyVolume(state.workouts))}kg. Recovery: ${state.recovery.slice(-1)[0]?.score || "N/A"}/10.`;

    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
    const reply = await ask(
      `You are an elite AI personal trainer with expertise in nutrition, strength training, recovery, and program design. You have full access to this user's data. Be specific, practical, and encouraging. Keep responses concise (max 150 words). Context: ${context}`,
      userMsg,
      history
    );
    if (reply) setMessages(p => [...p, { role: "assistant", content: reply }]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "calc(100vh - 120px)" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>AI Coach Chat</h2>
      <Card style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              {m.role === "assistant" && <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6C63FF, #00D4FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🤖</div>}
              <div style={{ maxWidth: "75%", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", background: m.role === "user" ? "rgba(108,99,255,0.25)" : "rgba(255,255,255,0.05)", border: `1px solid ${m.role === "user" ? "rgba(108,99,255,0.3)" : "rgba(255,255,255,0.07)"}`, fontSize: 14, lineHeight: 1.6 }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6C63FF, #00D4FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
            <div style={{ padding: "10px 16px", borderRadius: "4px 16px 16px 16px", background: "rgba(255,255,255,0.05)", fontSize: 14, color: "#8892B0" }}>Thinking...</div>
          </div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Ask your AI coach anything..." style={{ flex: 1 }} />
          <button className="neon-btn" onClick={sendMsg} disabled={loading} style={{ whiteSpace: "nowrap" }}>Send →</button>
        </div>
      </Card>
    </div>
  );
};

// ── Profile ──────────────────────────────────────────────────────────────────
const ProfilePage = ({ state, dispatch }) => {
  const { profile } = state;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });

  const save = () => {
    dispatch({ type: "UPDATE_PROFILE", payload: form });
    setEditing(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Profile</h2>
        <button className={editing ? "neon-btn" : "ghost-btn"} onClick={editing ? save : () => setEditing(true)}>{editing ? "Save Changes" : "Edit Profile"}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, #6C63FF, #00D4FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, marginBottom: 12 }}>
            {profile.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{profile.name}</div>
          <div style={{ fontSize: 12, color: "#8892B0" }}>Level {state.level} · {state.xp} XP</div>
        </div>

        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {[["name","Name","text"],["age","Age","number"],["weight","Weight (kg)","number"],["height","Height (cm)","number"],["bodyFat","Body Fat (%)","number"]].map(([k,l,t]) => (
              <div key={k}>
                <label style={{ fontSize: 11, color: "#8892B0", display: "block", marginBottom: 4 }}>{l}</label>
                {editing
                  ? <input type={t} value={form[k]} onChange={e => setForm(p=>({...p,[k]:t==="number"?+e.target.value:e.target.value}))} />
                  : <div style={{ fontSize: 15, fontWeight: 500 }}>{profile[k]}</div>}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <StatCard label="TDEE" value={profile.tdee} unit="kcal" color={COLORS.amber} />
        <StatCard label="Target Calories" value={profile.calories} unit="kcal" color={COLORS.green} />
        <StatCard label="Protein Target" value={profile.protein} unit="g" color={COLORS.primary} />
        <StatCard label="Goal" value={GOAL_LABELS[profile.goal]} color={COLORS.cyan} />
      </div>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Reset All Data</div>
        <p style={{ fontSize: 13, color: "#8892B0", marginBottom: 12 }}>This will permanently delete all your workouts, nutrition logs, and progress data.</p>
        <button style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)", color: COLORS.red, borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }} onClick={() => dispatch({ type: "RESET" })}>Reset All Data</button>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════

const PAGES = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "workout", label: "Workout", icon: "🏋️" },
  { id: "nutrition", label: "Nutrition", icon: "🥗" },
  { id: "recovery", label: "Recovery", icon: "😴" },
  { id: "programs", label: "Programs", icon: "📋" },
  { id: "progress", label: "Progress", icon: "📈" },
  { id: "bodyweight", label: "Body Weight", icon: "⚖️" },
  { id: "coach", label: "AI Coach", icon: "🤖" },
  { id: "profile", label: "Profile", icon: "👤" },
];

function reducer(state, action) {
  switch (action.type) {
    case "COMPLETE_ONBOARDING": {
      const { currentProgram, ...profileData } = action.payload;
      const newState = { ...state, profile: profileData, currentProgram };
      save(newState); return newState;
    }
    case "ADD_WORKOUT": {
      const xpGain = 50;
      const workouts = [...state.workouts, action.payload];
      const badges = [...state.badges];
      if (!badges.includes("first_workout") && workouts.length >= 1) badges.push("first_workout");
      if (!badges.includes("ten_workouts") && workouts.length >= 10) badges.push("ten_workouts");
      if (!badges.includes("hundred_workouts") && workouts.length >= 100) badges.push("hundred_workouts");
      if (!badges.includes("volume_1000") && action.payload.totalVolume >= 1000) badges.push("volume_1000");
      const xp = state.xp + xpGain;
      const level = Math.floor(xp / 500) + 1;
      const newState = { ...state, workouts, badges, xp, level };
      save(newState); return newState;
    }
    case "ADD_NUTRITION": {
      const nutrition = [...state.nutrition, action.payload];
      const nutDays = [...new Set(nutrition.map(n=>n.date))];
      const badges = [...state.badges];
      if (!badges.includes("nutrition_week") && nutDays.length >= 7) badges.push("nutrition_week");
      const newState = { ...state, nutrition, badges };
      save(newState); return newState;
    }
    case "ADD_RECOVERY": {
      const recovery = state.recovery.filter(r => r.date !== action.payload.date);
      const newState = { ...state, recovery: [...recovery, action.payload] };
      save(newState); return newState;
    }
    case "ADD_WEIGHT": {
      const bw = state.bodyWeight.filter(w => w.date !== action.payload.date);
      const newState = { ...state, bodyWeight: [...bw, action.payload].sort((a,b)=>a.date.localeCompare(b.date)) };
      save(newState); return newState;
    }
    case "SET_PROGRAM": {
      const newState = { ...state, currentProgram: action.payload };
      save(newState); return newState;
    }
    case "UPDATE_PROFILE": {
      const newState = { ...state, profile: { ...state.profile, ...action.payload } };
      save(newState); return newState;
    }
    case "RESET": {
      localStorage.removeItem(STORAGE_KEY);
      return mkInitial();
    }
    default: return state;
  }
}

export default function App() {
  const [appState, appDispatch] = React.useReducer(reducer, null, () => load() || mkInitial());
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!appState.profile) {
    return (
      <>
        <style>{G_STYLE}</style>
        <Onboarding onComplete={(profile) => appDispatch({ type: "COMPLETE_ONBOARDING", payload: profile })} />
      </>
    );
  }

  const PageComponent = {
    dashboard: Dashboard, workout: WorkoutTracker, nutrition: Nutrition,
    recovery: Recovery, programs: Programs, progress: Progress,
    bodyweight: BodyWeightLog, coach: AIChat, profile: ProfilePage
  }[page];

  const streak = calcStreak(appState.workouts);

  return (
    <>
      <style>{G_STYLE}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#080B14" }}>
        {/* Sidebar */}
        <div style={{ width: sidebarOpen ? 220 : 64, flexShrink: 0, background: "rgba(10,15,30,0.95)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", transition: "width 0.2s", overflow: "hidden" }}>
          <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 22, flexShrink: 0 }}>⚡</div>
            {sidebarOpen && <span style={{ fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg, #6C63FF, #00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap" }}>AI Fitness</span>}
            <button onClick={() => setSidebarOpen(p=>!p)} style={{ background: "none", color: "#8892B0", fontSize: 16, marginLeft: "auto", padding: 4 }}>☰</button>
          </div>

          <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
            {PAGES.map(p => (
              <button key={p.id} onClick={() => setPage(p.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, background: page===p.id ? "rgba(108,99,255,0.2)" : "none", border: `1px solid ${page===p.id ? "rgba(108,99,255,0.3)" : "transparent"}`, color: page===p.id ? "#9C8FFF" : "#8892B0", fontSize: 13, textAlign: "left", transition: "all 0.15s", cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{p.icon}</span>
                {sidebarOpen && <span>{p.label}</span>}
              </button>
            ))}
          </nav>

          {sidebarOpen && (
            <div style={{ padding: "14px 12px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#8892B0" }}>
              <div>Lv. {appState.level} · {appState.xp} XP</div>
              <div style={{ marginTop: 4 }}>🔥 {streak} day streak</div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {PageComponent && <PageComponent state={appState} dispatch={appDispatch} />}
        </div>
      </div>
    </>
  );
}
