// ─── Theme tokens ─────────────────────────────────────────────────────────────
export const THEMES = {
  dark: {
    bg:          "#050505",
    sidebar:     "#080808",
    card:        "#0a0a0a",
    card2:       "#0e0e0e",
    border:      "#141414",
    border2:     "#1a1a1a",
    border3:     "#111",
    text:        "#d4d4d4",
    textDim:     "#555",
    textFaint:   "#333",
    textGhost:   "#1e1e1e",
    input:       "#0a0a0a",
    headerBg:    "#080808",
    panelBg:     "#050505",

    blue:        "#378add",
    blueDark:    "#185fa5",
    blueLight:   "#1a7ed4",
    red:         "#e24b4a",
    redBg:       "#2d0f0f",
    redText:     "#ff6b6b",
    orange:      "#ef9f27",
    orangeBg:    "#2d1e0a",
    green:       "#6bc832",
    greenBg:     "#0f1a08",
    greenDark:   "#3b6d11",

    scrollTrack: "transparent",
    scrollThumb: "#1e1e1e",
    navHover:    "rgba(55,138,221,0.07)",
    navActive:   "rgba(55,138,221,0.07)",

    monacoTheme: "vs-dark",
  },
  light: {
    bg:          "#f0f4f8",
    sidebar:     "#ffffff",
    card:        "#ffffff",
    card2:       "#f8fafc",
    border:      "#e2e8f0",
    border2:     "#cbd5e1",
    border3:     "#e2e8f0",
    text:        "#1e293b",
    textDim:     "#475569",
    textFaint:   "#94a3b8",
    textGhost:   "#cbd5e1",
    input:       "#f8fafc",
    headerBg:    "#ffffff",
    panelBg:     "#f0f4f8",

    blue:        "#2563eb",
    blueDark:    "#1d4ed8",
    blueLight:   "#3b82f6",
    red:         "#dc2626",
    redBg:       "#fef2f2",
    redText:     "#dc2626",
    orange:      "#d97706",
    orangeBg:    "#fffbeb",
    green:       "#16a34a",
    greenBg:     "#f0fdf4",
    greenDark:   "#15803d",

    scrollTrack: "transparent",
    scrollThumb: "#cbd5e1",
    navHover:    "rgba(37,99,235,0.07)",
    navActive:   "rgba(37,99,235,0.07)",

    monacoTheme: "vs",
  },
};

// ─── Global CSS (injected into <head>) ────────────────────────────────────────
export const getGlobalCSS = (t) => `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Syne:wght@700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; background: ${t.bg}; }

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: ${t.scrollTrack}; }
::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 2px; }

/* ── Keyframes ── */
@keyframes fadeSlideIn    { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideInLeft    { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
@keyframes spin           { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
@keyframes pulse-ring     { 0% { box-shadow:0 0 0 0 rgba(55,138,221,0.4); } 70% { box-shadow:0 0 0 10px rgba(55,138,221,0); } 100% { box-shadow:0 0 0 0 rgba(55,138,221,0); } }
@keyframes scanline       { 0% { top:-5%; } 100% { top:108%; } }
@keyframes morphBg        { 0%,100% { border-radius:60% 40% 70% 30%/50% 60% 40% 50%; } 50% { border-radius:40% 60% 30% 70%/60% 40% 50% 50%; } }
@keyframes float3d        { 0%,100% { transform:perspective(800px) rotateX(2deg) rotateY(-1deg) translateY(0px); } 50% { transform:perspective(800px) rotateX(-1deg) rotateY(2deg) translateY(-8px); } }
@keyframes shimmer        { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
@keyframes glow-pulse     { 0%,100% { opacity:0.3; } 50% { opacity:0.7; } }

/* ── Utility classes ── */
.panel-enter  { animation: fadeSlideIn 0.28s cubic-bezier(0.22,1,0.36,1) both; }
.slide-left   { animation: slideInLeft 0.3s cubic-bezier(0.22,1,0.36,1) both; }

/* ── Nav ── */
.nav-item {
  display:flex; align-items:center; gap:10px; padding:9px 18px;
  font-size:12px; border-left:3px solid transparent; cursor:pointer;
  user-select:none; font-family:'JetBrains Mono',monospace;
  transition:color 0.18s, background 0.2s, border-color 0.2s, transform 0.2s, padding-left 0.2s;
}
.nav-item:hover { transform:translateX(4px); padding-left:22px; }

/* ── Tab bar ── */
.tab-btn {
  padding:9px 14px; font-size:12px; border-bottom:2px solid transparent;
  cursor:pointer; white-space:nowrap; user-select:none;
  font-family:'JetBrains Mono',monospace;
  transition:color 0.18s, border-color 0.18s, background 0.18s;
  border-radius:6px 6px 0 0;
}
.tab-btn:hover { background:rgba(55,138,221,0.05); }

/* ── Buttons ── */
.btn-primary {
  background:linear-gradient(135deg,#185fa5,#1a7ed4); color:#fff;
  border:none; border-radius:8px; font-family:'JetBrains Mono',monospace;
  cursor:pointer; transition:transform 0.15s, box-shadow 0.15s, opacity 0.15s;
  box-shadow:0 4px 16px rgba(24,95,165,0.4); position:relative; overflow:hidden;
}
.btn-primary::after {
  content:''; position:absolute; inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);
  transform:translateX(-100%); transition:transform 0.4s;
}
.btn-primary:hover:not(:disabled)::after { transform:translateX(100%); }
.btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(24,95,165,0.55); }
.btn-primary:active:not(:disabled) { transform:translateY(0); }
.btn-primary:disabled { opacity:0.5; cursor:not-allowed; }

/* ── Cards ── */
.card-hover {
  transition:transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s;
}
.card-hover:hover {
  transform:perspective(600px) rotateX(-1deg) rotateY(1deg) translateY(-4px);
}
.issue-card {
  transition:background 0.18s, border-color 0.18s, transform 0.2s, box-shadow 0.2s;
}
.issue-card:hover { transform:translateX(6px); box-shadow:0 4px 20px rgba(0,0,0,0.3); }
.score-hover {
  transition:transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s; cursor:default;
}
.score-hover:hover { transform:translateY(-6px) scale(1.04); }

/* ── Code area ── */
.code-area {
  width:100%; resize:none; outline:none; border:none; background:transparent;
  font-family:'JetBrains Mono',monospace; font-size:13px;
  line-height:1.75; tab-size:2; caret-color:#378add;
}

/* ── Lang button ── */
.lang-btn {
  font-size:11px; padding:5px 12px; border-radius:20px; border:1px solid;
  font-family:'JetBrains Mono',monospace; cursor:pointer;
  transition:all 0.2s; white-space:nowrap;
}
.lang-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.2); }

/* ── Glassmorphism cards ── */
.glass-card {
  backdrop-filter:blur(18px);
  background:rgba(15,23,42,0.65);
  border:1px solid rgba(255,255,255,0.08);
}

/* ── Skeleton shimmer ── */
.skeleton {
  background:linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%);
  background-size:200% 100%;
  animation:shimmer 1.4s ease-in-out infinite;
  border-radius:6px;
}

/* ── Toast notifications ── */
.toast-container {
  position:fixed; top:20px; right:20px; z-index:9999;
  display:flex; flex-direction:column; gap:8px; pointer-events:none;
}
.toast {
  padding:12px 18px; border-radius:10px; font-size:13px;
  font-family:'JetBrains Mono',monospace; pointer-events:all;
  animation:fadeSlideIn 0.3s both;
  box-shadow:0 8px 24px rgba(0,0,0,0.3);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .sidebar-desktop { display:none !important; }
  .mobile-nav      { display:flex !important; }
  .main-area       { padding:10px !important; }
  .score-grid      { grid-template-columns:1fr 1fr !important; }
  .chart-grid      { flex-direction:column !important; }
  .complexity-grid { grid-template-columns:1fr !important; }
  .header-tags     { display:none !important; }
}
@media (min-width: 769px) {
  .mobile-nav { display:none !important; }
}
`;

// ─── Severity style helper ─────────────────────────────────────────────────────
export const getSevStyle = (sev, t) => ({
  critical: { bg: t.redBg,    text: t.redText, label: "Critical" },
  warning:  { bg: t.orangeBg, text: t.orange,  label: "Warning"  },
  info:     { bg: t.navActive, text: t.blue,   label: "Info"     },
}[sev] || { bg: t.card, text: t.textDim, label: sev });

// ─── Score color helper ────────────────────────────────────────────────────────
export const scoreColor = (v, t) =>
  parseFloat(v) >= 7 ? t.green : parseFloat(v) >= 4 ? t.orange : t.red;

// ─── Complexity level styles ───────────────────────────────────────────────────
export const LVL_STYLE = {
  high: { bar:"#e24b4a", tag:"#2d0f0f", tc:"#ff6b6b" },
  med:  { bar:"#ef9f27", tag:"#2d1e0a", tc:"#ef9f27" },
  low:  { bar:"#3b6d11", tag:"#0f1a08", tc:"#6bc832" },
};

// ─── PR status styles ──────────────────────────────────────────────────────────
export const PR_STATUS = {
  open:   { bg:"#0f1a08", text:"#6bc832" },
  review: { bg:"#2d1e0a", text:"#ef9f27" },
  merged: { bg:"#0a1a2d", text:"#378add" },
};