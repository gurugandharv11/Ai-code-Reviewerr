import { useState } from "react";

import AppShell from "./components/AppShell";

function App() {

  const [tab, setTab] = useState("editor");

  const [isDark, setIsDark] = useState(true);

  const [code, setCode] = useState(`function hello() {
  console.log("Guru AI");
}`);

  const [results, setResults] = useState(null);

  const [analyzing, setAnalyzing] = useState(false);

  const [analyzeStep, setAnalyzeStep] = useState("Analyzing...");

  const user = {
    name: "Rahul Kumar",
    email: "rahul.kumar@gmail.com",
    plan: "pro"
  };

  const t = {
    panelBg:"#020617",
    sidebar:"#0f172a",
    headerBg:"#111827",
    border:"#1e293b",
    border2:"#334155",
    text:"#f8fafc",
    textDim:"#94a3b8",
    textFaint:"#64748b",
    textGhost:"#475569",
    blue:"#38bdf8",
    green:"#22c55e",
    greenBg:"rgba(34,197,94,0.15)",
    redBg:"rgba(239,68,68,0.15)",
    redText:"#f87171",
    orange:"#f59e0b",
    orangeBg:"rgba(245,158,11,0.15)",
    navActive:"rgba(56,189,248,0.12)",
    card:"#0f172a",
    card2:"#111827"
  };

  const runAnalysis = () => {

    setAnalyzing(true);

    setAnalyzeStep("Scanning vulnerabilities...");

    setTimeout(() => {

      setResults({
        critical:1,
        warnings:2,
        summary:"Potential security issue detected.",
      });

      setAnalyzing(false);

    },2000);
  };

  return (
    <AppShell
      tab={tab}
      setTab={setTab}
      isDark={isDark}
      setIsDark={setIsDark}
      user={user}
      onLogout={() => alert("Logged out")}
      results={results}
      analyzing={analyzing}
      analyzeStep={analyzeStep}
      onRunAnalysis={runAnalysis}
      code={code}
      language="JavaScript"
      t={t}
    />
  );
}

export default App;