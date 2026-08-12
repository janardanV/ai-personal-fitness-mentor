import { useState, useRef, useEffect } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAICoach, isUsingMock, GOAL_LABELS, calcStreak } from "../utils/helpers";
import {
  Bot, Send, Sparkles, Dumbbell, Target, Salad, Moon, Shield, Flame, Zap,
} from "lucide-react";

const CAPABILITIES = [
  { icon: Dumbbell, label: "Training", tip: "Programming, volume & progression", prompt: "How should I plan my next training week?", accent: "lime" },
  { icon: Target, label: "Form", tip: "Technique cues & exercise selection", prompt: "What are the most common squat form mistakes and how do I fix them?", accent: "blue" },
  { icon: Salad, label: "Nutrition", tip: "Meals, macros & pre-workout fuel", prompt: "What should I eat around my workouts to reach my protein target?", accent: "orange" },
  { icon: Moon, label: "Recovery", tip: "Sleep, stress & readiness", prompt: "My recovery score is low — what should I change today?", accent: "purple" },
];

const AIChat = ({ state, dispatch }) => {
  const { profile = {}, workouts = [], recovery = [], aiConversations = [] } = state || {};
  const [messages, setMessages] = useState(() =>
    Array.isArray(aiConversations) && aiConversations.length
      ? aiConversations
      : [{ role: "assistant", content: "Hey! I'm your AI fitness coach. I've reviewed your training logs and goals — ask me anything about training, form, nutrition, or recovery." }]
  );
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  const [input, setInput] = useState("");
  const { ask, loading } = useAICoach();
  const endRef = useRef(null);

  const commit = (next) => {
    messagesRef.current = next;
    setMessages(next);
    dispatch({ type: "SET_AI_CONVERSATIONS", payload: next });
  };

  const streak = calcStreak(workouts);
  const goal = profile.goal;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    const userMsg = { role: "user", content: q };
    commit([...messagesRef.current, userMsg]);
    setInput("");

    const rec = recovery.slice(-3);
    const recentWorkouts = workouts.slice(-5).map(w => `${w.date}: ${w.exercises?.map(e => `${e.name}(${e.sets.filter(s => s.completed).length} sets)`).join(", ")}`);
    const context = `Profile: ${JSON.stringify(profile)}. Recent recovery: ${JSON.stringify(rec)}. Recent workouts: ${recentWorkouts.join(" | ")}. Goal: ${goal || "muscle building"}.`;

    const reply = await ask(
      "You are an expert fitness coach with deep knowledge of exercise science, nutrition, and recovery. Give specific, actionable advice. Be concise but thorough. Max 150 words. Use plain text, no markdown.",
      `${context}\n\nUser: ${q}`
    );
    if (reply) commit([...messagesRef.current, { role: "assistant", content: reply }]);
  };

  const suggestions = ["How should I warm up for leg day?", "What's the best way to progress on bench press?", "How much protein do I need?", "Should I do cardio on rest days?", "How do I fix my squat form?", "What should I eat post-workout?"];
  const isNew = messages.length <= 1;

  return (
    <div className="rd-page" style={{ height: "calc(100vh - 132px)", maxHeight: "780px", gap: 14 }}>
      <motion.div className="rd-coach-hero"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <div style={{ minWidth: 0 }}>
          <span className="rd-kicker purple"><Sparkles size={13} /> AI Coach</span>
          <h1 className="rd-title" style={{ marginTop: 12 }}>Your Personal Coach</h1>
          <p className="rd-sub" style={{ maxWidth: 520 }}>Ask anything about training, form, nutrition, or recovery — your coach is trained on your logs and goals.</p>
          <div className="rd-coach-context">
            {goal && (
              <span className="rd-pill"><Target size={13} />Goal: <b>{GOAL_LABELS[goal] || goal.replace(/_/g, " ")}</b></span>
            )}
            {streak >= 2 && (
              <span className="rd-pill"><Flame size={13} /><b>{streak}</b>-day streak</span>
            )}
            <span className="rd-pill purple"><Zap size={13} />Trained on your data</span>
          </div>
        </div>
        <span style={{
          alignSelf: "center",
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 10, padding: "6px 13px", borderRadius: 999, whiteSpace: "nowrap",
          background: isUsingMock() ? "rgba(255,180,0,0.12)" : "rgba(0,200,80,0.12)",
          color: isUsingMock() ? "#FFB400" : "#00C850",
          border: `1px solid ${isUsingMock() ? "rgba(255,180,0,0.28)" : "rgba(0,200,80,0.28)"}`,
          textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", boxShadow: "0 0 8px currentColor" }} />
          {isUsingMock() ? "Mock Mode" : "Live Model"}
        </span>
      </motion.div>

      <div className="rd-chat">
        <div className="rd-chat-head">
          <div className="rd-msg-avatar"><Bot size={16} /></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>AI Coach</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              <span className="rd-chat-status" /> Online · knows {workouts.length} workouts & {recovery.length} recovery logs
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: 10, color: "rgba(156,163,175,0.5)", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700 }}>v2 · Context-aware</span>
          </div>
        </div>

        <div className="rd-chat-body">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div key={i} className={`rd-msg ${m.role === "user" ? "user" : "ai"}`}
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                {m.role === "assistant" && (
                  <div className="rd-msg-avatar"><Bot size={15} /></div>
                )}
                <div className="rd-msg-bubble">{m.content}</div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="rd-msg ai">
              <div className="rd-msg-avatar"><Bot size={15} /></div>
              <div className="rd-typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          {isNew && !loading && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
              <div className="rd-cap-label"><Sparkles size={11} style={{ color: "#8B5CF6" }} />What can I help with?</div>
              <div className="rd-cap-grid">
                {CAPABILITIES.map(c => {
                  const Icon = c.icon;
                  return (
                    <button key={c.label} className="rd-cap-card" onClick={() => send(c.prompt)}
                      role="button" tabIndex={0}
                      onKeyDown={e => { if (e.key === "Enter") send(c.prompt); }}>
                      <span className={`rd-cap-ico ${c.accent}`}><Icon size={16} /></span>
                      <span style={{ minWidth: 0 }}>
                        <span className="rd-cap-name" style={{ display: "block" }}>{c.label}</span>
                        <span className="rd-cap-tip" style={{ display: "block" }}>{c.tip}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        <div className="rd-chat-foot">
          {isNew && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700 }}>Try asking</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {suggestions.map((s, i) => (
                  <button key={i} className="rd-chip" style={{ fontSize: 11, padding: "7px 13px" }} onClick={() => setInput(s)} tabIndex={0}>{s}</button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <div className="rd-search" style={{ flex: 1 }}>
              <Sparkles size={15} style={{ color: "#8B5CF6" }} />
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything about training, form, nutrition..." aria-label="Message your AI coach" />
            </div>
            <button className="rd-btn-primary" onClick={() => send()} disabled={loading || !input.trim()} style={{ height: 46, padding: "0 20px", flexShrink: 0, opacity: loading || !input.trim() ? 0.5 : 1 }} aria-label="Send message">
              {loading ? <span className="rd-typing" style={{ padding: 0, background: "none", border: "none" }}><span /><span /><span /></span> : <><Send size={15} /> Send</>}
            </button>
          </div>
          <div className="rd-coach-note">
            <Shield size={11} />
            AI Coach can make mistakes — verify important health or medical advice before acting on it.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
