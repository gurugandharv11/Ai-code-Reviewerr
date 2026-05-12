// AnalysisCharts.jsx — Radar Chart + Score Cards + Trend Lines
// Uses Recharts (already available in Claude artifact sandbox)

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from "recharts";

// ── Static trend data ──────────────────────────────────────────
const SEC_TREND = [
  { d: "Apr 7", s: 2.0 }, { d: "Apr 10", s: 2.1 }, { d: "Apr 13", s: 1.9 },
  { d: "Apr 16", s: 2.0 }, { d: "Apr 19", s: 2.2 }, { d: "Apr 22", s: 2.3 },
  { d: "Apr 25", s: 2.5 }, { d: "Apr 28", s: 2.8 }, { d: "May 1", s: 3.0 },
  { d: "May 4", s: 3.1 },
];
const QUAL_TREND = [
  { d: "Apr 7", s: 4.0 }, { d: "Apr 10", s: 4.1 }, { d: "Apr 13", s: 4.3 },
  { d: "Apr 16", s: 4.5 }, { d: "Apr 19", s: 4.6 }, { d: "Apr 22", s: 4.9 },
  { d: "Apr 25", s: 5.1 }, { d: "Apr 28", s: 5.4 }, { d: "May 1", s: 5.6 },
  { d: "May 4", s: 5.8 },
];
const ISSUE_CATS = [
  { name: "SQL Inject", count: 3, color: "#f87171" },
  { name: "Hardcoded", count: 3, color: "#f87171" },
  { name: "eval()", count: 2, color: "#f87171" },
  { name: "Dead code", count: 5, color: "#fb923c" },
  { name: "Complexity", count: 4, color: "#38bdf8" },
];

// ── Custom tooltip ─────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0c0e18", border: "1px solid #1a1d2e", borderRadius: 8,
      padding: "6px 12px", fontSize: 11, fontFamily: "'JetBrains Mono',monospace",
      boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
    }}>
      <div style={{ color: "#64748b", marginBottom: 2 }}>{label}</div>
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
        {Number(payload[0].value).toFixed(1)}
      </div>
    </div>
  );
}

// ── Score Card ─────────────────────────────────────────────────
export function ScoreCard({ label, value, color, t }) {
  const pct = Math.min(100, (parseFloat(value) / 10) * 100);
  return (
    <div style={{
      flex: 1, minWidth: 110, background: t.card,
      border: `1px solid ${t.border}`, borderRadius: 12,
      padding: "14px 16px",
      transition: "transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s",
      cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px) scale(1.03)"; e.currentTarget.style.boxShadow = `0 12px 30px ${color}20`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ fontSize: 9, color: t.textFaint, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1, fontFamily: "'Syne',sans-serif" }}>
        {value}
      </div>
      <div style={{ marginTop: 10, height: 4, background: t.border, borderRadius: 2 }}>
        <div style={{
          height: 4, width: `${pct}%`, background: color,
          borderRadius: 2, boxShadow: `0 0 8px ${color}50`,
          transition: "width 1s cubic-bezier(0.22,1,0.36,1)",
        }} />
      </div>
    </div>
  );
}

// ── Radar Chart ────────────────────────────────────────────────
export function ScoreRadar({ scores, t }) {
  const data = Object.entries(scores).map(([k, v]) => ({
    subject: k.charAt(0).toUpperCase() + k.slice(1),
    score: v,
    fullMark: 10,
  }));

  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: 16, flex: 1,
    }}>
      <div style={{ fontSize: 11, color: t.textFaint, fontFamily: "'JetBrains Mono',monospace", marginBottom: 8 }}>
        Code Quality Radar
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke={t.border} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: t.textDim, fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}
          />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            dataKey="score"
            stroke={t.blue}
            fill={t.blue}
            fillOpacity={0.12}
            strokeWidth={2}
            dot={{ r: 3, fill: t.blue, strokeWidth: 0 }}
          />
          <Tooltip
            contentStyle={{
              background: t.card, border: `1px solid ${t.border}`,
              borderRadius: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
            }}
            labelStyle={{ color: t.textDim }}
            itemStyle={{ color: t.blue }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Trend Lines ────────────────────────────────────────────────
export function TrendCharts({ t }) {
  const charts = [
    { title: "Security score — 30 days", data: SEC_TREND, color: "#f87171" },
    { title: "Overall quality — 30 days", data: QUAL_TREND, color: "#4ade80" },
  ];

  return (
    <div className="chart-grid" style={{ display: "flex", gap: 12 }}>
      {charts.map(ch => (
        <div key={ch.title} style={{
          flex: 1, background: t.card2, border: `1px solid ${t.border}`,
          borderRadius: 12, padding: 14,
          transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
        }}
          onMouseEnter={e => e.currentTarget.style.transform = "perspective(600px) rotateX(-1deg) rotateY(1deg) translateY(-4px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "none"}>
          <div style={{ fontSize: 11, color: t.textFaint, marginBottom: 10, fontFamily: "'JetBrains Mono',monospace" }}>
            {ch.title}
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={ch.data}>
              <CartesianGrid stroke={t.border} vertical={false} />
              <XAxis
                dataKey="d"
                tick={{ fill: t.textFaint, fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
                axisLine={false} tickLine={false} interval={2}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fill: t.textFaint, fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
                axisLine={false} tickLine={false} width={18}
              />
              <Tooltip content={<ChartTip />} />
              <Line
                type="monotone" dataKey="s" stroke={ch.color} strokeWidth={2.5}
                dot={{ r: 3, fill: ch.color, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}

// ── Category Bar Chart ─────────────────────────────────────────
export function IssueCategoryChart({ results, t }) {
  const data = results?.issues
    ? (() => {
        const counts = {};
        results.issues.forEach(i => { counts[i.severity] = (counts[i.severity] || 0) + 1; });
        return Object.entries(counts).map(([k, v]) => ({
          name: k.charAt(0).toUpperCase() + k.slice(1),
          count: v,
          color: k === "critical" ? "#f87171" : k === "warning" ? "#fb923c" : "#38bdf8",
        }));
      })()
    : ISSUE_CATS;

  return (
    <div style={{
      background: t.card2, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: 14,
    }}>
      <div style={{ fontSize: 11, color: t.textFaint, marginBottom: 10, fontFamily: "'JetBrains Mono',monospace" }}>
        Issues by category — current scan
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
        {[{ c: "#f87171", l: "Critical" }, { c: "#fb923c", l: "Warning" }, { c: "#38bdf8", l: "Info" }].map(x => (
          <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: t.textDim, fontFamily: "'JetBrains Mono',monospace" }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
            {x.l}
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} barSize={28}>
          <CartesianGrid stroke={t.border} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: t.textFaint, fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fill: t.textFaint, fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
            axisLine={false} tickLine={false} width={18}
          />
          <Tooltip content={({ active, payload, label }) =>
            active && payload?.length ? (
              <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>
                <div style={{ color: t.textDim }}>{label}</div>
                <div style={{ color: "#fff", fontWeight: 700 }}>{payload[0].value}</div>
              </div>
            ) : null
          } />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Full Overview Panel (all charts combined) ──────────────────
export default function AnalysisCharts({ results, t }) {
  const scores = results?.scores || {
    security: 3.1, readability: 6.4, optimization: 7.2, maintainability: 6.5
  };
  const scoreColor = v => v >= 7 ? t.green : v >= 4 ? t.orange : t.red;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Score cards */}
      <div className="score-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {Object.entries(scores).map(([k, v]) => (
          <ScoreCard
            key={k}
            label={k.charAt(0).toUpperCase() + k.slice(1)}
            value={typeof v === "number" ? v.toFixed(1) : v}
            color={scoreColor(v)} t={t}
          />
        ))}
      </div>

      {/* Radar + trends */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <ScoreRadar scores={scores} t={t} />
      </div>

      <TrendCharts t={t} />

      {/* Issue category bar */}
      <IssueCategoryChart results={results} t={t} />

      {/* Summary banner */}
      {results?.summary && (
        <div style={{
          padding: "12px 16px",
          background: `${t.blue}08`,
          border: `1px solid ${t.blue}20`,
          borderRadius: 12, fontSize: 12, color: t.textDim,
          fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.7,
        }}>
          <span style={{ color: t.blue, fontWeight: 700 }}>📊 Summary: </span>
          {results.summary}
        </div>
      )}
    </div>
  );
}