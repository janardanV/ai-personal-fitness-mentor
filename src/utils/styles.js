import { useEffect } from "react";

export const G_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body, #root { min-height: 100vh; font-family: 'Inter', sans-serif; background: #0B0B0B; color: #FFFFFF; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(200,255,0,0.25); border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(200,255,0,0.4); }
  input, select, textarea { background: #1D1D1D; border: 1px solid rgba(200,255,0,0.1); border-radius: 12px; color: #FFFFFF; padding: 10px 14px; font-family: 'Inter',sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; width: 100%; }
  input:focus, select:focus, textarea:focus { border-color: rgba(200,255,0,0.5); box-shadow: 0 0 0 3px rgba(200,255,0,0.06); }
  input[type=range] { padding: 0; height: 4px; cursor: pointer; accent-color: #C8FF00; }
  select option { background: #1D1D1D; }
  button { font-family: 'Inter', sans-serif; cursor: pointer; border: none; outline: none; }
  .glass { background: rgba(21,21,21,0.85); border: 1px solid rgba(200,255,0,0.1); border-radius: 16px; backdrop-filter: blur(16px); }
  .glass-sm { background: rgba(29,29,29,0.8); border: 1px solid rgba(200,255,0,0.08); border-radius: 12px; }
  .glow { box-shadow: 0 0 24px rgba(200,255,0,0.15); }
  .neon { background: linear-gradient(135deg, #C8FF00, #A5E600); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .neon-btn { background: #C8FF00; color: #0B0B0B; border-radius: 12px; padding: 10px 22px; font-weight: 700; font-size: 14px; letter-spacing: 0.01em; transition: all 0.2s; }
  .neon-btn:hover { background: #D9FF4D; transform: translateY(-1px); }
  .neon-btn:active { transform: scale(0.98); }
  .ghost-btn { background: #1D1D1D; border: 1px solid rgba(200,255,0,0.1); color: #A0A0A0; border-radius: 12px; padding: 8px 16px; font-size: 13px; transition: all 0.2s; }
  .ghost-btn:hover { background: rgba(200,255,0,0.08); color: #FFFFFF; border-color: rgba(200,255,0,0.3); }
  .tab-btn { background: none; color: #A0A0A0; padding: 8px 16px; font-size: 13px; font-weight: 500; border-radius: 10px; transition: all 0.2s; }
  .tab-btn.active { background: rgba(200,255,0,0.12); color: #C8FF00; }
  .mono { font-family: 'JetBrains Mono', monospace; }
  .badge-card { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px; border-radius: 14px; background: #181818; border: 1px solid rgba(200,255,0,0.08); text-align: center; font-size: 11px; color: #A0A0A0; }
  .badge-card.earned { border-color: rgba(200,255,0,0.4); background: rgba(200,255,0,0.08); color: #C8FF00; }
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
  @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 20px rgba(200,255,0,0.1); } 50% { box-shadow: 0 0 40px rgba(200,255,0,0.2); } }

  .onb-input-wrap { position: relative; margin-bottom: 20px; }
  .onb-input-wrap .onb-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(160,160,160,0.6); font-size: 16px; pointer-events: none; transition: color 0.2s; z-index: 1; }
  .onb-input-wrap input, .onb-input-wrap select { padding: 16px 16px 16px 44px !important; border-radius: 14px !important; font-size: 15px !important; background: #181818 !important; border: 1px solid rgba(200,255,0,0.08) !important; transition: all 0.25s ease !important; height: 52px; }
  .onb-input-wrap input:focus, .onb-input-wrap select:focus { border-color: #C8FF00 !important; background: rgba(200,255,0,0.03) !important; box-shadow: 0 0 0 3px rgba(200,255,0,0.08) !important; }
  .onb-input-wrap input:focus ~ .onb-icon, .onb-input-wrap select:focus ~ .onb-icon { color: #C8FF00; }
  .onb-input-wrap input::placeholder { color: rgba(160,160,160,0.35); }
  .onb-input-wrap label.onb-float { position: absolute; left: 44px; top: 50%; transform: translateY(-50%); color: rgba(160,160,160,0.45); font-size: 15px; pointer-events: none; transition: all 0.2s ease; background: transparent; padding: 0 4px; z-index: 2; }
  .onb-input-wrap input:focus ~ label.onb-float,
  .onb-input-wrap input:not(:placeholder-shown) ~ label.onb-float,
  .onb-input-wrap select:focus ~ label.onb-float,
  .onb-input-wrap select ~ label.onb-float { top: -8px; left: 36px; font-size: 11px; color: #C8FF00; background: #121212; letter-spacing: 0.03em; font-weight: 500; }
  .onb-input-wrap select option { background: #1D1D1D; padding: 10px; }

  .onb-grad-btn { position: relative; overflow: hidden; background: #C8FF00; color: #0B0B0B; border-radius: 14px; padding: 16px 32px; font-weight: 800; font-size: 15px; letter-spacing: 0.02em; transition: all 0.25s ease; border: none; cursor: pointer; width: 100%; }
  .onb-grad-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(200,255,0,0.25); background: #D9FF4D; }
  .onb-grad-btn:active { transform: translateY(0) scale(0.98); }
  .onb-grad-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; background: #A0A0A0; color: #1D1D1D; }
  .onb-grad-btn .btn-ripple { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.25); width: 20px; height: 20px; margin-top: -10px; margin-left: -10px; animation: ripple 0.5s linear; pointer-events: none; }

  .onb-back-btn { background: #181818; border: 1px solid rgba(200,255,0,0.08); color: #A0A0A0; border-radius: 12px; padding: 14px 20px; font-size: 14px; font-weight: 500; transition: all 0.2s ease; cursor: pointer; }
  .onb-back-btn:hover { background: rgba(200,255,0,0.06); color: #FFFFFF; border-color: rgba(200,255,0,0.25); }

  .onb-goal-btn { padding: 14px 16px; border-radius: 14px; font-size: 13px; font-weight: 500; background: #151515; border: 1px solid rgba(200,255,0,0.06); color: #A0A0A0; transition: all 0.2s ease; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 10px; }
  .onb-goal-btn:hover { background: rgba(200,255,0,0.05); border-color: rgba(200,255,0,0.15); color: #FFFFFF; }
  .onb-goal-btn.selected { background: rgba(200,255,0,0.1); border-color: rgba(200,255,0,0.4); color: #C8FF00; box-shadow: 0 0 20px rgba(200,255,0,0.06); }
  .onb-goal-btn .goal-check { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(160,160,160,0.2); display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0; }
  .onb-goal-btn.selected .goal-check { border-color: #C8FF00; background: #C8FF00; }

  .onb-feature-card { background: #181818; border: 1px solid rgba(200,255,0,0.06); border-radius: 16px; padding: 20px; transition: all 0.25s ease; }
  .onb-feature-card:hover { background: #1D1D1D; border-color: rgba(200,255,0,0.12); transform: translateY(-2px); }
  .onb-feature-card .feat-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 12px; }
  .onb-feature-card h4 { font-size: 14px; font-weight: 600; color: #FFFFFF; margin-bottom: 6px; }
  .onb-feature-card p { font-size: 12px; color: rgba(160,160,160,0.7); line-height: 1.5; }

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

  .dash-header { position: relative; overflow: hidden; border-radius: 20px; padding: 28px 32px; background: linear-gradient(135deg, #151515 0%, #1D1D1D 100%); border: 1px solid rgba(200,255,0,0.1); backdrop-filter: blur(16px); }
  .dash-header::before { content: ''; position: absolute; top: -50%; right: -10%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(200,255,0,0.06) 0%, transparent 70%); pointer-events: none; }
  .dash-header::after { content: ''; position: absolute; bottom: -40%; left: 20%; width: 200px; height: 200px; background: radial-gradient(circle, rgba(165,230,0,0.04) 0%, transparent 70%); pointer-events: none; }

  .dash-metric { position: relative; background: #151515; border: 1px solid rgba(200,255,0,0.08); border-radius: 16px; padding: 20px; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; cursor: default; }
  .dash-metric::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent, #C8FF00), transparent); opacity: 0; transition: opacity 0.3s; }
  .dash-metric:hover { transform: translateY(-2px); border-color: rgba(200,255,0,0.15); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
  .dash-metric:hover::before { opacity: 1; }

  .dash-quick { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 14px; background: #151515; border: 1px solid rgba(200,255,0,0.06); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
  .dash-quick:hover { background: rgba(200,255,0,0.06); border-color: rgba(200,255,0,0.15); transform: translateY(-1px); }
  .dash-quick:active { transform: translateY(0) scale(0.98); }
  .dash-quick .q-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }

  .dash-progress { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.05); overflow: hidden; position: relative; }
  .dash-progress-fill { height: 100%; border-radius: 3px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); position: relative; }
  .dash-progress-fill::after { content: ''; position: absolute; top: 0; right: 0; width: 20px; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3)); border-radius: 0 3px 3px 0; }

  .dash-section-title { font-size: 15px; font-weight: 700; color: #FFFFFF; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .dash-section-title .st-dot { width: 4px; height: 18px; border-radius: 2px; background: #C8FF00; }

  .dash-ai-card { position: relative; background: linear-gradient(135deg, #151515 0%, #181818 100%); border: 1px solid rgba(200,255,0,0.1); border-radius: 20px; padding: 28px; overflow: hidden; }
  .dash-ai-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,255,0,0.25), transparent); }
  .dash-ai-card::after { content: ''; position: absolute; top: -60%; right: -20%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(200,255,0,0.04) 0%, transparent 60%); pointer-events: none; }

  .dash-badge { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 12px; border-radius: 14px; background: #151515; border: 1px solid rgba(255,255,255,0.04); transition: all 0.25s; text-align: center; }
  .dash-badge:hover { border-color: rgba(200,255,0,0.12); transform: translateY(-2px); }
  .dash-badge.earned { border-color: rgba(200,255,0,0.3); background: rgba(200,255,0,0.05); }
  .dash-badge .badge-glow { position: absolute; inset: 0; border-radius: 14px; background: radial-gradient(circle at center, rgba(200,255,0,0.08), transparent 70%); opacity: 0; transition: opacity 0.3s; }
  .dash-badge.earned .badge-glow { opacity: 1; }

  .dash-timeline-item { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
  .dash-timeline-item:last-child { border-bottom: none; }
  .dash-timeline-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  .dash-sidebar-group { margin-bottom: 20px; }
  .dash-sidebar-label { font-size: 10px; font-weight: 600; color: rgba(160,160,160,0.35); text-transform: uppercase; letter-spacing: 0.1em; padding: 0 12px; margin-bottom: 6px; }
  .dash-sidebar-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 10px; background: transparent; border: 1px solid transparent; color: #A0A0A0; font-size: 13px; font-weight: 500; transition: all 0.2s; cursor: pointer; text-align: left; }
  .dash-sidebar-btn:hover { background: rgba(200,255,0,0.04); color: #FFFFFF; }
  .dash-sidebar-btn.active { background: rgba(200,255,0,0.08); border-color: rgba(200,255,0,0.15); color: #C8FF00; }
  .dash-sidebar-btn .nav-icon { width: 20px; text-align: center; font-size: 15px; flex-shrink: 0; }

  .dash-recovery-bar { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
  .dash-recovery-label { font-size: 12px; color: #A0A0A0; width: 70px; flex-shrink: 0; }
  .dash-recovery-track { flex: 1; height: 8px; border-radius: 4px; background: rgba(255,255,255,0.04); overflow: hidden; }
  .dash-recovery-fill { height: 100%; border-radius: 4px; transition: width 1s ease; }
  .dash-recovery-val { font-size: 12px; font-weight: 600; color: #FFFFFF; width: 36px; text-align: right; font-family: 'JetBrains Mono', monospace; }

  .dash-activity-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; position: relative; }
  .dash-activity-dot::after { content: ''; position: absolute; inset: -3px; border-radius: 50%; border: 1px solid; border-color: inherit; opacity: 0.3; }

  .dash-upcoming-card { background: linear-gradient(135deg, rgba(200,255,0,0.06) 0%, rgba(165,230,0,0.03) 100%); border: 1px solid rgba(200,255,0,0.1); border-radius: 16px; padding: 20px; position: relative; overflow: hidden; }
  .dash-upcoming-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,255,0,0.3), transparent); }

  .dash-dropdown { position: absolute; top: calc(100% + 8px); right: 0; min-width: 220px; background: rgba(15,15,15,0.98); border: 1px solid rgba(200,255,0,0.1); border-radius: 14px; padding: 6px; backdrop-filter: blur(20px); box-shadow: 0 16px 48px rgba(0,0,0,0.5); z-index: 100; }
  .dash-dropdown-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 10px; background: none; border: none; color: #A0A0A0; font-size: 13px; cursor: pointer; transition: all 0.15s; text-align: left; }
  .dash-dropdown-item:hover { background: rgba(200,255,0,0.06); color: #FFFFFF; }
  .dash-dropdown-item.danger:hover { background: rgba(255,71,87,0.1); color: #FF4757; }
  .dash-dropdown-divider { height: 1px; background: rgba(255,255,255,0.05); margin: 4px 8px; }

  .dash-notif-panel { position: absolute; top: calc(100% + 8px); right: 0; width: 360px; max-height: 420px; overflow-y: auto; background: rgba(15,15,15,0.98); border: 1px solid rgba(200,255,0,0.1); border-radius: 14px; padding: 8px; backdrop-filter: blur(20px); box-shadow: 0 16px 48px rgba(0,0,0,0.5); z-index: 100; }
  .dash-notif-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-radius: 10px; transition: background 0.15s; }
  .dash-notif-item:hover { background: rgba(200,255,0,0.03); }

  .dash-filter-btn { padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; background: #1D1D1D; border: 1px solid rgba(200,255,0,0.06); color: #A0A0A0; cursor: pointer; transition: all 0.2s; }
  .dash-filter-btn:hover { background: #252525; color: #FFFFFF; }
  .dash-filter-btn.active { background: rgba(200,255,0,0.1); border-color: rgba(200,255,0,0.25); color: #C8FF00; }

  .dash-clickable { cursor: pointer; transition: all 0.2s; }
  .dash-clickable:hover { border-color: rgba(200,255,0,0.2) !important; }

  .run-metric-card { position: relative; background: #151515; border: 1px solid rgba(200,255,0,0.08); border-radius: 16px; padding: 20px; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; cursor: default; }
  .run-metric-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent, #C8FF00), transparent); opacity: 0; transition: opacity 0.3s; }
  .run-metric-card:hover { transform: translateY(-2px); border-color: rgba(200,255,0,0.15); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
  .run-metric-card:hover::before { opacity: 1; }
  .run-metric-card .run-metric-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 10px; }
  .run-metric-card .run-metric-value { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 800; color: #FFFFFF; }
  .run-metric-card .run-metric-label { font-size: 11px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }

  .run-live-display { text-align: center; padding: 32px 16px; }
  .run-live-pace { font-family: 'JetBrains Mono', monospace; font-size: 64px; font-weight: 800; color: #C8FF00; text-shadow: 0 0 40px rgba(200,255,0,0.3); line-height: 1; }
  .run-live-label { font-size: 12px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px; }

  .run-map-container { border-radius: 16px; overflow: hidden; border: 1px solid rgba(200,255,0,0.08); min-height: 300px; position: relative; }
  .run-map-container .leaflet-container { background: #0B0B0B; }

  .run-control-btn { border-radius: 14px; padding: 14px 28px; font-weight: 700; font-size: 14px; letter-spacing: 0.01em; transition: all 0.2s; cursor: pointer; border: none; font-family: 'Inter', sans-serif; }
  .run-control-btn:hover { transform: translateY(-1px); }
  .run-control-btn:active { transform: scale(0.98); }
  .run-control-btn.start { background: #C8FF00; color: #0B0B0B; }
  .run-control-btn.start:hover { background: #D9FF4D; box-shadow: 0 4px 20px rgba(200,255,0,0.25); }
  .run-control-btn.pause { background: rgba(255,165,0,0.12); color: #FFA500; border: 1px solid rgba(255,165,0,0.3); }
  .run-control-btn.resume { background: rgba(0,200,83,0.12); color: #00C853; border: 1px solid rgba(0,200,83,0.3); }
  .run-control-btn.finish { background: rgba(255,71,87,0.12); color: #FF4757; border: 1px solid rgba(255,71,87,0.3); }
  .run-control-btn.reset { background: #1D1D1D; color: #A0A0A0; border: 1px solid rgba(200,255,0,0.1); }
  .run-control-btn.ghost { background: transparent; color: #A0A0A0; border: 1px solid rgba(200,255,0,0.1); }

  .run-summary-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.88); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; overflow-y: auto; }
  .run-summary-card { width: 100%; max-width: 560px; background: rgba(15,15,15,0.98); border: 1px solid rgba(200,255,0,0.12); border-radius: 20px; padding: 32px; }

  .run-history-item { background: #151515; border: 1px solid rgba(200,255,0,0.06); border-radius: 14px; padding: 18px; transition: all 0.2s; cursor: pointer; }
  .run-history-item:hover { border-color: rgba(200,255,0,0.12); transform: translateY(-1px); }

  .run-pr-card { background: #151515; border: 1px solid rgba(200,255,0,0.06); border-radius: 14px; padding: 18px; transition: all 0.2s; text-align: center; }
  .run-pr-card.achieved { border-color: rgba(255,215,0,0.3); background: rgba(255,215,0,0.05); }
  .run-pr-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; background: rgba(255,215,0,0.1); color: #FFD700; }

  .run-goal-card { background: #151515; border: 1px solid rgba(200,255,0,0.06); border-radius: 14px; padding: 20px; transition: all 0.25s; }
  .run-goal-card:hover { border-color: rgba(200,255,0,0.12); }
  .run-goal-card.met { border-color: rgba(165,230,0,0.3); background: rgba(165,230,0,0.04); }

  .run-split-row { display: grid; grid-template-columns: 60px 1fr 1fr; gap: 8px; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.03); align-items: center; font-size: 13px; }
  .run-split-row:last-child { border-bottom: none; }
  .run-split-header { font-size: 10px; font-weight: 600; color: rgba(160,160,160,0.4); text-transform: uppercase; letter-spacing: 0.05em; }
  .run-split-fast { color: #00C853; }
  .run-split-slow { color: #FF4757; }

  .run-badge-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 12px; border-radius: 14px; background: #151515; border: 1px solid rgba(255,255,255,0.04); transition: all 0.25s; text-align: center; }
  .run-badge-card:hover { border-color: rgba(200,255,0,0.12); transform: translateY(-2px); }
  .run-badge-card.earned { border-color: rgba(200,255,0,0.3); background: rgba(200,255,0,0.05); }
  .run-badge-icon { font-size: 28px; margin-bottom: 4px; }
  .run-badge-label { font-size: 12px; font-weight: 600; color: #FFFFFF; }
  .run-badge-desc { font-size: 10px; color: #A0A0A0; }
  .run-badge-card.earned .run-badge-label { color: #C8FF00; }

  @keyframes runPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(200,255,0,0.3); } 50% { box-shadow: 0 0 0 12px rgba(200,255,0,0); } }
  @keyframes runGlow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
  .run-live-pulse { animation: runPulse 2s ease-in-out infinite; }
  .run-glow { animation: runGlow 2s ease-in-out infinite; }

  .skeleton { position: relative; overflow: hidden; background: rgba(255,255,255,0.03); border-radius: 8px; }
  .skeleton::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(200,255,0,0.03) 50%, transparent 100%); animation: shimmer 1.5s ease-in-out infinite; }

  .dash-goal-indicator { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); transition: all 0.25s; cursor: pointer; }
  .dash-goal-indicator:hover { border-color: rgba(200,255,0,0.12); }
  .dash-goal-indicator.met { border-color: rgba(165,230,0,0.3); background: rgba(165,230,0,0.04); }

  .dash-tip-chip { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px; background: rgba(200,255,0,0.05); border: 1px solid rgba(200,255,0,0.08); font-size: 12px; color: #A0A0A0; transition: all 0.2s; cursor: default; }
  .dash-tip-chip:hover { background: rgba(200,255,0,0.08); border-color: rgba(200,255,0,0.15); color: #FFFFFF; }

  .dash-reminder { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); margin-bottom: 6px; transition: all 0.2s; }
  .dash-reminder:hover { background: rgba(255,255,255,0.04); }

  :focus-visible { outline: 2px solid rgba(200,255,0,0.5); outline-offset: 2px; border-radius: 8px; }
  button:focus-visible { outline: 2px solid rgba(200,255,0,0.5); outline-offset: 2px; }

  .wm-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
  .wm-page-header h2 { font-size: 22px; font-weight: 800; color: #FFFFFF; }
  .wm-tab-bar { display: flex; gap: 4px; padding: 4px; background: #151515; border-radius: 12px; border: 1px solid rgba(200,255,0,0.06); margin-bottom: 20px; flex-wrap: wrap; }
  .wm-tab { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; background: none; color: #A0A0A0; cursor: pointer; transition: all 0.2s; border: none; white-space: nowrap; }
  .wm-tab:hover { color: #FFFFFF; background: rgba(255,255,255,0.04); }
  .wm-tab.active { background: rgba(200,255,0,0.12); color: #C8FF00; }

  .wm-exercise-card { background: #151515; border: 1px solid rgba(200,255,0,0.06); border-radius: 14px; padding: 16px; transition: all 0.2s; margin-bottom: 12px; }
  .wm-exercise-card:hover { border-color: rgba(200,255,0,0.12); }
  .wm-exercise-card.active-exercise { border-color: rgba(200,255,0,0.3); background: rgba(200,255,0,0.03); }
  .wm-exercise-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .wm-exercise-name { font-size: 15px; font-weight: 700; color: #FFFFFF; }
  .wm-exercise-meta { font-size: 12px; color: #A0A0A0; }
  .wm-muscle-tag { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; background: rgba(200,255,0,0.08); color: #C8FF00; margin-right: 4px; }

  .wm-set-row { display: grid; grid-template-columns: 36px 1fr 1fr 1fr 60px 36px; gap: 6px; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.02); }
  .wm-set-row:last-child { border-bottom: none; }
  .wm-set-num { font-size: 12px; font-weight: 600; color: #A0A0A0; text-align: center; }
  .wm-set-input { padding: 6px 8px !important; font-size: 13px !important; text-align: center; border-radius: 8px !important; height: 34px; font-family: 'JetBrains Mono', monospace; background: #1D1D1D !important; border-color: rgba(200,255,0,0.08) !important; }
  .wm-set-input.rpe { font-size: 12px !important; }
  .wm-set-done { width: 28px; height: 28px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.08); background: none; color: #A0A0A0; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 14px; }
  .wm-set-done.checked { background: #C8FF00; border-color: #C8FF00; color: #0B0B0B; }
  .wm-set-done:hover { border-color: #C8FF00; }

  .wm-set-header { display: grid; grid-template-columns: 36px 1fr 1fr 1fr 60px 36px; gap: 6px; padding: 0 0 6px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 4px; }
  .wm-set-header span { font-size: 10px; font-weight: 600; color: rgba(160,160,160,0.4); text-transform: uppercase; letter-spacing: 0.05em; text-align: center; }

  .wm-rest-timer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.88); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .wm-rest-timer-card { text-align: center; }
  .wm-rest-timer-display { font-family: 'JetBrains Mono', monospace; font-size: 80px; font-weight: 700; color: #C8FF00; text-shadow: 0 0 40px rgba(200,255,0,0.3); line-height: 1; }
  .wm-rest-timer-label { font-size: 14px; color: #A0A0A0; margin-top: 12px; margin-bottom: 24px; }

  .wm-search-bar { position: relative; margin-bottom: 16px; }
  .wm-search-bar input { padding-left: 40px !important; height: 42px; }
  .wm-search-bar .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(160,160,160,0.4); font-size: 14px; pointer-events: none; }

  .wm-filter-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
  .wm-chip { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; background: #1D1D1D; border: 1px solid rgba(200,255,0,0.06); color: #A0A0A0; cursor: pointer; transition: all 0.2s; }
  .wm-chip:hover { background: #252525; color: #FFFFFF; }
  .wm-chip.active { background: rgba(200,255,0,0.1); border-color: rgba(200,255,0,0.25); color: #C8FF00; }

  .wm-pr-card { background: #151515; border: 1px solid rgba(200,255,0,0.06); border-radius: 14px; padding: 16px; transition: all 0.2s; }
  .wm-pr-card:hover { border-color: rgba(255,215,0,0.2); }
  .wm-pr-card .pr-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; background: rgba(255,215,0,0.1); color: #FFD700; }
  .wm-pr-card .pr-new { background: rgba(200,255,0,0.08); color: #C8FF00; }

  .wm-history-card { background: #151515; border: 1px solid rgba(200,255,0,0.06); border-radius: 14px; padding: 18px; transition: all 0.2s; cursor: pointer; }
  .wm-history-card:hover { border-color: rgba(200,255,0,0.12); transform: translateY(-1px); }

  .wm-session-bar { position: sticky; top: 0; z-index: 50; background: rgba(11,11,11,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(200,255,0,0.12); padding: 10px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .wm-session-timer { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 600; color: #C8FF00; }
  .wm-session-stats { display: flex; gap: 16px; }
  .wm-session-stat { font-size: 12px; color: #A0A0A0; }
  .wm-session-stat span { color: #FFFFFF; font-weight: 600; font-family: 'JetBrains Mono', monospace; }

  .wm-summary-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.88); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
  .wm-summary-card { width: 100%; max-width: 480px; background: rgba(15,15,15,0.98); border: 1px solid rgba(200,255,0,0.12); border-radius: 20px; padding: 32px; text-align: center; }

  .wm-empty { text-align: center; padding: 48px 24px; }
  .wm-empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.3; }
  .wm-empty-title { font-size: 18px; font-weight: 700; color: #FFFFFF; margin-bottom: 8px; }
  .wm-empty-desc { font-size: 13px; color: #A0A0A0; margin-bottom: 20px; }

  .wm-template-card { background: #151515; border: 1px solid rgba(200,255,0,0.06); border-radius: 14px; padding: 18px; transition: all 0.2s; cursor: pointer; }
  .wm-template-card:hover { border-color: rgba(200,255,0,0.15); transform: translateY(-2px); }
  .wm-template-card.active { border-color: rgba(200,255,0,0.35); background: rgba(200,255,0,0.03); }

  .wm-notes-input { width: 100% !important; min-height: 48px; resize: vertical; padding: 8px 12px !important; font-size: 12px !important; color: #A0A0A0 !important; }

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
  @media (max-width: 1024px) {
    .bento-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .bento-grid > .bento-span-2 { grid-column: span 2 !important; }
    .bento-grid > .bento-span-4 { grid-column: span 2 !important; }
  }
  @media (max-width: 768px) {
    .dash-header { padding: 20px !important; }
    .dash-header h1 { font-size: 22px !important; }
    .dash-quick-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .dash-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .dash-badge-grid { grid-template-columns: repeat(3, 1fr) !important; }
    .dash-sidebar-overlay { display: block !important; }
    .bento-grid { grid-template-columns: 1fr !important; }
    .bento-grid > .bento-span-2, .bento-grid > .bento-span-4 { grid-column: span 1 !important; }
  }
  @media (max-width: 480px) {
    .dash-metrics-grid { grid-template-columns: 1fr !important; }
    .dash-quick-grid { grid-template-columns: 1fr !important; }
    .dash-badge-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .bento-grid { grid-template-columns: 1fr !important; }
  }

  .bento-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: start; }
  .bento-grid > .bento-span-2 { grid-column: span 2; }
  .bento-grid > .bento-span-4 { grid-column: span 4; }
  .bento-card { background: #111111; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
  .bento-card:hover { border-color: rgba(255,255,255,0.08); }
  .bento-card-hero { background: #111111; border: 1px solid rgba(200,255,0,0.08); border-radius: 20px; padding: 28px; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); position: relative; overflow: hidden; }
  .bento-card-hero::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: linear-gradient(180deg, #C8FF00, rgba(200,255,0,0.2)); }
  .bento-card-hero:hover { border-color: rgba(200,255,0,0.15); }
  .bento-card-hero::after { content: ''; position: absolute; top: -40%; right: -10%; width: 240px; height: 240px; background: radial-gradient(circle, rgba(200,255,0,0.04) 0%, transparent 70%); pointer-events: none; }
  .bento-stat { background: #111111; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); cursor: pointer; }
  .bento-stat:hover { border-color: rgba(255,255,255,0.08); transform: translateY(-1px); }
  .bento-stat-value { font-size: 22px; font-weight: 700; color: #FFFFFF; font-family: 'JetBrains Mono', monospace; line-height: 1.2; }
  .bento-stat-label { font-size: 12px; color: #666666; margin-top: 4px; font-weight: 500; }
  .bento-stat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
  .bento-progress { height: 4px; border-radius: 2px; background: rgba(255,255,255,0.04); overflow: hidden; margin-top: 12px; }
  .bento-progress-fill { height: 100%; border-radius: 2px; transition: width 1s cubic-bezier(0.4,0,0.2,1); }

  .bento-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0; gap: 16px; flex-wrap: wrap; }
  .bento-header-left { display: flex; align-items: center; gap: 14px; }
  .bento-greeting { font-size: 22px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.02em; }
  .bento-greeting-sub { font-size: 13px; color: #666666; margin-top: 2px; }
  .bento-header-actions { display: flex; align-items: center; gap: 10px; }
  .bento-icon-btn { width: 38px; height: 38px; border-radius: 10px; background: #111111; border: 1px solid rgba(255,255,255,0.06); color: #666666; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; position: relative; }
  .bento-icon-btn:hover { background: #1A1A1A; border-color: rgba(255,255,255,0.1); color: #FFFFFF; }
  .bento-avatar { width: 38px; height: 38px; border-radius: 10px; background: #C8FF00; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #0B0B0B; cursor: pointer; transition: all 0.2s; border: none; }
  .bento-avatar:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(200,255,0,0.2); }

  .bento-macro-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; }
  .bento-macro-label { font-size: 12px; color: #666666; width: 70px; flex-shrink: 0; }
  .bento-macro-bar { flex: 1; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.04); overflow: hidden; }
  .bento-macro-fill { height: 100%; border-radius: 2px; transition: width 1s cubic-bezier(0.4,0,0.2,1); }
  .bento-macro-value { font-size: 12px; color: #A0A0A0; font-family: 'JetBrains Mono', monospace; width: 70px; text-align: right; }

  .bento-section-title { font-size: 13px; font-weight: 600; color: #A0A0A0; margin-bottom: 16px; letter-spacing: 0.02em; }

  .bento-activity-item { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
  .bento-activity-item:last-child { border-bottom: none; }
  .bento-activity-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .bento-activity-text { font-size: 13px; color: #D0D0D0; flex: 1; }
  .bento-activity-time { font-size: 11px; color: #555555; flex-shrink: 0; }

  .bento-coach-area { background: #0D0D0D; border: 1px solid rgba(200,255,0,0.06); border-radius: 16px; padding: 20px; margin-top: 16px; }
  .bento-coach-text { font-size: 13px; line-height: 1.7; color: #C0C0C0; }
  .bento-coach-tip { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); margin-bottom: 8px; font-size: 13px; color: #A0A0A0; line-height: 1.5; cursor: default; transition: all 0.15s; }
  .bento-coach-tip:hover { background: rgba(200,255,0,0.03); border-color: rgba(200,255,0,0.08); }

  .bento-ring { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
  .bento-ring svg { transform: rotate(-90deg); }
  .bento-ring-value { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 18px; font-weight: 700; color: #FFFFFF; font-family: 'JetBrains Mono', monospace; }
  .bento-ring-label { position: absolute; top: calc(50% + 14px); left: 50%; transform: translateX(-50%); font-size: 9px; color: #555555; white-space: nowrap; }
  .bento-ring-bg { fill: none; stroke: rgba(255,255,255,0.04); stroke-width: 5; }
  .bento-ring-fg { fill: none; stroke-width: 5; stroke-linecap: round; transition: stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1); }

  .bento-recovery-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
  .bento-recovery-label { font-size: 12px; color: #666666; width: 76px; flex-shrink: 0; font-weight: 500; }
  .bento-recovery-track { flex: 1; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.04); overflow: hidden; }
  .bento-recovery-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }
  .bento-recovery-val { font-size: 11px; font-weight: 600; color: #A0A0A0; width: 40px; text-align: right; font-family: 'JetBrains Mono', monospace; }

  .bento-water-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; margin-top: 10px; }
  .bento-water-cup { aspect-ratio: 1; border-radius: 6px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .bento-water-cup.filled { background: rgba(0,180,255,0.15); border-color: rgba(0,180,255,0.25); }
  .bento-water-cup:hover { border-color: rgba(255,255,255,0.12); }
  .bento-water-cup.filled:hover { border-color: rgba(0,180,255,0.4); }

  .bento-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; border: none; }
  .bento-btn-primary { background: #C8FF00; color: #0B0B0B; }
  .bento-btn-primary:hover { background: #D9FF4D; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(200,255,0,0.2); }
  .bento-btn-secondary { background: rgba(255,255,255,0.04); color: #A0A0A0; border: 1px solid rgba(255,255,255,0.06); }
  .bento-btn-secondary:hover { background: rgba(255,255,255,0.06); color: #FFFFFF; border-color: rgba(255,255,255,0.1); }

  .bento-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; background: rgba(255,255,255,0.03); color: #666666; border: 1px solid rgba(255,255,255,0.04); }

  .bento-filter-btn { padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; background: transparent; border: 1px solid rgba(255,255,255,0.06); color: #666666; cursor: pointer; transition: all 0.2s; }
  .bento-filter-btn:hover { background: rgba(255,255,255,0.04); color: #A0A0A0; }
  .bento-filter-btn.active { background: rgba(200,255,0,0.08); border-color: rgba(200,255,0,0.15); color: #C8FF00; }

  .chat-container { display: flex; height: calc(100vh - 48px); gap: 0; border-radius: 16px; overflow: hidden; border: 1px solid rgba(200,255,0,0.08); background: #0B0B0B; }
  .chat-sidebar { width: 260px; flex-shrink: 0; background: #0F0F0F; border-right: 1px solid rgba(200,255,0,0.06); display: flex; flex-direction: column; transition: width 0.3s, opacity 0.3s; overflow: hidden; }
  .chat-sidebar.collapsed { width: 0; opacity: 0; pointer-events: none; }
  .chat-sidebar-header { padding: 16px; border-bottom: 1px solid rgba(200,255,0,0.06); }
  .chat-new-btn { width: 100%; padding: 10px 16px; border-radius: 12px; background: rgba(200,255,0,0.08); border: 1px solid rgba(200,255,0,0.15); color: #C8FF00; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
  .chat-new-btn:hover { background: rgba(200,255,0,0.12); border-color: rgba(200,255,0,0.25); }
  .chat-conv-list { flex: 1; overflow-y: auto; padding: 8px; }
  .chat-conv-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: all 0.15s; margin-bottom: 2px; }
  .chat-conv-item:hover { background: rgba(200,255,0,0.04); }
  .chat-conv-item.active { background: rgba(200,255,0,0.08); border: 1px solid rgba(200,255,0,0.12); }
  .chat-conv-item .conv-title { font-size: 13px; color: #FFFFFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; font-weight: 500; }
  .chat-conv-item .conv-delete { opacity: 0; background: none; border: none; color: #A0A0A0; cursor: pointer; padding: 2px 6px; border-radius: 6px; font-size: 12px; transition: all 0.15s; flex-shrink: 0; }
  .chat-conv-item:hover .conv-delete { opacity: 1; }
  .chat-conv-item .conv-delete:hover { color: #FF4757; background: rgba(255,71,87,0.1); }

  .chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .chat-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid rgba(200,255,0,0.06); background: #0F0F0F; gap: 12px; }
  .chat-header-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .chat-header-title { font-size: 15px; font-weight: 700; color: #FFFFFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .chat-header-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .chat-header-btn { padding: 6px 10px; border-radius: 8px; background: rgba(200,255,0,0.06); border: 1px solid rgba(200,255,0,0.08); color: #A0A0A0; font-size: 12px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 4px; }
  .chat-header-btn:hover { background: rgba(200,255,0,0.1); color: #FFFFFF; border-color: rgba(200,255,0,0.15); }
  .chat-header-btn.danger:hover { background: rgba(255,71,87,0.1); color: #FF4757; border-color: rgba(255,71,87,0.2); }

  .chat-messages { flex: 1; overflow-y: auto; padding: 24px 0; scroll-behavior: smooth; }
  .chat-messages-inner { max-width: 780px; margin: 0 auto; padding: 0 24px; }

  .chat-msg { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 24px; }
  .chat-msg.user { flex-direction: row-reverse; }
  .chat-msg-avatar { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .chat-msg-avatar.assistant { background: rgba(200,255,0,0.1); border: 1px solid rgba(200,255,0,0.15); }
  .chat-msg-avatar.user { background: rgba(200,255,0,0.18); border: 1px solid rgba(200,255,0,0.25); }
  .chat-msg-body { max-width: 85%; min-width: 0; }
  .chat-msg-bubble { padding: 14px 18px; border-radius: 16px; font-size: 14px; line-height: 1.7; color: #E8E8E8; word-wrap: break-word; overflow-wrap: break-word; }
  .chat-msg.user .chat-msg-bubble { background: rgba(200,255,0,0.12); border: 1px solid rgba(200,255,0,0.18); border-radius: 16px 4px 16px 16px; }
  .chat-msg.assistant .chat-msg-bubble { background: #151515; border: 1px solid rgba(255,255,255,0.05); border-radius: 4px 16px 16px 16px; }
  .chat-msg-meta { display: flex; align-items: center; gap: 8px; margin-top: 6px; padding: 0 4px; }
  .chat-msg.user .chat-msg-meta { flex-direction: row-reverse; }
  .chat-msg-time { font-size: 11px; color: rgba(160,160,160,0.4); }
  .chat-msg-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; }
  .chat-msg:hover .chat-msg-actions { opacity: 1; }
  .chat-msg-action { padding: 3px 8px; border-radius: 6px; background: none; border: 1px solid transparent; color: #A0A0A0; font-size: 11px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 3px; }
  .chat-msg-action:hover { background: rgba(200,255,0,0.06); color: #FFFFFF; border-color: rgba(200,255,0,0.1); }
  .chat-msg-action.copied { color: #C8FF00; }

  .chat-typing { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 24px; }
  .chat-typing-dots { display: flex; gap: 4px; padding: 14px 18px; background: #151515; border: 1px solid rgba(255,255,255,0.05); border-radius: 4px 16px 16px 16px; }
  .chat-typing-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(200,255,0,0.4); animation: typingBounce 1.4s ease-in-out infinite; }
  .chat-typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .chat-typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-6px); opacity: 1; } }

  .chat-suggested { max-width: 780px; margin: 0 auto; padding: 40px 24px; }
  .chat-suggested-title { font-size: 20px; font-weight: 800; color: #FFFFFF; margin-bottom: 6px; }
  .chat-suggested-sub { font-size: 14px; color: #A0A0A0; margin-bottom: 28px; }
  .chat-suggested-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .chat-prompt-card { padding: 16px; border-radius: 14px; background: #151515; border: 1px solid rgba(200,255,0,0.06); cursor: pointer; transition: all 0.2s; text-align: left; }
  .chat-prompt-card:hover { background: rgba(200,255,0,0.04); border-color: rgba(200,255,0,0.12); transform: translateY(-1px); }
  .chat-prompt-card .prompt-icon { font-size: 20px; margin-bottom: 8px; }
  .chat-prompt-card .prompt-title { font-size: 13px; font-weight: 600; color: #FFFFFF; margin-bottom: 4px; }
  .chat-prompt-card .prompt-desc { font-size: 12px; color: #A0A0A0; line-height: 1.4; }

  .chat-input-area { padding: 16px 24px 20px; border-top: 1px solid rgba(200,255,0,0.06); background: #0F0F0F; }
  .chat-input-wrap { max-width: 780px; margin: 0 auto; display: flex; gap: 10px; align-items: flex-end; }
  .chat-textarea-wrap { flex: 1; position: relative; }
  .chat-textarea { width: 100%; min-height: 44px; max-height: 160px; padding: 11px 16px; border-radius: 14px; background: #181818; border: 1px solid rgba(200,255,0,0.08); color: #FFFFFF; font-size: 14px; font-family: 'Inter', sans-serif; line-height: 1.5; resize: none; outline: none; transition: border-color 0.2s; }
  .chat-textarea:focus { border-color: rgba(200,255,0,0.3); }
  .chat-textarea::placeholder { color: rgba(160,160,160,0.35); }
  .chat-send-btn { width: 44px; height: 44px; border-radius: 12px; background: #C8FF00; border: none; color: #0B0B0B; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
  .chat-send-btn:hover { background: #D9FF4D; transform: translateY(-1px); }
  .chat-send-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; background: #A0A0A0; }
  .chat-send-btn:active:not(:disabled) { transform: scale(0.95); }

  .chat-code-block { background: #0B0B0B; border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 14px 16px; margin: 10px 0; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.6; color: #E8E8E8; }
  .chat-inline-code { background: rgba(200,255,0,0.08); border: 1px solid rgba(200,255,0,0.12); border-radius: 5px; padding: 1px 6px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #C8FF00; }
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

  .topbar { position: sticky; top: 0; z-index: 40; display: flex; align-items: center; justify-content: space-between; padding: 12px 28px; background: rgba(11,11,11,0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(200,255,0,0.06); min-height: 56px; }
  .topbar-title { font-size: 16px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.01em; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }

  .topbar-avatar { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #C8FF00, #A5E600); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #0B0B0B; cursor: pointer; transition: all 0.2s; border: 2px solid transparent; position: relative; }
  .topbar-avatar:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(200,255,0,0.2); }
  .topbar-avatar.open { border-color: #C8FF00; box-shadow: 0 0 0 3px rgba(200,255,0,0.12); }

  .account-menu { position: absolute; top: calc(100% + 10px); right: 0; min-width: 260px; background: rgba(15,15,15,0.98); border: 1px solid rgba(200,255,0,0.1); border-radius: 16px; padding: 8px; backdrop-filter: blur(20px); box-shadow: 0 20px 60px rgba(0,0,0,0.6); z-index: 9999; }
  .account-menu-header { padding: 14px 14px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 4px; display: flex; align-items: center; gap: 12px; }
  .account-menu-header .avatar-lg { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #C8FF00, #A5E600); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: #0B0B0B; flex-shrink: 0; }
  .account-menu-header .user-info { flex: 1; min-width: 0; }
  .account-menu-header .user-name { font-size: 14px; font-weight: 700; color: #FFFFFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .account-menu-header .user-meta { font-size: 12px; color: #A0A0A0; margin-top: 1px; }

  .account-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 10px; background: none; border: none; color: #A0A0A0; font-size: 13px; cursor: pointer; transition: all 0.15s; text-align: left; font-family: 'Inter', sans-serif; }
  .account-menu-item:hover { background: rgba(200,255,0,0.06); color: #FFFFFF; }
  .account-menu-item .menu-icon { width: 20px; text-align: center; font-size: 15px; flex-shrink: 0; }
  .account-menu-item .menu-label { flex: 1; }
  .account-menu-item .menu-shortcut { font-size: 11px; color: rgba(160,160,160,0.3); }

  .account-menu-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 8px; }

  .account-menu-item.danger { color: #FF4757; }
  .account-menu-item.danger:hover { background: rgba(255,71,87,0.08); color: #FF4757; }

  .logout-modal-overlay { position: fixed; inset: 0; z-index: 10001; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); padding: 20px; }
  .logout-modal { background: rgba(15,15,15,0.98); border: 1px solid rgba(200,255,0,0.1); border-radius: 20px; padding: 36px 32px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 24px 64px rgba(0,0,0,0.5); }
  .logout-modal-icon { width: 56px; height: 56px; border-radius: 14px; background: rgba(255,71,87,0.1); border: 1px solid rgba(255,71,87,0.15); display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 20px; }
  .logout-modal h3 { font-size: 20px; font-weight: 800; color: #FFFFFF; margin-bottom: 12px; text-align: center; }
  .logout-modal p { font-size: 14px; color: #A0A0A0; line-height: 1.7; margin-bottom: 28px; text-align: center; word-wrap: break-word; overflow-wrap: break-word; }
  .logout-modal-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .logout-modal-actions .btn-cancel { background: #1D1D1D; border: 1px solid rgba(200,255,0,0.1); color: #A0A0A0; border-radius: 12px; padding: 11px 24px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .logout-modal-actions .btn-cancel:hover { background: rgba(200,255,0,0.06); color: #FFFFFF; border-color: rgba(200,255,0,0.2); }
  .logout-modal-actions .btn-signout { background: rgba(255,71,87,0.12); border: 1px solid rgba(255,71,87,0.3); color: #FF4757; border-radius: 12px; padding: 11px 24px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .logout-modal-actions .btn-signout:hover { background: rgba(255,71,87,0.2); box-shadow: 0 4px 20px rgba(255,71,87,0.15); }

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
