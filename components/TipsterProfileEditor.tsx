"use client";

import { useState } from "react";
import Link from "next/link";

export interface TipsterProfileEditorProps {
  initial: {
    name: string;
    specialty: string;
    shortBio: string;
    longBio: string;
    slug: string;
  };
}

type State =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "ok"; message: string }
  | { kind: "err"; message: string };

export default function TipsterProfileEditor({ initial }: TipsterProfileEditorProps) {
  const [name, setName] = useState(initial.name);
  const [specialty, setSpecialty] = useState(initial.specialty);
  const [shortBio, setShortBio] = useState(initial.shortBio);
  const [longBio, setLongBio] = useState(initial.longBio);
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "saving") return;
    setState({ kind: "saving" });
    try {
      const res = await fetch("/api/tipster/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, specialty, shortBio, longBio }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ kind: "err", message: data.error ?? "Could not save." });
        return;
      }
      setState({ kind: "ok", message: "Profile saved." });
    } catch {
      setState({ kind: "err", message: "Network error. Please try again." });
    }
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <div className="stack-sm">
        <label htmlFor="tpe-slug" className="form-label">
          Public URL slug
        </label>
        <input
          id="tpe-slug"
          type="text"
          className="input"
          value={`/tipsters/${initial.slug}`}
          readOnly
          aria-readonly="true"
        />
        <p className="text-muted-sm" style={{ margin: 0 }}>
          Set at approval — can&apos;t be changed. Email{" "}
          <a href="mailto:hello@tiphub.rs" className="text-link">hello@tiphub.rs</a>{" "}
          if you need a new one.
        </p>
      </div>

      <div className="stack-sm">
        <label htmlFor="tpe-name" className="form-label">
          Display name
        </label>
        <input
          id="tpe-name"
          type="text"
          className="input"
          value={name}
          maxLength={80}
          required
          onChange={(e) => setName(e.target.value)}
          disabled={state.kind === "saving"}
        />
      </div>

      <div className="stack-sm">
        <label htmlFor="tpe-specialty" className="form-label">
          Specialty
        </label>
        <input
          id="tpe-specialty"
          type="text"
          className="input"
          value={specialty}
          maxLength={100}
          required
          placeholder="e.g. BTTS markets, low-block teams"
          onChange={(e) => setSpecialty(e.target.value)}
          disabled={state.kind === "saving"}
        />
      </div>

      <div className="stack-sm">
        <label htmlFor="tpe-short-bio" className="form-label">
          Short bio (max 200 chars — shown on tipster cards)
        </label>
        <textarea
          id="tpe-short-bio"
          className="input"
          rows={2}
          value={shortBio}
          maxLength={200}
          required
          onChange={(e) => setShortBio(e.target.value)}
          disabled={state.kind === "saving"}
        />
        <p className="text-muted-sm" style={{ margin: 0 }}>{shortBio.length}/200</p>
      </div>

      <div className="stack-sm">
        <label htmlFor="tpe-long-bio" className="form-label">
          Full bio (shown on your public profile page)
        </label>
        <textarea
          id="tpe-long-bio"
          className="input"
          rows={8}
          value={longBio}
          maxLength={2000}
          required
          onChange={(e) => setLongBio(e.target.value)}
          disabled={state.kind === "saving"}
        />
        <p className="text-muted-sm" style={{ margin: 0 }}>{longBio.length}/2000</p>
      </div>

      <div className="row" style={{ gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={state.kind === "saving"}
        >
          {state.kind === "saving" ? "Saving…" : "Save profile"}
        </button>
        <Link href={`/tipsters/${initial.slug}`} className="btn btn-ghost">
          View public profile →
        </Link>
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
