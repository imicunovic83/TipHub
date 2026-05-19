"use client";

import { useState } from "react";

type State =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export default function NewsletterSignup({
  variant = "footer",
}: {
  variant?: "footer" | "inline";
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "submitting") return;
    setState({ kind: "submitting" });

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ kind: "error", message: data.error ?? "Could not subscribe." });
        return;
      }
      setState({
        kind: "success",
        message: data.message ?? "Check your inbox for the confirmation link.",
      });
      setEmail("");
    } catch {
      setState({ kind: "error", message: "Network error. Please try again." });
    }
  }

  const wrapperClass =
    variant === "footer" ? "newsletter-form newsletter-form--footer" : "newsletter-form";

  return (
    <form className={wrapperClass} onSubmit={onSubmit} noValidate>
      <label htmlFor={`nl-email-${variant}`} className="sr-only">
        Your email for the TipHub newsletter
      </label>
      <input
        id={`nl-email-${variant}`}
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input newsletter-form-input"
        disabled={state.kind === "submitting"}
      />
      <button
        type="submit"
        className="btn btn-primary newsletter-form-btn"
        disabled={state.kind === "submitting"}
      >
        {state.kind === "submitting" ? "Sending…" : "Subscribe"}
      </button>
      {state.kind === "success" ? (
        <p className="newsletter-form-msg newsletter-form-msg--ok" role="status">
          {state.message}
        </p>
      ) : null}
      {state.kind === "error" ? (
        <p className="newsletter-form-msg newsletter-form-msg--err" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
