import { useEffect } from "react";

export const G_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  :root {
    --bg: #0B0F14;
    --surface: rgba(20,26,34,0.92);
    --surface-solid: #141A22;
    --surface-glass: rgba(20,26,34,0.72);
    --surface-2: rgba(28,36,48,0.90);
    --elev: #1C2430;
    --glass: rgba(255,255,255,0.06);
    --glass-border: rgba(255,255,255,0.10);
    --blur: 18px;
    --card: rgba(20,26,34,0.92);
    --card-2: rgba(28,36,48,0.90);
    --line: rgba(255,255,255,0.08);
    --line-strong: rgba(255,255,255,0.14);
    --text: #F8FAFC;
    --muted: #A7B1C2;
    --muted-2: #6B7280;
    --faint: rgba(167,177,194,0.45);
    --accent: #C8FF32;
    --accent-hi: #D9FF66;
    --accent-soft: rgba(200,255,50,0.09);
    --accent-line: rgba(200,255,50,0.22);
    --blue: #5AC8FA;
    --blue-soft: rgba(90,200,250,0.10);
    --purple: #8B5CF6;
    --purple-soft: rgba(139,92,246,0.10);
    --orange: #FF9F0A;
    --orange-soft: rgba(255,159,10,0.10);
    --red: #FF5A5F;
    --red-soft: rgba(255,90,95,0.10);
    --green: #C8FF32;
    --radius: 22px;
    --ease: cubic-bezier(0.22, 1, 0.36, 1);
    --shadow-card: 0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 60px rgba(0,0,0,0.45);
    --shadow-hover: 0 1px 0 rgba(255,255,255,0.05) inset, 0 34px 90px rgba(0,0,0,0.55);
    --shadow-pop: 0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
    --font: 'Inter', sans-serif;
    --mono: 'JetBrains Mono', monospace;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-text-size-adjust: 100%; }
  body, #root { min-height: 100vh; font-family: var(--font); background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
  body::before { content: ''; position: fixed; inset: 0; z-index: -1; pointer-events: none;
    background:
      radial-gradient(900px 480px at 86% -8%, rgba(200,255,50,0.045) 0%, transparent 62%),
      radial-gradient(1000px 560px at -10% 26%, rgba(90,200,250,0.04) 0%, transparent 60%),
      radial-gradient(920px 700px at 52% 114%, rgba(139,92,246,0.04) 0%, transparent 62%);
  }
  ::selection { background: rgba(200,255,50,0.20); color: #FFFFFF; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(167,177,194,0.22); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(167,177,194,0.4); }

  input, select, textarea { background: rgba(13,17,23,0.9); border: 1px solid rgba(255,255,255,0.09); border-radius: 12px; color: var(--text); padding: 11px 14px; font-family: var(--font); font-size: 14px; outline: none; transition: border-color 0.18s var(--ease), box-shadow 0.18s var(--ease), background 0.18s var(--ease); width: 100%; }
  input:hover, select:hover, textarea:hover { border-color: rgba(255,255,255,0.14); }
  input:focus, select:focus, textarea:focus { border-color: rgba(200,255,50,0.45); box-shadow: 0 0 0 3px rgba(200,255,50,0.08); background: rgba(16,22,30,0.95); }
  input[type=range] { padding: 0; height: 6px; cursor: pointer; accent-color: var(--accent); }
  select option { background: var(--surface-2); color: var(--text); }
  button { font-family: var(--font); cursor: pointer; border: none; outline: none; }
  :focus-visible { outline: 2px solid rgba(200,255,50,0.5); outline-offset: 2px; border-radius: 8px; }
  button:focus-visible { outline: 2px solid rgba(200,255,50,0.5); outline-offset: 2px; }

  .glass { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); border-radius: 16px; backdrop-filter: blur(18px); }
  .glass-sm { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; }
  .glow { box-shadow: 0 0 34px rgba(200,255,50,0.12); }
  .neon { background: linear-gradient(120deg, var(--accent-hi), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .neon-btn { background: var(--accent); color: #0B0F14; border-radius: 14px; padding: 11px 22px; font-weight: 700; font-size: 14px; letter-spacing: 0.01em; transition: all 0.18s var(--ease); box-shadow: 0 10px 28px rgba(200,255,50,0.18); }
  .neon-btn:hover { background: var(--accent-hi); transform: translateY(-1px); box-shadow: 0 14px 36px rgba(200,255,50,0.28); }
  .neon-btn:active { transform: scale(0.98); }
  .ghost-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.10); color: var(--muted); border-radius: 12px; padding: 8px 16px; font-size: 13px; transition: all 0.16s var(--ease); }
  .ghost-btn:hover { background: rgba(255,255,255,0.08); color: var(--text); border-color: rgba(255,255,255,0.16); }
  .tab-btn { background: none; color: var(--muted); padding: 8px 16px; font-size: 13px; font-weight: 500; border-radius: 10px; transition: all 0.16s var(--ease); }
  .tab-btn:hover { color: var(--text); background: rgba(255,255,255,0.05); }
  .tab-btn.active { background: var(--accent-soft); color: var(--accent); }
  .mono { font-family: var(--mono); }
  .badge-card { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px; border-radius: 14px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), var(--surface); border: 1px solid rgba(255,255,255,0.07); text-align: center; font-size: 11px; color: var(--muted); }
  .badge-card.earned { border-color: var(--accent-line); background: var(--accent-soft); color: var(--accent); }

  @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes fadeInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
  @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-16px) rotate(2deg); } }
  @keyframes float2 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(-1.5deg); } }
  @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
  @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes ripple { to { transform: scale(4); opacity: 0; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes stepComplete { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
  @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 18px rgba(200,255,50,0.10); } 50% { box-shadow: 0 0 34px rgba(200,255,50,0.20); } }

  /* â•â•â• ONBOARDING / AUTH â•â•â• */
  .onb-split { min-height: 100vh; display: flex; position: relative; overflow: hidden; }
  .onb-hero { position: relative; overflow: hidden; background: linear-gradient(150deg, #0B0F14 0%, #10151D 45%, #141B26 100%); }
  .onb-card-side { position: relative; display: flex; align-items: center; justify-content: center; padding: 48px 40px; background: var(--bg); border-left: 1px solid rgba(255,255,255,0.06); }

  .onb-input-wrap { position: relative; margin-bottom: 20px; }
  .onb-input-wrap .onb-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 16px; pointer-events: none; transition: color 0.18s var(--ease); z-index: 1; display: flex; }
  .onb-input-wrap input, .onb-input-wrap select { padding: 16px 16px 16px 46px !important; border-radius: 14px !important; font-size: 15px !important; background: rgba(13,17,23,0.9) !important; border: 1px solid rgba(255,255,255,0.09) !important; transition: all 0.18s var(--ease) !important; height: 52px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.03); }
  .onb-input-wrap input:hover, .onb-input-wrap select:hover { border-color: rgba(255,255,255,0.15) !important; }
  .onb-input-wrap input:focus, .onb-input-wrap select:focus { border-color: rgba(200,255,50,0.5) !important; background: rgba(16,22,30,0.95) !important; box-shadow: 0 0 0 3px rgba(200,255,50,0.08) !important; }
  .onb-input-wrap input:focus ~ .onb-icon, .onb-input-wrap select:focus ~ .onb-icon { color: var(--accent); }
  .onb-input-wrap input::placeholder { color: rgba(156,163,175,0.35); }
  .onb-input-wrap label.onb-float { position: absolute; left: 46px; top: 50%; transform: translateY(-50%); color: rgba(156,163,175,0.6); font-size: 15px; pointer-events: none; transition: all 0.18s var(--ease); background: transparent; padding: 0 4px; z-index: 2; }
  .onb-input-wrap input:focus ~ label.onb-float,
  .onb-input-wrap input:not(:placeholder-shown) ~ label.onb-float,
  .onb-input-wrap select:focus ~ label.onb-float,
  .onb-input-wrap select ~ label.onb-float { top: -8px; left: 38px; font-size: 11px; color: var(--accent); background: var(--bg); letter-spacing: 0.03em; font-weight: 600; padding: 0 6px; }
  .onb-input-wrap select option { background: var(--surface-2); padding: 10px; }

  .onb-grad-btn { position: relative; overflow: hidden; background: var(--accent); color: #0B0F14; border-radius: 14px; padding: 16px 32px; font-weight: 800; font-size: 15px; letter-spacing: 0.01em; transition: all 0.18s var(--ease); border: none; cursor: pointer; width: 100%; box-shadow: 0 10px 30px rgba(200,255,50,0.16); }
  .onb-grad-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 44px rgba(200,255,50,0.26); background: var(--accent-hi); }
  .onb-grad-btn:active { transform: translateY(0) scale(0.98); }
  .onb-grad-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; background: var(--muted); color: #0B0F14; }
  .onb-grad-btn .btn-ripple { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.25); width: 20px; height: 20px; margin-top: -10px; margin-left: -10px; animation: ripple 0.5s linear; pointer-events: none; }

  .onb-back-btn { background: var(--surface-2); border: 1px solid rgba(255,255,255,0.09); color: var(--muted); border-radius: 12px; padding: 14px 20px; font-size: 14px; font-weight: 500; transition: all 0.16s var(--ease); cursor: pointer; }
  .onb-back-btn:hover { background: rgba(255,255,255,0.07); color: var(--text); border-color: rgba(255,255,255,0.16); }

  .onb-goal-btn { padding: 14px 16px; border-radius: 14px; font-size: 13px; font-weight: 500; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), var(--surface); border: 1px solid rgba(255,255,255,0.07); color: var(--muted); transition: all 0.16s var(--ease); text-align: left; cursor: pointer; display: flex; align-items: center; gap: 10px; }
  .onb-goal-btn:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.15); color: var(--text); }
  .onb-goal-btn.selected { background: var(--accent-soft); border-color: var(--accent-line); color: var(--accent); box-shadow: 0 0 24px rgba(200,255,50,0.08); }
  .onb-goal-btn .goal-check { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(156,163,175,0.28); display: flex; align-items: center; justify-content: center; transition: all 0.18s var(--ease); flex-shrink: 0; color: #0B0F14; }
  .onb-goal-btn.selected .goal-check { border-color: var(--accent); background: var(--accent); }

  .onb-feature-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; transition: all 0.18s var(--ease); backdrop-filter: blur(12px); }
  .onb-feature-card:hover { background: rgba(30,36,46,0.85); border-color: rgba(255,255,255,0.14); transform: translateY(-2px); box-shadow: 0 14px 36px rgba(0,0,0,0.35); }
  .onb-feature-card .feat-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 12px; }
  .onb-feature-card h4 { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
  .onb-feature-card p { font-size: 12px; color: var(--muted); line-height: 1.5; }

  .onb-brand { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 44px; }
  .onb-brand-tile { width: 42px; height: 42px; border-radius: 13px; background: var(--accent); color: #0B0F14; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 26px rgba(200,255,50,0.24); }
  .onb-brand-name { font-size: 16px; font-weight: 800; color: var(--text); letter-spacing: -0.02em; line-height: 1.1; }
  .onb-brand-tag { font-size: 10px; font-weight: 700; color: var(--accent); letter-spacing: 0.14em; text-transform: uppercase; margin-top: 2px; }
  .onb-kicker { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 999px; background: var(--accent-soft); border: 1px solid var(--accent-line); color: var(--accent); font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 28px; }
  .onb-kicker svg { color: var(--accent); }
  .onb-hero-sub { font-size: 17px; color: var(--muted); line-height: 1.6; margin-bottom: 44px; max-width: 440px; font-weight: 400; }
  .onb-feature-icon { background: var(--accent-soft); border: 1px solid var(--accent-line); color: var(--accent); }

  .onb-eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--muted); cursor: pointer; z-index: 2; padding: 6px; display: flex; align-items: center; justify-content: center; transition: color 0.15s; }
  .onb-eye-btn:hover { color: var(--text); }

  .auth-logo { width: 56px; height: 56px; border-radius: 16px; margin: 0 auto 16px; background: var(--accent-soft); border: 1px solid var(--accent-line); display: flex; align-items: center; justify-content: center; color: var(--accent); animation: glowPulse 3s ease infinite; }
  .auth-error { padding: 12px 16px; border-radius: 12px; margin-bottom: 20px; background: var(--red-soft); border: 1px solid rgba(255,90,95,0.22); color: var(--red); font-size: 13px; font-weight: 500; animation: fadeIn 0.2s ease; }
  .auth-success { padding: 16px; border-radius: 12px; margin-bottom: 24px; background: rgba(200,255,50,0.08); border: 1px solid rgba(200,255,50,0.2); text-align: center; }
  .auth-divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; }
  .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
  .auth-divider span { font-size: 12px; color: var(--muted); font-weight: 500; }
  .btn-google { width: 100%; padding: 13px 20px; border-radius: 14px; font-size: 14px; font-weight: 600; background: var(--surface-2); border: 1px solid rgba(255,255,255,0.10); color: var(--text); cursor: pointer; transition: all 0.16s var(--ease); display: flex; align-items: center; justify-content: center; gap: 10px; font-family: var(--font); }
  .btn-google:hover { background: var(--card-2); border-color: rgba(255,255,255,0.18); }
  .btn-google:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-loading { display: inline-flex; align-items: center; gap: 8px; justify-content: center; }
  .spin { animation: spin 0.8s linear infinite; }

  @media (max-width: 900px) {
    .onb-split { flex-direction: column; }
    .onb-hero { padding: 40px 24px 32px !important; text-align: center; max-width: 100% !important; }
    .onb-hero h1 { font-size: 28px !important; }
    .onb-hero .feat-grid { grid-template-columns: 1fr !important; }
    .onb-card-side { padding: 16px !important; border-left: none; border-top: 1px solid rgba(255,255,255,0.06); max-width: 100% !important; }
  }
  @media (max-width: 480px) {
    .onb-hero h1 { font-size: 24px !important; }
    .onb-hero .onb-subtitle { font-size: 14px !important; }
  }

  .dash-header { position: relative; overflow: hidden; border-radius: 22px; padding: 30px 34px; background: radial-gradient(680px 320px at 88% -20%, rgba(200,255,50,0.07) 0%, transparent 60%), radial-gradient(520px 280px at -8% 115%, rgba(90,200,250,0.05) 0%, transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%), var(--surface-2); border: 1px solid rgba(255,255,255,0.10); box-shadow: var(--shadow-card); }
  .dash-header::before { content: ''; position: absolute; top: -50%; right: -10%; width: 320px; height: 320px; background: radial-gradient(circle, rgba(200,255,50,0.06) 0%, transparent 70%); pointer-events: none; }
  .dash-header::after { content: ''; position: absolute; bottom: -40%; left: 20%; width: 220px; height: 220px; background: radial-gradient(circle, rgba(90,200,250,0.05) 0%, transparent 70%); pointer-events: none; }

  .dash-metric { position: relative; background: linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.012) 100%), var(--surface); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 20px; transition: transform 0.18s var(--ease), box-shadow 0.18s var(--ease), border-color 0.18s var(--ease); overflow: hidden; cursor: default; }
  .dash-metric::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); opacity: 0; transition: opacity 0.2s; }
  .dash-metric:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.13); box-shadow: var(--shadow-hover); }
  .dash-metric:hover::before { opacity: 1; }

  .dash-quick { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 14px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), var(--surface); border: 1px solid rgba(255,255,255,0.08); transition: all 0.16s var(--ease); cursor: pointer; }
  .dash-quick:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.14); transform: translateY(-1px); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
  .dash-quick:active { transform: translateY(0) scale(0.98); }
  .dash-quick .q-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }

  .dash-progress { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.06); overflow: hidden; position: relative; }
  .dash-progress-fill { height: 100%; border-radius: 3px; transition: width 0.6s var(--ease); position: relative; background: linear-gradient(90deg, rgba(200,255,50,0.7), var(--accent)); }
  .dash-progress-fill::after { content: ''; position: absolute; top: 0; right: 0; width: 20px; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3)); border-radius: 0 3px 3px 0; }

  .dash-section-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .dash-section-title .st-dot { width: 4px; height: 18px; border-radius: 2px; background: var(--accent); }

  .dash-ai-card { position: relative; background: radial-gradient(560px 320px at 92% -10%, rgba(139,92,246,0.08) 0%, transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.01) 100%), var(--surface); border: 1px solid rgba(255,255,255,0.09); border-radius: 22px; padding: 28px; overflow: hidden; }
  .dash-ai-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,255,50,0.3), transparent); }
  .dash-ai-card::after { content: ''; position: absolute; top: -60%; right: -20%; width: 320px; height: 320px; background: radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 60%); pointer-events: none; }

  .dash-badge { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 12px; border-radius: 14px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), var(--surface); border: 1px solid rgba(255,255,255,0.06); transition: all 0.18s var(--ease); text-align: center; }
  .dash-badge:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,0,0,0.3); }
  .dash-badge.earned { border-color: var(--accent-line); background: var(--accent-soft); }
  .dash-badge .badge-glow { position: absolute; inset: 0; border-radius: 14px; background: radial-gradient(circle at center, rgba(200,255,50,0.08), transparent 70%); opacity: 0; transition: opacity 0.2s; }
  .dash-badge.earned .badge-glow { opacity: 1; }

  .dash-timeline-item { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .dash-timeline-item:last-child { border-bottom: none; }
  .dash-timeline-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  .dash-sidebar-group { margin-bottom: 18px; }
  .dash-sidebar-label { font-size: 9.5px; font-weight: 700; color: var(--muted-2); text-transform: uppercase; letter-spacing: 0.16em; padding: 0 14px; margin-bottom: 8px; }
  .dash-sidebar-btn { position: relative; display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 13px; border-radius: 12px; background: transparent; border: 1px solid transparent; color: var(--muted); font-size: 13px; font-weight: 500; transition: color 0.18s var(--ease), transform 0.18s var(--ease); cursor: pointer; text-align: left; }
  .dash-sidebar-btn > svg, .dash-sidebar-btn > span { position: relative; z-index: 1; }
  .dash-sidebar-btn .nav-pill { position: absolute; inset: 0; border-radius: 12px; background: linear-gradient(180deg, rgba(200,255,50,0.14) 0%, rgba(200,255,50,0.04) 100%); border: 1px solid rgba(200,255,50,0.20); box-shadow: 0 10px 26px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08); opacity: 0; transform: scale(0.94); transition: opacity 0.2s var(--ease), transform 0.2s var(--ease); pointer-events: none; }
  .dash-sidebar-btn .nav-accent { position: absolute; left: 0; top: 9px; bottom: 9px; width: 3px; border-radius: 2px; background: var(--accent); box-shadow: 0 0 14px rgba(200,255,50,0.7); opacity: 0; transition: opacity 0.2s var(--ease); }
  .dash-sidebar-btn:hover { color: var(--text); transform: translateX(2px); }
  .dash-sidebar-btn:hover .nav-pill { opacity: 0.5; transform: scale(1); }
  .dash-sidebar-btn.active { color: var(--accent); }
  .dash-sidebar-btn.active .nav-pill { opacity: 1; transform: scale(1); }
  .dash-sidebar-btn.active .nav-accent { opacity: 1; }
  .dash-sidebar-btn .nav-icon { width: 20px; text-align: center; font-size: 15px; flex-shrink: 0; }

  .dash-recovery-bar { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
  .dash-recovery-label { font-size: 12px; color: var(--muted); width: 70px; flex-shrink: 0; }
  .dash-recovery-track { flex: 1; height: 8px; border-radius: 4px; background: rgba(255,255,255,0.06); overflow: hidden; }
  .dash-recovery-fill { height: 100%; border-radius: 4px; transition: width 0.6s var(--ease); }
  .dash-recovery-val { font-size: 12px; font-weight: 600; color: var(--text); width: 36px; text-align: right; font-family: var(--mono); }

  .dash-activity-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; position: relative; }
  .dash-activity-dot::after { content: ''; position: absolute; inset: -3px; border-radius: 50%; border: 1px solid; border-color: inherit; opacity: 0.3; }

  .dash-upcoming-card { background: linear-gradient(135deg, rgba(200,255,50,0.05) 0%, rgba(200,255,50,0.015) 100%), var(--surface); border: 1px solid rgba(200,255,50,0.12); border-radius: 16px; padding: 20px; position: relative; overflow: hidden; }
  .dash-upcoming-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,255,50,0.35), transparent); }

  .dash-dropdown { position: absolute; top: calc(100% + 8px); right: 0; min-width: 220px; background: rgba(20,26,34,0.96); border: 1px solid rgba(255,255,255,0.10); border-radius: 14px; padding: 6px; backdrop-filter: blur(22px); box-shadow: var(--shadow-pop); z-index: 100; }
  .dash-dropdown-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 10px; background: none; border: none; color: var(--muted); font-size: 13px; cursor: pointer; transition: all 0.15s; text-align: left; font-family: var(--font); }
  .dash-dropdown-item:hover { background: rgba(255,255,255,0.05); color: var(--text); }
  .dash-dropdown-item.danger:hover { background: var(--red-soft); color: var(--red); }
  .dash-dropdown-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 4px 8px; }

  .dash-notif-panel { position: absolute; top: calc(100% + 8px); right: 0; width: 360px; max-height: 420px; overflow-y: auto; background: rgba(20,26,34,0.96); border: 1px solid rgba(255,255,255,0.10); border-radius: 16px; padding: 8px; backdrop-filter: blur(22px); box-shadow: var(--shadow-pop); z-index: 100; }
  .dash-notif-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-radius: 10px; transition: background 0.15s; }
  .dash-notif-item:hover { background: rgba(255,255,255,0.03); }

  .dash-filter-btn { padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; background: var(--surface-2); border: 1px solid rgba(255,255,255,0.08); color: var(--muted); cursor: pointer; transition: all 0.16s var(--ease); font-family: var(--font); }
  .dash-filter-btn:hover { background: var(--card-2); color: var(--text); }
  .dash-filter-btn.active { background: var(--accent-soft); border-color: var(--accent-line); color: var(--accent); }

  .dash-clickable { cursor: pointer; transition: all 0.18s var(--ease); }
  .dash-clickable:hover { border-color: rgba(255,255,255,0.16) !important; }

  .dash-goal-indicator { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); transition: all 0.18s var(--ease); cursor: pointer; }
  .dash-goal-indicator:hover { border-color: rgba(255,255,255,0.14); }
  .dash-goal-indicator.met { border-color: rgba(200,255,50,0.3); background: rgba(200,255,50,0.05); }

  .dash-tip-chip { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px; background: rgba(200,255,50,0.05); border: 1px solid rgba(200,255,50,0.10); font-size: 12px; color: var(--muted); transition: all 0.16s var(--ease); cursor: default; font-family: var(--font); }
  .dash-tip-chip:hover { background: rgba(200,255,50,0.08); border-color: var(--accent-line); color: var(--text); }

  .dash-reminder { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); margin-bottom: 6px; transition: all 0.16s var(--ease); }
  .dash-reminder:hover { background: rgba(255,255,255,0.04); }

  .run-map-container { border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); min-height: 300px; position: relative; }
  .run-map-container .leaflet-container { background: var(--bg); }

  @keyframes runGlow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
  .run-glow { animation: runGlow 2s ease-in-out infinite; }

  .skeleton { position: relative; overflow: hidden; background: rgba(255,255,255,0.04); border-radius: 8px; }
  .skeleton::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%); animation: shimmer 1.5s ease-in-out infinite; }

  /* â•â•â• TOPBAR / ACCOUNT MENU â•â•â• */
  .topbar { position: sticky; top: 0; z-index: 40; display: flex; align-items: center; justify-content: space-between; padding: 12px 28px; background: rgba(11,15,20,0.72); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border-bottom: 1px solid rgba(255,255,255,0.06); min-height: 58px; }
  .topbar-title { font-size: 15px; font-weight: 700; color: var(--text); letter-spacing: -0.01em; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }

  .topbar-avatar { width: 36px; height: 36px; border-radius: 11px; background: linear-gradient(135deg, var(--accent), var(--green)); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #0B0F14; cursor: pointer; transition: all 0.16s var(--ease); border: 2px solid transparent; position: relative; box-shadow: 0 6px 20px rgba(200,255,50,0.22); }
  .topbar-avatar:hover { transform: translateY(-1px); box-shadow: 0 8px 26px rgba(200,255,50,0.3); }
  .topbar-avatar.open { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(200,255,50,0.14); }

  .account-menu { position: absolute; top: calc(100% + 10px); right: 0; min-width: 264px; background: rgba(20,26,34,0.96); border: 1px solid rgba(255,255,255,0.10); border-radius: 16px; padding: 8px; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); box-shadow: var(--shadow-pop); z-index: 9999; }
  .account-menu-header { padding: 14px 14px 12px; border-bottom: 1px solid rgba(255,255,255,0.07); margin-bottom: 4px; display: flex; align-items: center; gap: 12px; }
  .account-menu-header .avatar-lg { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, var(--accent), var(--green)); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: #0B0F14; flex-shrink: 0; }
  .account-menu-header .user-info { flex: 1; min-width: 0; }
  .account-menu-header .user-name { font-size: 14px; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .account-menu-header .user-meta { font-size: 12px; color: var(--muted); margin-top: 1px; }

  .account-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 10px; background: none; border: none; color: var(--muted); font-size: 13px; cursor: pointer; transition: all 0.15s; text-align: left; font-family: var(--font); }
  .account-menu-item:hover { background: rgba(255,255,255,0.05); color: var(--text); }
  .account-menu-item .menu-icon { width: 20px; text-align: center; font-size: 15px; flex-shrink: 0; }
  .account-menu-item .menu-label { flex: 1; }
  .account-menu-item .menu-shortcut { font-size: 11px; color: rgba(156,163,175,0.4); }

  .account-menu-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 4px 8px; }

  .account-menu-item.danger { color: var(--red); }
  .account-menu-item.danger:hover { background: var(--red-soft); color: var(--red); }

  .logout-modal-overlay { position: fixed; inset: 0; z-index: 10001; display: flex; align-items: center; justify-content: center; background: rgba(5,8,11,0.72); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding: 20px; }
  .logout-modal { background: linear-gradient(180deg, var(--surface-2), var(--surface)); border: 1px solid rgba(255,255,255,0.10); border-radius: 24px; padding: 36px 32px; max-width: 440px; width: 100%; text-align: center; box-shadow: var(--shadow-pop); }
  .logout-modal-icon { width: 56px; height: 56px; border-radius: 14px; background: var(--red-soft); border: 1px solid rgba(255,90,95,0.18); display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 20px; color: var(--red); }
  .logout-modal h3 { font-size: 20px; font-weight: 800; color: var(--text); margin-bottom: 12px; text-align: center; }
  .logout-modal p { font-size: 14px; color: var(--muted); line-height: 1.7; margin-bottom: 28px; text-align: center; word-wrap: break-word; overflow-wrap: break-word; }
  .logout-modal-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .logout-modal-actions .btn-cancel { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.10); color: var(--muted); border-radius: 12px; padding: 11px 24px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.16s var(--ease); font-family: var(--font); }
  .logout-modal-actions .btn-cancel:hover { background: rgba(255,255,255,0.07); color: var(--text); border-color: rgba(255,255,255,0.18); }
  .logout-modal-actions .btn-signout { background: var(--red-soft); border: 1px solid rgba(255,90,95,0.32); color: var(--red); border-radius: 12px; padding: 11px 24px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.16s var(--ease); font-family: var(--font); }
  .logout-modal-actions .btn-signout:hover { background: rgba(255,90,95,0.2); box-shadow: 0 4px 20px rgba(255,90,95,0.18); }

  @keyframes menuSlideDown { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .account-menu { animation: menuSlideDown 0.18s var(--ease); }

  @media (max-width: 768px) {
    .topbar { padding: 10px 16px; }
    .account-menu { min-width: 240px; right: -8px; }
  }

  /* â•â•â• CORE PAGE SHELL â•â•â• */
  .rd-page { display: flex; flex-direction: column; gap: 18px; }
  .rd-page-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
  .rd-page-head .rd-title { font-size: 32px; font-weight: 800; letter-spacing: -0.035em; color: var(--text); line-height: 1.15; }
  .rd-page-head .rd-sub { font-size: 13.5px; color: var(--muted); margin-top: 6px; }
  .rd-kicker { display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px; border-radius: 999px; background: var(--accent-soft); border: 1px solid var(--accent-line); color: var(--accent); font-size: 11px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; align-self: flex-start; }

  .rd-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
  .rd-greeting { font-size: 32px; font-weight: 800; letter-spacing: -0.035em; color: var(--text); line-height: 1.15; }
  .rd-greeting-name { color: var(--accent); }
  .rd-greeting-sub { font-size: 13px; color: var(--muted); margin-top: 6px; }
  .rd-pills { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
  .rd-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 13px; border-radius: 999px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); font-size: 12px; font-weight: 600; color: var(--muted); font-family: var(--font); }
  .rd-pill svg { color: var(--accent); }
  .rd-pill b { color: var(--text); font-weight: 700; }
  .rd-pill.blue svg { color: var(--blue); }
  .rd-pill.purple svg { color: var(--purple); }

  .rd-top-right { display: flex; align-items: center; gap: 10px; }
  .rd-date-pill { display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: 12px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), var(--surface); border: 1px solid rgba(255,255,255,0.07); color: var(--muted); font-size: 12px; font-weight: 500; white-space: nowrap; }
  .rd-date-pill svg { color: var(--faint); }
  .rd-icon-btn { position: relative; width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), var(--surface); border: 1px solid rgba(255,255,255,0.07); color: var(--muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.16s var(--ease); font-family: var(--font); }
  .rd-icon-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.14); background: var(--surface-2); }
  .rd-avatar { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, var(--accent), var(--green)); color: #0B0F14; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; cursor: pointer; border: none; transition: all 0.16s var(--ease); box-shadow: 0 6px 22px rgba(200,255,50,0.22); font-family: var(--font); }
  .rd-avatar:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(200,255,50,0.3); }

  .rd-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 18px; align-items: stretch; }
  .rd-grid > .rd-span-6 { grid-column: span 6; }
  .rd-grid > .rd-span-4 { grid-column: span 4; }
  .rd-grid > .rd-span-3 { grid-column: span 3; }
  .rd-grid > .rd-span-2 { grid-column: span 2; }
  .rd-grid > .rd-span-1 { grid-column: span 1; }

  .rd-card { background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%), var(--surface); border: 1px solid rgba(255,255,255,0.09); border-radius: var(--radius); padding: 24px; position: relative; box-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 60px rgba(0,0,0,0.45); overflow: hidden; }
  .rd-card-click { cursor: pointer; transition: transform 0.18s var(--ease), box-shadow 0.18s var(--ease), border-color 0.18s var(--ease); }
  .rd-card-click:hover { border-color: rgba(255,255,255,0.15); transform: translateY(-2px); box-shadow: var(--shadow-hover); }

  .rd-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 10px; }
  .rd-card-title { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .rd-card-title-ico { width: 34px; height: 34px; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: var(--muted); flex-shrink: 0; }
  .rd-card-title-ico.lime { background: var(--accent-soft); border-color: rgba(200,255,50,0.16); color: var(--accent); }
  .rd-card-title-ico.blue { background: var(--blue-soft); border-color: rgba(90,200,250,0.20); color: var(--blue); }
  .rd-card-title-ico.orange { background: var(--orange-soft); border-color: rgba(255,159,10,0.20); color: var(--orange); }
  .rd-card-title-ico.purple { background: var(--purple-soft); border-color: rgba(139,92,246,0.24); color: var(--purple); }
  .rd-card-kicker { font-size: 10px; font-weight: 700; letter-spacing: 0.11em; color: var(--muted-2); text-transform: uppercase; }
  .rd-card-name { font-size: 15px; font-weight: 700; color: var(--text); margin-top: 1px; }
  .rd-card-link { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: var(--accent); cursor: pointer; background: none; border: none; padding: 4px; white-space: nowrap; font-family: var(--font); }
  .rd-card-link:hover { text-decoration: underline; }

  /* Hero: Today's Workout */
  .rd-hero { background:
      radial-gradient(820px 420px at 90% -10%, rgba(200,255,50,0.10) 0%, transparent 55%),
      radial-gradient(560px 340px at 4% 112%, rgba(139,92,246,0.07) 0%, transparent 60%),
      radial-gradient(420px 260px at 60% 120%, rgba(90,200,250,0.05) 0%, transparent 62%),
      linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%),
      linear-gradient(180deg, #1B2330 0%, #11161D 100%);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 26px;
    padding: 34px;
    position: relative; overflow: hidden;
    box-shadow: 0 1px 0 rgba(255,255,255,0.06) inset, 0 28px 80px rgba(0,0,0,0.5);
  }
  .rd-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,255,50,0.45), transparent); }
  .rd-hero::after { content: ''; position: absolute; inset: 0; background: radial-gradient(600px 300px at 82% 120%, rgba(200,255,50,0.06), transparent 60%); pointer-events: none; }

  .rd-hero-grid { position: relative; display: grid; grid-template-columns: minmax(0, 1.12fr) minmax(300px, 0.88fr); gap: 34px; align-items: center; }
  .rd-hero-copy { display: flex; flex-direction: column; gap: 15px; min-width: 0; z-index: 1; }
  .rd-hero-title { font-size: 44px; font-weight: 800; letter-spacing: -0.045em; line-height: 1.05; color: var(--text); }
  .rd-hero-title .accent { color: var(--accent); }
  .rd-hero-date { font-size: 13px; color: var(--muted); }
  .rd-hero-sub { font-size: 14.5px; color: var(--muted); line-height: 1.6; }
  .rd-hero-sub b { color: var(--text); font-weight: 600; }
  .rd-hero-ai { display: flex; gap: 11px; align-items: flex-start; padding: 13px 16px; border-radius: 14px; background: rgba(139,92,246,0.09); border: 1px solid rgba(139,92,246,0.24); font-size: 12.5px; line-height: 1.6; color: rgba(248,250,252,0.88); }
  .rd-hero-ai svg { color: #B39DFB; margin-top: 2px; flex-shrink: 0; }
  .rd-hero-stats { display: flex; gap: 10px; flex-wrap: wrap; }
  .rd-hero-stat-chip { display: inline-flex; flex-direction: column; gap: 2px; padding: 10px 15px; border-radius: 13px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); min-width: 84px; }
  .rd-hero-stat-chip .c-v { font-size: 17px; font-weight: 800; color: var(--text); font-family: var(--mono); line-height: 1.1; }
  .rd-hero-stat-chip .c-v span { font-size: 11px; color: var(--muted); font-weight: 500; font-family: var(--font); }
  .rd-hero-stat-chip .c-l { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.09em; font-weight: 600; }
  .rd-hero-actions { display: flex; gap: 10px; flex-wrap: wrap; }

  .rd-hero-visual { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; min-height: 340px; z-index: 1; }
  .rd-body-wrap { position: relative; width: 100%; max-width: 252px; }
  .rd-body-wrap svg { width: 100%; height: auto; display: block; }
  .rd-body-active { filter: drop-shadow(0 0 10px rgba(200,255,50,0.5)); animation: musclePulse 3.2s ease-in-out infinite; }
  @keyframes musclePulse { 0%, 100% { filter: drop-shadow(0 0 7px rgba(200,255,50,0.32)); } 50% { filter: drop-shadow(0 0 16px rgba(200,255,50,0.6)); } }
  .rd-body-labels { display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; margin-top: 10px; }
  .rd-body-labels span { font-size: 9.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 9px; border-radius: 999px; background: var(--accent-soft); border: 1px solid rgba(200,255,50,0.18); color: var(--accent); }

  .rd-hero-readiness { position: relative; margin-top: -40px; width: calc(100% - 20px); max-width: 330px; display: flex; align-items: center; gap: 16px; padding: 14px 16px; border-radius: 18px; background: rgba(20,26,34,0.82); border: 1px solid rgba(255,255,255,0.10); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); box-shadow: 0 18px 48px rgba(0,0,0,0.45); }
  .rd-hero-readiness .rr-ring { position: relative; width: 76px; height: 76px; flex-shrink: 0; }
  .rd-hero-readiness .rr-ring svg { transform: rotate(-90deg); width: 100%; height: 100%; }
  .rd-hero-readiness .rr-ring .rr-bg { fill: none; stroke: rgba(255,255,255,0.08); }
  .rd-hero-readiness .rr-ring .rr-fg { fill: none; stroke-linecap: round; transition: stroke-dasharray 1.2s var(--ease); }
  .rd-hero-readiness .rr-ring .rr-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .rd-hero-readiness .rr-ring .rr-center b { font-size: 22px; font-weight: 800; font-family: var(--mono); line-height: 1; }
  .rd-hero-readiness .rr-ring .rr-center span { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }
  .rd-hero-readiness .rr-status { font-size: 13px; font-weight: 700; }
  .rd-hero-readiness .rr-status small { display: block; font-size: 10.5px; color: var(--muted); font-weight: 500; margin-top: 3px; }
  .rd-hero-readiness .rr-bars { display: flex; flex-direction: column; gap: 5px; margin-top: 10px; }
  .rd-hero-readiness .rr-bar-row { display: flex; align-items: center; gap: 8px; }
  .rd-hero-readiness .rr-bar-row .rr-l { font-size: 9px; color: var(--muted); width: 42px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
  .rd-hero-readiness .rr-bar { flex: 1; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.08); overflow: hidden; }
  .rd-hero-readiness .rr-bar i { display: block; height: 100%; border-radius: 2px; transition: width 1s var(--ease); }

  .rd-plan-panel { position: relative; width: calc(100% - 20px); max-width: 330px; display: flex; flex-direction: column; gap: 14px; padding: 18px; border-radius: 18px; background: rgba(20,26,34,0.82); border: 1px solid rgba(255,255,255,0.10); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); box-shadow: 0 18px 48px rgba(0,0,0,0.45); }
  .rd-plan-top { display: flex; align-items: center; gap: 14px; }
  .rd-ring { position: relative; width: 64px; height: 64px; flex-shrink: 0; }
  .rd-ring svg { transform: rotate(-90deg); width: 100%; height: 100%; }
  .rd-ring .rr-bg { fill: none; stroke: rgba(255,255,255,0.08); }
  .rd-ring .rr-fg { fill: none; stroke-linecap: round; transition: stroke-dasharray 1.2s var(--ease); }
  .rd-ring .rd-ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .rd-ring .rd-ring-center b { font-size: 16px; font-weight: 800; font-family: var(--mono); line-height: 1; color: var(--text); }
  .rd-ring .rd-ring-center span { font-size: 8px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }
  .rd-plan-kicker { font-size: 10px; font-weight: 800; letter-spacing: 0.13em; color: rgba(156,163,175,0.5); text-transform: uppercase; }
  .rd-plan-name { font-size: 17px; font-weight: 800; color: var(--text); margin-top: 3px; line-height: 1.2; }
  .rd-plan-meta { font-size: 11.5px; color: var(--muted); margin-top: 4px; }
  .rd-plan-tags { display: flex; flex-wrap: wrap; gap: 5px; }
  .rd-plan-cta { display: flex; gap: 8px; margin-top: auto; }

  .rd-ring-big { position: relative; width: 200px; height: 200px; flex-shrink: 0; }
  .rd-ring-big svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .rd-ring-big .rr-bg { fill: none; stroke: rgba(255,255,255,0.06); }
  .rd-ring-big .rr-fg { fill: none; stroke-linecap: round; transition: stroke-dasharray 1.3s var(--ease), stroke 0.6s ease; }
  .rd-ring-big-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .rd-ring-big-score { font-size: 44px; font-weight: 800; font-family: var(--mono); line-height: 1; letter-spacing: -0.03em; }
  .rd-ring-big-label { font-size: 10px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-top: 6px; }
  .rd-ring-big-status { font-size: 12px; font-weight: 700; margin-top: 8px; }
  .rd-rec-bars { display: flex; flex-direction: column; gap: 9px; width: 100%; max-width: 260px; margin-top: 22px; }
  .rd-rec-row { display: flex; align-items: center; gap: 10px; }
  .rd-rec-row .rr-l { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.07em; font-weight: 700; width: 62px; flex-shrink: 0; }
  .rd-rec-row .rr-bar { flex: 1; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.07); overflow: hidden; }
  .rd-rec-row .rr-bar i { display: block; height: 100%; border-radius: 3px; transition: width 1s var(--ease); }
  .rd-rec-row .rd-rec-val { font-size: 11px; font-family: var(--mono); color: var(--text); width: 44px; text-align: right; flex-shrink: 0; }
  .rd-ai-tips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
  .rd-ai-tips span { font-size: 10.5px; font-weight: 600; padding: 6px 11px; border-radius: 999px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: var(--muted); }

  .rd-leader { display: flex; flex-direction: column; gap: 6px; width: 100%; }
  .rd-leader-row { display: flex; align-items: center; gap: 10px; padding: 9px 11px; border-radius: 12px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); }
  .rd-leader-rank { width: 20px; height: 20px; border-radius: 7px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: var(--muted); font-family: var(--mono); flex-shrink: 0; }
  .rd-leader-rank.gold { background: rgba(255,215,0,0.12); color: #FFD700; border: 1px solid rgba(255,215,0,0.2); }
  .rd-leader-body { flex: 1; min-width: 0; }
  .rd-leader-name { font-size: 12px; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rd-leader-sub { font-size: 9.5px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.07em; margin-top: 1px; }
  .rd-leader-val { font-size: 13px; font-weight: 800; font-family: var(--mono); color: var(--text); flex-shrink: 0; }
  .rd-leader-val span { font-size: 9px; color: var(--muted); font-weight: 500; font-family: var(--font); margin-left: 1px; }
  .rd-leader-delta { font-size: 10px; font-weight: 800; font-family: var(--mono); flex-shrink: 0; min-width: 46px; text-align: right; }
  .rd-leader-delta.up { color: #C8FF32; }
  .rd-leader-delta.down { color: #FF5A5F; }
  .rd-leader-delta.flat { color: var(--muted); }
  .rd-pr-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; font-family: var(--mono); white-space: nowrap; }
  .rd-pr-badge.up { background: rgba(200,255,50,0.10); color: #C8FF32; border: 1px solid rgba(200,255,50,0.18); }
  .rd-pr-badge.down { background: rgba(255,90,95,0.10); color: #FF5A5F; border: 1px solid rgba(255,90,95,0.18); }
  .rd-pr-badge.flat { background: rgba(255,255,255,0.04); color: var(--muted); border: 1px solid rgba(255,255,255,0.08); }

  /* Progress snapshot */
  .rd-snapshot { display: flex; flex-direction: column; gap: 18px; height: 100%; }
  .rd-snapshot-sec { display: flex; flex-direction: column; gap: 8px; }
  .rd-snapshot-divider { height: 1px; background: rgba(255,255,255,0.07); }


  .rd-btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 9px; min-height: 50px; padding: 12px 26px; border-radius: 16px; background: var(--accent); color: #0B0F14; font-size: 14px; font-weight: 700; cursor: pointer; border: none; transition: all 0.18s var(--ease); font-family: var(--font); box-shadow: 0 12px 32px rgba(200,255,50,0.2); position: relative; overflow: hidden; }
  .rd-btn-primary:hover { background: var(--accent-hi); transform: translateY(-2px); box-shadow: 0 18px 44px rgba(200,255,50,0.32), 0 0 0 1px rgba(200,255,50,0.25); }
  .rd-btn-primary:active { transform: translateY(0) scale(0.98); }
  .rd-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
  .rd-btn-secondary { display: inline-flex; align-items: center; justify-content: center; gap: 9px; min-height: 50px; padding: 12px 24px; border-radius: 16px; background: rgba(255,255,255,0.05); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); color: rgba(248,250,252,0.85); font-size: 14px; font-weight: 600; cursor: pointer; border: 1px solid rgba(255,255,255,0.10); transition: all 0.18s var(--ease); font-family: var(--font); }
  .rd-btn-secondary:hover { background: rgba(255,255,255,0.09); color: var(--text); border-color: rgba(255,255,255,0.20); transform: translateY(-2px); box-shadow: 0 14px 34px rgba(0,0,0,0.35); }
  .rd-btn-secondary:active { transform: translateY(0) scale(0.98); }
  .rd-btn-lg { min-height: 58px; padding: 15px 34px; border-radius: 18px; font-size: 15px; }
  .rd-btn-sm2 { min-height: 40px; padding: 8px 18px; border-radius: 12px; font-size: 13px; }

  .rd-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 28px 16px; gap: 8px; color: var(--muted); font-size: 13px; }
  .rd-empty .rd-empty-title { font-size: 15px; font-weight: 700; color: var(--text); }
  .rd-empty .rd-empty-sub { color: var(--muted); font-size: 12px; }

  /* Readiness */
  .rd-ring { position: relative; width: 132px; height: 132px; flex-shrink: 0; }
  .rd-ring svg { transform: rotate(-90deg); }
  .rd-ring-bg { fill: none; stroke: rgba(255,255,255,0.07); }
  .rd-ring-fg { fill: none; stroke-linecap: round; transition: stroke-dasharray 1.2s var(--ease); filter: drop-shadow(0 0 6px rgba(200,255,50,0.3)); }
  .rd-ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .rd-ring-value { font-size: 32px; font-weight: 800; color: var(--text); font-family: var(--mono); line-height: 1; }
  .rd-ring-value span { font-size: 16px; color: var(--muted); font-weight: 600; }
  .rd-ring-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.09em; margin-top: 3px; }
  .rd-readiness-status { font-size: 14px; font-weight: 700; color: var(--accent); }
  .rd-readiness-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }

  .rd-recovery-row { display: flex; align-items: center; gap: 10px; padding: 5px 0; }
  .rd-recovery-label { font-size: 11px; color: var(--muted); width: 58px; flex-shrink: 0; font-weight: 500; }
  .rd-recovery-track { flex: 1; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.07); overflow: hidden; }
  .rd-recovery-fill { height: 100%; border-radius: 3px; transition: width 0.6s var(--ease); }
  .rd-recovery-val { font-size: 11px; font-weight: 600; color: var(--muted); width: 32px; text-align: right; font-family: var(--mono); }

  /* Macro bars */
  .rd-macro { margin-bottom: 14px; }
  .rd-macro:last-child { margin-bottom: 0; }
  .rd-macro-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .rd-macro-label { font-size: 12px; font-weight: 600; color: var(--muted); }
  .rd-macro-val { font-size: 12px; color: var(--muted); font-family: var(--mono); }
  .rd-macro-val b { color: var(--text); font-weight: 600; }
  .rd-macro-track { height: 7px; border-radius: 4px; background: rgba(255,255,255,0.07); overflow: hidden; }
  .rd-macro-fill { height: 100%; border-radius: 4px; transition: width 0.6s var(--ease); }

  .rd-big-metric { font-size: 40px; font-weight: 800; color: var(--text); font-family: var(--mono); letter-spacing: -0.035em; line-height: 1; }
  .rd-big-metric span { font-size: 15px; color: var(--muted); font-weight: 500; font-family: var(--font); }
  .rd-metric-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.09em; font-weight: 600; margin-top: 4px; }
  .rd-water-track { height: 9px; border-radius: 5px; background: rgba(255,255,255,0.07); overflow: hidden; position: relative; }
  .rd-water-fill { height: 100%; border-radius: 5px; background: linear-gradient(90deg, #2A9CF5, var(--blue)); box-shadow: 0 0 12px rgba(90,200,250,0.4); transition: width 0.6s var(--ease); }
  .rd-water-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; border-radius: 10px; background: rgba(90,200,250,0.10); border: 1px solid rgba(90,200,250,0.24); color: #7CC8FB; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.16s var(--ease); font-family: var(--font); }
  .rd-water-btn:hover { background: rgba(90,200,250,0.18); border-color: rgba(90,200,250,0.4); color: #FFFFFF; }

  /* Nutrition */
  .rd-nut-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .rd-nut-stat { background: linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.012) 100%), var(--surface); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 18px 16px; position: relative; overflow: hidden; box-shadow: 0 1px 0 rgba(255,255,255,0.03) inset; }
  .rd-nut-stat::after { content: ''; position: absolute; top: -30px; right: -30px; width: 70px; height: 70px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.05), transparent 70%); pointer-events: none; }
  .rd-nut-stat .l { font-size: 10px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--muted); }
  .rd-nut-stat .v { font-size: 28px; font-weight: 800; color: var(--text); font-family: var(--mono); letter-spacing: -0.02em; margin-top: 5px; line-height: 1.1; }
  .rd-nut-stat .v span { font-size: 12px; color: var(--muted); font-weight: 500; font-family: var(--font); }
  .rd-nut-stat .s { font-size: 11px; color: var(--muted); margin-top: 6px; }
  .rd-nut-stat .s b { color: var(--accent); font-weight: 600; }
  .rd-nut-stat.lime .v { color: var(--accent); }
  .rd-nut-stat.blue .v { color: var(--blue); }
  .rd-nut-stat.orange .v { color: var(--orange); }
  .rd-nut-stat.green .v { color: var(--green); }
  .rd-nut-stat.red .v { color: var(--red); }
  .rd-nut-stat.purple .v { color: var(--purple); }

  .rd-search-dropdown { position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 120; background: rgba(17,21,27,0.98); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; box-shadow: var(--shadow-pop); overflow: hidden; max-height: 280px; overflow-y: auto; }
  .rd-search-item { padding: 11px 14px; cursor: pointer; transition: background 0.15s; }
  .rd-search-item:hover { background: rgba(200,255,50,0.06); }
  .rd-search-item + .rd-search-item { border-top: 1px solid rgba(255,255,255,0.05); }

  .rd-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .rd-table th { padding: 8px 6px; text-align: left; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.09em; color: var(--muted); border-bottom: 1px solid rgba(255,255,255,0.08); }
  .rd-table td { padding: 9px 6px; border-bottom: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.75); }
  .rd-table tr:last-child td { border-bottom: none; }
  .rd-table td.num { font-family: var(--mono); font-size: 12px; }
  .rd-table td.cal { font-weight: 700; color: var(--text); }
  .rd-table .food-name { font-weight: 600; color: var(--text); }
  .rd-table .food-brand { font-size: 10px; color: var(--muted); margin-top: 1px; }
  .rd-iconbtn { background: none; border: none; color: var(--faint); width: 26px; height: 26px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; font-family: var(--font); }
  .rd-iconbtn:hover { background: rgba(255,255,255,0.07); color: var(--text); }
  .rd-iconbtn.lime:hover { background: var(--accent-soft); color: var(--accent); }
  .rd-iconbtn.danger:hover { background: var(--red-soft); color: var(--red); }
  .rd-iconbtn.orange:hover { background: var(--orange-soft); color: var(--orange); }

  .rd-food-preview { border: 1px solid var(--accent-line); background: var(--accent-soft); border-radius: 16px; padding: 18px; }
  .rd-food-name { font-size: 16px; font-weight: 700; color: var(--text); }
  .rd-food-brand { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .rd-macro-mini { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 8px 10px; text-align: center; }
  .rd-macro-mini .l { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.07em; font-weight: 600; }
  .rd-macro-mini .v { font-size: 13px; font-weight: 700; color: var(--text); font-family: var(--mono); margin-top: 2px; }
  .rd-macro-mini .v span { font-size: 9px; color: var(--muted); font-weight: 500; font-family: var(--font); }

  .rd-ai-card { background: linear-gradient(180deg, rgba(200,255,50,0.05) 0%, rgba(15,18,23,0.5) 100%); border: 1px solid rgba(200,255,50,0.13); }
  .rd-nut-advice { background: rgba(200,255,50,0.05); border: 1px solid rgba(200,255,50,0.13); border-radius: 12px; padding: 16px; font-size: 13px; color: rgba(255,255,255,0.85); line-height: 1.7; }

  .rd-meal-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; background: linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.012) 100%), var(--surface); border: 1px solid rgba(255,255,255,0.08); margin-bottom: 8px; transition: border-color 0.16s var(--ease); }
  .rd-meal-row:hover { border-color: rgba(255,255,255,0.14); }
  .rd-meal-tag { font-size: 9px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px; }
  .rd-meal-name { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
  .rd-meal-meta { display: flex; gap: 10px; font-size: 11px; color: var(--muted); font-family: var(--mono); flex-wrap: wrap; }
  .rd-meal-meta .p { color: var(--blue); }
  .rd-meal-meta .c { color: var(--orange); }
  .rd-meal-meta .f { color: var(--purple); }
  .rd-food-add { margin-left: auto; flex-shrink: 0; }

  .rd-stepper { display: inline-flex; align-items: center; gap: 6px; }
  .rd-step-btn { width: 30px; height: 30px; border-radius: 9px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); color: var(--muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; font-family: var(--font); }
  .rd-step-btn:hover { background: var(--accent-soft); border-color: var(--accent-line); color: var(--accent); }

  .rd-chart-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

  /* Streak consistency */
  .rd-dots { display: flex; gap: 5px; align-items: flex-end; }
  .rd-dot { flex: 1; border-radius: 4px; background: rgba(255,255,255,0.08); }
  .rd-dot.on { background: var(--accent); box-shadow: 0 0 10px rgba(200,255,50,0.4); }

  .rd-trend { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; }
  .rd-trend.up { color: var(--orange); }
  .rd-trend.down { color: var(--accent); }
  .rd-trend.flat { color: var(--muted); }

  /* Charts */
  .rd-chart-filter { display: flex; gap: 3px; padding: 3px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; }
  .rd-chart-filter button { padding: 4px 11px; border-radius: 7px; background: transparent; border: none; color: var(--muted); font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: var(--font); }
  .rd-chart-filter button:hover { color: var(--text); }
  .rd-chart-filter button.active { background: var(--accent-soft); color: var(--accent); }
  .rd-legend { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
  .rd-legend-item { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--muted); font-weight: 500; }
  .rd-legend-dot { width: 8px; height: 8px; border-radius: 3px; }
  .rd-tooltip { background: rgba(17,21,27,0.98); border: 1px solid rgba(255,255,255,0.10); border-radius: 12px; padding: 12px 14px; box-shadow: var(--shadow-pop); min-width: 170px; }
  .rd-tooltip-day { font-size: 12px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .rd-tooltip-row { display: flex; align-items: center; gap: 7px; font-size: 12px; color: rgba(255,255,255,0.75); padding: 2px 0; }
  .rd-tooltip-row .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .rd-tooltip-row b { margin-left: auto; padding-left: 12px; font-family: var(--mono); color: var(--text); font-weight: 600; }

  /* Recent workouts */
  .rd-recent-item { display: flex; align-items: center; gap: 12px; padding: 11px 10px; border-radius: 12px; transition: background 0.15s; cursor: pointer; }
  .rd-recent-item:hover { background: rgba(255,255,255,0.03); }
  .rd-recent-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--accent-soft); border: 1px solid rgba(200,255,50,0.14); color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .rd-recent-name { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rd-recent-meta { font-size: 11px; color: var(--muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rd-recent-right { margin-left: auto; text-align: right; flex-shrink: 0; }
  .rd-recent-dur { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7); font-family: var(--mono); }
  .rd-recent-date { font-size: 10px; color: var(--muted); margin-top: 2px; }

  /* AI Coach banner */
  .rd-ai { position: relative; border-radius: 22px; overflow: hidden; padding: 28px 30px; display: flex; align-items: center; gap: 22px; flex-wrap: wrap;
    background: linear-gradient(120deg, rgba(139,92,246,0.22) 0%, rgba(139,92,246,0.12) 40%, rgba(91,33,182,0.16) 100%), #18202A;
    border: 1px solid rgba(139,92,246,0.3);
    box-shadow: 0 1px 0 rgba(255,255,255,0.05) inset, 0 16px 44px rgba(0,0,0,0.35);
  }
  .rd-ai::before { content: ''; position: absolute; top: -80px; right: -40px; width: 340px; height: 340px; border-radius: 50%; background: radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 70%); pointer-events: none; }
  .rd-ai-icon { width: 54px; height: 54px; border-radius: 15px; background: linear-gradient(135deg, #8B5CF6, #B39DFB); display: flex; align-items: center; justify-content: center; color: #FFFFFF; flex-shrink: 0; box-shadow: 0 8px 28px rgba(139,92,246,0.45); }
  .rd-ai-kicker { font-size: 10px; font-weight: 800; letter-spacing: 0.15em; color: #B39DFB; text-transform: uppercase; }
  .rd-ai-title { font-size: 17px; font-weight: 800; color: var(--text); margin-top: 3px; }
  .rd-ai-text { font-size: 13px; line-height: 1.65; color: rgba(255,255,255,0.72); margin-top: 8px; max-width: 620px; }
  .rd-ai-btn { display: inline-flex; align-items: center; gap: 8px; padding: 11px 20px; border-radius: 12px; background: #FFFFFF; color: #3B0764; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.18s var(--ease); font-family: var(--font); flex-shrink: 0; margin-left: auto; }
  .rd-ai-btn:hover { background: #EDE9FE; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(0,0,0,0.3); }
  .rd-ai-btn .spark { color: #8B5CF6; }

  /* AI Coach chat */
  .rd-chat { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; background: linear-gradient(180deg, rgba(19,23,31,0.9) 0%, rgba(11,15,20,0.95) 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius); overflow: hidden; box-shadow: 0 1px 0 rgba(255,255,255,0.035) inset, 0 18px 48px rgba(0,0,0,0.35); }
  .rd-chat::before { content: ''; display: block; height: 1px; background: linear-gradient(90deg, transparent, rgba(139,92,246,0.45), transparent); }
  .rd-chat-head { display: flex; align-items: center; gap: 12px; padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .rd-chat-status { width: 8px; height: 8px; border-radius: 50%; background: var(--green); box-shadow: 0 0 8px rgba(200,255,50,0.6); }
  .rd-chat-body { flex: 1; overflow-y: auto; padding: 22px 20px; display: flex; flex-direction: column; gap: 14px; }
  .rd-msg { display: flex; gap: 10px; max-width: 82%; }
  .rd-msg.user { align-self: flex-end; flex-direction: row-reverse; }
  .rd-msg-avatar { width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #8B5CF6, #B39DFB); color: #FFFFFF; box-shadow: 0 4px 14px rgba(139,92,246,0.35); }
  .rd-msg-bubble { padding: 12px 16px; border-radius: 14px; font-size: 13px; line-height: 1.65; color: var(--text); }
  .rd-msg.user .rd-msg-bubble { background: linear-gradient(180deg, rgba(200,255,50,0.12), rgba(200,255,50,0.05)); border: 1px solid rgba(200,255,50,0.20); border-bottom-right-radius: 4px; }
  .rd-msg.ai .rd-msg-bubble { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-bottom-left-radius: 4px; }
  .rd-chat-foot { padding: 14px 18px; border-top: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.015); }

  /* AI Coach hero */
  .rd-coach-hero { position: relative; overflow: hidden; border-radius: var(--radius); padding: 24px 26px; display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap;
    background: linear-gradient(120deg, rgba(139,92,246,0.15) 0%, rgba(124,58,237,0.07) 45%, rgba(20,25,34,0) 70%), #1E242E;
    border: 1px solid rgba(139,92,246,0.2);
  }
  .rd-coach-hero::before { content: ''; position: absolute; top: -120px; right: -60px; width: 380px; height: 380px; border-radius: 50%; background: radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 70%); pointer-events: none; }
  .rd-coach-hero::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent); }
  .rd-coach-hero > * { position: relative; z-index: 1; }
  .rd-coach-context { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
  .rd-kicker.purple { background: rgba(139,92,246,0.10); border-color: rgba(139,92,246,0.26); color: #8B5CF6; }

  .rd-cap-label { font-size: 10px; font-weight: 800; letter-spacing: 0.13em; color: rgba(156,163,175,0.55); text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
  .rd-cap-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
  .rd-cap-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 10px; }
  .rd-cap-card { display: flex; align-items: flex-start; gap: 11px; padding: 13px 14px; border-radius: 14px; background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012)), rgba(20,26,34,0.8); border: 1px solid rgba(255,255,255,0.08); cursor: pointer; transition: all 0.16s var(--ease); text-align: left; font-family: var(--font); }
  .rd-cap-card:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.14); background: rgba(30,36,46,0.9); box-shadow: 0 12px 30px rgba(0,0,0,0.28); }
  .rd-cap-ico { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .rd-cap-ico.lime { background: rgba(200,255,50,0.10); border: 1px solid rgba(200,255,50,0.20); color: var(--accent); }
  .rd-cap-ico.blue { background: rgba(90,200,250,0.10); border: 1px solid rgba(90,200,250,0.20); color: var(--blue); }
  .rd-cap-ico.orange { background: rgba(255,159,10,0.10); border: 1px solid rgba(255,159,10,0.20); color: var(--orange); }
  .rd-cap-ico.purple { background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.26); color: #B39DFB; }
  .rd-cap-name { font-size: 12.5px; font-weight: 700; color: var(--text); }
  .rd-cap-tip { font-size: 11px; color: var(--muted); margin-top: 2px; line-height: 1.4; }
  .rd-coach-note { display: flex; align-items: center; gap: 7px; font-size: 10.5px; color: rgba(156,163,175,0.55); margin-top: 10px; }
  .rd-typing { display: inline-flex; align-items: center; gap: 5px; padding: 14px 16px; border-radius: 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-bottom-left-radius: 4px; }
  .rd-typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--purple); animation: rdPulse 1.2s infinite; }
  .rd-typing span:nth-child(2) { animation-delay: 0.2s; }
  .rd-typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes rdPulse { 0%, 100% { opacity: 0.3; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1); } }

  .rd-notif-badge { position: absolute; top: 5px; right: 5px; min-width: 15px; height: 15px; border-radius: 8px; background: var(--accent); border: 2px solid #0B0F14; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 800; color: #0B0F14; padding: 0 3px; }

  .rd-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 14px 0; }

  /* â•â•â• WORKOUT HUB / EXERCISE LIBRARY â•â•â• */
  .rd-tabbar { display: flex; gap: 3px; padding: 4px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; flex-wrap: wrap; }
  .rd-tab { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; color: var(--muted); background: transparent; border: none; cursor: pointer; transition: all 0.16s var(--ease); font-family: var(--font); white-space: nowrap; }
  .rd-tab svg { opacity: 0.65; }
  .rd-tab:hover { color: var(--text); background: rgba(255,255,255,0.05); }
  .rd-tab.active { background: rgba(200,255,50,0.10); color: var(--accent); box-shadow: inset 0 0 0 1px rgba(200,255,50,0.20); }
  .rd-tab.active svg { opacity: 1; }

  .rd-search { position: relative; }
  .rd-search > svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }
  .rd-search input { width: 100%; height: 46px; padding: 0 16px 0 42px; background: rgba(13,17,23,0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 13px; color: var(--text); font-size: 14px; outline: none; transition: all 0.18s var(--ease); font-family: var(--font); }
  .rd-search input::placeholder { color: rgba(156,163,175,0.4); }
  .rd-search input:focus { border-color: rgba(200,255,50,0.35); box-shadow: 0 0 0 3px rgba(200,255,50,0.07); background: rgba(16,22,30,0.95); }

  .rd-filter-card { display: flex; flex-direction: column; gap: 14px; }
  .rd-filter-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .rd-filter-label { font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.11em; min-width: 76px; flex-shrink: 0; }
  .rd-chip { display: inline-flex; align-items: center; gap: 5px; padding: 6px 13px; border-radius: 999px; font-size: 12px; font-weight: 600; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: var(--muted); cursor: pointer; transition: all 0.15s; font-family: var(--font); }
  .rd-chip:hover { background: rgba(255,255,255,0.06); color: var(--text); border-color: rgba(255,255,255,0.14); }
  .rd-chip.active { background: var(--accent-soft); border-color: var(--accent-line); color: var(--accent); }

  .rd-count { font-size: 12px; color: var(--muted); font-weight: 500; }
  .rd-count svg { color: rgba(200,255,50,0.7); vertical-align: -2px; }
  .rd-count b { color: var(--text); font-weight: 700; font-family: var(--mono); }

  .rd-ex-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
  .rd-ex-card { display: flex; flex-direction: column; gap: 14px; padding: 18px; background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%), var(--surface); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; cursor: pointer; transition: all 0.18s var(--ease); position: relative; overflow: hidden; }
  .rd-ex-card:hover { border-color: rgba(200,255,50,0.26); transform: translateY(-2px); box-shadow: var(--shadow-hover); }
  .rd-ex-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,255,50,0.3), transparent); opacity: 0; transition: opacity 0.18s; }
  .rd-ex-card:hover::before { opacity: 1; }
  .rd-ex-top { display: flex; align-items: flex-start; gap: 13px; min-width: 0; }
  .rd-ex-tile { width: 46px; height: 46px; border-radius: 13px; background: var(--accent-soft); border: 1px solid rgba(200,255,50,0.16); color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .rd-ex-body { min-width: 0; flex: 1; }
  .rd-ex-name { font-size: 15px; font-weight: 700; color: var(--text); line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rd-ex-sub { font-size: 11px; color: var(--muted); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rd-ex-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .rd-ex-tag { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 7px; font-size: 10px; font-weight: 700; background: var(--accent-soft); color: var(--accent); border: 1px solid rgba(200,255,50,0.14); letter-spacing: 0.02em; }
  .rd-ex-tag.muted { background: rgba(255,255,255,0.04); color: var(--muted); border-color: rgba(255,255,255,0.08); }
  .rd-ex-tag.blue { background: rgba(90,200,250,0.10); color: var(--blue); border-color: rgba(90,200,250,0.20); }
  .rd-ex-tag.green { background: rgba(74,222,128,0.10); color: #4ADE80; border-color: rgba(74,222,128,0.20); }
  .rd-ex-tag.orange { background: rgba(255,159,10,0.10); color: var(--orange); border-color: rgba(255,159,10,0.20); }
  .rd-ex-tag.red { background: rgba(255,90,95,0.10); color: var(--red); border-color: rgba(255,90,95,0.20); }
  .rd-ex-meta { display: flex; align-items: center; gap: 16px; padding-top: 13px; border-top: 1px solid rgba(255,255,255,0.06); margin-top: auto; }
  .rd-ex-meta-item { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); font-weight: 600; }
  .rd-ex-meta-item svg { color: rgba(200,255,50,0.7); }
  .rd-ex-meta-item b { font-family: var(--mono); color: var(--text); font-weight: 600; }
  .rd-ex-del { margin-left: auto; display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 8px; background: rgba(255,90,95,0.08); border: 1px solid rgba(255,90,95,0.18); color: var(--red); font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s; font-family: var(--font); }
  .rd-ex-del:hover { background: rgba(255,90,95,0.16); border-color: rgba(255,90,95,0.32); }

  .rd-modal-overlay { position: fixed; inset: 0; background: rgba(5,8,11,0.74); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); display: flex; align-items: center; justify-content: center; z-index: 900; padding: 20px; overflow-y: auto; }
  .rd-modal { width: 100%; max-width: 440px; background: linear-gradient(180deg, var(--surface-2), var(--surface)); border: 1px solid rgba(255,255,255,0.10); border-radius: 24px; padding: 26px; box-shadow: var(--shadow-pop); position: relative; }
  .rd-modal-lg { max-width: 600px; max-height: 90vh; overflow-y: auto; }
  .rd-modal-title { font-size: 18px; font-weight: 800; color: var(--text); }
  .rd-modal-close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); color: var(--muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; font-family: var(--font); }
  .rd-modal-close:hover { color: var(--text); background: rgba(255,255,255,0.09); }
  .rd-form { display: flex; flex-direction: column; gap: 13px; }
  .rd-field label { display: block; font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 6px; }
  .rd-input, .rd-select { width: 100%; padding: 11px 14px; background: rgba(13,17,23,0.9); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; color: var(--text); font-size: 13px; outline: none; transition: all 0.18s var(--ease); font-family: var(--font); }
  .rd-input:focus, .rd-select:focus { border-color: rgba(200,255,50,0.35); box-shadow: 0 0 0 3px rgba(200,255,50,0.07); background: rgba(16,22,30,0.95); }
  .rd-select-wrap { position: relative; }
  .rd-select-wrap svg { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }
  .rd-select { appearance: none; padding-right: 38px; }

  /* â•â•â• ACTIVE WORKOUT SESSION â•â•â• */
  .rd-session-bar { position: sticky; top: 0; z-index: 50; background: rgba(11,15,20,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.09); border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; box-shadow: var(--shadow-card); }
  .rd-session-name { font-size: 15px; font-weight: 700; color: var(--text); }
  .rd-session-timer { display: inline-flex; align-items: center; gap: 7px; font-family: var(--mono); font-size: 16px; font-weight: 600; color: var(--accent); margin-top: 2px; }
  .rd-session-timer svg { color: rgba(200,255,50,0.7); }
  .rd-session-stats { display: flex; gap: 8px; flex-wrap: wrap; }
  .rd-session-stat { display: inline-flex; flex-direction: column; gap: 1px; padding: 7px 14px; border-radius: 10px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), var(--surface); border: 1px solid rgba(255,255,255,0.08); min-width: 66px; }
  .rd-session-stat .v { font-size: 15px; font-weight: 700; color: var(--text); font-family: var(--mono); }
  .rd-session-stat .l { font-size: 9px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.09em; }
  .rd-progress-track { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.07); overflow: hidden; flex: 1; min-width: 120px; max-width: 260px; }
  .rd-progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, rgba(200,255,50,0.7), var(--accent)); box-shadow: 0 0 10px rgba(200,255,50,0.3); transition: width 0.4s var(--ease); }

  .rd-session-grid { display: flex; flex-direction: column; gap: 14px; }
  .rd-ex-session { display: flex; flex-direction: column; gap: 12px; padding: 18px; background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%), var(--surface); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; transition: border-color 0.18s var(--ease), box-shadow 0.18s var(--ease); }
  .rd-ex-session.current { border-color: rgba(200,255,50,0.34); box-shadow: inset 0 0 0 1px rgba(200,255,50,0.08), 0 10px 30px rgba(0,0,0,0.28); }
  .rd-ex-session-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
  .rd-ex-session-name { font-size: 16px; font-weight: 700; color: var(--text); }
  .rd-ex-session-sub { font-size: 11px; color: var(--muted); margin-top: 3px; }
  .rd-ex-session-actions { display: flex; gap: 6px; flex-shrink: 0; align-items: center; flex-wrap: wrap; }
  .rd-mini-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 9px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); color: var(--muted); font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: var(--font); }
  .rd-mini-btn:hover { background: rgba(255,255,255,0.07); color: var(--text); border-color: rgba(255,255,255,0.16); }
  .rd-mini-btn.danger { color: var(--red); }
  .rd-mini-btn.danger:hover { background: var(--red-soft); border-color: rgba(255,90,95,0.3); color: var(--red); }

  .rd-prev { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--muted); }
  .rd-prev svg { color: rgba(90,200,250,0.75); }
  .rd-prev b { color: var(--text); font-weight: 600; font-family: var(--mono); }

  .rd-set-header, .rd-set-row { display: grid; grid-template-columns: 34px 1fr 1fr 1fr 64px 36px; gap: 8px; align-items: center; }
  .rd-set-header { padding-bottom: 7px; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .rd-set-header span { font-size: 9px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.09em; text-align: center; }
  .rd-set-header span:first-child { text-align: center; }
  .rd-set-row { padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); transition: opacity 0.2s; }
  .rd-set-row:last-of-type { border-bottom: none; }
  .rd-set-row.done { opacity: 0.55; }
  .rd-set-num { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 9px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); font-size: 12px; font-weight: 700; color: var(--muted); font-family: var(--mono); transition: all 0.16s var(--ease); }
  .rd-set-row.done .rd-set-num { background: var(--accent-soft); border-color: var(--accent-line); color: var(--accent); }
  .rd-set-row.current .rd-set-num { background: var(--accent-soft); border-color: rgba(200,255,50,0.4); color: var(--accent); box-shadow: 0 0 12px rgba(200,255,50,0.18); }
  .rd-set-input { width: 100%; height: 34px; padding: 0 8px; text-align: center; border-radius: 9px; background: rgba(13,17,23,0.9); border: 1px solid rgba(255,255,255,0.08); color: var(--text); font-size: 13px; font-family: var(--mono); outline: none; transition: all 0.15s; }
  .rd-set-input:focus { border-color: rgba(200,255,50,0.35); box-shadow: 0 0 0 3px rgba(200,255,50,0.07); }
  .rd-set-input::placeholder { color: rgba(156,163,175,0.3); }
  .rd-set-e1rm { font-size: 12px; font-family: var(--mono); color: rgba(200,255,50,0.75); text-align: center; }
  .rd-set-check { width: 32px; height: 32px; border-radius: 10px; border: 1.5px solid rgba(255,255,255,0.12); background: none; color: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
  .rd-set-check:hover { border-color: var(--accent); }
  .rd-set-check.checked { background: var(--accent); border-color: var(--accent); color: #0B0F14; box-shadow: 0 4px 16px rgba(200,255,50,0.3); }

  .rd-notes { width: 100%; min-height: 46px; resize: vertical; padding: 10px 12px; border-radius: 10px; background: rgba(13,17,23,0.9); border: 1px solid rgba(255,255,255,0.08); color: var(--muted); font-size: 12px; outline: none; transition: all 0.15s; font-family: var(--font); }
  .rd-notes:focus { border-color: rgba(200,255,50,0.3); }
  .rd-notes::placeholder { color: rgba(156,163,175,0.3); }

  .rd-add-dashed { width: 100%; padding: 14px; border-radius: 14px; border: 1.5px dashed rgba(255,255,255,0.16); background: transparent; color: var(--muted); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.16s var(--ease); font-family: var(--font); display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
  .rd-add-dashed:hover { border-color: rgba(200,255,50,0.4); color: var(--accent); background: var(--accent-soft); }

  .rd-ex-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 14px; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); cursor: pointer; transition: all 0.15s; }
  .rd-ex-row:hover { background: var(--accent-soft); border-color: rgba(200,255,50,0.25); }

  .rd-timer-display { font-family: var(--mono); font-size: 72px; font-weight: 700; color: var(--accent); line-height: 1; letter-spacing: -0.03em; }
  .rd-timer-label { font-size: 12px; color: var(--muted); margin-top: 10px; }

  .rd-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 20px 0; }
  .rd-stat-box { padding: 14px; border-radius: 12px; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), var(--surface); border: 1px solid rgba(255,255,255,0.08); text-align: left; }
  .rd-stat-box .l { font-size: 9px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.09em; }
  .rd-stat-box .v { font-size: 20px; font-weight: 700; color: var(--text); font-family: var(--mono); margin-top: 3px; }
  .rd-stat-box .v span { font-size: 11px; color: var(--muted); font-family: var(--font); font-weight: 500; }
  .rd-stat-box.lime .v { color: var(--accent); }
  .rd-break-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; gap: 10px; }
  .rd-break-row:last-child { border-bottom: none; }
  .rd-break-row .n { color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rd-break-row .m { color: var(--muted); font-family: var(--mono); font-size: 11px; white-space: nowrap; }
  .rd-break-row .m b { color: var(--accent); font-weight: 600; }

  /* â•â•â• WORKOUT TEMPLATES â•â•â• */
  .rd-stack { display: flex; flex-direction: column; gap: 16px; }
  .rd-tab-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .rd-section-label { font-size: 13px; font-weight: 700; color: var(--text); }

  .rd-tmpl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
  .rd-tmpl-card { display: flex; flex-direction: column; gap: 10px; padding: 18px; background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%), var(--surface); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; transition: all 0.18s var(--ease); position: relative; overflow: hidden; }
  .rd-tmpl-card:hover { border-color: rgba(200,255,50,0.22); transform: translateY(-2px); box-shadow: var(--shadow-hover); }
  .rd-tmpl-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,255,50,0.3), transparent); opacity: 0; transition: opacity 0.18s; }
  .rd-tmpl-card:hover::before { opacity: 1; }
  .rd-tmpl-name { font-size: 15px; font-weight: 700; color: var(--text); }
  .rd-tmpl-desc { font-size: 12px; color: var(--muted); }
  .rd-tmpl-meta { display: flex; align-items: center; gap: 14px; font-size: 11px; font-weight: 600; color: var(--muted); }
  .rd-tmpl-meta svg { color: rgba(200,255,50,0.7); }
  .rd-tmpl-chips { display: flex; flex-wrap: wrap; gap: 5px; }
  .rd-tmpl-actions { display: flex; gap: 8px; margin-top: auto; padding-top: 13px; border-top: 1px solid rgba(255,255,255,0.06); }

  .rd-btn-sm { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 14px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; transition: all 0.15s; font-family: var(--font); }
  .rd-btn-sm.primary { background: var(--accent); color: #0B0F14; box-shadow: 0 6px 18px rgba(200,255,50,0.16); }
  .rd-btn-sm.primary:hover { background: var(--accent-hi); }
  .rd-btn-sm.ghost { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.72); border: 1px solid rgba(255,255,255,0.09); }
  .rd-btn-sm.ghost:hover { background: rgba(255,255,255,0.08); color: var(--text); }
  .rd-btn-sm.danger { background: rgba(255,90,95,0.08); color: var(--red); border: 1px solid rgba(255,90,95,0.18); }
  .rd-btn-sm.danger:hover { background: rgba(255,90,95,0.16); border-color: rgba(255,90,95,0.32); }

  .rd-ex-edit { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 12px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); }
  .rd-ex-edit .num { width: 22px; text-align: center; font-size: 12px; font-weight: 700; color: var(--muted); font-family: var(--mono); flex-shrink: 0; }
  .rd-ex-edit .n { font-size: 13px; font-weight: 600; color: var(--text); flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rd-ex-edit .sets-cell { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .rd-ex-edit .sets-cell label { font-size: 9px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
  .rd-ex-edit .rd-set-input { width: 52px; }

  /* â•â•â• WORKOUT HISTORY â•â•â• */
  .rd-history-list { display: flex; flex-direction: column; gap: 10px; }
  .rd-history-card { padding: 17px; background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%), var(--surface); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; cursor: pointer; transition: all 0.18s var(--ease); }
  .rd-history-card:hover { border-color: rgba(255,255,255,0.13); transform: translateY(-1px); box-shadow: 0 14px 40px rgba(0,0,0,0.35); }
  .rd-history-card.expanded { border-color: rgba(200,255,50,0.22); box-shadow: var(--shadow-card); }
  .rd-history-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .rd-history-name { font-size: 14px; font-weight: 700; color: var(--text); }
  .rd-history-sub { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--muted); margin-top: 3px; flex-wrap: wrap; }
  .rd-history-sub svg { color: var(--faint); vertical-align: -2px; }
  .rd-history-vol { text-align: right; flex-shrink: 0; }
  .rd-history-vol .v { font-family: var(--mono); font-size: 15px; font-weight: 700; color: var(--accent); }
  .rd-history-vol .v span { font-size: 11px; color: var(--muted); font-family: var(--font); font-weight: 500; }
  .rd-history-vol .kcal { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .rd-history-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 11px; }
  .rd-vs-box { margin-top: 12px; padding: 11px 13px; border-radius: 11px; background: rgba(200,255,50,0.05); border: 1px solid rgba(200,255,50,0.13); font-size: 12px; color: rgba(255,255,255,0.6); }
  .rd-vs-box .l { font-size: 10px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--accent); margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
  .rd-vs-box .l svg { color: rgba(200,255,50,0.75); }
  .rd-vs-box b { font-family: var(--mono); font-weight: 600; }

  /* â•â•â• PERSONAL RECORDS â•â•â• */
  .rd-pr-section-label { font-size: 11px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.09em; margin-bottom: 10px; display: flex; align-items: center; gap: 7px; }
  .rd-pr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px; }
  .rd-pr-card { padding: 16px; background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%), var(--surface); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; transition: all 0.18s var(--ease); }
  .rd-pr-card:hover { border-color: rgba(200,255,50,0.2); transform: translateY(-1px); box-shadow: 0 14px 40px rgba(0,0,0,0.35); }
  .rd-pr-name { font-size: 13px; font-weight: 700; color: var(--text); }
  .rd-pr-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; background: var(--accent-soft); border: 1px solid var(--accent-line); color: var(--accent); font-size: 10px; font-weight: 700; letter-spacing: 0.05em; }
  .rd-pr-badge svg { width: 11px; height: 11px; }
  .rd-pr-val { font-family: var(--mono); font-size: 20px; font-weight: 800; color: var(--text); }
  .rd-pr-val span { font-size: 12px; color: var(--muted); font-weight: 500; font-family: var(--font); }
  .rd-pr-date { font-size: 11px; color: var(--muted); font-family: var(--mono); }
  .rd-pr-e1rm { font-size: 11px; color: var(--muted); margin-top: 9px; }
  .rd-pr-e1rm b { color: var(--accent); font-family: var(--mono); font-weight: 600; }
  .rd-pr-new-chips { display: flex; gap: 8px; flex-wrap: wrap; }
  .rd-pr-new-chip { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 9px; background: rgba(255,159,10,0.10); border: 1px solid rgba(255,159,10,0.22); color: var(--orange); font-size: 12px; font-weight: 600; }
  .rd-pr-new-chip svg { color: rgba(255,159,10,0.85); }
  .rd-pr-new-chip b { font-family: var(--mono); }

  /* â•â•â• HEALTH PAGES (Recovery / Body Weight) â•â•â• */
  .rd-2col { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; align-items: start; }
  .rd-slider-row { margin-bottom: 16px; }
  .rd-slider-row:last-of-type { margin-bottom: 4px; }
  .rd-slider-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
  .rd-slider-label { font-size: 12px; font-weight: 500; color: var(--muted); }
  .rd-slider-val { font-size: 13px; font-weight: 700; font-family: var(--mono); min-width: 56px; text-align: right; }
  .rd-slider-val span { font-size: 10px; opacity: 0.55; font-family: var(--font); font-weight: 500; }
  .rd-range { width: 100%; height: 6px; cursor: pointer; }
  .rd-score-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; text-align: center; flex: 1; }

  .rd-link-btn { color: var(--accent); font-weight: 600; background: none; border: none; cursor: pointer; padding: 0; font-family: var(--font); font-size: 13px; transition: color 0.15s; }
  .rd-link-btn:hover { color: var(--accent-hi); text-decoration: underline; }

  /* Settings toggle */
  .rd-toggle { transition: background 0.2s var(--ease), box-shadow 0.2s var(--ease); }
  .rd-toggle-knob { transition: left 0.2s var(--ease), background 0.2s var(--ease); box-shadow: 0 1px 3px rgba(0,0,0,0.35); }

  @media (max-width: 1100px) {
    .rd-grid { grid-template-columns: repeat(2, 1fr); }
    .rd-grid > .rd-span-6, .rd-grid > .rd-span-4, .rd-grid > .rd-span-3, .rd-grid > .rd-span-2 { grid-column: span 2; }
    .rd-grid > .rd-span-1 { grid-column: span 1; }
    .rd-hero-grid { grid-template-columns: 1fr; gap: 22px; }
    .rd-hero-visual { min-height: 0; max-width: 300px; margin: 0 auto; }
    .rd-hero-readiness { margin-top: -24px; }
    .rd-plan-panel { max-width: 100%; }
  }
  @media (max-width: 900px) {
    .rd-nut-stats { grid-template-columns: repeat(2, 1fr); }
    .rd-chart-grid { grid-template-columns: 1fr; }
    .rd-2col { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .rd-grid { grid-template-columns: 1fr; }
    .rd-grid > .rd-span-6, .rd-grid > .rd-span-4, .rd-grid > .rd-span-3, .rd-grid > .rd-span-2, .rd-grid > .rd-span-1 { grid-column: span 1; }
    .rd-greeting { font-size: 22px; }
    .rd-hero-title { font-size: 30px; }
    .rd-hero { padding: 22px; }
    .rd-tabbar { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
    .rd-tabbar::-webkit-scrollbar { display: none; }
    .rd-tab { flex-shrink: 0; }
    .rd-ring-big { width: 160px; height: 160px; }
    .rd-ring-big-score { font-size: 36px; }
    .rd-ai { padding: 22px 20px; }
    .rd-ai-btn { margin-left: 0; width: 100%; justify-content: center; }
    .rd-page-head .rd-title { font-size: 23px; }
    .rd-ex-grid { grid-template-columns: 1fr; }
    .rd-filter-label { min-width: 0; width: 100%; }
    .rd-modal { padding: 22px; }
    .rd-set-header, .rd-set-row { grid-template-columns: 32px 1fr 1fr 1fr 36px; gap: 6px; }
    .rd-set-header span:nth-child(5), .rd-set-e1rm { display: none; }
    .rd-timer-display { font-size: 56px; }
    .rd-session-stat { min-width: 54px; padding: 6px 10px; }
    .rd-session-bar { padding: 12px 14px; }
    .rd-nut-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .rd-nut-stat { padding: 14px 12px; }
    .rd-nut-stat .v { font-size: 21px; }
    .rd-tmpl-grid { grid-template-columns: 1fr; }
    .rd-pr-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
    .rd-ex-edit { flex-wrap: wrap; }
    .rd-ex-edit .sets-cell { margin-left: 32px; }
  }
`;

export const GlobalStyles = () => {
  useEffect(() => {
    const id = "global-fitness-styles";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = G_STYLE;
      document.head.appendChild(el);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);
  return null;
};
