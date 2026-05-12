import * as BabelParser from "@babel/parser";

// ─── Language auto-detection ──────────────────────────────────────────────────
export function detectLanguage(code) {
    if (!code.trim()) return "JavaScript";
    if (code.includes("import java.") || code.includes("public class") || code.includes("System.out.println")) return "Java";
    if (code.includes("def ") && code.includes(":") && !code.includes("{")) return "Python";
    if ((code.includes("fn ") && code.includes("let mut")) || code.includes("println!")) return "Rust";
    if (code.includes("package main") || code.includes("fmt.Println")) return "Go";
    if (code.includes("#include") && code.includes("cout")) return "C++";
    if (code.includes("#include") && code.includes("printf")) return "C";
    if (code.includes("<?php")) return "PHP";
    if (code.includes("using System;") || code.includes("namespace ")) return "C#";
    if ((code.includes("fun ") && code.includes("val ")) || code.includes("println(")) return "Kotlin";
    if (code.includes(": string") || code.includes(": number") || code.includes("interface ")) return "TypeScript";
    if (/\bSELECT\b.*\bFROM\b/i.test(code)) return "SQL";
    if (code.includes("#!/bin/bash") || (code.includes("echo ") && code.includes("$"))) return "Shell";
    return "JavaScript";
}

// ─── Babel syntax check (real AST parse) ─────────────────────────────────────
export function syntaxCheck(code) {
    try {
        BabelParser.parse(code, {
            sourceType: "module",
            plugins: ["jsx", "typescript"],
        });
        return { ok: true, error: null };
    } catch (err) {
        return {
            ok: false,
            error: {
                line: err.loc ? .line ? ? "?",
                col: err.loc ? .column ? ? "?",
                message: err.message,
            },
        };
    }
}

// ─── Local security scan (regex-based, instant) ───────────────────────────────
const SECURITY_RULES = [{
        id: "sql-inject",
        regex: /`[^`]*\$\{[^}]*\}[^`]*`.*(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)/i,
        title: "SQL Injection risk",
        severity: "critical",
        desc: "User input is interpolated directly into a SQL string. Use parameterised queries.",
    },
    {
        id: "hardcoded-secret",
        regex: /(?:secret|api_?key|token|password|passwd|pwd)\s*=\s*["'][^"']{8,}["']/i,
        title: "Hardcoded secret",
        severity: "critical",
        desc: "Credentials are embedded in source code. Move to environment variables.",
    },
    {
        id: "eval-usage",
        regex: /\beval\s*\(/,
        title: "Unsafe eval()",
        severity: "critical",
        desc: "eval() executes arbitrary code and is a major XSS / code-injection vector.",
    },
    {
        id: "inner-html",
        regex: /\.innerHTML\s*=/,
        title: "Unsafe innerHTML assignment",
        severity: "critical",
        desc: "Direct innerHTML assignment can introduce XSS. Use textContent or a sanitiser.",
    },
    {
        id: "console-log",
        regex: /console\.(log|warn|error|debug)\s*\(/,
        title: "Console statement left in code",
        severity: "warning",
        desc: "Console calls expose debug info in production. Remove or replace with a logger.",
    },
    {
        id: "todo-fixme",
        regex: /\/\/\s*(TODO|FIXME|HACK|XXX)\b/i,
        title: "TODO / FIXME comment",
        severity: "info",
        desc: "Unresolved work item in code. Track in your issue tracker instead.",
    },
    {
        id: "dead-if-false",
        regex: /if\s*\(\s*false\s*\)/,
        title: "Dead code (if false)",
        severity: "warning",
        desc: "Block is unreachable. Remove to reduce confusion and maintenance burden.",
    },
    {
        id: "dangerous-regex",
        regex: /new\s+RegExp\s*\([^)]*\+/,
        title: "Potentially dangerous RegExp",
        severity: "warning",
        desc: "Concatenating user input into a RegExp can cause ReDoS. Use a literal instead.",
    },
];

/**
 * Run regex rules line-by-line and return found issues with line numbers.
 */
export function localSecurityScan(code) {
    const lines = code.split("\n");
    const issues = [];

    for (const rule of SECURITY_RULES) {
        // Check full code for overall match
        if (!rule.regex.test(code)) continue;

        // Find the specific line(s)
        lines.forEach((line, idx) => {
            if (rule.regex.test(line)) {
                issues.push({
                    severity: rule.severity,
                    title: `${rule.title} — line ${idx + 1}`,
                    line: idx + 1,
                    snippet: line.trim().slice(0, 80),
                    description: rule.desc,
                    ruleId: rule.id,
                });
                // Reset lastIndex if global flag
                rule.regex.lastIndex = 0;
            }
        });
    }

    return issues;
}

// ─── AI analysis (Claude API) ─────────────────────────────────────────────────
export async function analyzeWithAI(code, language) {

    let syntaxIssues = [];

    try {

        parser.parse(code, {
            sourceType: "module",
            plugins: ["jsx", "typescript"]
        });

    } catch (err) {

        syntaxIssues.push({
            severity: "critical",
            title: "Syntax Error",
            line: err.loc ? .line || 1,
            snippet: code.split("\n")[err.loc ? .line - 1] || "",
            description: err.message
        });

    }

    try {

        const aiFeedback = await getAISuggestions(code);

        const response = await fetch(
            "https://api.anthropic.com/v1/messages", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01"
                },

                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",

                    max_tokens: 1000,

                    messages: [{
                        role: "user",

                        content: `
Analyze this ${language} code.

Find:
- syntax errors
- security issues
- runtime risks
- optimization issues
- bad practices

Return ONLY valid JSON:

{
  "issues": [
    {
      "severity": "critical",
      "title": "Issue title",
      "line": 1,
      "snippet": "code",
      "description": "description"
    }
  ],

  "scores": {
    "security": 0,
    "readability": 0,
    "optimization": 0,
    "maintainability": 0
  },

  "summary": "summary"
}

Code:
${code.slice(0, 3500)}
`
                    }]
                })
            }
        );

        const data = await response.json();

        const text =
            data.content ?
            .map((c) => c.text || "")
            .join("") || "";

        const clean = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        let parsed = {};

        try {

            parsed = JSON.parse(clean);

        } catch {

            parsed = {
                issues: [],
                scores: {
                    security: 5,
                    readability: 5,
                    optimization: 5,
                    maintainability: 5
                },
                summary: "AI response parsing failed."
            };

        }

        const finalIssues = [
            ...syntaxIssues,
            ...(parsed.issues || [])
        ];

        return {

            critical: finalIssues.filter(
                (i) => i.severity === "critical"
            ).length,

            warnings: finalIssues.filter(
                (i) => i.severity === "warning"
            ).length,

            lines: code.split("\n").length,

            issues: finalIssues,

            scores: parsed.scores || {
                security: syntaxIssues.length ? 4 : 10,
                readability: syntaxIssues.length ? 5 : 10,
                optimization: 8,
                maintainability: syntaxIssues.length ? 5 : 10
            },

            summary: syntaxIssues.length > 0 ?
                `Found ${syntaxIssues.length} syntax issue(s).` :
                parsed.summary || "Analysis complete.",

            aiFeedback

        };

    } catch (err) {

        console.log(err);

        return {

            critical: 1,

            warnings: 0,

            lines: code.split("\n").length,

            issues: [{
                severity: "critical",
                title: "AI Analysis Failed",
                line: 1,
                snippet: "",
                description: err.message
            }],

            scores: {
                security: 0,
                readability: 0,
                optimization: 0,
                maintainability: 0
            },

            summary: "AI analysis failed.",

            aiFeedback: "No AI feedback."

        };

    }

}
// ─── AI chat question ─────────────────────────────────────────────────────────
export async function askAI(question, codeContext = "") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                            model: "claude-sonnet-4-20250514",
                            max_tokens: 1000,
                            messages: [{
                                        role: "user",
                                        content: `You are Guru AI, an expert code review assistant. Answer this developer question clearly and concisely.

${codeContext ? `Code context:\n\`\`\`\n${codeContext.slice(0, 1200)}\n\`\`\`` : ""}

Question: ${question}

Give a practical, helpful answer. Include short code examples where relevant. Be direct and professional.`,
      }],
    }),
  });

  const data = await response.json();
  console.log("API DATA =>", data);
  return data.content?.map((c) => c.text || "").join("") || "Could not get AI response.";
}

// ─── AI auto-fix ──────────────────────────────────────────────────────────────
export async function fixWithAI(code, language, issues) {
  const issueList = issues
    .map((i) => `- ${i.title}: ${i.description}`)
    .join("\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role:    "user",
        content: `You are a senior ${language} developer. Fix the following issues in the code below.

Issues to fix:
${issueList}

Return ONLY the corrected code — no explanation, no markdown fences.

Code:
${code.slice(0, 3000)}`,
      }],
    }),
  });

  const data = await response.json();
  return data.content?.map((c) => c.text || "").join("") || code;
}

// ─── Plagiarism check (AI-powered) ───────────────────────────────────────────
export async function checkPlagiarism(code, language) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 600,
      messages: [{
        role:    "user",
        content: `Analyze this ${language} code for signs of being copied or heavily influenced by well-known open-source projects, StackOverflow answers, or textbook examples.

Return ONLY valid JSON:
{
  "similarityScore": <0-100 integer>,
  "verdict": "original" | "likely-copied" | "uncertain",
  "matches": [
    { "source": "<source name or URL>", "confidence": <0-100>, "detail": "<brief description>" }
  ],
  "explanation": "<2-3 sentence summary>"
}

Code:
\`\`\`${language}
${code.slice(0, 2000)}
\`\`\``,
      }],
    }),
  });

  const data  = await response.json();
  const text  = data.content?.map((c) => c.text || "").join("") || "";
  const clean = text.replace(/```(?:json)?\n?|```/g, "").trim();
  return JSON.parse(clean);
}