// SettingsPanel.jsx — App Settings & Preferences
// Theme switcher, font size, scan depth, keyboard shortcuts

import { useState } from "react";

// ── Toggle ─────────────────────────────────────────────────────
function Toggle({ value, onChange, t }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 12, cursor: "pointer",
        background: value ? t.blue : t.border2,
        position: "relative", transition: "background 0.25s",
        border: `1px solid ${value ? t.blue : t.border2}`,
        flexShrink: 0,
      }}>
      <div style={{
        position: "absolute", width: 16, height: 16,
        background: "#fff", borderRadius: "50%",
        top: 2, left: value ? 21 : 2,
        transition: "left 0.25s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }} />
    </div>
  );
}

// ── Slider ─────────────────────────────────────────────────────
function Slider({ value, min, max, step = 1, onChange, t }) {
  return (
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{
        flex: 1, height: 4, accentColor: t.blue,
        cursor: "pointer", background: "transparent",
      }}
    />
  );
}

// ── Section header ─────────────────────────────────────────────
function SectionTitle({ children, t }) {
  return (
    <div style={{
      fontSize: 9, color: t.textFaint, textTransform: "uppercase",
      letterSpacing: "0.8px", marginBottom: 8, marginTop: 4,
      fontFamily: "'JetBrains Mono',monospace",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <div style={{ flex: 1, height: 1, background: t.border }} />
      {children}
      <div style={{ flex: 1, height: 1, background: t.border }} />
    </div>
  );
}

// ── Setting row ────────────────────────────────────────────────
function SettingRow({ label, description, children, t }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 0", borderBottom: `1px solid ${t.border}`,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: t.text, fontFamily: "'JetBrains Mono',monospace", fontWeight: 500 }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: 10, color: t.textFaint, fontFamily: "'JetBrains Mono',monospace", marginTop: 2, lineHeight: 1.5 }}>
            {description}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Keyboard shortcut badge ────────────────────────────────────
function KbdBadge({ keys, t }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {keys.map(k => (
        <kbd key={k} style={{
          padding: "2px 7px", borderRadius: 5, fontSize: 10,
          background: t.card2, border: `1px solid ${t.border2}`,
          color: t.textDim, fontFamily: "'JetBrains Mono',monospace",
        }}>{k}</kbd>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function SettingsPanel({ t, settings, onSettingsChange }) {
  const [saved, setSaved] = useState(false);

  const update = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
    setSaved(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem("guru_ai_settings", JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const handleReset = () => {
    const defaults = {
      theme: "dark",
      fontSize: 13,
      scanDepth: "standard",
      autoDetectLang: true,
      showLineNumbers: true,
      animationsEnabled: true,
      particlesEnabled: true,
      saveHistory: true,
      realTimeScan: false,
      showMinimap: false,
      compactMode: false,
      highlightErrors: true,
      soundEnabled: false,
    };
    onSettingsChange(defaults);
  };

  const THEMES_LIST = [
    { key: "dark", label: "🌙 Dark", desc: "Deep space dark theme" },
    { key: "cyberpunk", label: "⚡ Cyberpunk", desc: "Neon pink & green" },
    { key: "light", label: "☀️ Light", desc: "Clean light mode" },
  ];

  const SCAN_DEPTHS = [
    { key: "quick", label: "Quick", desc: "Basic security scan only (~1s)" },
    { key: "standard", label: "Standard", desc: "Security + complexity + AI (~3s)" },
    { key: "deep", label: "Deep", desc: "Full analysis with optimization (~8s)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 640 }}>

      {/* ── Appearance ── */}
      <SectionTitle t={t}>Appearance</SectionTitle>

      {/* Theme */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: t.text, fontFamily: "'JetBrains Mono',monospace", fontWeight: 500, marginBottom: 10 }}>
          Theme
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {THEMES_LIST.map(th => (
            <div key={th.key}
              onClick={() => update("theme", th.key)}
              style={{
                padding: "10px 16px", borderRadius: 10, cursor: "pointer",
                background: settings.theme === th.key ? `${t.blue}15` : t.card,
                border: `1px solid ${settings.theme === th.key ? t.blue : t.border}`,
                transition: "all 0.18s", flex: 1, minWidth: 120,
              }}>
              <div style={{ fontSize: 13, color: settings.theme === th.key ? t.blue : t.text, fontFamily: "'JetBrains Mono',monospace", fontWeight: settings.theme === th.key ? 700 : 400 }}>
                {th.label}
              </div>
              <div style={{ fontSize: 10, color: t.textFaint, fontFamily: "'JetBrains Mono',monospace", marginTop: 3 }}>
                {th.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Font size */}
      <SettingRow label="Font Size" description={`Editor font size: ${settings.fontSize}px`} t={t}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: 160 }}>
          <Slider value={settings.fontSize} min={11} max={18} onChange={v => update("fontSize", v)} t={t} />
          <span style={{ fontSize: 12, color: t.blue, fontFamily: "'JetBrains Mono',monospace", minWidth: 28 }}>
            {settings.fontSize}px
          </span>
        </div>
      </SettingRow>

      <SettingRow label="Animations" description="Panel transitions and card effects" t={t}>
        <Toggle value={settings.animationsEnabled} onChange={v => update("animationsEnabled", v)} t={t} />
      </SettingRow>

      <SettingRow label="3D Particles" description="WebGL background particle field" t={t}>
        <Toggle value={settings.particlesEnabled} onChange={v => update("particlesEnabled", v)} t={t} />
      </SettingRow>

      <SettingRow label="Compact Mode" description="Reduce padding for more content" t={t}>
        <Toggle value={settings.compactMode} onChange={v => update("compactMode", v)} t={t} />
      </SettingRow>

      {/* ── Editor ── */}
      <div style={{ marginTop: 20 }}>
        <SectionTitle t={t}>Editor</SectionTitle>
      </div>

      <SettingRow label="Line Numbers" description="Show line numbers in editor" t={t}>
        <Toggle value={settings.showLineNumbers} onChange={v => update("showLineNumbers", v)} t={t} />
      </SettingRow>

      <SettingRow label="Auto-detect Language" description="Detect language on paste" t={t}>
        <Toggle value={settings.autoDetectLang} onChange={v => update("autoDetectLang", v)} t={t} />
      </SettingRow>

      <SettingRow label="Highlight Errors" description="Red glow on lines with issues" t={t}>
        <Toggle value={settings.highlightErrors} onChange={v => update("highlightErrors", v)} t={t} />
      </SettingRow>

      {/* ── Analysis ── */}
      <div style={{ marginTop: 20 }}>
        <SectionTitle t={t}>Analysis</SectionTitle>
      </div>

      {/* Scan depth */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: t.text, fontFamily: "'JetBrains Mono',monospace", fontWeight: 500, marginBottom: 10 }}>
          Scan Depth
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {SCAN_DEPTHS.map(d => (
            <div key={d.key}
              onClick={() => update("scanDepth", d.key)}
              style={{
                padding: "8px 14px", borderRadius: 8, cursor: "pointer", flex: 1,
                background: settings.scanDepth === d.key ? `${t.blue}15` : t.card,
                border: `1px solid ${settings.scanDepth === d.key ? t.blue : t.border}`,
                transition: "all 0.18s",
              }}>
              <div style={{ fontSize: 12, color: settings.scanDepth === d.key ? t.blue : t.text, fontFamily: "'JetBrains Mono',monospace", fontWeight: settings.scanDepth === d.key ? 700 : 400 }}>
                {d.label}
              </div>
              <div style={{ fontSize: 9, color: t.textFaint, fontFamily: "'JetBrains Mono',monospace", marginTop: 3 }}>
                {d.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SettingRow label="Save Scan History" description="Store last 20 scans in browser" t={t}>
        <Toggle value={settings.saveHistory} onChange={v => update("saveHistory", v)} t={t} />
      </SettingRow>

      <SettingRow label="Real-time Scan" description="Scan as you type (may be slow)" t={t}>
        <Toggle value={settings.realTimeScan} onChange={v => update("realTimeScan", v)} t={t} />
      </SettingRow>

      {/* ── Keyboard Shortcuts ── */}
      <div style={{ marginTop: 20 }}>
        <SectionTitle t={t}>Keyboard Shortcuts</SectionTitle>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {[
          { label: "Run Analysis", keys: ["Ctrl", "Enter"] },
          { label: "Load Sample Code", keys: ["Ctrl", "Shift", "S"] },
          { label: "Clear Editor", keys: ["Ctrl", "Shift", "X"] },
          { label: "Focus Chat", keys: ["Ctrl", "Shift", "C"] },
          { label: "Toggle Theme", keys: ["Ctrl", "Shift", "T"] },
          { label: "Export PDF", keys: ["Ctrl", "Shift", "E"] },
        ].map(s => (
          <SettingRow key={s.label} label={s.label} t={t}>
            <KbdBadge keys={s.keys} t={t} />
          </SettingRow>
        ))}
      </div>

      {/* ── Actions ── */}
      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <button onClick={handleSave} style={{
          padding: "10px 20px", fontSize: 12, borderRadius: 8, cursor: "pointer",
          background: `linear-gradient(135deg,${t.blueDark || "#1d4ed8"},${t.blue})`,
          color: "#fff", border: "none", fontFamily: "'JetBrains Mono',monospace",
          fontWeight: 700, transition: "all 0.18s",
          boxShadow: `0 4px 16px ${t.blue}35`,
        }}>
          {saved ? "✓ Saved!" : "Save Settings"}
        </button>

        <button onClick={handleReset} style={{
          padding: "10px 16px", fontSize: 12, borderRadius: 8, cursor: "pointer",
          background: "transparent", color: t.textFaint,
          border: `1px solid ${t.border2}`, fontFamily: "'JetBrains Mono',monospace",
          transition: "all 0.18s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = t.orange; e.currentTarget.style.color = t.orange; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = t.border2; e.currentTarget.style.color = t.textFaint; }}>
          Reset Defaults
        </button>
      </div>

      {/* ── Version info ── */}
      <div style={{
        marginTop: 20, padding: "12px 16px",
        background: t.card, border: `1px solid ${t.border}`,
        borderRadius: 10, fontSize: 10, color: t.textFaint,
        fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.8,
      }}>
        <strong style={{ color: t.textDim }}>Guru AI</strong> v2.0.0 · Production<br />
        Engine: Claude Sonnet 4.6 · EmailJS OTP Auth<br />
        Scan engine: Client-side regex + AST + AI hybrid<br />
        <span style={{ color: t.textGhost }}>Settings saved to localStorage</span>
      </div>
    </div>
  );
}