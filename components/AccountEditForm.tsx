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
  initial: { favoriteTipster: string };
}) {
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
        body: JSON.stringify({ favorite_tipster: favoriteTipster }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ kind: "err", message: data.error ?? "Could not save." });
        return;
      }
      setState({ kind: "ok", message: "Saved." });
    } catch {
      setState({ kind: "err", message: "Network error. Please try again." });
    }
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
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
        <p className="text-muted-sm" style={{ margin: 0 }}>
          Optional. Shown only on your profile.
        </p>
      </div>

      <p className="text-muted-sm" style={{ margin: 0 }}>
        Name and email changes are paused during beta — we&apos;ll add a request form
        for them shortly.
      </p>

      <div className="row" style={{ gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <button type="submit" className="btn btn-primary" disabled={state.kind === "saving"}>
          {state.kind === "saving" ? "Saving…" : "Save"}
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
