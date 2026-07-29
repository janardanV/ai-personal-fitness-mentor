import { useEffect } from "react";

export const G_STYLE = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body, #root { min-height: 100vh; font-family: 'Inter', sans-serif; background: #0A0A0A; color: #FFFFFF; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

  /* ── Typography ── */
  .metric-value { font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 800; color: #FFFFFF; line-height: 1; letter-spacing: -0.03em; }
  .metric-value-sm { font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 700; color: #FFFFFF; line-height: 1; }
  .metric-value-lg { font-family: 'JetBrains Mono', monospace; font-size: 36px; font-weight: 800; color: #FFFFFF; line-height: 1; letter-spacing: -0.03em; }
  .metric-label { font-size: 10px; font-weight: 600; color: #707070; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 6px; }
  .metric-unit { font-size: 12px; font-weight: 500; color: #707070; }
  .section-title { font-size: 14px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.01em; display: flex; align-items: center; gap: 8px; }

  /* ── Card System ── */
  .card { background: #0F0F0F; border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
  .card:hover { border-color: rgba(255,255,255,0.08); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
  .card-primary { background: #0F0F0F; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.35); transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
  .card-primary:hover { border-color: rgba(255,255,255,0.1); box-shadow: 0 8px 28px rgba(0,0,0,0.45); }
  .card-secondary { background: #0E0E0E; border: 1px solid rgba(255,255,255,0.04); border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.2); transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
  .card-secondary:hover { border-color: rgba(255,255,255,0.07); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
  .card-minimal { background: transparent; border: none; border-radius: 0; }
  .card-inset { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 10px; }
  .card-elevated { background: #151515; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2); }

  /* ── Bento Grid ── */
  .bento-grid { display: grid; gap: 16px; }
  .bento-grid-2 { grid-template-columns: 1fr 1fr; }
  .bento-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
  .bento-grid-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
  .bento-grid-hero { grid-template-columns: 1.4fr 1fr; }
  .bento-grid-bottom { grid-template-columns: 1fr 1fr 0.8fr 1.2fr; }
  .bento-span-2 { grid-column: span 2; }
  .bento-full { grid-column: 1 / -1; }
  .bento-tall { grid-row: span 2; }

  /* ── Buttons ── */
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; transition: all 0.2s; border: none; cursor: pointer; font-family: 'Inter', sans-serif; }
  .btn:active { transform: scale(0.97); }
  .btn-primary { background: #22C55E; color: #0A0A0A; }
  .btn-primary:hover { background: #1DB954; }
  .btn-secondary { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: #FFFFFF; }
  .btn-secondary:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.12); }
  .btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.08); color: #A0A0A0; }
  .btn-ghost:hover { background: rgba(255,255,255,0.04); color: #FFFFFF; border-color: rgba(255,255,255,0.15); }
  .btn-danger { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #EF4444; }
  .btn-danger:hover { background: rgba(239,68,68,0.15); }
  .btn-sm { padding: 6px 14px; font-size: 12px; border-radius: 8px; }
  .btn-icon { width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 10px; }

  /* ── Progress Bars ── */
  .progress-track { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.05); overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }

  /* ── Legacy compatibility ── */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
  input, select, textarea { background: #1A1A1A; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #FFFFFF; padding: 10px 14px; font-family: 'Inter',sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; width: 100%; }
  input:focus, select:focus, textarea:focus { border-color: rgba(255,255,255,0.3); box-shadow: 0 0 0 3px rgba(255,255,255,0.06); }
  input[type=range] { padding: 0; height: 4px; cursor: pointer; accent-color: #22C55E; }
  select option { background: #1A1A1A; }
  button { font-family: 'Inter', sans-serif; cursor: pointer; border: none; outline: none; }
  .glass { background: rgba(18,18,18,0.9); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; backdrop-filter: blur(16px); }
  .glass-sm { background: rgba(26,26,26,0.85); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; }
  .glow { box-shadow: 0 0 24px rgba(255,255,255,0.08); }
  .neon { background: linear-gradient(135deg, #22C55E, #22C55E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .neon-btn { background: #22C55E; color: #0A0A0A; border-radius: 10px; padding: 10px 22px; font-weight: 700; font-size: 14px; letter-spacing: 0.01em; transition: all 0.2s; cursor: pointer; border: none; font-family: 'Inter', sans-serif; }
  .neon-btn:hover { background: #1DB954; }
  .neon-btn:active { transform: scale(0.98); }
  .ghost-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #A0A0A0; border-radius: 10px; padding: 8px 16px; font-size: 13px; transition: all 0.2s; cursor: pointer; font-family: 'Inter', sans-serif; }
  .ghost-btn:hover { background: rgba(255,255,255,0.04); color: #FFFFFF; border-color: rgba(255,255,255,0.2); }
  .tab-btn { background: none; color: #A0A0A0; padding: 8px 16px; font-size: 13px; font-weight: 500; border-radius: 8px; transition: all 0.2s; cursor: pointer; font-family: 'Inter', sans-serif; }
  .tab-btn.active { background: rgba(255,255,255,0.1); color: #22C55E; }
  .mono { font-family: 'JetBrains Mono', monospace; }
  .badge-card { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px; border-radius: 12px; background: #141414; border: 1px solid rgba(255,255,255,0.05); text-align: center; font-size: 11px; color: #A0A0A0; }
  .badge-card.earned { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.06); color: #22C55E; }
  @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes fadeInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
  @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes stepComplete { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }

  .onb-input-wrap { position: relative; margin-bottom: 20px; }
  .onb-input-wrap .onb-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.25); font-size: 16px; pointer-events: none; transition: color 0.2s; z-index: 1; }
  .onb-input-wrap input, .onb-input-wrap select { padding: 16px 16px 16px 44px !important; border-radius: 12px !important; font-size: 15px !important; background: #141414 !important; border: 1px solid rgba(255,255,255,0.08) !important; transition: all 0.25s ease !important; height: 52px; }
  .onb-input-wrap input:focus, .onb-input-wrap select:focus { border-color: rgba(255,255,255,0.3) !important; background: rgba(255,255,255,0.03) !important; box-shadow: 0 0 0 3px rgba(255,255,255,0.06) !important; }
  .onb-input-wrap input:focus ~ .onb-icon, .onb-input-wrap select:focus ~ .onb-icon { color: #22C55E; }
  .onb-input-wrap input::placeholder { color: rgba(255,255,255,0.2); }
  .onb-input-wrap label.onb-float { position: absolute; left: 44px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.25); font-size: 15px; pointer-events: none; transition: all 0.2s ease; background: transparent; padding: 0 4px; z-index: 2; }
  .onb-input-wrap input:focus ~ label.onb-float,
  .onb-input-wrap input:not(:placeholder-shown) ~ label.onb-float,
  .onb-input-wrap select:focus ~ label.onb-float,
  .onb-input-wrap select ~ label.onb-float { top: -8px; left: 36px; font-size: 11px; color: #22C55E; background: #0F0F0F; letter-spacing: 0.03em; font-weight: 500; }
  .onb-input-wrap select option { background: #1A1A1A; padding: 10px; }

  .onb-grad-btn { position: relative; overflow: hidden; background: #22C55E; color: #0A0A0A; border-radius: 12px; padding: 16px 32px; font-weight: 800; font-size: 15px; letter-spacing: 0.02em; transition: all 0.25s ease; border: none; cursor: pointer; width: 100%; }
  .onb-grad-btn:hover { background: #28D863; }
  .onb-grad-btn:active { transform: scale(0.98); }
  .onb-grad-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .onb-back-btn { background: #141414; border: 1px solid rgba(255,255,255,0.08); color: #999999; border-radius: 12px; padding: 14px 20px; font-size: 14px; font-weight: 500; transition: all 0.2s ease; cursor: pointer; }
  .onb-back-btn:hover { background: rgba(255,255,255,0.04); color: #FFFFFF; border-color: rgba(255,255,255,0.15); }

  .onb-goal-btn { padding: 14px 16px; border-radius: 12px; font-size: 13px; font-weight: 500; background: #141414; border: 1px solid rgba(255,255,255,0.06); color: #999999; transition: all 0.2s ease; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 10px; }
  .onb-goal-btn:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.15); color: #FFFFFF; }
  .onb-goal-btn.selected { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.3); color: #22C55E; }
  .onb-goal-btn .goal-check { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0; }
  .onb-goal-btn.selected .goal-check { border-color: #22C55E; background: #22C55E; }

  .onb-feature-card { background: #141414; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 20px; transition: all 0.25s ease; }
  .onb-feature-card:hover { background: #181818; border-color: rgba(255,255,255,0.1); }
  .onb-feature-card .feat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 12px; }
  .onb-feature-card h4 { font-size: 14px; font-weight: 600; color: #FFFFFF; margin-bottom: 6px; }
  .onb-feature-card p { font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.5; }

  @media (max-width: 900px) {
    .onb-split { flex-direction: column !important; }
    .onb-hero { padding: 40px 24px 32px !important; text-align: center; }
    .onb-hero h1 { font-size: 28px !important; }
    .onb-hero .feat-grid { grid-template-columns: 1fr !important; }
    .onb-card-side { padding: 16px !important; }
  }
  @media (max-width: 480px) {
    .onb-hero h1 { font-size: 24px !important; }
    .onb-hero .onb-subtitle { font-size: 14px !important; }
  }

  .dash-header { position: relative; overflow: hidden; border-radius: 16px; padding: 28px 32px; background: linear-gradient(135deg, #0F0F0F 0%, #141414 100%); border: 1px solid rgba(255,255,255,0.05); }
  .dash-header::before { content: ''; position: absolute; top: -50%; right: -10%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%); pointer-events: none; }

  .dash-metric { position: relative; background: #0F0F0F; border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; padding: 20px; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; cursor: default; }
  .dash-metric::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent, #22C55E), transparent); opacity: 0; transition: opacity 0.3s; }
  .dash-metric:hover { border-color: rgba(255,255,255,0.1); }
  .dash-metric:hover::before { opacity: 1; }

  .dash-quick { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 12px; background: #0F0F0F; border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
  .dash-quick:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.12); }
  .dash-quick:active { transform: scale(0.98); }
  .dash-quick .q-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }

  .dash-progress { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.05); overflow: hidden; position: relative; }
  .dash-progress-fill { height: 100%; border-radius: 3px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); position: relative; }
  .dash-progress-fill::after { content: ''; position: absolute; top: 0; right: 0; width: 20px; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2)); border-radius: 0 3px 3px 0; }

  .dash-section-title { font-size: 15px; font-weight: 700; color: #FFFFFF; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .dash-section-title .st-dot { width: 3px; height: 16px; border-radius: 2px; background: #22C55E; }

  .dash-ai-card { position: relative; background: #0F0F0F; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 28px; overflow: hidden; }
  .dash-ai-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); }
  .dash-ai-card::after { content: ''; position: absolute; top: -60%; right: -20%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%); pointer-events: none; }

  .dash-badge { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 12px; border-radius: 12px; background: #0F0F0F; border: 1px solid rgba(255,255,255,0.04); transition: all 0.25s; text-align: center; }
  .dash-badge:hover { border-color: rgba(255,255,255,0.1); }
  .dash-badge.earned { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.05); }

  .dash-timeline-item { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
  .dash-timeline-item:last-child { border-bottom: none; }
  .dash-timeline-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  .dash-sidebar-group { margin-bottom: 20px; }
  .dash-sidebar-label { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.1em; padding: 0 12px; margin-bottom: 6px; }
  .dash-sidebar-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 8px; background: transparent; border: 1px solid transparent; color: #999999; font-size: 13px; font-weight: 500; transition: all 0.2s; cursor: pointer; text-align: left; }
  .dash-sidebar-btn:hover { background: rgba(255,255,255,0.04); color: #FFFFFF; }
  .dash-sidebar-btn.active { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); color: #22C55E; }
  .dash-sidebar-btn .nav-icon { width: 20px; text-align: center; font-size: 15px; flex-shrink: 0; }

  .dash-recovery-bar { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
  .dash-recovery-label { font-size: 12px; color: #999999; width: 70px; flex-shrink: 0; }
  .dash-recovery-track { flex: 1; height: 8px; border-radius: 4px; background: rgba(255,255,255,0.04); overflow: hidden; }
  .dash-recovery-fill { height: 100%; border-radius: 4px; transition: width 1s ease; }
  .dash-recovery-val { font-size: 12px; font-weight: 600; color: #FFFFFF; width: 36px; text-align: right; font-family: 'JetBrains Mono', monospace; }

  .dash-activity-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; position: relative; }
  .dash-activity-dot::after { content: ''; position: absolute; inset: -3px; border-radius: 50%; border: 1px solid; border-color: inherit; opacity: 0.3; }

  .dash-upcoming-card { background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(34,197,94,0.02) 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; position: relative; overflow: hidden; }

  .dash-dropdown { position: absolute; top: calc(100% + 8px); right: 0; min-width: 220px; background: rgba(15,15,15,0.98); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 6px; backdrop-filter: blur(20px); box-shadow: 0 16px 48px rgba(0,0,0,0.6); z-index: 100; }
  .dash-dropdown-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 8px; background: none; border: none; color: #999999; font-size: 13px; cursor: pointer; transition: all 0.15s; text-align: left; }
  .dash-dropdown-item:hover { background: rgba(255,255,255,0.04); color: #FFFFFF; }
  .dash-dropdown-item.danger:hover { background: rgba(239,68,68,0.1); color: #EF4444; }
  .dash-dropdown-divider { height: 1px; background: rgba(255,255,255,0.05); margin: 4px 8px; }

  .dash-notif-panel { position: absolute; top: calc(100% + 8px); right: 0; width: 360px; max-height: 420px; overflow-y: auto; background: rgba(15,15,15,0.98); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 8px; backdrop-filter: blur(20px); box-shadow: 0 16px 48px rgba(0,0,0,0.6); z-index: 100; }
  .dash-notif-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-radius: 8px; transition: background 0.15s; }
  .dash-notif-item:hover { background: rgba(255,255,255,0.03); }

  .dash-filter-btn { padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; background: #1A1A1A; border: 1px solid rgba(255,255,255,0.06); color: #999999; cursor: pointer; transition: all 0.2s; }
  .dash-filter-btn:hover { background: #202020; color: #FFFFFF; }
  .dash-filter-btn.active { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.25); color: #22C55E; }

  .dash-clickable { cursor: pointer; transition: all 0.2s; }
  .dash-clickable:hover { border-color: rgba(255,255,255,0.12) !important; }

  .run-metric-card { position: relative; background: #0F0F0F; border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; padding: 20px; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; cursor: default; }
  .run-metric-card:hover { border-color: rgba(255,255,255,0.1); }
  .run-metric-card .run-metric-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 10px; }
  .run-metric-card .run-metric-value { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 800; color: #FFFFFF; }
  .run-metric-card .run-metric-label { font-size: 11px; color: #999999; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }

  .run-live-display { text-align: center; padding: 32px 16px; }
  .run-live-pace { font-family: 'JetBrains Mono', monospace; font-size: 64px; font-weight: 800; color: #22C55E; line-height: 1; }
  .run-live-label { font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px; }

  .run-map-container { border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); min-height: 300px; position: relative; }
  .run-map-container .leaflet-container { background: #0A0A0A; }

  .run-control-btn { border-radius: 12px; padding: 14px 28px; font-weight: 700; font-size: 14px; letter-spacing: 0.01em; transition: all 0.2s; cursor: pointer; border: none; font-family: 'Inter', sans-serif; }
  .run-control-btn:hover { transform: translateY(-1px); }
  .run-control-btn:active { transform: scale(0.98); }
  .run-control-btn.start { background: #22C55E; color: #0A0A0A; }
  .run-control-btn.start:hover { background: #28D863; }
  .run-control-btn.pause { background: rgba(245,158,11,0.1); color: #F59E0B; border: 1px solid rgba(245,158,11,0.25); }
  .run-control-btn.resume { background: rgba(34,197,94,0.1); color: #22C55E; border: 1px solid rgba(34,197,94,0.25); }
  .run-control-btn.finish { background: rgba(239,68,68,0.1); color: #EF4444; border: 1px solid rgba(239,68,68,0.25); }
  .run-control-btn.reset { background: #1A1A1A; color: #999999; border: 1px solid rgba(255,255,255,0.06); }
  .run-control-btn.ghost { background: transparent; color: #999999; border: 1px solid rgba(255,255,255,0.08); }

  .run-summary-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; overflow-y: auto; }
  .run-summary-card { width: 100%; max-width: 560px; background: rgba(15,15,15,0.98); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; }

  .run-history-item { background: #0F0F0F; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 18px; transition: all 0.2s; cursor: pointer; }
  .run-history-item:hover { border-color: rgba(255,255,255,0.1); }

  .run-pr-card { background: #0F0F0F; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 18px; transition: all 0.2s; text-align: center; }
  .run-pr-card.achieved { border-color: rgba(255,215,0,0.25); background: rgba(255,215,0,0.04); }
  .run-pr-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; background: rgba(255,215,0,0.1); color: #FFD700; }

  .run-goal-card { background: #0F0F0F; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; transition: all 0.25s; }
  .run-goal-card:hover { border-color: rgba(255,255,255,0.1); }
  .run-goal-card.met { border-color: rgba(34,197,94,0.25); background: rgba(34,197,94,0.04); }

  .run-split-row { display: grid; grid-template-columns: 60px 1fr 1fr; gap: 8px; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.03); align-items: center; font-size: 13px; }
  .run-split-row:last-child { border-bottom: none; }
  .run-split-header { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.05em; }
  .run-split-fast { color: #22C55E; }
  .run-split-slow { color: #EF4444; }

  .run-badge-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 12px; border-radius: 12px; background: #0F0F0F; border: 1px solid rgba(255,255,255,0.04); transition: all 0.25s; text-align: center; }
  .run-badge-card:hover { border-color: rgba(255,255,255,0.1); }
  .run-badge-card.earned { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.05); }
  .run-badge-icon { font-size: 28px; margin-bottom: 4px; }
  .run-badge-label { font-size: 12px; font-weight: 600; color: #FFFFFF; }
  .run-badge-desc { font-size: 10px; color: #999999; }
  .run-badge-card.earned .run-badge-label { color: #22C55E; }

  @keyframes runPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.2); } 50% { box-shadow: 0 0 0 12px rgba(255,255,255,0); } }
  @keyframes runGlow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
  .run-live-pulse { animation: runPulse 2s ease-in-out infinite; }
  .run-glow { animation: runGlow 2s ease-in-out infinite; }

  .skeleton { position: relative; overflow: hidden; background: rgba(255,255,255,0.03); border-radius: 8px; }
  .skeleton::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%); animation: shimmer 1.5s ease-in-out infinite; }

  .dash-goal-indicator { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); transition: all 0.25s; cursor: pointer; }
  .dash-goal-indicator:hover { border-color: rgba(255,255,255,0.1); }
  .dash-goal-indicator.met { border-color: rgba(34,197,94,0.25); background: rgba(34,197,94,0.04); }

  .dash-tip-chip { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #999999; transition: all 0.2s; cursor: default; }
  .dash-tip-chip:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1); color: #FFFFFF; }

  .dash-reminder { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); margin-bottom: 6px; transition: all 0.2s; }
  .dash-reminder:hover { background: rgba(255,255,255,0.04); }

  :focus-visible { outline: 2px solid rgba(34,197,94,0.4); outline-offset: 2px; border-radius: 8px; }
  button:focus-visible { outline: 2px solid rgba(34,197,94,0.4); outline-offset: 2px; }

  .wm-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
  .wm-page-header h2 { font-size: 22px; font-weight: 800; color: #FFFFFF; }
  .wm-tab-bar { display: flex; gap: 4px; padding: 4px; background: #0F0F0F; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 20px; flex-wrap: wrap; }
  .wm-tab { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; background: none; color: #999999; cursor: pointer; transition: all 0.2s; border: none; white-space: nowrap; }
  .wm-tab:hover { color: #FFFFFF; background: rgba(255,255,255,0.04); }
  .wm-tab.active { background: rgba(255,255,255,0.1); color: #22C55E; }

  .wm-exercise-card { background: #0F0F0F; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; transition: all 0.2s; margin-bottom: 12px; }
  .wm-exercise-card:hover { border-color: rgba(255,255,255,0.1); }
  .wm-exercise-card.active-exercise { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.03); }
  .wm-exercise-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .wm-exercise-name { font-size: 15px; font-weight: 700; color: #FFFFFF; }
  .wm-exercise-meta { font-size: 12px; color: #999999; }
  .wm-muscle-tag { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; background: rgba(255,255,255,0.07); color: #22C55E; margin-right: 4px; }

  .wm-set-row { display: grid; grid-template-columns: 36px 1fr 1fr 1fr 60px 36px; gap: 6px; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.02); }
  .wm-set-row:last-child { border-bottom: none; }
  .wm-set-num { font-size: 12px; font-weight: 600; color: #999999; text-align: center; }
  .wm-set-input { padding: 6px 8px !important; font-size: 13px !important; text-align: center; border-radius: 8px !important; height: 34px; font-family: 'JetBrains Mono', monospace; background: #1A1A1A !important; border-color: rgba(255,255,255,0.08) !important; }
  .wm-set-input.rpe { font-size: 12px !important; }
  .wm-set-done { width: 28px; height: 28px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.08); background: none; color: #999999; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 14px; }
  .wm-set-done.checked { background: #22C55E; border-color: #22C55E; color: #0A0A0A; }
  .wm-set-done:hover { border-color: #22C55E; }

  .wm-set-header { display: grid; grid-template-columns: 36px 1fr 1fr 1fr 60px 36px; gap: 6px; padding: 0 0 6px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 4px; }
  .wm-set-header span { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.05em; text-align: center; }

  .wm-rest-timer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .wm-rest-timer-card { text-align: center; }
  .wm-rest-timer-display { font-family: 'JetBrains Mono', monospace; font-size: 80px; font-weight: 700; color: #22C55E; line-height: 1; }
  .wm-rest-timer-label { font-size: 14px; color: #999999; margin-top: 12px; margin-bottom: 24px; }

  .wm-search-bar { position: relative; margin-bottom: 16px; }
  .wm-search-bar input { padding-left: 40px !important; height: 42px; }
  .wm-search-bar .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.25); font-size: 14px; pointer-events: none; }

  .wm-filter-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
  .wm-chip { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; background: #1A1A1A; border: 1px solid rgba(255,255,255,0.06); color: #999999; cursor: pointer; transition: all 0.2s; }
  .wm-chip:hover { background: #202020; color: #FFFFFF; }
  .wm-chip.active { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.25); color: #22C55E; }

  .wm-pr-card { background: #0F0F0F; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; transition: all 0.2s; }
  .wm-pr-card:hover { border-color: rgba(255,215,0,0.15); }
  .wm-pr-card .pr-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; background: rgba(255,215,0,0.1); color: #FFD700; }
  .wm-pr-card .pr-new { background: rgba(255,255,255,0.07); color: #22C55E; }

  .wm-history-card { background: #0F0F0F; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 18px; transition: all 0.2s; cursor: pointer; }
  .wm-history-card:hover { border-color: rgba(255,255,255,0.1); }

  .wm-session-bar { position: sticky; top: 0; z-index: 50; background: rgba(10,10,10,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 10px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .wm-session-timer { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 600; color: #22C55E; }
  .wm-session-stats { display: flex; gap: 16px; }
  .wm-session-stat { font-size: 12px; color: #999999; }
  .wm-session-stat span { color: #FFFFFF; font-weight: 600; font-family: 'JetBrains Mono', monospace; }

  .wm-summary-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
  .wm-summary-card { width: 100%; max-width: 480px; background: rgba(15,15,15,0.98); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; text-align: center; }

  .wm-empty { text-align: center; padding: 48px 24px; }
  .wm-empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.3; }
  .wm-empty-title { font-size: 18px; font-weight: 700; color: #FFFFFF; margin-bottom: 8px; }
  .wm-empty-desc { font-size: 13px; color: #999999; margin-bottom: 20px; }

  .wm-template-card { background: #0F0F0F; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 18px; transition: all 0.2s; cursor: pointer; }
  .wm-template-card:hover { border-color: rgba(255,255,255,0.12); }
  .wm-template-card.active { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.03); }

  .wm-notes-input { width: 100% !important; min-height: 48px; resize: vertical; padding: 8px 12px !important; font-size: 12px !important; color: #999999 !important; }

  @media (max-width: 768px) {
    .wm-set-row { grid-template-columns: 30px 1fr 1fr 1fr 48px 30px; gap: 4px; }
    .wm-set-header { grid-template-columns: 30px 1fr 1fr 1fr 48px 30px; gap: 4px; }
    .wm-session-bar { flex-wrap: wrap; justify-content: center; }
    .wm-rest-timer-display { font-size: 60px; }
    .wm-summary-card { padding: 24px 16px; }
  }

  @media (max-width: 1024px) {
    .dash-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .dash-charts-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 768px) {
    .dash-header { padding: 20px !important; }
    .dash-header h1 { font-size: 22px !important; }
    .dash-quick-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .dash-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .dash-badge-grid { grid-template-columns: repeat(3, 1fr) !important; }
    .dash-sidebar-overlay { display: block !important; }
  }
  @media (max-width: 480px) {
    .dash-metrics-grid { grid-template-columns: 1fr !important; }
    .dash-quick-grid { grid-template-columns: 1fr !important; }
    .dash-badge-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }

  .chat-container { display: flex; height: calc(100vh - 48px); gap: 0; border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); background: #0A0A0A; }
  .chat-sidebar { width: 260px; flex-shrink: 0; background: #0F0F0F; border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; transition: width 0.3s, opacity 0.3s; overflow: hidden; }
  .chat-sidebar.collapsed { width: 0; opacity: 0; pointer-events: none; }
  .chat-sidebar-header { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .chat-new-btn { width: 100%; padding: 10px 16px; border-radius: 10px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); color: #22C55E; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
  .chat-new-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
  .chat-conv-list { flex: 1; overflow-y: auto; padding: 8px; }
  .chat-conv-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: all 0.15s; margin-bottom: 2px; }
  .chat-conv-item:hover { background: rgba(255,255,255,0.03); }
  .chat-conv-item.active { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); }
  .chat-conv-item .conv-title { font-size: 13px; color: #FFFFFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; font-weight: 500; }
  .chat-conv-item .conv-delete { opacity: 0; background: none; border: none; color: #999999; cursor: pointer; padding: 2px 6px; border-radius: 6px; font-size: 12px; transition: all 0.15s; flex-shrink: 0; }
  .chat-conv-item:hover .conv-delete { opacity: 1; }
  .chat-conv-item .conv-delete:hover { color: #EF4444; background: rgba(239,68,68,0.1); }

  .chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .chat-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); background: #0F0F0F; gap: 12px; }
  .chat-header-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .chat-header-title { font-size: 15px; font-weight: 700; color: #FFFFFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .chat-header-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .chat-header-btn { padding: 6px 10px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); color: #999999; font-size: 12px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 4px; }
  .chat-header-btn:hover { background: rgba(255,255,255,0.06); color: #FFFFFF; border-color: rgba(255,255,255,0.1); }
  .chat-header-btn.danger:hover { background: rgba(239,68,68,0.1); color: #EF4444; border-color: rgba(239,68,68,0.15); }

  .chat-messages { flex: 1; overflow-y: auto; padding: 24px 0; scroll-behavior: smooth; }
  .chat-messages-inner { max-width: 780px; margin: 0 auto; padding: 0 24px; }

  .chat-msg { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 24px; }
  .chat-msg.user { flex-direction: row-reverse; }
  .chat-msg-avatar { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .chat-msg-avatar.assistant { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); }
  .chat-msg-avatar.user { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); }
  .chat-msg-body { max-width: 85%; min-width: 0; }
  .chat-msg-bubble { padding: 14px 18px; border-radius: 14px; font-size: 14px; line-height: 1.7; color: #E8E8E8; word-wrap: break-word; overflow-wrap: break-word; }
  .chat-msg.user .chat-msg-bubble { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius: 14px 4px 14px 14px; }
  .chat-msg.assistant .chat-msg-bubble { background: #141414; border: 1px solid rgba(255,255,255,0.06); border-radius: 4px 14px 14px 14px; }
  .chat-msg-meta { display: flex; align-items: center; gap: 8px; margin-top: 6px; padding: 0 4px; }
  .chat-msg.user .chat-msg-meta { flex-direction: row-reverse; }
  .chat-msg-time { font-size: 11px; color: rgba(255,255,255,0.25); }
  .chat-msg-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; }
  .chat-msg:hover .chat-msg-actions { opacity: 1; }
  .chat-msg-action { padding: 3px 8px; border-radius: 6px; background: none; border: 1px solid transparent; color: #999999; font-size: 11px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 3px; }
  .chat-msg-action:hover { background: rgba(255,255,255,0.05); color: #FFFFFF; border-color: rgba(255,255,255,0.08); }
  .chat-msg-action.copied { color: #22C55E; }

  .chat-typing { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 24px; }
  .chat-typing-dots { display: flex; gap: 4px; padding: 14px 18px; background: #141414; border: 1px solid rgba(255,255,255,0.06); border-radius: 4px 14px 14px 14px; }
  .chat-typing-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(34,197,94,0.4); animation: typingBounce 1.4s ease-in-out infinite; }
  .chat-typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .chat-typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-6px); opacity: 1; } }

  .chat-suggested { max-width: 780px; margin: 0 auto; padding: 40px 24px; }
  .chat-suggested-title { font-size: 20px; font-weight: 800; color: #FFFFFF; margin-bottom: 6px; }
  .chat-suggested-sub { font-size: 14px; color: #999999; margin-bottom: 28px; }
  .chat-suggested-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .chat-prompt-card { padding: 16px; border-radius: 12px; background: #0F0F0F; border: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: all 0.2s; text-align: left; }
  .chat-prompt-card:hover { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.1); }
  .chat-prompt-card .prompt-icon { font-size: 20px; margin-bottom: 8px; }
  .chat-prompt-card .prompt-title { font-size: 13px; font-weight: 600; color: #FFFFFF; margin-bottom: 4px; }
  .chat-prompt-card .prompt-desc { font-size: 12px; color: #999999; line-height: 1.4; }

  .chat-input-area { padding: 16px 24px 20px; border-top: 1px solid rgba(255,255,255,0.06); background: #0F0F0F; }
  .chat-input-wrap { max-width: 780px; margin: 0 auto; display: flex; gap: 10px; align-items: flex-end; }
  .chat-textarea-wrap { flex: 1; position: relative; }
  .chat-textarea { width: 100%; min-height: 44px; max-height: 160px; padding: 11px 16px; border-radius: 12px; background: #141414; border: 1px solid rgba(255,255,255,0.08); color: #FFFFFF; font-size: 14px; font-family: 'Inter', sans-serif; line-height: 1.5; resize: none; outline: none; transition: border-color 0.2s; }
  .chat-textarea:focus { border-color: rgba(255,255,255,0.25); }
  .chat-textarea::placeholder { color: rgba(255,255,255,0.2); }
  .chat-send-btn { width: 44px; height: 44px; border-radius: 10px; background: #22C55E; border: none; color: #0A0A0A; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
  .chat-send-btn:hover { background: #28D863; }
  .chat-send-btn:disabled { opacity: 0.3; cursor: not-allowed; background: #666666; }
  .chat-send-btn:active:not(:disabled) { transform: scale(0.95); }

  .chat-code-block { background: #0A0A0A; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 14px 16px; margin: 10px 0; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.6; color: #E8E8E8; }
  .chat-inline-code { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 1px 6px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #22C55E; }
  .chat-md-h { font-weight: 700; color: #FFFFFF; margin: 12px 0 6px; }
  .chat-md-h:first-child { margin-top: 0; }
  .chat-md-ul, .chat-md-ol { padding-left: 20px; margin: 8px 0; }
  .chat-md-li, .chat-md-oli { margin-bottom: 4px; line-height: 1.6; }

  @media (max-width: 768px) {
    .chat-sidebar { position: absolute; z-index: 30; height: 100%; }
    .chat-sidebar.collapsed { width: 0; }
    .chat-suggested-grid { grid-template-columns: 1fr; }
    .chat-msg-body { max-width: 90%; }
    .chat-messages-inner { padding: 0 16px; }
  }

  .topbar { position: sticky; top: 0; z-index: 40; display: flex; align-items: center; justify-content: space-between; padding: 12px 28px; background: rgba(10,10,10,0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.06); min-height: 56px; }
  .topbar-title { font-size: 16px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.01em; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }

  .topbar-avatar { width: 36px; height: 36px; border-radius: 8px; background: #22C55E; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #0A0A0A; cursor: pointer; transition: all 0.2s; border: 2px solid transparent; position: relative; }
  .topbar-avatar:hover { border-color: rgba(255,255,255,0.2); }
  .topbar-avatar.open { border-color: #22C55E; }

  .account-menu { position: absolute; top: calc(100% + 10px); right: 0; min-width: 260px; background: rgba(15,15,15,0.98); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 8px; backdrop-filter: blur(20px); box-shadow: 0 20px 60px rgba(0,0,0,0.6); z-index: 9999; }
  .account-menu-header { padding: 14px 14px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 4px; display: flex; align-items: center; gap: 12px; }
  .account-menu-header .avatar-lg { width: 42px; height: 42px; border-radius: 10px; background: #22C55E; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: #0A0A0A; flex-shrink: 0; }
  .account-menu-header .user-info { flex: 1; min-width: 0; }
  .account-menu-header .user-name { font-size: 14px; font-weight: 700; color: #FFFFFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .account-menu-header .user-meta { font-size: 12px; color: #999999; margin-top: 1px; }

  .account-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 8px; background: none; border: none; color: #999999; font-size: 13px; cursor: pointer; transition: all 0.15s; text-align: left; font-family: 'Inter', sans-serif; }
  .account-menu-item:hover { background: rgba(255,255,255,0.04); color: #FFFFFF; }
  .account-menu-item .menu-icon { width: 20px; text-align: center; font-size: 15px; flex-shrink: 0; }
  .account-menu-item .menu-label { flex: 1; }
  .account-menu-item .menu-shortcut { font-size: 11px; color: rgba(255,255,255,0.15); }

  .account-menu-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 8px; }

  .account-menu-item.danger { color: #EF4444; }
  .account-menu-item.danger:hover { background: rgba(239,68,68,0.08); color: #EF4444; }

  .logout-modal-overlay { position: fixed; inset: 0; z-index: 10001; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); padding: 20px; }
  .logout-modal { background: rgba(15,15,15,0.98); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 36px 32px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 24px 64px rgba(0,0,0,0.5); }
  .logout-modal-icon { width: 56px; height: 56px; border-radius: 12px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.15); display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 20px; }
  .logout-modal h3 { font-size: 20px; font-weight: 800; color: #FFFFFF; margin-bottom: 12px; text-align: center; }
  .logout-modal p { font-size: 14px; color: #999999; line-height: 1.7; margin-bottom: 28px; text-align: center; word-wrap: break-word; overflow-wrap: break-word; }
  .logout-modal-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .logout-modal-actions .btn-cancel { background: #1A1A1A; border: 1px solid rgba(255,255,255,0.08); color: #999999; border-radius: 10px; padding: 11px 24px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .logout-modal-actions .btn-cancel:hover { background: rgba(255,255,255,0.04); color: #FFFFFF; border-color: rgba(255,255,255,0.15); }
  .logout-modal-actions .btn-signout { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #EF4444; border-radius: 10px; padding: 11px 24px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .logout-modal-actions .btn-signout:hover { background: rgba(239,68,68,0.18); }

  @keyframes menuSlideDown { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .account-menu { animation: menuSlideDown 0.18s cubic-bezier(0.16, 1, 0.3, 1); }

  @media (max-width: 768px) {
    .topbar { padding: 10px 16px; }
    .account-menu { min-width: 240px; right: -8px; }
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
