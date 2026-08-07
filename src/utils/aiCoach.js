import { useEffect, useState, useCallback } from "react";
import React from "react";
import { MOCK_COACHING, MOCK_DELAY, pick } from "./constants";
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
