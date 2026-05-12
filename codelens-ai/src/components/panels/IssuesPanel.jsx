import React, { useState, useMemo } from "react";
import { STATIC_ISSUES } from "../../constants";
import { getSevStyle } from "../../theme";
import { fixWithAI } from "../../services/analyzeService";
import { Spinner } from "../shared/Spinner";

const FILTER_OPTIONS = ["all", "critical", "warning", "info"];

export default function IssuesPanel({ results, code, language, onExplain, t, toast }) {
  const rawIssues = results?.issues || [];

  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [fixing,   setFixing]   = useState(false);
  const [fixedCode, setFixed]   = useState(null);

  // ── Filtered issues ───────────────────────────────────────────────────────
  const issues = useMemo(() => {
    return rawIssues.filter((issue) => {
      const matchFilter = filter === "all" || issue.severity === filter;
      const matchSearch =
        !search ||
        issue.title.toLowerCase().includes(search.toLowerCase()) ||
        issue.snippet?.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [rawIssues, filter, search]);

  // ── AI Fix all ────────────────────────────────────────────────────────────
  const handleFixAll = async () => {
    if (!code || issues.length === 0) return;
    setFixing(true);
    try {
      const fixed = await fixWithAI(code, language || "JavaScript", issues);
      setFixed(fixed);
      toast("AI fix generated! Check the diff below.", "success");
    } catch {
      toast("AI fix failed. Try again.", "error");
    }
    setFixing(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* ── Filter + search bar ── */}
      <div
        style={{
          display:     "flex",
          gap:         8,
          alignItems:  "center",
          flexWrap:    "wrap",
          padding:     "12px 14px",
          background:  t.card,
          border:      `1px solid ${t.border}`,
          borderRadius: 12,
        }}
      >
        {FILTER_OPTIONS.map((f) => {
          const active = filter === f;
          const colors = {
            all:      { bg: t.navActive,  text: t.blue   },
            critical: { bg: t.redBg,      text: t.redText },
            warning:  { bg: t.orangeBg,   text: t.orange  },
            info:     { bg: t.navActive,  text: t.blue    },
          };
          const c = colors[f];
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding:      "5px 14px",
                borderRadius: 20,
                border:       `1px solid ${active ? c.text + "40" : t.border}`,
                background:   active ? c.bg : "transparent",
                color:        active ? c.text : t.textFaint,
                fontSize:     11,
                fontFamily:   "'JetBrains Mono',monospace",
                cursor:       "pointer",
                transition:   "all 0.18s",
                textTransform: "capitalize",
              }}
            >
              {f}
              {f !== "all" && (
                <span style={{ marginLeft: 6, opacity: 0.7 }}>
                  ({rawIssues.filter((i) => i.severity === f).length})
                </span>
              )}
              {f === "all" && (
                <span style={{ marginLeft: 6, opacity: 0.7 }}>
                  ({rawIssues.length})
                </span>
              )}
            </button>
          );
        })}

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search issues…"
          style={{
            flex:        1,
            minWidth:    160,
            background:  t.input,
            border:      `1px solid ${t.border}`,
            borderRadius: 8,
            padding:     "6px 12px",
            fontSize:    11,
            color:       t.text,
            fontFamily:  "'JetBrains Mono',monospace",
            outline:     "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = t.blue)}
          onBlur={(e)  => (e.target.style.borderColor = t.border)}
        />

        {/* Fix all */}
        <button
          className="btn-primary"
          style={{ padding: "6px 14px", fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}
          onClick={handleFixAll}
          disabled={fixing || issues.length === 0}
        >
          {fixing ? <><Spinner color="#fff" size={11} /> Fixing…</> : "✨ Fix all with AI"}
        </button>
      </div>

      {/* ── No issues ── */}
      {issues.length === 0 && (
        <div
          style={{
            padding:   "48px",
            textAlign: "center",
            color:     t.textFaint,
            fontFamily: "'JetBrains Mono',monospace",
            fontSize:  13,
          }}
        >
          {rawIssues.length === 0
            ? "No issues found. Run analysis first."
            : "No issues match your filter."}
        </div>
      )}

      {/* ── Issue cards ── */}
      {issues.map((issue, idx) => {
        const s = getSevStyle(issue.severity, t);
        return (
          <div
            key={idx}
            className="issue-card"
            style={{
              background:   t.card,
              border:       `1px solid ${t.border}`,
              borderRadius: 12,
              padding:      "14px 16px",
              animation:    `slideInLeft 0.3s ${idx * 0.05}s cubic-bezier(0.22,1,0.36,1) both`,
              boxShadow:    "0 2px 12px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display:    "flex",
                alignItems: "center",
                gap:        8,
                flexWrap:   "wrap",
              }}
            >
              {/* Severity badge */}
              <span
                style={{
                  fontSize:     10,
                  padding:      "3px 9px",
                  borderRadius: 6,
                  background:   s.bg,
                  color:        s.text,
                  fontFamily:   "'JetBrains Mono',monospace",
                  fontWeight:   700,
                  flexShrink:   0,
                }}
              >
                {s.label}
              </span>

              {/* Line badge */}
              {issue.line && (
                <span
                  style={{
                    fontSize:     10,
                    padding:      "3px 8px",
                    borderRadius: 6,
                    background:   t.card2,
                    color:        t.textDim,
                    fontFamily:   "'JetBrains Mono',monospace",
                    flexShrink:   0,
                  }}
                >
                  L{issue.line}
                </span>
              )}

              {/* Title */}
              <span
                style={{
                  fontSize:  13,
                  color:     t.text,
                  fontWeight: 500,
                  flex:      1,
                }}
              >
                {issue.title}
              </span>

              {/* Explain button */}
              <button
                onClick={() => onExplain(`Explain this issue and give a code fix: "${issue.title}"`)}
                style={{
                  fontSize:     11,
                  padding:      "4px 12px",
                  border:       `1px solid ${t.border2}`,
                  borderRadius: 20,
                  background:   "transparent",
                  color:        t.orange,
                  cursor:       "pointer",
                  fontFamily:   "'JetBrains Mono',monospace",
                  transition:   "all 0.18s",
                  whiteSpace:   "nowrap",
                  flexShrink:   0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background    = t.orangeBg;
                  e.currentTarget.style.borderColor   = t.orange;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background    = "transparent";
                  e.currentTarget.style.borderColor   = t.border2;
                }}
              >
                Why? [AI]
              </button>
            </div>

            {/* Snippet */}
            {issue.snippet && (
              <div
                style={{
                  marginTop:   8,
                  fontSize:    12,
                  color:       t.textDim,
                  fontFamily:  "'JetBrains Mono',monospace",
                  background:  t.headerBg,
                  padding:     "6px 12px",
                  borderRadius: 6,
                  borderLeft:  `3px solid ${s.text}`,
                  overflow:    "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace:  "nowrap",
                }}
              >
                {issue.file ? `${issue.file}:${issue.line} — ` : ""}{issue.snippet}
              </div>
            )}

            {/* Description */}
            {issue.description && (
              <div
                style={{
                  marginTop: 6,
                  fontSize:  11,
                  color:     t.textFaint,
                  fontFamily: "'JetBrains Mono',monospace",
                  lineHeight: 1.6,
                }}
              >
                {issue.description}
              </div>
            )}
          </div>
        );
      })}

      {/* ── AI Fixed code diff ── */}
      {fixedCode && (
        <div
          style={{
            background:   t.card,
            border:       `1px solid ${t.green}30`,
            borderRadius: 12,
            padding:      "16px",
            animation:    "fadeSlideIn 0.35s both",
          }}
        >
          <div
            style={{
              display:       "flex",
              alignItems:    "center",
              justifyContent: "space-between",
              marginBottom:  12,
              paddingBottom: 10,
              borderBottom:  `1px solid ${t.border}`,
            }}
          >
            <span
              style={{
                fontSize:  11,
                color:     t.green,
                fontFamily: "'JetBrains Mono',monospace",
                fontWeight: 700,
              }}
            >
              ✨ AI FIXED CODE
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(fixedCode);
                  toast("Fixed code copied!", "success");
                }}
                style={{
                  fontSize:     11,
                  padding:      "4px 10px",
                  background:   "transparent",
                  border:       `1px solid ${t.border2}`,
                  borderRadius: 6,
                  color:        t.textDim,
                  cursor:       "pointer",
                  fontFamily:   "'JetBrains Mono',monospace",
                }}
              >
                Copy
              </button>
              <button
                onClick={() => setFixed(null)}
                style={{
                  fontSize:     11,
                  padding:      "4px 10px",
                  background:   "transparent",
                  border:       `1px solid ${t.border2}`,
                  borderRadius: 6,
                  color:        t.textDim,
                  cursor:       "pointer",
                  fontFamily:   "'JetBrains Mono',monospace",
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
          <pre
            style={{
              fontSize:   12,
              color:      t.text,
              fontFamily: "'JetBrains Mono',monospace",
              overflow:   "auto",
              maxHeight:  360,
              lineHeight: 1.7,
              margin:     0,
            }}
          >
            {fixedCode}
          </pre>
        </div>
      )}
    </div>
  );
}