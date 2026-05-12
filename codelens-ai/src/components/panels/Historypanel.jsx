// HistoryPanel.jsx — Recent Scan History
// Stores and displays scan history using localStorage

import { useState, useEffect } from "react";

const HISTORY_KEY = "guru_ai_scan_history";
const MAX_HISTORY = 20;

// ── Helpers ────────────────────────────────────────────────────
export function saveToHistory(code, language, results) {
  try {
    const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      language,
      lines: code.split("\n").length,
      codeSnippet: code.slice(0, 120),
      critical: results.critical || 0,
      warnings: results.warnings || 0,
      info: results.info || 0,
      scores: results.scores || {},
      summary: results.summary || "",
      issueCount: (results.issues || []).length,
    };
    const updated = [entry, ...existing].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch { return []; }
}

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch { return []; }
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

// ── Relative time ──────────────────────────────────────────────
function relTime(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Score badge ────────────────────────────────────────────────
function ScoreDot({ value }) {
  const color = value >= 7 ? "#4ade80" : value >= 4 ? "#fb923c" : "#f87171";
  return (
    <div style={{
      width: 8, height: 8, borderRadius: "50%",
      background: color, boxShadow: `0 0 6px ${color}80`, flexShrink: 0
    }} />
  );
}

// ── Mini bar ───────────────────────────────────────────────────
function MiniBar({ value, color }) {
  return (
    <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
      <div style={{
        height: 3, width: `${Math.min(100, (value / 10) * 100)}%`,
        background: color, borderRadius: 2,
        transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)"
      }} />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function HistoryPanel({ t, onRestoreCode }) {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all"); // all | critical | clean
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const filtered = history.filter(h => {
    if (filter === "critical") return h.critical > 0;
    if (filter === "clean") return h.critical === 0 && h.warnings === 0;
    return true;
  });

  const handleClear = () => {
    if (confirmClear) {
      clearHistory();
      setHistory([]);
      setSelected(null);
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  const secColor = v => v >= 7 ? t.green : v >= 4 ? t.orange : t.red;

  // ── Empty state ──────────────────────────────────────────────
  if (history.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 16 }}>
        <div style={{ fontSize: 48, opacity: 0.4 }}>🕐</div>
        <div style={{ fontSize: 14, color: t.textDim, fontFamily: "'JetBrains Mono',monospace", textAlign: "center" }}>
          No scan history yet
        </div>
        <div style={{ fontSize: 11, color: t.textFaint, fontFamily: "'JetBrains Mono',monospace", textAlign: "center", lineHeight: 1.8 }}>
          Run your first analysis to see history here.<br />
          Up to 20 scans are saved locally.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontSize: 11, color: t.textFaint, fontFamily: "'JetBrains Mono',monospace" }}>
          {filtered.length} scan{filtered.length !== 1 ? "s" : ""}
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 6, marginLeft: 4 }}>
          {[
            { key: "all", label: "All" },
            { key: "critical", label: "⚠️ Has Issues" },
            { key: "clean", label: "✓ Clean" },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: "3px 10px", fontSize: 10, borderRadius: 20, cursor: "pointer",
              fontFamily: "'JetBrains Mono',monospace", transition: "all 0.18s",
              background: filter === f.key ? t.blue : "transparent",
              color: filter === f.key ? "#fff" : t.textFaint,
              border: `1px solid ${filter === f.key ? t.blue : t.border2}`,
            }}>{f.label}</button>
          ))}
        </div>

        <button onClick={handleClear} style={{
          marginLeft: "auto", padding: "4px 10px", fontSize: 10, borderRadius: 6,
          background: "transparent", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace",
          border: `1px solid ${confirmClear ? t.red : t.border2}`,
          color: confirmClear ? t.red : t.textFaint, transition: "all 0.2s",
        }}>
          {confirmClear ? "Confirm clear?" : "Clear all"}
        </button>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { label: "Total Scans", value: history.length, color: t.blue },
          { label: "Avg Security", value: (history.reduce((s, h) => s + (h.scores?.security || 0), 0) / history.length).toFixed(1), color: secColor(history.reduce((s, h) => s + (h.scores?.security || 0), 0) / history.length) },
          { label: "Critical Found", value: history.reduce((s, h) => s + h.critical, 0), color: t.red },
          { label: "Languages", value: [...new Set(history.map(h => h.language))].length, color: t.green },
        ].map(stat => (
          <div key={stat.label} style={{
            flex: 1, minWidth: 90, padding: "10px 14px",
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 10, textAlign: "center"
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: stat.color, fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 9, color: t.textFaint, marginTop: 4, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── List ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((entry, idx) => {
          const isSelected = selected === entry.id;
          const secScore = entry.scores?.security || 0;

          return (
            <div key={entry.id}
              onClick={() => setSelected(isSelected ? null : entry.id)}
              style={{
                background: isSelected ? t.card2 : t.card,
                border: `1px solid ${isSelected ? t.blue + "60" : t.border}`,
                borderRadius: 12, cursor: "pointer",
                animation: `slideLeft 0.25s ${idx * 0.04}s both`,
                transition: "all 0.2s", overflow: "hidden",
                boxShadow: isSelected ? `0 0 20px ${t.blue}15` : "none",
              }}>

              {/* Row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>

                {/* Language badge */}
                <div style={{
                  padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                  background: `${t.blue}15`, color: t.blue,
                  fontFamily: "'JetBrains Mono',monospace", flexShrink: 0
                }}>
                  {entry.language}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <ScoreDot value={secScore} />
                    <span style={{ fontSize: 11, color: t.text, fontFamily: "'JetBrains Mono',monospace" }}>
                      {entry.lines} lines · {entry.issueCount} issues
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: t.textFaint, fontFamily: "'JetBrains Mono',monospace" }}>
                    {relTime(entry.date)} · {new Date(entry.date).toLocaleDateString()}
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                  {entry.critical > 0 && (
                    <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: t.redBg, color: t.red, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>
                      {entry.critical} CRIT
                    </span>
                  )}
                  {entry.warnings > 0 && (
                    <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: t.orangeBg, color: t.orange, fontFamily: "'JetBrains Mono',monospace" }}>
                      {entry.warnings} WARN
                    </span>
                  )}
                  {entry.critical === 0 && entry.warnings === 0 && (
                    <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: t.greenBg, color: t.green, fontFamily: "'JetBrains Mono',monospace" }}>
                      CLEAN
                    </span>
                  )}
                </div>

                {/* Chevron */}
                <span style={{ fontSize: 10, color: t.textFaint, transition: "transform 0.2s", transform: isSelected ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>▾</span>
              </div>

              {/* Expanded detail */}
              {isSelected && (
                <div style={{ borderTop: `1px solid ${t.border}`, padding: "14px 16px", animation: "fadeSlideIn 0.2s both" }}>

                  {/* Score bars */}
                  {entry.scores && Object.keys(entry.scores).length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 9, color: t.textFaint, fontFamily: "'JetBrains Mono',monospace", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Scores</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {Object.entries(entry.scores).map(([k, v]) => (
                          <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 9, color: t.textDim, fontFamily: "'JetBrains Mono',monospace", width: 90, textTransform: "capitalize" }}>{k}</span>
                            <MiniBar value={v} color={secColor(v)} />
                            <span style={{ fontSize: 9, color: secColor(v), fontFamily: "'JetBrains Mono',monospace", width: 28, textAlign: "right", fontWeight: 700 }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {entry.summary && (
                    <div style={{ fontSize: 11, color: t.textFaint, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.7, marginBottom: 12, borderLeft: `2px solid ${t.border2}`, paddingLeft: 10 }}>
                      {entry.summary.slice(0, 180)}{entry.summary.length > 180 ? "…" : ""}
                    </div>
                  )}

                  {/* Code snippet */}
                  <div style={{ background: t.panelBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: t.textDim, fontFamily: "'JetBrains Mono',monospace", whiteSpace: "pre-wrap", wordBreak: "break-all", marginBottom: 12, maxHeight: 80, overflow: "hidden" }}>
                    {entry.codeSnippet}…
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 8 }}>
                    {onRestoreCode && (
                      <button onClick={(e) => { e.stopPropagation(); onRestoreCode(entry.codeSnippet, entry.language); }}
                        style={{
                          padding: "6px 14px", fontSize: 11, borderRadius: 8, cursor: "pointer",
                          background: `linear-gradient(135deg,${t.blueDark || "#1d4ed8"},${t.blue})`,
                          color: "#fff", border: "none", fontFamily: "'JetBrains Mono',monospace",
                          fontWeight: 600, transition: "all 0.18s"
                        }}>
                        Load Code
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setSelected(null); }}
                      style={{
                        padding: "6px 14px", fontSize: 11, borderRadius: 8, cursor: "pointer",
                        background: "transparent", color: t.textFaint,
                        border: `1px solid ${t.border2}`, fontFamily: "'JetBrains Mono',monospace",
                      }}>
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}