"use client";

import { useState, type FormEvent } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (!email.trim()) {
      setStatus({ type: "error", message: "Email is required." });
      return;
    }

    setLoading(true);
    trackEvent("reset_password_request", { email: email.trim().toLowerCase() });

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setStatus({ type: "error", message: error.message || "Unable to send reset email." });
    } else {
      setStatus({ type: "success", message: "If the account exists, a reset link has been sent to your email." });
      setEmail("");
    }

    setLoading(false);
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="forgot-password-email" className="field-label">
          Email address
        </label>
        <input
          id="forgot-password-email"
          name="email"
          type="email"
          className="input"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="username"
        />
      </div>

      {status ? (
        <div className={status.type === "success" ? "badge badge--pitch" : "badge badge--rose"}>
          {status.message}
        </div>
      ) : null}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Sending reset link…" : "Send reset link"}
      </button>
    </form>
  );
}
