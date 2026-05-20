"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

type State =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "ok"; message: string }
  | { kind: "err"; message: string };

export interface TipsterOption {
  slug: string;
  name: string;
}

export default function AccountEditForm({
  initial,
  tipsters,
}: {
  initial: { nickname: string; favoriteTipster: string };
  tipsters: TipsterOption[];
}) {
  const [nickname, setNickname] = useState(initial.nickname);
  const [favoriteTipster, setFavoriteTipster] = useState(initial.favoriteTipster);
  const [state, setState] = useState<State>({ kind: "idle" });
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "saving") return;
    setState({ kind: "saving" });
    try {
      const res = await fetch("/api/profile/me", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ nickname, favorite_tipster: favoriteTipster }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ kind: "err", message: data.error ?? "Could not save." });
        return;
      }
      setState({ kind: "ok", message: "Saved." });

      // Nickname was mirrored to user_metadata server-side; refresh the session
      // so the header re-renders with it (same pattern as the avatar picker).
      try {
        await getSupabaseClient().auth.refreshSession();
      } catch {
        // non-fatal — header updates on the next token refresh
      }
      router.refresh();
    } catch {
      setState({ kind: "err", message: "Network error. Please try again." });
    }
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <div className="stack-sm">
        <label htmlFor="acct-nickname" className="form-label">Nickname</label>
        <input
          id="acct-nickname"
          type="text"
          className="input"
          value={nickname}
          maxLength={40}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="e.g. PitchProphet"
          disabled={state.kind === "saving"}
        />
        <p className="text-muted-sm" style={{ margin: 0 }}>
          Shown publicly instead of your real name (header, community leaderboard).
          Leave empty to use your first name. You can change it anytime.
        </p>
      </div>

      <div className="stack-sm">
        <label htmlFor="acct-fav" className="form-label">Favorite tipster</label>
        <select
          id="acct-fav"
          className="select"
          value={favoriteTipster}
          onChange={(e) => setFavoriteTipster(e.target.value)}
          disabled={state.kind === "saving"}
        >
          <option value="">None</option>
          {tipsters.map((t) => (
            <option key={t.slug} value={t.slug}>{t.name}</option>
          ))}
        </select>
        <p className="text-muted-sm" style={{ margin: 0 }}>
          Optional — pick from registered tipsters. Display only, doesn&apos;t affect stats.
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
