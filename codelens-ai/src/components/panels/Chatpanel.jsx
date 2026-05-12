// ChatPanel.jsx — AI Assistant Chat
// Real-time conversation with Guru AI about your code

import { useState, useRef, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────
// message: { id, role: "user"|"ai", content, time, loading? }

// ── AI call ───────────────────────────────────────────────────
async function callAI(messages, code) {
  const history = messages
    .filter(m => !m.loading)
    .slice(-8)
    .map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }));

  const systemContext = code
    ? `You are Guru AI, an expert code reviewer and security analyst. You have access to the user's code:\n\`\`\`\n${code.slice(0, 1200)}\n\`\`\`\nBe concise, practical, and include code examples when helpful.`
    : "You are Guru AI, an expert code reviewer and security analyst. Be concise and practical.";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: systemContext,
      messages: history,
    }),
  });
  const data = await response.json();
  return data.content?.map(c => c.text || "").join("") || "Sorry, I couldn't process that.";
}

// ── Message bubble ─────────────────────────────────────────────
function Bubble({ msg, t }) {
  const isUser = msg.role === "user";

  return (
    <div style={{
      display: "flex", flexDirection: isUser ? "row-reverse" : "row",
      gap: 10, alignItems: "flex-start",
      animation: "slideInRight 0.22s cubic-bezier(0.22,1,0.36,1) both",
    }}>
      {/* Avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        background: isUser
          ? `linear-gradient(135deg,${t.blueDark || "#1d4ed8"},${t.blue})`
          : "linear-gradient(135deg,#7c3aed,#4f46e5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color: "#fff",
        boxShadow: isUser ? `0 2px 10px ${t.blue}40` : "0 2px 10px rgba(124,58,237,0.4)",
      }}>
        {isUser ? "U" : "G"}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: "75%",
        padding: "10px 14px",
        borderRadius: isUser ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
        background: isUser ? `linear-gradient(135deg,${t.blueDark || "#1d4ed8"},${t.blue})` : t.card2,
        border: isUser ? "none" : `1px solid ${t.border}`,
        color: isUser ? "#fff" : t.text,
        fontSize: 12, lineHeight: 1.75,
        fontFamily: "'JetBrains Mono',monospace",
        whiteSpace: "pre-wrap", wordBreak: "break-word",
        boxShadow: isUser ? `0 4px 16px ${t.blue}30` : "none",
      }}>
        {msg.loading ? (
          <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "2px 0" }}>
            {[0, 0.2, 0.4].map((d, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: "50%",
                background: t.blue, opacity: 0.7,
                animation: `pulse 1.2s ${d}s ease-in-out infinite`,
              }} />
            ))}
          </div>
        ) : msg.content}

        {/* Time */}
        <div style={{
          fontSize: 9, color: isUser ? "rgba(255,255,255,0.5)" : t.textFaint,
          marginTop: 5, textAlign: "right",
        }}>
          {new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

// ── Quick prompts ──────────────────────────────────────────────
const QUICK_PROMPTS = [
  "What are the biggest security risks in my code?",
  "How can I improve performance?",
  "Explain the SQL injection vulnerability",
  "What's the cyclomatic complexity and why does it matter?",
  "How do I fix hardcoded secrets?",
  "Convert this to use async/await properly",
  "What unit tests should I write for this?",
  "Rate my code quality 1-10 with reasons",
];

// ── Main component ─────────────────────────────────────────────
export default function ChatPanel({ t, code }) {
  const [messages, setMessages] = useState([
    {
      id: 1, role: "ai",
      content: "👋 Hi! I'm Guru AI — your code security expert.\n\nI can see your code in the editor. Ask me anything:\n• Security vulnerabilities\n• Performance improvements\n• Code explanations\n• Refactoring tips",
      time: Date.now(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;

    setInput("");

    const userMsg = { id: Date.now(), role: "user", content: msg, time: Date.now() };
    const loadingMsg = { id: Date.now() + 1, role: "ai", content: "", time: Date.now(), loading: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setIsLoading(true);

    try {
      const reply = await callAI([...messages, userMsg], code);
      setMessages(prev => prev.map(m => m.loading ? { ...m, content: reply, loading: false } : m));
    } catch {
      setMessages(prev => prev.map(m => m.loading
        ? { ...m, content: "⚠️ Network error. Please try again.", loading: false }
        : m
      ));
    }
    setIsLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(), role: "ai",
      content: "Chat cleared. What would you like to know about your code?",
      time: Date.now(),
    }]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", minHeight: 400 }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px", marginBottom: 12,
        background: t.card, border: `1px solid ${t.border}`,
        borderRadius: 12,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: t.green, boxShadow: `0 0 8px ${t.green}`,
          animation: "pulse 2s ease-in-out infinite",
        }} />
        <span style={{ fontSize: 12, color: t.text, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>
          Guru AI Chat
        </span>
        <span style={{ fontSize: 10, color: t.textFaint, fontFamily: "'JetBrains Mono',monospace" }}>
          {code ? "· Code loaded" : "· No code"}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button onClick={clearChat} style={{
            padding: "4px 10px", fontSize: 10, borderRadius: 6,
            background: "transparent", border: `1px solid ${t.border2}`,
            color: t.textFaint, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace",
            transition: "all 0.18s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.blue; e.currentTarget.style.color = t.blue; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.border2; e.currentTarget.style.color = t.textFaint; }}>
            Clear
          </button>
        </div>
      </div>

      {/* ── Quick prompts (only when 1 message) ── */}
      {messages.length <= 1 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: t.textFaint, fontFamily: "'JetBrains Mono',monospace", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Quick questions
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {QUICK_PROMPTS.slice(0, 4).map(q => (
              <button key={q} onClick={() => send(q)} style={{
                padding: "5px 12px", fontSize: 10, borderRadius: 20,
                background: "transparent", border: `1px solid ${t.border2}`,
                color: t.blue, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace",
                transition: "all 0.18s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = t.navHover; e.currentTarget.style.borderColor = t.blue; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = t.border2; }}>
                {q.length > 36 ? q.slice(0, 36) + "…" : q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14,
        padding: "4px 2px", marginBottom: 12,
      }}>
        {messages.map(msg => <Bubble key={msg.id} msg={msg} t={t} />)}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div style={{
        display: "flex", gap: 8, alignItems: "flex-end",
        background: t.card, border: `1px solid ${t.border}`,
        borderRadius: 14, padding: "8px 12px",
        boxShadow: `0 0 20px ${t.blue}10`,
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about your code… (Enter to send, Shift+Enter for new line)"
          rows={1}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none", resize: "none",
            color: t.text, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, lineHeight: 1.6,
            maxHeight: 100, overflowY: "auto",
          }}
          onInput={e => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
          }}
        />
        <button
          onClick={() => send()}
          disabled={isLoading || !input.trim()}
          style={{
            width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer",
            background: isLoading || !input.trim()
              ? t.border2
              : `linear-gradient(135deg,${t.blueDark || "#1d4ed8"},${t.blue})`,
            color: "#fff", fontSize: 14, flexShrink: 0,
            transition: "all 0.18s", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: !isLoading && input.trim() ? `0 4px 14px ${t.blue}40` : "none",
          }}>
          {isLoading ? (
            <div style={{
              width: 14, height: 14, borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
              animation: "spin 0.7s linear infinite",
            }} />
          ) : "↑"}
        </button>
      </div>

      <div style={{ fontSize: 9, color: t.textFaint, fontFamily: "'JetBrains Mono',monospace", textAlign: "center", marginTop: 6 }}>
        Powered by Claude Sonnet · Context-aware from your editor
      </div>
    </div>
  );
}