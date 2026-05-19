"use client";

import { useState } from "react";

type State =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "ok"; message: string }
  | { kind: "err"; message: string };

export default function AccountEditForm({
  initial,
}: {
  initial: { fullName: string; favoriteTipster: string };
}) {
  const [fullName, setFullName] = useState(initial.fullName);
  const [favoriteTipster, setFavoriteTipster] = useState(initial.favoriteTipster);
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "saving") return;
    setState({ kind: "saving" });
    try {
      const res = await fetch("/api/profile/me", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          favorite_tipster: favoriteTipster,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ kind: "err", message: data.error ?? "Could not save." });
        return;
      }
      setState({ kind: "ok", message: "Account details saved." });
    } catch {
      setState({ kind: "err", message: "Network error. Please try again." });
    }
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <div className="stack-sm">
        <label htmlFor="acct-name" className="form-label">Full name</label>
        <input
          id="acct-name"
          type="text"
          className="input"
          value={fullName}
          maxLength={80}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="How you'd like to appear"
          disabled={state.kind === "saving"}
        />
      </div>

      <div className="stack-sm">
        <label htmlFor="acct-fav" className="form-label">Favorite tipster</label>
        <input
          id="acct-fav"
          type="text"
          className="input"
          value={favoriteTipster}
          maxLength={80}
          onChange={(e) => setFavoriteTipster(e.target.value)}
          placeholder="Optional — display only, doesn't affect stats"
          disabled={state.kind === "saving"}
        />
      </div>

      <p className="text-muted-sm" style={{ margin: 0 }}>
        Need to change your email? Drop a line at{" "}
        <a href="mailto:hello@tiphub.rs" className="text-link">hello@tiphub.rs</a>{" "}
        — email changes go through manual review during beta.
      </p>

      <div className="row" style={{ gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <button type="submit" className="btn btn-primary" disabled={state.kind === "saving"}>
          {state.kind === "saving" ? "Saving…" : "Save changes"}
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
