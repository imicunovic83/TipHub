"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

type State =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "ok"; message: string }
  | { kind: "err"; message: string };

export default function ChangePasswordForm() {
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "saving") return;

    if (next.length < 8) {
      setState({ kind: "err", message: "Password must be at least 8 characters." });
      return;
    }
    if (next !== confirm) {
      setState({ kind: "err", message: "Passwords don't match." });
      return;
    }

    setState({ kind: "saving" });
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) {
        setState({ kind: "err", message: error.message });
        return;
      }
      setNext("");
      setConfirm("");
      setState({ kind: "ok", message: "Password updated. Your other sessions stay signed in." });
    } catch (e) {
      setState({ kind: "err", message: e instanceof Error ? e.message : "Could not update." });
    }
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <div className="stack-sm">
        <label htmlFor="cp-new" className="form-label">New password</label>
        <input
          id="cp-new"
          name="new-password"
          type="password"
          className="input"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          minLength={8}
          required
          autoComplete="new-password"
          disabled={state.kind === "saving"}
          placeholder="At least 8 characters"
        />
      </div>

      <div className="stack-sm">
        <label htmlFor="cp-confirm" className="form-label">Confirm new password</label>
        <input
          id="cp-confirm"
          name="confirm-password"
          type="password"
          className="input"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={8}
          required
          autoComplete="new-password"
          disabled={state.kind === "saving"}
          placeholder="Repeat your new password"
        />
      </div>

      <div className="row" style={{ gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <button type="submit" className="btn btn-primary" disabled={state.kind === "saving"}>
          {state.kind === "saving" ? "Updating…" : "Update password"}
        </button>
        {state.kind === "ok" ? (
          <span className="form-msg form-msg--ok" role="status">{state.message}</span>
        ) : null}
        {state.kind === "err" ? (
          <span className="form-msg form-msg--err" role="alert">{state.message}</span>
        ) : null}
      </div>
    </form>
  );
}
