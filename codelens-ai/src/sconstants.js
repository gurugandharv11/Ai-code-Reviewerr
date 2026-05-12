// ─── Languages ──────────────────────────────────────────────────────────────
export const LANGUAGES = [
    "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Go", "Rust",
    "PHP", "Ruby", "Swift", "Kotlin", "Scala", "R", "Dart", "Lua", "Shell", "SQL",
];

// ─── Nav items ───────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
    { id: "editor", label: "Code Editor", icon: "✏️" },
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "issues", label: "Issues", icon: "⚠️" },
    { id: "ast", label: "AST View", icon: "🌳" },
    { id: "complexity", label: "Complexity", icon: "📈" },
    { id: "explain", label: "AI Explain", icon: "🤖" },
    { id: "github", label: "GitHub PR", icon: "🔗" },
    { id: "debt", label: "Tech Debt", icon: "💰" },
    { id: "history", label: "Scan History", icon: "🕐" },
    { id: "export", label: "Export PDF", icon: "📄" },
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
];

// ─── Sample code (preloaded in editor) ───────────────────────────────────────
export const SAMPLE_CODE = `// userAuth.js - Authentication Service
const db = require('./database');
const SECRET_KEY = "sk-prod-abc123xyz"; // (!) Hardcoded secret!

async function authenticateUser(userId, password) {
  // (!) SQL Injection - never interpolate user input!
  const user = await db.query(
    \`SELECT * FROM users WHERE id=\${userId}\`
  );

  // Dead code - this block never runs
  if (false) {
    console.log("unreachable");
    return null;
  }

  // (!) Dangerous: eval() runs arbitrary code
  const result = eval(userInput);

  // Unused variable
  const tempToken = generateToken();

  // O(n²) complexity - nested loops
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < tokens.length; j++) {
      if (users[i].id === tokens[j].userId) {
        processMatch(users[i], tokens[j]);
      }
    }
  }

  return result;
}

module.exports = { authenticateUser };`;

// ─── Static chart data ────────────────────────────────────────────────────────
export const SEC_TREND = [
    { d: "Apr 7", s: 2.0 }, { d: "Apr 10", s: 2.1 }, { d: "Apr 13", s: 1.9 },
    { d: "Apr 16", s: 2.0 }, { d: "Apr 19", s: 2.2 }, { d: "Apr 22", s: 2.3 },
    { d: "Apr 25", s: 2.5 }, { d: "Apr 28", s: 2.8 }, { d: "May 1", s: 3.0 },
    { d: "May 4", s: 3.1 },
];

export const QUAL_TREND = [
    { d: "Apr 7", s: 4.0 }, { d: "Apr 10", s: 4.1 }, { d: "Apr 13", s: 4.3 },
    { d: "Apr 16", s: 4.5 }, { d: "Apr 19", s: 4.6 }, { d: "Apr 22", s: 4.9 },
    { d: "Apr 25", s: 5.1 }, { d: "Apr 28", s: 5.4 }, { d: "May 1", s: 5.6 },
    { d: "May 4", s: 5.8 },
];

export const ISSUE_CATS = [
    { name: "SQL Inject", count: 3, color: "#e24b4a" },
    { name: "Hardcoded", count: 3, color: "#e24b4a" },
    { name: "eval()", count: 2, color: "#e24b4a" },
    { name: "Dead code", count: 5, color: "#ef9f27" },
    { name: "Complexity", count: 4, color: "#378add" },
];

// ─── Fallback static issues (shown before first real analysis) ────────────────
export const STATIC_ISSUES = [
    { id: 1, severity: "critical", title: "SQL Injection — line 8", file: "userAuth.js", line: 8, snippet: 'db.query(`SELECT * WHERE id=${userId}`)' },
    { id: 2, severity: "critical", title: "Hardcoded API secret — line 3", file: "userAuth.js", line: 3, snippet: 'const SECRET_KEY = "sk-prod-abc123xyz"' },
    { id: 3, severity: "critical", title: "Unsafe eval() — line 21", file: "userAuth.js", line: 21, snippet: "eval(userInput)" },
    { id: 4, severity: "warning", title: "Unused variable — line 24", file: "userAuth.js", line: 24, snippet: "const tempToken = generateToken()" },
    { id: 5, severity: "warning", title: "Dead code block — lines 13-16", file: "userAuth.js", line: 13, snippet: "if (false) { ... } // never executes" },
];

export const COMPLEXITY_DATA = [
    { fn: "authenticateUser()", notation: "O(n²)", level: "high", cc: 14, pct: 90, tip: "Nested loops lines 27-31. Extract inner loop to helper." },
    { fn: "validateToken()", notation: "O(n log n)", level: "med", cc: 7, pct: 50, tip: "3 nested conditions. Use early returns." },
    { fn: "hashPassword()", notation: "O(1)", level: "low", cc: 2, pct: 15, tip: "Clean. No refactoring needed." },
    { fn: "refreshSession()", notation: "O(n)", level: "med", cc: 5, pct: 38, tip: "Replace manual loop with Array.reduce()." },
];

export const STATIC_PRS = [
    { num: 47, title: "feat: add JWT refresh token logic", status: "open", adds: 234, files: 3, author: "rahulkumar", crit: 2, warn: 1 },
    { num: 44, title: "fix: password validation edge cases", status: "review", adds: 67, files: 1, author: "priya-dev", crit: 0, warn: 0 },
    { num: 41, title: "refactor: split auth controller", status: "open", adds: 512, files: 8, author: "rahulkumar", crit: 0, warn: 3 },
];

// ─── Quick AI questions ───────────────────────────────────────────────────────
export const QUICK_QUESTIONS = [
    "Why is SQL Injection dangerous?",
    "What is cyclomatic complexity?",
    "How to fix hardcoded secrets?",
    "What is dead code?",
    "How does AST analysis work?",
    "What is Big O notation?",
    "How to prevent XSS attacks?",
    "What is the OWASP Top 10?",
];