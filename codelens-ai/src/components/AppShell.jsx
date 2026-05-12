import EditorPanel from "./panels/EditorPanel";
import IssuesPanel from "./panels/IssuesPanel";
import ExplainPanel from "./panels/ExplainPanel";
import React, { useState } from "react";
import { NAV_ITEMS } from "../constants";
import { Spinner } from "./shared/Spinner";

// ─── Premium user profile card ────────────────────────────────────────────────
function UserCard({ user, onLogout, t }) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        margin:       "8px 10px 14px",
        padding:      "14px",
        borderRadius: 14,
        background:   `linear-gradient(135deg,${t.card},${t.card2})`,
        border:       `1px solid ${t.blue}28`,
        boxShadow:    `0 0 20px ${t.blue}10,inset 0 1px 0 rgba(255,255,255,0.04)`,
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          {user.photo ? (
            <img
              src={user.photo}
              alt={user.name}
              style={{
                width:        38,
                height:       38,
                borderRadius: "50%",
                objectFit:    "cover",
                border:       `2px solid ${t.blue}50`,
                boxShadow:    `0 0 14px ${t.blue}40`,
              }}
            />
          ) : (
            <div
              style={{
                width:          38,
                height:         38,
                borderRadius:   "50%",
                background:     "linear-gradient(135deg,#185fa5,#1a7ed4)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       13,
                fontWeight:     700,
                color:          "#fff",
                boxShadow:      `0 0 14px ${t.blue}40`,
                border:         `2px solid ${t.blue}50`,
                fontFamily:     "'JetBrains Mono',monospace",
              }}
            >
              {initials}
            </div>
          )}
          {/* Online dot */}
          <div
            style={{
              position:     "absolute",
              bottom:       1,
              right:        1,
              width:        8,
              height:       8,
              borderRadius: "50%",
              background:   t.green,
              border:       `2px solid ${t.sidebar}`,
              boxShadow:    `0 0 6px ${t.green}`,
              animation:    "glow-pulse 2.5s ease-in-out infinite",
            }}
          />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize:      12,
              color:         t.text,
              fontWeight:    600,
              overflow:      "hidden",
              textOverflow:  "ellipsis",
              whiteSpace:    "nowrap",
              fontFamily:    "'JetBrains Mono',monospace",
            }}
          >
            {user.name}
          </div>
          <div
            style={{
              fontSize:     10,
              color:        t.textDim,
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
              marginTop:    2,
            }}
          >
            {user.email}
          </div>
          <div
            style={{
              marginTop:    4,
              display:      "inline-block",
              fontSize:     9,
              padding:      "2px 7px",
              borderRadius: 10,
              background:   `${t.blue}15`,
              color:        t.blue,
              fontFamily:   "'JetBrains Mono',monospace",
              border:       `1px solid ${t.blue}25`,
            }}
          >
            {user.plan?.toUpperCase() || "FREE"}
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        style={{
          marginTop:    10,
          width:        "100%",
          padding:      "7px",
          fontSize:     11,
          background:   "transparent",
          border:       `1px solid ${t.border2}`,
          borderRadius: 8,
          color:        t.textDim,
          fontFamily:   "'JetBrains Mono',monospace",
          cursor:       "pointer",
          transition:   "all 0.18s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = t.red;
          e.currentTarget.style.color       = t.redText;
          e.currentTarget.style.background  = t.redBg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = t.border2;
          e.currentTarget.style.color       = t.textDim;
          e.currentTarget.style.background  = "transparent";
        }}
      >
        Sign out
      </button>
    </div>
  );
}

// ─── Desktop sidebar ───────────────────────────────────────────────────────────
function Sidebar({ tab, setTab, isDark, setIsDark, user, onLogout, issueCount, t }) {
  return (
    <div
      className="sidebar-desktop"
      style={{
        width:       220,
        minWidth:    220,
        background:  t.sidebar,
        borderRight: `1px solid ${t.border}`,
        display:     "flex",
        flexDirection: "column",
        boxShadow:   "4px 0 24px rgba(0,0,0,0.2)",
      }}
    >
      {/* Logo + theme toggle */}
      <div
        style={{
          padding:      "18px 18px 14px",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width:          36,
              height:         36,
              borderRadius:   10,
              background:     "linear-gradient(135deg,#185fa5,#1a7ed4)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontSize:       14,
              fontWeight:     900,
              color:          "#fff",
              flexShrink:     0,
              boxShadow:      "0 4px 14px rgba(24,95,165,0.5)",
              animation:      "pulse-ring 3s infinite",
              fontFamily:     "'Syne',sans-serif",
            }}
          >
            G
          </div>
          <div>
            <div
              style={{
                fontSize:      15,
                fontWeight:    900,
                color:         t.text,
                letterSpacing: "-0.5px",
                fontFamily:    "'Syne',sans-serif",
              }}
            >
              Guru AI
            </div>
            <div style={{ fontSize: 9, color: t.textGhost, letterSpacing: "0.3px" }}>
              v2.1 · production
            </div>
          </div>

          {/* Theme toggle */}
          <div
            onClick={() => setIsDark((d) => !d)}
            title="Toggle theme"
            style={{
              marginLeft:   "auto",
              width:        32,
              height:       18,
              borderRadius: 10,
              background:   isDark ? "#185fa5" : t.border2,
              cursor:       "pointer",
              position:     "relative",
              transition:   "background 0.25s",
              border:       `1px solid ${t.border2}`,
              flexShrink:   0,
            }}
          >
            <div
              style={{
                position:     "absolute",
                width:        12,
                height:       12,
                background:   "#fff",
                borderRadius: "50%",
                top:          2,
                left:         isDark ? 16 : 2,
                transition:   "left 0.25s cubic-bezier(0.22,1,0.36,1)",
                boxShadow:    "0 1px 4px rgba(0,0,0,0.3)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const active = item.id === tab;
          return (
            <div
              key={item.id}
              className="nav-item"
              style={{
                color:           active ? t.blue : t.textFaint,
                background:      active ? t.navActive : "transparent",
                borderLeftColor: active ? t.blue : "transparent",
              }}
              onClick={() => setTab(item.id)}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "issues" && issueCount > 0 && (
                <span
                  style={{
                    marginLeft:   "auto",
                    fontSize:     9,
                    padding:      "1px 6px",
                    borderRadius: 20,
                    background:   t.redBg,
                    color:        t.redText,
                    fontWeight:   700,
                  }}
                >
                  {issueCount}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* User card */}
      <UserCard user={user} onLogout={onLogout} t={t} />
    </div>
  );
}

// ─── Mobile bottom nav ─────────────────────────────────────────────────────────
function MobileBottomNav({ tab, setTab, t }) {
  const primary = NAV_ITEMS.slice(0, 5);
  return (
    <div
      className="mobile-nav"
      style={{
        position:   "fixed",
        bottom:     0,
        left:       0,
        right:      0,
        background: t.sidebar,
        borderTop:  `1px solid ${t.border}`,
        display:    "flex",
        zIndex:     200,
        boxShadow:  "0 -4px 24px rgba(0,0,0,0.2)",
      }}
    >
      {primary.map((item) => (
        <div
          key={item.id}
          onClick={() => setTab(item.id)}
          style={{
            flex:           1,
            padding:        "10px 4px 8px",
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            gap:            3,
            cursor:         "pointer",
            borderTop:      `2px solid ${tab === item.id ? t.blue : "transparent"}`,
            transition:     "all 0.18s",
            background:     tab === item.id ? t.navActive : "transparent",
          }}
        >
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          <span
            style={{
              fontSize:  9,
              fontFamily: "'JetBrains Mono',monospace",
              color:     tab === item.id ? t.blue : t.textFaint,
            }}
          >
            {item.label.split(" ")[0]}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main AppShell export ──────────────────────────────────────────────────────
export default function AppShell({
  tab,
  setTab,
  isDark,
  setIsDark,
  user,
  onLogout,
  results,
  analyzing,
  analyzeStep,
  onRunAnalysis,
  code,
  language,
  children,
  t,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const issueCount = results ? (results.critical || 0) + (results.warnings || 0) : 0;

  const switchTab = (id) => {
    setTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <div
      style={{
        display:   "flex",
        height:    "100vh",
        width:     "100vw",
        background: t.panelBg,
        overflow:  "hidden",
        fontFamily: "'JetBrains Mono',monospace",
        color:     t.text,
        position:  "relative",
      }}
    >
      {/* Desktop sidebar */}
      <Sidebar
        tab={tab}
        setTab={switchTab}
        isDark={isDark}
        setIsDark={setIsDark}
        user={user}
        onLogout={onLogout}
        issueCount={issueCount}
        t={t}
      />

      {/* Main area */}
      <div
        style={{
          flex:          1,
          display:       "flex",
          flexDirection: "column",
          overflow:      "hidden",
          minWidth:      0,
        }}
      >
        {/* Header bar */}
        <div
          style={{
            padding:     "10px 16px",
            borderBottom: `1px solid ${t.border}`,
            display:     "flex",
            alignItems:  "center",
            gap:         8,
            background:  t.headerBg,
            flexWrap:    "wrap",
            boxShadow:   "0 2px 12px rgba(0,0,0,0.1)",
          }}
        >
          {/* Mobile hamburger */}
          <button
            className="mobile-nav"
            style={{
              padding:      "6px",
              background:   "transparent",
              border:       `1px solid ${t.border2}`,
              borderRadius: 6,
              color:        t.textDim,
              cursor:       "pointer",
              fontSize:     14,
              display:      "none",
            }}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            ☰
          </button>

          <span
            className="header-tags"
            style={{
              fontSize:     11,
              padding:      "3px 10px",
              borderRadius: 5,
              background:   `${t.blue}15`,
              color:        t.blue,
              fontWeight:   700,
              fontFamily:   "'JetBrains Mono',monospace",
            }}
          >
            {language}
          </span>
          <span
            className="header-tags"
            style={{
              fontSize:     11,
              padding:      "3px 10px",
              borderRadius: 5,
              border:       `1px solid ${t.border}`,
              color:        t.textFaint,
              fontFamily:   "'JetBrains Mono',monospace",
            }}
          >
            {code.split("\n").length} lines
          </span>

          {results ? (
            <>
              {results.critical > 0 && (
                <span
                  className="header-tags"
                  style={{
                    fontSize:     11,
                    padding:      "3px 10px",
                    borderRadius: 5,
                    background:   t.redBg,
                    color:        t.redText,
                    fontWeight:   700,
                    fontFamily:   "'JetBrains Mono',monospace",
                  }}
                >
                  {results.critical} critical
                </span>
              )}
              {results.warnings > 0 && (
                <span
                  className="header-tags"
                  style={{
                    fontSize:     11,
                    padding:      "3px 10px",
                    borderRadius: 5,
                    background:   t.orangeBg,
                    color:        t.orange,
                    fontWeight:   700,
                    fontFamily:   "'JetBrains Mono',monospace",
                  }}
                >
                  {results.warnings} warnings
                </span>
              )}
              <span
                className="header-tags"
                style={{
                  fontSize:     11,
                  padding:      "3px 10px",
                  borderRadius: 5,
                  background:   t.greenBg,
                  color:        t.green,
                  fontWeight:   700,
                  fontFamily:   "'JetBrains Mono',monospace",
                }}
              >
                ✓ Analyzed
              </span>
            </>
          ) : (
            <span
              className="header-tags"
              style={{
                fontSize:     11,
                padding:      "3px 10px",
                borderRadius: 5,
                border:       `1px solid ${t.border}`,
                color:        t.textGhost,
                fontFamily:   "'JetBrains Mono',monospace",
              }}
            >
              Not analyzed
            </span>
          )}

          <button
            className="btn-primary"
            style={{
              marginLeft: "auto",
              padding:    "7px 18px",
              fontSize:   12,
              fontWeight: 700,
            }}
            onClick={onRunAnalysis}
            disabled={analyzing}
          >
            {analyzing ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Spinner color="#fff" size={12} />
                {analyzeStep}
              </span>
            ) : (
              "Run Analysis"
            )}
          </button>
        </div>

        {/* Desktop tab bar */}
        <div
          className="sidebar-desktop"
          style={{
            display:    "flex",
            borderBottom: `1px solid ${t.border}`,
            padding:    "0 16px",
            background: t.headerBg,
            overflowX:  "auto",
            flexShrink: 0,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`tab-btn${item.id === tab ? " active" : ""}`}
              style={{
                color:           item.id === tab ? t.blue : t.textFaint,
                borderBottomColor: item.id === tab ? t.blue : "transparent",
              }}
              onClick={() => switchTab(item.id)}
            >
              {item.icon}{" "}
              {item.label}
              {item.id === "issues" && issueCount > 0 ? ` (${issueCount})` : ""}
            </div>
          ))}
        </div>

        {/* Panel content */}
        <div
          style={{
            flex:        1,
            overflowY:   "auto",
            padding:     "16px",
            background:  t.panelBg,
            paddingBottom: 70,
          }}
        >
          {children}
        </div>
      </div>

      {/* Mobile slide-in menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav"
          style={{
            position: "fixed",
            inset:    0,
            zIndex:   150,
            display:  "none",
          }}
        >
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            style={{
              position:  "absolute",
              left:      0,
              top:       0,
              bottom:    0,
              width:     240,
              background: t.sidebar,
              padding:   "20px 0",
              boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                padding:      "0 18px 16px",
                borderBottom: `1px solid ${t.border}`,
                marginBottom: 8,
                fontFamily:   "'Syne',sans-serif",
                fontSize:     18,
                fontWeight:   900,
                color:        t.text,
              }}
            >
              Guru AI
            </div>
            {NAV_ITEMS.map((item) => (
              <div
                key={item.id}
                className="nav-item"
                style={{
                  color:           item.id === tab ? t.blue : t.textFaint,
                  background:      item.id === tab ? t.navActive : "transparent",
                  borderLeftColor: item.id === tab ? t.blue : "transparent",
                }}
                onClick={() => switchTab(item.id)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <MobileBottomNav tab={tab} setTab={switchTab} t={t} />
    </div>
  );
}