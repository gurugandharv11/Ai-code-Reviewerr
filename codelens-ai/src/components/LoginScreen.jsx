import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { loginWithGoogle } from "../firebase";
import { Spinner } from "./shared/Spinner";

export default function LoginScreen({ onLogin, t }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep]         = useState("choose"); // "choose" | "manual"
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Manual / OTP
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [otp, setOtp]           = useState("");
  const [generatedOtp, setGenOtp] = useState("");
  const [otpSent, setOtpSent]   = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  // ── Google login ───────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const user = await loginWithGoogle();
      onLogin(user);
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    }
    setLoading(false);
  };

  // ── OTP send ───────────────────────────────────────────────────────────────
  const sendOtp = async () => {
    setError("");
    if (!name.trim())      { setError("Enter your name."); return; }
    if (!validEmail(email)) { setError("Enter a valid email."); return; }

    setOtpLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGenOtp(code);

    try {
      await emailjs.send(
        "service_zpnpqfb",
        "template_ryd8bo3",
        { to_email: email, otp: code },
        "sI77B86_k19Yv4FA9",
      );
      setOtpSent(true);
    } catch {
      setError("Failed to send OTP. Check your email address.");
    }
    setOtpLoading(false);
  };

  // ── OTP verify ────────────────────────────────────────────────────────────
  const verifyOtp = () => {
    if (!otp.trim())          { setError("Enter the OTP."); return; }
    if (otp !== generatedOtp) { setError("Incorrect OTP. Try again."); return; }
    onLogin({ name: name.trim(), email: email.trim(), uid: email, plan: "free" });
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const inputStyle = {
    width:       "100%",
    background:  t.input,
    border:      `1px solid ${t.border}`,
    borderRadius: 10,
    padding:     "12px 14px",
    color:       t.text,
    fontFamily:  "'JetBrains Mono',monospace",
    fontSize:    13,
    outline:     "none",
    transition:  "border-color 0.18s",
    marginBottom: 10,
  };

  return (
    <div
      style={{
        height:          "100vh",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        background:      t.bg,
        position:        "relative",
        overflow:        "hidden",
      }}
    >
      {/* ── Animated background ── */}
      <div
        style={{
          position:          "absolute",
          inset:             0,
          backgroundImage:   `linear-gradient(rgba(55,138,221,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(55,138,221,0.04) 1px,transparent 1px)`,
          backgroundSize:    "44px 44px",
        }}
      />
      <div
        style={{
          position:     "absolute",
          width:        500,
          height:       500,
          background:   "radial-gradient(circle,rgba(24,95,165,0.12) 0%,transparent 70%)",
          top:          "5%",
          left:         "10%",
          borderRadius: "50%",
          filter:       "blur(60px)",
          animation:    "morphBg 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position:     "absolute",
          width:        350,
          height:       350,
          background:   "radial-gradient(circle,rgba(55,138,221,0.08) 0%,transparent 70%)",
          bottom:       "10%",
          right:        "15%",
          borderRadius: "50%",
          filter:       "blur(50px)",
          animation:    "morphBg 10s ease-in-out infinite reverse",
        }}
      />

      {/* ── Card ── */}
      <div
        style={{
          animation: "float3d 7s ease-in-out infinite",
          position:  "relative",
          zIndex:    1,
          width:     "100%",
          maxWidth:  440,
          padding:   "0 20px",
        }}
      >
        <div
          style={{
            background:   t.sidebar,
            border:       `1px solid ${t.border2}`,
            borderRadius: 24,
            padding:      "48px 44px",
            boxShadow:    `0 48px 96px rgba(0,0,0,0.3),0 0 0 1px rgba(55,138,221,0.08),inset 0 1px 0 rgba(255,255,255,0.06)`,
            textAlign:    "center",
          }}
        >
          {/* Logo */}
          <div
            style={{
              width:        62,
              height:       62,
              borderRadius: 16,
              background:   "linear-gradient(135deg,#185fa5,#1a7ed4)",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              margin:       "0 auto 22px",
              fontSize:     20,
              fontWeight:   900,
              color:        "#fff",
              boxShadow:    "0 8px 28px rgba(24,95,165,0.55)",
              animation:    "pulse-ring 2.5s infinite",
              fontFamily:   "'Syne',sans-serif",
            }}
          >
            G
          </div>

          <div
            style={{
              fontFamily:    "'Syne',sans-serif",
              fontSize:      30,
              fontWeight:    900,
              color:         t.text,
              marginBottom:  6,
              letterSpacing: "-0.5px",
            }}
          >
            Guru AI
          </div>
          <div
            style={{
              fontFamily:    "'JetBrains Mono',monospace",
              fontSize:      10,
              color:         t.textFaint,
              marginBottom:  28,
              letterSpacing: "0.8px",
            }}
          >
            AI-POWERED CODE REVIEW PLATFORM
          </div>

          {/* Feature pills */}
          <div
            style={{
              display:       "flex",
              gap:           6,
              justifyContent: "center",
              marginBottom:  28,
              flexWrap:      "wrap",
            }}
          >
            {["AST Analysis", "Security Scan", "AI Explain", "Tech Debt"].map((f) => (
              <span
                key={f}
                style={{
                  fontSize:     10,
                  padding:      "3px 10px",
                  background:   t.navActive,
                  border:       `1px solid ${t.blue}30`,
                  borderRadius: 20,
                  color:        t.blue,
                  fontFamily:   "'JetBrains Mono',monospace",
                }}
              >
                {f}
              </span>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginBottom: 12,
                padding:      "8px 14px",
                background:   t.redBg,
                border:       `1px solid ${t.redText}30`,
                borderRadius: 8,
                fontSize:     12,
                color:        t.redText,
                fontFamily:   "'JetBrains Mono',monospace",
                textAlign:    "left",
              }}
            >
              {error}
            </div>
          )}

          {/* ── Choose step ── */}
          {step === "choose" && !loading && (
            <>
              {/* Google button */}
              <button
                onClick={handleGoogle}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  gap:            12,
                  width:          "100%",
                  padding:        "13px 20px",
                  background:     "#fff",
                  color:          "#333",
                  border:         "none",
                  borderRadius:   12,
                  fontSize:       14,
                  fontWeight:     500,
                  cursor:         "pointer",
                  fontFamily:     "'JetBrains Mono',monospace",
                  transition:     "transform 0.18s, box-shadow 0.18s",
                  boxShadow:      "0 4px 24px rgba(0,0,0,0.15)",
                  marginBottom:   12,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform  = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 10px 32px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform  = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.15)";
                }}
              >
                {/* Google G SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div
                style={{
                  display:    "flex",
                  alignItems: "center",
                  gap:        10,
                  margin:     "16px 0",
                }}
              >
                <div style={{ flex: 1, height: 1, background: t.border }} />
                <span
                  style={{
                    fontSize:  10,
                    color:     t.textFaint,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  OR
                </span>
                <div style={{ flex: 1, height: 1, background: t.border }} />
              </div>

              <button
                onClick={() => { setStep("manual"); setError(""); }}
                style={{
                  width:       "100%",
                  padding:     "12px",
                  fontSize:    12,
                  background:  "transparent",
                  border:      `1px solid ${t.border2}`,
                  borderRadius: 10,
                  color:       t.textDim,
                  fontFamily:  "'JetBrains Mono',monospace",
                  cursor:      "pointer",
                  transition:  "all 0.18s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = t.blue;
                  e.currentTarget.style.color       = t.blue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = t.border2;
                  e.currentTarget.style.color       = t.textDim;
                }}
              >
                Sign in with Email & OTP
              </button>
            </>
          )}

          {/* Loading */}
          {loading && (
            <div
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:            12,
                padding:        "20px 0",
                color:          t.textDim,
                fontFamily:     "'JetBrains Mono',monospace",
                fontSize:       13,
              }}
            >
              <Spinner color={t.blue} /> Signing you in…
            </div>
          )}

          {/* ── Manual / OTP step ── */}
          {step === "manual" && !loading && (
            <div style={{ textAlign: "left" }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = t.blue)}
                onBlur={(e)  => (e.target.style.borderColor = t.border)}
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                type="email"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = t.blue)}
                onBlur={(e)  => (e.target.style.borderColor = t.border)}
              />

              {!otpSent ? (
                <button
                  className="btn-primary"
                  style={{
                    width:          "100%",
                    padding:        "12px",
                    fontSize:       13,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    gap:            8,
                  }}
                  onClick={sendOtp}
                  disabled={otpLoading}
                >
                  {otpLoading
                    ? <><Spinner color="#fff" size={14} /> Sending OTP…</>
                    : "Send OTP →"}
                </button>
              ) : (
                <>
                  <div
                    style={{
                      padding:      "10px 14px",
                      background:   t.greenBg,
                      border:       `1px solid ${t.green}30`,
                      borderRadius: 8,
                      fontSize:     11,
                      color:        t.green,
                      fontFamily:   "'JetBrains Mono',monospace",
                      marginBottom: 10,
                    }}
                  >
                    ✓ OTP sent to {email}
                  </div>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    style={inputStyle}
                    maxLength={6}
                    onFocus={(e) => (e.target.style.borderColor = t.blue)}
                    onBlur={(e)  => (e.target.style.borderColor = t.border)}
                  />
                  <button
                    className="btn-primary"
                    style={{ width: "100%", padding: "12px", fontSize: 13, marginBottom: 8 }}
                    onClick={verifyOtp}
                  >
                    Verify & Login →
                  </button>
                  <button
                    onClick={() => setOtpSent(false)}
                    style={{
                      width:      "100%",
                      padding:    "8px",
                      fontSize:   11,
                      background: "transparent",
                      border:     "none",
                      color:      t.textFaint,
                      fontFamily: "'JetBrains Mono',monospace",
                      cursor:     "pointer",
                    }}
                  >
                    Resend OTP
                  </button>
                </>
              )}

              <button
                onClick={() => { setStep("choose"); setError(""); setOtpSent(false); }}
                style={{
                  width:      "100%",
                  padding:    "8px",
                  fontSize:   11,
                  background: "transparent",
                  border:     "none",
                  color:      t.textFaint,
                  fontFamily: "'JetBrains Mono',monospace",
                  cursor:     "pointer",
                  marginTop:  4,
                }}
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}