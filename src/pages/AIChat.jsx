import { useState, useRef, useEffect } from "react";
import React from "react";
import { useAICoach, isUsingMock } from "../utils/helpers";
import { Bot, Send, Sparkles } from "lucide-react";

const AIChat = ({ state }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! I'm your AI fitness coach. Ask me anything about training, form, nutrition, or recovery." }
  ]);
  const [input, setInput] = useState("");
  const { ask, loading } = useAICoach();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
    <div className="rd-page" style={{ height: "calc(100vh - 140px)", maxHeight: "760px", gap: 0 }}>
      <div className="rd-page-head" style={{ marginBottom: 16 }}>
        <div>
          <span className="rd-kicker" style={{ background: "rgba(167,139,250,0.1)", borderColor: "rgba(167,139,250,0.25)", color: "#A78BFA" }}><Sparkles size={13} /> AI Coach</span>
          <h1 className="rd-title">Your Personal Coach</h1>
          <p className="rd-sub">Ask anything about training, form, nutrition, or recovery.</p>
        </div>
        <span style={{
          alignSelf: "center",
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 10, padding: "5px 12px", borderRadius: 999,
          background: isUsingMock() ? "rgba(255,180,0,0.12)" : "rgba(0,200,80,0.12)",
          color: isUsingMock() ? "#FFB400" : "#00C850",
          border: `1px solid ${isUsingMock() ? "rgba(255,180,0,0.28)" : "rgba(0,200,80,0.28)"}`,
          textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
          {isUsingMock() ? "Mock Mode" : "Claude"}
        </span>
      </div>

      <div className="rd-chat">
        <div className="rd-chat-head">
          <div className="rd-msg-avatar"><Bot size={16} /></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>AI Coach</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              <span className="rd-chat-status" /> Online · trained on your data
            </div>
          </div>
        </div>

        <div className="rd-chat-body">
          {messages.map((m, i) => (
            <div key={i} className={`rd-msg ${m.role === "user" ? "user" : "ai"}`}>
              {m.role === "assistant" && (
                <div className="rd-msg-avatar"><Bot size={15} /></div>
              )}
              <div className="rd-msg-bubble">{m.content}</div>
            </div>
          ))}

          {loading && (
            <div className="rd-msg ai">
              <div className="rd-msg-avatar"><Bot size={15} /></div>
              <div className="rd-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="rd-chat-foot">
          {messages.length < 3 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700 }}>Try asking</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {suggestions.map((s, i) => (
                  <button key={i} className="rd-chip" style={{ fontSize: 11, padding: "7px 13px" }} onClick={() => { setInput(s); }}>{s}</button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <div className="rd-search" style={{ flex: 1 }}>
              <Sparkles size={15} style={{ color: "#A78BFA" }} />
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything about training, form, nutrition..." />
            </div>
            <button className="rd-btn-primary" onClick={send} disabled={loading || !input.trim()} style={{ height: 46, padding: "0 20px", flexShrink: 0, opacity: loading || !input.trim() ? 0.5 : 1 }}>
              {loading ? <span className="rd-typing" style={{ padding: 0, background: "none", border: "none" }}><span /><span /><span /></span> : <><Send size={15} /> Send</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
