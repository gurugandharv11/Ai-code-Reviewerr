import { useState, useCallback, useRef } from "react";
import {
    analyzeWithAI,
    localSecurityScan,
    syntaxCheck,
} from "../services/analyzeService";
import { saveScan } from "../firebase";

const STEPS = [
    "Parsing AST…",
    "Security scan…",
    "AI analysis…",
    "Computing scores…",
];

/**
 * useAnalysis — orchestrates the full scan pipeline.
 *
 * @param {string} code        - current editor code
 * @param {string} language    - detected / selected language
 * @param {object|null} user   - logged-in user (or null)
 * @param {function} toast     - toast(message, type) callback
 *
 * Returns: { results, analyzing, analyzeStep, runAnalysis, reset }
 */
export function useAnalysis({ code, language, user, toast }) {
    const [results, setResults] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzeStep, setAnalyzeStep] = useState("[ Analyze ]");
    const timerRef = useRef(null);

    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const runAnalysis = useCallback(async() => {
        if (analyzing || code.trim().length < 10) return;

        setAnalyzing(true);
        setResults(null);

        // ── Step 1: syntax check ──────────────────────────────────────────────
        setAnalyzeStep(STEPS[0]);
        const syntax = syntaxCheck(code);

        // ── Step 2: local regex security scan ─────────────────────────────────
        setAnalyzeStep(STEPS[1]);
        const localIssues = localSecurityScan(code);

        // ── Cycle through step labels while AI call is in-flight ──────────────
        setAnalyzeStep(STEPS[2]);
        let stepIdx = 2;
        timerRef.current = setInterval(() => {
            stepIdx = (stepIdx + 1) % STEPS.length;
            setAnalyzeStep(STEPS[stepIdx]);
        }, 800);

        try {
            // ── Step 3: AI deep analysis ─────────────────────────────────────────
            const aiData = await analyzeWithAI(code, language);
            clearTimer();

            // Merge AI issues with local regex issues (deduplicate by line)
            const aiLines = new Set(aiData.issues.map((i) => i.line));
            const extraLocal = localIssues.filter((i) => !aiLines.has(i.line));
            const merged = [...aiData.issues, ...extraLocal];

            // Patch in syntax error if AI missed it
            if (!syntax.ok && !aiLines.has(syntax.error.line)) {
                merged.unshift({
                    severity: "critical",
                    title: `Syntax error — line ${syntax.error.line}`,
                    line: syntax.error.line,
                    snippet: syntax.error.message.slice(0, 80),
                    description: "Fix the syntax error before other issues can be properly analysed.",
                });
            }

            const finalResults = {
                ...aiData,
                issues: merged,
                critical: merged.filter((i) => i.severity === "critical").length,
                warnings: merged.filter((i) => i.severity === "warning").length,
                lines: code.split("\n").length,
            };

            setResults(finalResults);
            setAnalyzeStep("[ Analyze ]");
            setAnalyzing(false);

            toast("Analysis complete!", "success");

            // ── Auto-save to Firestore ───────────────────────────────────────────
            if (user ? .uid) {
                saveScan(user.uid, { code, language, results: finalResults }).catch(() => {
                    // Silent fail — don't bother user if save fails
                });
            }
        } catch (err) {
            clearTimer();
            console.error("AI analysis failed:", err);

            // ── Fallback: use only local scan + syntax ────────────────────────────
            const fallbackIssues = [...localIssues];
            if (!syntax.ok) {
                fallbackIssues.unshift({
                    severity: "critical",
                    title: `Syntax error — line ${syntax.error.line}`,
                    line: syntax.error.line,
                    snippet: syntax.error.message.slice(0, 80),
                    description: "Syntax error detected by Babel parser.",
                });
            }

            setResults({
                critical: fallbackIssues.filter((i) => i.severity === "critical").length,
                warnings: fallbackIssues.filter((i) => i.severity === "warning").length,
                lines: code.split("\n").length,
                issues: fallbackIssues,
                scores: { security: 3.1, readability: 6.4, optimization: 7.2, maintainability: 6.5 },
                summary: "AI analysis unavailable. Showing local security scan results only.",
            });

            setAnalyzeStep("[ Analyze ]");
            setAnalyzing(false);
            toast("AI offline — showing local scan results", "warning");
        }
    }, [analyzing, code, language, user, toast]);

    const reset = useCallback(() => {
        clearTimer();
        setResults(null);
        setAnalyzing(false);
        setAnalyzeStep("[ Analyze ]");
    }, []);

    return { results, analyzing, analyzeStep, runAnalysis, reset };
}