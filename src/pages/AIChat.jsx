import { useState, useRef, useEffect } from "react";
import React from "react";
import { useAICoach, fmt, isUsingMock } from "../utils/helpers";

const Card = ({ children, style, className = "" }) => (
  <div className={`glass ${className}`} style={{ padding: "20px", ...style }}>{children}</div>
);

const AIChat = ({ state }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! I'm your AI fitness coach. Ask me anything about training, form, nutrition, or recovery." }
  ]);
  const [input, setInput] = useState("");
  const { ask, loading } = useAICoach();
  const endRef = useRef(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const send = async () => {
    if (!input.trim()) return;
    setMessages(p => [...p, { role: "user", content: input.trim() }]);
    setInput("");

    const rec = state.recovery.slice(-3);
    const recentWorkouts = state.workouts.slice(-5).map(w => `${w.date}: ${w.exercises?.map(e => `${e.name}(${e.sets.filter(s => s.completed).length} sets)`).join(", ")}`);
    const context = `Profile: ${JSON.stringify(state.profile)}. Recent recovery: ${JSON.stringify(rec)}. Recent workouts: ${recentWorkouts.join(" | ")}. Goal: ${state.profile.goal || "muscle building"}.`;

    const reply = await ask(
      "You are an expert fitness coach with deep knowledge of exercise science, nutrition, and recovery. Give specific, actionable advice. Be concise but thorough. Max 150 words. Use plain text, no markdown.",
      `${context}\n\nUser: ${input.trim()}`
    );
    if (reply) setMessages(p => [...p, { role: "assistant", content: reply }]);
  };

  const suggestions = ["How should I warm up for leg day?", "What's the best way to progress on bench press?", "How much protein do I need?", "Should I do cardio on rest days?", "How do I fix my squat form?", "What should I eat post-workout?"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>AI Coach</h2>
        <span style={{
          fontSize: 10, padding: "2px 8px", borderRadius: 10,
          background: isUsingMock() ? "rgba(255,180,0,0.15)" : "rgba(34,197,94,0.15)",
          color: isUsingMock() ? "#FFB400" : "#22C55E",
          border: `1px solid ${isUsingMock() ? "rgba(255,180,0,0.3)" : "rgba(34,197,94,0.3)"}`,
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          {isUsingMock() ? "Mock Mode" : "Claude"}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12, paddingRight: 4 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%",
              background: m.role === "user" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${m.role === "user" ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.06)"}`,
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              padding: "12px 16px",
            }}>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "#FFFFFF", margin: 0 }}>{m.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px 16px 16px 4px", padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 4 }}>
                <span style={{ width: 6, height: 6, background: COLORS.primary, borderRadius: "50%", animation: "pulse 1s infinite" }} />
                <span style={{ width: 6, height: 6, background: COLORS.primary, borderRadius: "50%", animation: "pulse 1s infinite 0.2s" }} />
                <span style={{ width: 6, height: 6, background: COLORS.primary, borderRadius: "50%", animation: "pulse 1s infinite 0.4s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length < 3 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#A0A0A0", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Try asking</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {suggestions.map((s, i) => (
              <button key={i} className="ghost-btn" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => { setInput(s); }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything about training, form, nutrition..."
          style={{ flex: 1 }} />
        <button className="neon-btn" onClick={send} disabled={loading || !input.trim()} style={{ whiteSpace: "nowrap" }}>
          {loading ? "..." : "Send →"}
        </button>
      </div>
    </div>
  );
};

export default AIChat;
