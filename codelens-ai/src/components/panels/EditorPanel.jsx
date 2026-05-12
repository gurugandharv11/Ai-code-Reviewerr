import React, { useEffect, useRef, useState, useCallback } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { LANGUAGES } from "../../constants";
import { detectLanguage } from "../../services/analyzeService";
import { Spinner } from "../shared/Spinner";

// ─── Monaco language map ──────────────────────────────────────────────────────
const MONACO_LANG_MAP = {
  JavaScript:  "javascript",
  TypeScript:  "typescript",
  Python:      "python",
  Java:        "java",
  "C":         "c",
  "C++":       "cpp",
  "C#":        "csharp",
  Go:          "go",
  Rust:        "rust",
  PHP:         "php",
  Ruby:        "ruby",
  Swift:       "swift",
  Kotlin:      "kotlin",
  Scala:       "scala",
  R:           "r",
  Dart:        "dart",
  Lua:         "lua",
  Shell:       "shell",
  SQL:         "sql",
};

export default function EditorPanel({
  code,
  setCode,
  language,
  setLanguage,
  results,
  analyzing,
  analyzeStep,
  onAnalyze,
  t,
}) {
  const monaco     = useMonaco();
  const editorRef  = useRef(null);
  const [showLangs, setShowLangs] = useState(false);

  // ── Apply error decorations on results change ─────────────────────────────
  useEffect(() => {
    if (!monaco || !editorRef.current || !results?.issues) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    const decorations = results.issues
      .filter((i) => typeof i.line === "number")
      .map((issue) => ({
        range: new monaco.Range(issue.line, 1, issue.line, 9999),
        options: {
          isWholeLine:         true,
          className:
            issue.severity === "critical"
              ? "monaco-error-line"
              : issue.severity === "warning"
              ? "monaco-warn-line"
              : "monaco-info-line",
          glyphMarginClassName:
            issue.severity === "critical"
              ? "monaco-glyph-error"
              : issue.severity === "warning"
              ? "monaco-glyph-warn"
              : "monaco-glyph-info",
          hoverMessage: { value: `**${issue.title}**\n\n${issue.description || ""}` },
          overviewRuler: {
            color:    issue.severity === "critical" ? "#e24b4a" : "#ef9f27",
            position: monaco.editor.OverviewRulerLane.Right,
          },
        },
      }));

    editorRef.current.deltaDecorations([], decorations);
  }, [results, monaco]);

  // ── Inject Monaco decoration CSS ─────────────────────────────────────────
  useEffect(() => {
    if (!monaco) return;
    const style = document.createElement("style");
    style.id    = "monaco-decorations";
    style.textContent = `
      .monaco-error-line { background: rgba(226,75,74,0.12) !important; border-left: 3px solid #e24b4a !important; }
      .monaco-warn-line  { background: rgba(239,159,39,0.10) !important; border-left: 3px solid #ef9f27 !important; }
      .monaco-info-line  { background: rgba(55,138,221,0.08) !important; border-left: 3px solid #378add !important; }
      .monaco-glyph-error::before { content:'●'; color:#e24b4a; font-size:10px; }
      .monaco-glyph-warn::before  { content:'●'; color:#ef9f27; font-size:10px; }
      .monaco-glyph-info::before  { content:'●'; color:#378add; font-size:10px; }
    `;
    const existing = document.getElementById("monaco-decorations");
    if (existing) existing.remove();
    document.head.appendChild(style);
    return () => style.remove();
  }, [monaco]);

  // ── Auto-detect language on paste ────────────────────────────────────────
  const handleEditorChange = useCallback(
    (value) => {
      setCode(value ?? "");
      const detected = detectLanguage(value ?? "");
      if (detected !== language) setLanguage(detected);
    },
    [language, setCode, setLanguage],
  );

  const scoreColor = (v) =>
    v >= 7 ? t.green : v >= 4 ? t.orange : t.red;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Status bar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {/* Language badge / dropdown trigger */}
        <div style={{ position: "relative" }}>
          <button
            className="lang-btn"
            style={{
              background: "linear-gradient(135deg,#185fa5,#1a7ed4)",
              color:      "#fff",
              border:     "none",
              boxShadow:  "0 0 18px rgba(24,95,165,0.4)",
            }}
            onClick={() => setShowLangs((v) => !v)}
          >
            {language} ▾
          </button>
          {showLangs && (
            <div
              style={{
                position:    "absolute",
                top:         "calc(100% + 6px)",
                left:        0,
                zIndex:      100,
                background:  t.card,
                border:      `1px solid ${t.border2}`,
                borderRadius: 10,
                padding:     "6px",
                display:     "grid",
                gridTemplateColumns: "1fr 1fr",
                gap:         4,
                maxHeight:   260,
                overflowY:   "auto",
                boxShadow:   "0 12px 32px rgba(0,0,0,0.4)",
                minWidth:    180,
              }}
            >
              {LANGUAGES.map((lang) => (
                <div
                  key={lang}
                  onClick={() => { setLanguage(lang); setShowLangs(false); }}
                  style={{
                    padding:      "6px 10px",
                    borderRadius: 6,
                    fontSize:     11,
                    cursor:       "pointer",
                    fontFamily:   "'JetBrains Mono',monospace",
                    color:        lang === language ? t.blue : t.textDim,
                    background:   lang === language ? t.navActive : "transparent",
                    transition:   "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = t.navHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = lang === language ? t.navActive : "transparent")}
                >
                  {lang}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            background:   t.card,
            border:       `1px solid ${t.border}`,
            padding:      "7px 14px",
            borderRadius: 999,
            fontSize:     12,
            color:        t.textDim,
          }}
        >
          {code.split("\n").length} lines
        </div>

        <div
          style={{
            background:   results ? `${t.green}15` : `${t.orange}12`,
            border:       `1px solid ${results ? t.green : t.orange}25`,
            padding:      "7px 14px",
            borderRadius: 999,
            fontSize:     12,
            color:        results ? t.green : t.orange,
            fontWeight:   700,
          }}
        >
          {results ? "✓ Analysis Complete" : "Not analyzed yet"}
        </div>

        <button
          className="btn-primary"
          style={{ marginLeft: "auto", padding: "8px 20px", fontSize: 12, fontWeight: 700 }}
          onClick={onAnalyze}
          disabled={analyzing}
        >
          {analyzing ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Spinner color="#fff" size={12} />
              {analyzeStep}
            </span>
          ) : (
            "⚡ Analyze"
          )}
        </button>
      </div>

      {/* ── Monaco editor ── */}
      <div
        style={{
          background:   "#020617",
          border:       `1px solid ${t.border2}`,
          borderRadius: 18,
          overflow:     "hidden",
          boxShadow:    "0 0 50px rgba(0,0,0,0.45)",
        }}
      >
        {/* Editor chrome */}
        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            padding:        "14px 20px",
            borderBottom:   "1px solid #1e293b",
            background:     "linear-gradient(180deg,#111827,#020617)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 7 }}>
              {["#ef4444", "#facc15", "#22c55e"].map((c) => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
              ))}
            </div>
            <span style={{ color: "#64748b", fontSize: 13, fontFamily: "JetBrains Mono" }}>
              editor.{MONACO_LANG_MAP[language] || "js"}
            </span>
          </div>
          <div style={{ color: "#38bdf8", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
            AI READY
          </div>
        </div>

        {/* Monaco */}
        <Editor
          height="500px"
          language={MONACO_LANG_MAP[language] || "javascript"}
          theme={t.monacoTheme}
          value={code}
          onChange={handleEditorChange}
          onMount={(editor) => { editorRef.current = editor; }}
          options={{
            fontSize:            14,
            lineHeight:          24,
            fontFamily:          "'JetBrains Mono', monospace",
            fontLigatures:       true,
            minimap:             { enabled: true, scale: 0.6 },
            scrollBeyondLastLine: false,
            renderLineHighlight: "line",
            glyphMargin:         true,
            folding:             true,
            bracketPairColorization: { enabled: true },
            tabSize:             2,
            wordWrap:            "off",
            smoothScrolling:     true,
            cursorBlinking:      "smooth",
            cursorSmoothCaretAnimation: "on",
            padding:             { top: 16, bottom: 16 },
            scrollbar:           { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
          }}
        />
      </div>

      {/* ── Results summary cards ── */}
      {results && (
        <>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { val: results.critical, label: "CRITICAL", color: "#ef4444" },
              { val: results.warnings, label: "WARNINGS", color: "#f59e0b" },
              { val: results.lines,    label: "LINES",    color: "#38bdf8" },
            ].map((r) => (
              <div
                key={r.label}
                style={{
                  flex:         1,
                  minWidth:     130,
                  padding:      "18px",
                  borderRadius: 16,
                  background:   `${r.color}12`,
                  border:       `1px solid ${r.color}30`,
                  textAlign:    "center",
                }}
              >
                <div style={{ fontSize: 34, fontWeight: 900, color: r.color }}>
                  {r.val}
                </div>
                <div style={{ fontSize: 11, color: r.color, marginTop: 6, letterSpacing: 1 }}>
                  {r.label}
                </div>
              </div>
            ))}
            {/* Scores */}
            {results.scores &&
              Object.entries(results.scores).map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    flex:         1,
                    minWidth:     110,
                    padding:      "18px",
                    borderRadius: 16,
                    background:   t.card,
                    border:       `1px solid ${t.border}`,
                    textAlign:    "center",
                  }}
                >
                  <div
                    style={{
                      fontSize:  28,
                      fontWeight: 900,
                      color:     scoreColor(v),
                      fontFamily: "'Syne',sans-serif",
                    }}
                  >
                    {parseFloat(v).toFixed(1)}
                  </div>
                  <div
                    style={{
                      fontSize:      9,
                      color:         t.textFaint,
                      marginTop:     6,
                      textTransform: "capitalize",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {k}
                  </div>
                </div>
              ))}
          </div>

          {/* AI summary */}
          {results.summary && (
            <div
              style={{
                padding:     "18px",
                background:  "linear-gradient(180deg,#0f172a,#020617)",
                border:      "1px solid rgba(56,189,248,0.2)",
                borderRadius: 16,
                color:       "#cbd5e1",
                lineHeight:  1.8,
                fontSize:    13,
                fontFamily:  "JetBrains Mono",
              }}
            >
              <span style={{ color: "#38bdf8", fontWeight: 800 }}>AI Summary: </span>
              {results.summary}
            </div>
          )}
        </>
      )}
    </div>
  );
}