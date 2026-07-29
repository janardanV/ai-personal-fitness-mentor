import { useEffect, useState, useCallback } from "react";
import React from "react";
import { MOCK_COACHING, MOCK_DELAY, pick, fmt, today, weekAgo } from "./constants";
import { calcStreak, calcWeeklyVolume } from "./calculations";
import { isUsingMock, callAnthropic } from "./aiProvider";

export { isUsingMock };

export const generateMockResponse = (systemPrompt, userMsg) => {
  const lower = (userMsg || "").toLowerCase();
  const sysLower = (systemPrompt || "").toLowerCase();

  if (sysLower.includes("weekly review") || sysLower.includes("review my training")) return pick(MOCK_COACHING.workout_review);
  if (sysLower.includes("strength coach") || sysLower.includes("coaching tip")) return pick(MOCK_COACHING.workout_tip);
  if (sysLower.includes("nutritionist") || sysLower.includes("meal")) return pick(MOCK_COACHING.nutrition);
  if (sysLower.includes("recovery") || sysLower.includes("sleep")) return pick(MOCK_COACHING.recovery);
  if (sysLower.includes("personal trainer") || lower.includes("workout") || lower.includes("exercise") || lower.includes("lift")) return pick(MOCK_COACHING.workout_tip);

  if (lower.includes("program") || lower.includes("split") || lower.includes("routine")) {
    return JSON.stringify({
      name: "AI-Generated Program",
      description: "Customized training program based on your profile and goals",
      split: "ppl",
      days: [
        { name: "Push Day", focus: "Chest, Shoulders, Triceps", exercises: [
          { name: "Bench Press", sets: 4, reps: "8-10", rest: "2-3 min", notes: "Control the eccentric" },
          { name: "Overhead Press", sets: 3, reps: "10-12", rest: "90s", notes: "No leg drive" },
          { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "90s", notes: "" },
          { name: "Lateral Raise", sets: 4, reps: "12-15", rest: "60s", notes: "Slow and controlled" },
          { name: "Tricep Extension", sets: 3, reps: "12-15", rest: "60s", notes: "" },
        ]},
        { name: "Pull Day", focus: "Back, Biceps", exercises: [
          { name: "Deadlift", sets: 3, reps: "5-6", rest: "3 min", notes: "Heavy compound" },
          { name: "Barbell Row", sets: 4, reps: "8-10", rest: "2 min", notes: "Squeeze at top" },
          { name: "Lat Pulldown", sets: 3, reps: "10-12", rest: "90s", notes: "" },
          { name: "Face Pull", sets: 3, reps: "15-20", rest: "60s", notes: "Rear delt health" },
          { name: "Bicep Curl", sets: 3, reps: "10-12", rest: "60s", notes: "" },
        ]},
        { name: "Leg Day", focus: "Quads, Hamstrings, Glutes", exercises: [
          { name: "Squat", sets: 4, reps: "6-8", rest: "3 min", notes: "Depth below parallel" },
          { name: "Romanian Deadlift", sets: 3, reps: "10-12", rest: "2 min", notes: "Feel the stretch" },
          { name: "Leg Press", sets: 3, reps: "12-15", rest: "90s", notes: "" },
          { name: "Leg Curl", sets: 3, reps: "12-15", rest: "60s", notes: "" },
          { name: "Hip Thrust", sets: 3, reps: "10-12", rest: "90s", notes: "Squeeze glutes at top" },
        ]},
      ],
    });
  }

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return pick([
      "Hey! Ready to crush your training today? Ask me about your program, nutrition, or recovery — I've got all your data at my fingertips.",
      "Hello! Great to see you. Want a quick check-in on your progress, or do you have a specific question about training?",
      "Hey there! I'm here to help with anything fitness-related. What's on your mind today?",
    ]);
  }

  if (lower.includes("thank") || lower.includes("thanks")) return pick(["You're welcome! Keep up the great work.", "Anytime! Consistency is your superpower.", "Happy to help! Let me know if you need anything else."]);
  if (lower.includes("how are you") || lower.includes("what's up")) return pick(["I'm doing great! More importantly, how are YOU feeling today? Ready to train?", "All good here! Let's talk about your fitness goals. What do you need?"]);

  return pick(MOCK_COACHING.general);
};

export const callAIProvider = async (messages, systemPrompt) => {
  if (isUsingMock()) {
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    const text = generateMockResponse(systemPrompt, lastUser?.content || "");
    await new Promise(r => setTimeout(r, MOCK_DELAY()));
    return text;
  }

  const userMsg = [...messages].reverse().find(m => m.role === "user");
  const history = messages.filter(m => m.role !== "user");
  return callAnthropic(systemPrompt, userMsg?.content || "", history);
};

export const useAICoach = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = React.useRef(null);

  const ask = useCallback(async (systemPrompt, userMsg, history = []) => {
    setLoading(true);
    setError(null);
    try {
      const text = await callAIProvider(
        [{ role: "user", content: userMsg }, ...history],
        systemPrompt
      );
      setLoading(false);
      return text;
    } catch (e) {
      setError(e.message);
      setLoading(false);
      return null;
    }
  }, []);

  const cancel = useCallback(() => { abortRef.current?.abort(); }, []);

  return { ask, loading, error, cancel };
};

export const buildUserContext = (state) => {
  const { profile, workouts, nutrition, recovery, bodyWeight, water, personalRecords, level, xp } = state;
  const streak = calcStreak(workouts);
  const weekVol = calcWeeklyVolume(workouts);
  const todayStr = today();
  const todayN = nutrition.find(n => n.date === todayStr);
  const todayR = recovery.find(r => r.date === todayStr);
  const latestW = bodyWeight.length > 0 ? bodyWeight[bodyWeight.length - 1] : null;
  const topPRs = Object.entries(personalRecords || {}).slice(0, 5);

  const parts = [
    `## User Profile`,
    `Name: ${profile?.name || "Unknown"}, Age: ${profile?.age || "N/A"}, Gender: ${profile?.gender || "N/A"}`,
    `Weight: ${profile?.weight}kg, Height: ${profile?.height}cm, Body Fat: ${profile?.bodyFat || "N/A"}%`,
    `Goal: ${(profile?.goal || "general").replace(/_/g, " ")}, Experience: ${profile?.experience || "intermediate"}`,
    `TDEE: ${profile?.tdee || "N/A"} kcal, Target Calories: ${profile?.calories || "N/A"} kcal, Target Protein: ${profile?.protein || "N/A"}g`,
    `Level: ${level}, XP: ${xp}, Streak: ${streak} days`,
    ``,
    `## Today's Data (${todayStr})`,
    `Nutrition: ${todayN ? `${todayN.calories || 0} kcal, ${todayN.protein || 0}g protein, ${todayN.carbs || 0}g carbs, ${todayN.fat || 0}g fat` : "Not logged"}`,
    `Recovery: ${todayR ? `Score ${todayR.score}/10, Sleep ${todayR.sleep}h, Quality ${todayR.quality}/10, Stress ${todayR.stress}/10` : "Not logged"}`,
    `Water: ${(water || {})[todayStr] || 0} glasses`,
  ];

  if (workouts.length > 0) {
    const recent = workouts.slice(-5).reverse();
    parts.push(``, `## Recent Workouts (last ${recent.length})`);
    recent.forEach(w => {
      parts.push(`${w.date}: ${w.name || "Workout"} — ${w.exercises?.length || 0} exercises, ${Math.round(w.totalVolume)}kg volume, ${w.duration || "?"}min`);
      w.exercises?.forEach(e => { parts.push(`  • ${e.name}: ${e.sets?.filter(s => s.done).length || 0} working sets`); });
    });
    parts.push(``, `Weekly Volume: ${Math.round(weekVol)}kg, Total Workouts: ${workouts.length}`);
  }

  if (bodyWeight.length > 1) {
    const first = bodyWeight[0];
    const last = bodyWeight[bodyWeight.length - 1];
    const change = last.weight - first.weight;
    parts.push(``, `## Body Weight Trend`, `Start: ${first.weight}kg (${first.date}) → Current: ${last.weight}kg (${last.date}), Change: ${change > 0 ? "+" : ""}${fmt(change, 1)}kg`);
  }

  if (topPRs.length > 0) {
    parts.push(``, `## Personal Records`);
    topPRs.forEach(([name, pr]) => { parts.push(`• ${name}: ${pr.weight}kg × ${pr.reps} reps (e1RM: ${fmt(pr.e1rm || 0, 0)}kg)`); });
  }

  if (recovery.length > 1) {
    const avgSleep = recovery.slice(-7).reduce((s, r) => s + (r.sleep || 0), 0) / Math.min(recovery.length, 7);
    const avgScore = recovery.slice(-7).reduce((s, r) => s + (r.score || 0), 0) / Math.min(recovery.length, 7);
    parts.push(``, `## Recovery Averages (7-day)`, `Avg Sleep: ${fmt(avgSleep, 1)}h, Avg Recovery Score: ${fmt(avgScore, 1)}/10`);
  }

  return parts.join("\n");
};

export const buildSystemPrompt = (context) =>
  `You are an elite AI personal trainer and nutrition coach with deep expertise in strength training, hypertrophy, powerlifting, sports nutrition, recovery optimization, and program design.

You have FULL access to this user's training data, body metrics, nutrition logs, recovery data, and personal records. Use this data to give SPECIFIC, ACTIONABLE, and PERSONALIZED advice. Reference their actual numbers, exercises, and trends.

Guidelines:
- Be specific with numbers (sets, reps, weights, calories, macros)
- Reference their actual data (workouts, PRs, recovery scores)
- Keep responses concise but thorough (aim for 100-200 words)
- Use bullet points and structure for readability
- Be encouraging but honest
- If data is missing, note it and suggest they log it
- For workout programming, consider their experience level and recent training volume
- For nutrition, reference their actual targets and today's intake
- For recovery, consider their sleep, stress, and recent training load

${context}`;

export const renderMarkdown = (text) => {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="chat-code-block"><code>${code.trim()}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, '<h4 class="chat-md-h">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="chat-md-h">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="chat-md-h">$1</h2>')
    .replace(/^- (.+)$/gm, '<li class="chat-md-li">$1</li>')
    .replace(/(<li class="chat-md-li">.*<\/li>\n?)+/g, m => `<ul class="chat-md-ul">${m}</ul>`)
    .replace(/^(\d+)\. (.+)$/gm, '<li class="chat-md-oli">$2</li>')
    .replace(/(<li class="chat-md-oli">.*<\/li>\n?)+/g, m => `<ol class="chat-md-ol">${m}</ol>`)
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\n/g, "<br/>");
  return html;
};
