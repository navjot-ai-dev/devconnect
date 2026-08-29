
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Invalid email or password");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background:
          "radial-gradient(ellipse at 30% 20%, oklch(0.65 0.22 270 / 12%) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, oklch(0.68 0.24 300 / 8%) 0%, transparent 50%)",
      }}
    >
      <form
        onSubmit={handleSignIn}
        className="card-3d"
        style={{
          width: "100%",
          maxWidth: "26rem",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.125rem",
        }}
      >
        {/* Logo / Brand */}
        <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              background:
                "linear-gradient(135deg, oklch(0.75 0.2 270), oklch(0.78 0.22 300), oklch(0.7 0.25 320))",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradient-shift 3s ease infinite",
              filter: "drop-shadow(0 0 16px oklch(0.65 0.22 270 / 30%))",
              lineHeight: 1.1,
            }}
          >
            ⟨/⟩
          </div>
          <h1
            style={{
              marginTop: "0.5rem",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "oklch(0.92 0.02 265)",
              letterSpacing: "-0.01em",
            }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: "0.875rem", color: "oklch(0.55 0.04 265)", marginTop: "0.25rem" }}>
            Sign in to DevConnect
          </p>
        </div>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-3d"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-3d"
          required
        />

        {error && (
          <div className="danger-zone-3d" style={{ padding: "0.75rem 1rem" }}>
            <p style={{ fontSize: "0.875rem", color: "oklch(0.75 0.2 25)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
              ⚠️ {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-3d-primary"
          style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", fontWeight: 700, justifyContent: "center" }}
        >
          {loading ? "⏳ Signing in…" : "🚀 Sign In"}
        </button>

        <p style={{ textAlign: "center", fontSize: "0.875rem", color: "oklch(0.55 0.04 265)" }}>
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            style={{ color: "oklch(0.7 0.18 270)", fontWeight: 600, textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.8 0.2 270)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.7 0.18 270)")}
          >
            Sign up →
          </Link>
        </p>
      </form>
    </main>
  );
}
