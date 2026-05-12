import React, { useState, useEffect } from "react";
import { QUICK_QUESTIONS } from "../../constants";
import { askAI } from "../../services/analyzeService";
import { Spinner } from "../shared/Spinner";

export default function ExplainPanel({ initQuery, code, t }) {
  const [query,   setQuery]   = useState(initQuery || "Why is eval(userInput) dangerous?");
  const [loading, setLoading] = useState(false);
  const [answer,  setAnswer]  = useState("");
  const [error,   setError]   = useState("");
  const [history, setHistory] = useState([]);

  // Sync external initQuery (from Issues panel "Why? [AI]" button)
  useEffect(() => {
    if (initQuery) setQuery(initQuery);
  }, [initQuery]);

  const ask = async (q) => {
    const question = q || query;
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const res = await askAI(question, code);
      setAnswer(res);
      setHistory((h) => [{ q: question, a: res, ts: Date.now() }, ...h].slice(0, 10));
    } catch {
      setError("AI request failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* ── Input row ── */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          style={{
            flex:        1,
            background:  t.input,
            border:      `1px solid ${t.border}`,
            borderRadius: 10,
            padding:     "11px 14px",
            color:       t.text,
            fontFamily:  "'JetBrains Mono',monospace",
            fontSize:    12,
            outline:     "none",
            transition:  "border-color 0.18s",
          }}
          onFocus={(e) => (e.target.style.borderColor = t.blue)}
          onBlur={(e)  => (e.target.style.borderColor = t.border)}
          placeholder="Ask anything about your code…"
        />
        <button
          className="btn-primary"
          style={{ padding: "10px 18px", fontSize: 12, fontWeight: 700, flexShrink: 0 }}
          onClick={() => ask()}
          disabled={loading}
        >
          Ask AI
        </button>
      </div>

      {/* ── Quick questions ── */}
      <div>
        <div
          style={{
            fontSize:      9,
            color:         t.textGhost,
            marginBottom:  8,
            fontFamily:    "'JetBrains Mono',monospace",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
          }}
        >
          Quick questions
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => { setQuery(q); setTimeout(() => ask(q), 60); }}
              style={{
                fontSize:     11,
                padding:      "5px 12px",
                border:       `1px solid ${t.border2}`,
                borderRadius: 20,
                background:   "transparent",
                color:        t.orange,
                cursor:       "pointer",
                fontFamily:   "'JetBrains Mono',monospace",
                transition:   "all 0.18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background  = t.orangeBg;
                e.currentTarget.style.borderColor = t.orange;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background  = "transparent";
                e.currentTarget.style.borderColor = t.border2;
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        10,
            padding:    16,
            background: t.card,
            border:     `1px solid ${t.border}`,
            borderRadius: 12,
          }}
        >
          <Spinner color={t.blue} />
          <span
            style={{
              fontSize:  12,
              color:     t.textDim,
              fontFamily: "'JetBrains Mono',monospace",
            }}
          >
            Guru AI is thinking…
          </span>
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div
          style={{
            padding:      "12px 16px",
            background:   t.redBg,
            border:       `1px solid ${t.redText}30`,
            borderRadius: 10,
            fontSize:     12,
            color:        t.redText,
            fontFamily:   "'JetBrains Mono',monospace",
          }}
        >
          {error}
        </div>
      )}

      {/* ── Answer ── */}
      {answer && !loading && (
        <div
          style={{
            background:   t.card,
            border:       `1px solid ${t.border}`,
            borderRadius: 12,
            padding:      18,
            fontSize:     13,
            color:        t.text,
            lineHeight:   1.85,
            fontFamily:   "'JetBrains Mono',monospace",
            whiteSpace:   "pre-wrap",
            animation:    "fadeSlideIn 0.3s both",
            boxShadow:    "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display:       "flex",
              alignItems:    "center",
              gap:           6,
              marginBottom:  12,
              paddingBottom: 10,
              borderBottom:  `1px solid ${t.border}`,
            }}
          >
            <div
              style={{
                width:        8,
                height:       8,
                borderRadius: "50%",
                background:   t.green,
                boxShadow:    `0 0 6px ${t.green}`,
              }}
            />
            <span
              style={{
                fontSize:  10,
                color:     t.green,
                fontFamily: "'JetBrains Mono',monospace",
                fontWeight: 600,
              }}
            >
              GURU AI RESPONSE
            </span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(answer);
              }}
              style={{
                marginLeft:   "auto",
                fontSize:     10,
                padding:      "3px 8px",
                background:   "transparent",
                border:       `1px solid ${t.border2}`,
                borderRadius: 6,
                color:        t.textFaint,
                cursor:       "pointer",
                fontFamily:   "'JetBrains Mono',monospace",
              }}
            >
              Copy
            </button>
          </div>
          {answer}
        </div>
      )}

      {/* ── History ── */}
      {history.length > 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontSize:      9,
              color:         t.textGhost,
              fontFamily:    "'JetBrains Mono',monospace",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
            }}
          >
            Recent questions
          </div>
          {history.slice(1, 5).map((h) => (
            <div
              key={h.ts}
              onClick={() => { setQuery(h.q); setAnswer(h.a); }}
              style={{
                padding:      "8px 12px",
                background:   t.card,
                border:       `1px solid ${t.border}`,
                borderRadius: 8,
                fontSize:     11,
                color:        t.textDim,
                cursor:       "pointer",
                fontFamily:   "'JetBrains Mono',monospace",
                transition:   "background 0.18s",
                overflow:     "hidden",
                textOverflow: "ellipsis",
                whiteSpace:   "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.navHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = t.card)}
            >
              {h.q}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}