"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

// 12 curated DiceBear presets covering 4 styles. Order chosen so the grid
// reads "people / minimalist / robots / abstract" left-to-right, top-to-bottom.
// Background colors pinned to the TipHub pitch palette so avatars feel native.
const BG = "064e3b,065f46,047857";

function diceBear(style: string, seed: string): string {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${BG}&radius=50`;
}

const PRESETS = [
  { id: "av-1", url: diceBear("avataaars", "Tipster One") },
  { id: "av-2", url: diceBear("avataaars", "Striker") },
  { id: "av-3", url: diceBear("avataaars", "Goalkeeper") },
  { id: "av-4", url: diceBear("lorelei", "Olive") },
  { id: "av-5", url: diceBear("lorelei", "Nova") },
  { id: "av-6", url: diceBear("adventurer-neutral", "Skyline") },
  { id: "av-7", url: diceBear("bottts", "TipBot") },
  { id: "av-8", url: diceBear("bottts", "OddsBot") },
  { id: "av-9", url: diceBear("shapes", "Hex") },
  { id: "av-10", url: diceBear("shapes", "Arc") },
  { id: "av-11", url: diceBear("rings", "Ringer") },
  { id: "av-12", url: diceBear("identicon", "Tile") },
];

type State =
  | { kind: "idle" }
  | { kind: "saving"; target: string | null }
  | { kind: "ok"; message: string }
  | { kind: "err"; message: string };

export default function AvatarPicker({
  initialAvatarUrl,
  email,
}: {
  initialAvatarUrl: string | null;
  email: string;
}) {
  const [current, setCurrent] = useState<string | null>(initialAvatarUrl ?? null);
  const [state, setState] = useState<State>({ kind: "idle" });
  const router = useRouter();

  async function save(target: string | null) {
    if (state.kind === "saving") return;
    setState({ kind: "saving", target });
    try {
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ kind: "err", message: data.error ?? "Could not save." });
        return;
      }
      setCurrent(target);
      setState({
        kind: "ok",
        message: target ? "Avatar updated." : "Avatar reset to default.",
      });

      // Service-role write updated user_metadata server-side, but the JWT in
      // the user's cookies still holds the old snapshot. Force a refresh so a
      // new JWT is minted with the latest metadata — AuthControls listens to
      // onAuthStateChange("TOKEN_REFRESHED") and re-renders the header avatar
      // automatically. Also refresh server components so /profile reflects
      // immediately on the next navigation.
      try {
        await getSupabaseClient().auth.refreshSession();
      } catch (refreshErr) {
        console.warn("[avatar] session refresh failed:", refreshErr);
      }
      router.refresh();
    } catch {
      setState({ kind: "err", message: "Network error. Please try again." });
    }
  }

  const fallback = `https://www.gravatar.com/avatar/?s=128&d=identicon&u=${encodeURIComponent(email)}`;
  const saving = state.kind === "saving";

  return (
    <div className="stack">
      <p className="text-muted-sm" style={{ margin: 0 }}>
        Pick a preset or reset to the default (Gravatar based on your email).
        The change shows up in the header immediately.
      </p>

      <div className="avatar-picker-grid">
        {PRESETS.map((preset) => {
          const isActive = current === preset.url;
          const isPending = state.kind === "saving" && state.target === preset.url;
          return (
            <button
              key={preset.id}
              type="button"
              className={`avatar-picker-tile${isActive ? " is-active" : ""}`}
              onClick={() => save(preset.url)}
              disabled={saving}
              aria-pressed={isActive}
              aria-label={`Select avatar ${preset.id}`}
            >
              <img src={preset.url} alt="" width={56} height={56} loading="lazy" />
              {isPending ? <span className="avatar-picker-spinner" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>

      <div className="row" style={{ gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => save(null)}
          disabled={saving || current === null}
        >
          Use default (Gravatar / initials)
        </button>
        {state.kind === "ok" ? (
          <span className="form-msg form-msg--ok" role="status">{state.message}</span>
        ) : null}
        {state.kind === "err" ? (
          <span className="form-msg form-msg--err" role="alert">{state.message}</span>
        ) : null}
      </div>

      {!current ? (
        <p className="text-muted-sm" style={{ margin: 0 }}>
          Default in use: Gravatar for <code>{email}</code> if you have one,
          otherwise generated initials.{" "}
          <a href={fallback} target="_blank" rel="noreferrer noopener" className="text-link">Preview</a>
        </p>
      ) : null}
    </div>
  );
}
