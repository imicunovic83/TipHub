"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/profile";
  return value;
}

export default function LoginForm({ nextPath: nextPathProp }: { nextPath?: string | null } = {}) {
  const router = useRouter();
  const nextPath = safeNextPath(nextPathProp);
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    if (!form.email.trim() || !form.password.trim()) {
      setStatus({ type: "error", message: "Email and password are required." });
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    trackEvent('login_attempt', { email: form.email });
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setStatus({ type: "error", message: error.message || "Login failed." });
    } else {
      if (data.session?.access_token) {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }),
        });
      }
      setStatus({ type: "success", message: "Logged in successfully. Redirecting…" });
      router.push(nextPath);
    }

    setLoading(false);
  }

  return (
    <form className="panel stack" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="login-email" className="field-label">
          Email address
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          className="input"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
          autoComplete="username"
          placeholder="you@example.com"
        />
      </div>

      <div className="field">
        <label htmlFor="login-password" className="field-label">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          className="input"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
          autoComplete="current-password"
          placeholder="Enter your password"
        />
      </div>

      {status ? (
        <div className={status.type === "success" ? "badge badge--pitch" : "badge badge--rose"}>
          {status.message}
        </div>
      ) : null}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
