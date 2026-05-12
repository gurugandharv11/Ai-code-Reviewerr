import React from "react";

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 16, color = "#378add" }) {
  return (
    <div
      style={{
        width:         size,
        height:        size,
        borderRadius:  "50%",
        border:        `${Math.max(2, size / 8)}px solid ${color}22`,
        borderTopColor: color,
        animation:     "spin 0.8s linear infinite",
        flexShrink:    0,
      }}
    />
  );
}

// ─── Toast container ──────────────────────────────────────────────────────────
const TOAST_COLORS = {
  success: { bg: "#0f1a08", border: "#6bc83230", text: "#6bc832" },
  error:   { bg: "#2d0f0f", border: "#ff6b6b30", text: "#ff6b6b" },
  warning: { bg: "#2d1e0a", border: "#ef9f2730", text: "#ef9f27" },
  info:    { bg: "#0a1a2d", border: "#378add30", text: "#378add" },
};

export function ToastContainer({ toasts, dismiss }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => {
        const c = TOAST_COLORS[t.type] || TOAST_COLORS.info;
        return (
          <div
            key={t.id}
            className="toast"
            onClick={() => dismiss(t.id)}
            style={{
              background:   c.bg,
              border:       `1px solid ${c.border}`,
              color:        c.text,
              cursor:       "pointer",
            }}
          >
            {t.message}
          </div>
        );
      })}
    </div>
  );
}

// ─── Score card ───────────────────────────────────────────────────────────────
export function ScoreCard({ label, value, color, t }) {
  const pct = Math.min(100, (parseFloat(value) / 10) * 100);
  return (
    <div
      className="score-hover"
      style={{
        flex:       1,
        minWidth:   120,
        background: t.card,
        border:     `1px solid ${t.border}`,
        borderRadius: 12,
        padding:    "14px 16px",
        boxShadow:  "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          fontSize:      9,
          color:         t.textFaint,
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          marginBottom:  8,
          fontFamily:    "'JetBrains Mono',monospace",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize:   28,
          fontWeight: 900,
          color,
          lineHeight: 1,
          fontFamily: "'Syne',sans-serif",
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop:    10,
          height:       4,
          background:   t.border,
          borderRadius: 2,
        }}
      >
        <div
          style={{
            height:      4,
            width:       `${pct}%`,
            background:  color,
            borderRadius: 2,
            boxShadow:   `0 0 8px ${color}50`,
            transition:  "width 1s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
    </div>
  );
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────
export function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background:  "#111",
        border:      "1px solid #1e1e1e",
        borderRadius: 8,
        padding:     "6px 12px",
        fontSize:    11,
        fontFamily:  "'JetBrains Mono',monospace",
        boxShadow:   "0 8px 24px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ color: "#888", marginBottom: 2 }}>{label}</div>
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
        {Number(payload[0].value).toFixed(1)}
      </div>
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
export function Skeleton({ width = "100%", height = 20, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 6, ...style }}
    />
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, t }) {
  return (
    <div
      style={{
        fontSize:      9,
        color:         t.textGhost,
        textTransform: "uppercase",
        letterSpacing: "0.6px",
        marginBottom:  8,
        fontFamily:    "'JetBrains Mono',monospace",
      }}
    >
      {title}
    </div>
  );
}