"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

const MARKETS = ["1X2", "Over/Under 2.5", "BTTS", "Asian Handicap", "Correct Score"] as const;
const CONFIDENCES = [1, 2, 3, 4, 5] as const;

export interface MatchOption {
  id: string;
  label: string;
}

export interface BookmakerOption {
  slug: string;
  name: string;
}

export default function NewTipForm({
  matches,
  bookmakers,
}: {
  matches: MatchOption[];
  bookmakers: BookmakerOption[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    matchId: matches[0]?.id ?? "",
    market: MARKETS[0] as (typeof MARKETS)[number],
    prediction: "",
    shortReason: "",
    analysis: "",
    oddsValue: 1.9,
    oddsBookmaker: bookmakers[0]?.slug ?? "",
    confidence: 3 as (typeof CONFIDENCES)[number],
  });
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    const supabase = getSupabaseClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setStatus({ type: "error", message: "Your session expired. Please log in again." });
      setLoading(false);
      return;
    }

    const response = await fetch("/api/tipster/tips", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus({ type: "error", message: data.error || "Failed to post tip." });
    } else {
      setStatus({ type: "success", message: "Tip posted. It's pending until an admin resolves it." });
      setForm((prev) => ({ ...prev, prediction: "", shortReason: "", analysis: "" }));
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div className="grid-filters" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
        <div className="field">
          <label htmlFor="tip-match" className="field-label">Match</label>
          <select
            id="tip-match"
            className="select"
            value={form.matchId}
            onChange={(event) => setForm({ ...form, matchId: event.target.value })}
            required
          >
            {matches.map((match) => (
              <option key={match.id} value={match.id}>{match.label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="tip-market" className="field-label">Market</label>
          <select
            id="tip-market"
            className="select"
            value={form.market}
            onChange={(event) => setForm({ ...form, market: event.target.value as typeof form.market })}
          >
            {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="tip-prediction" className="field-label">Prediction</label>
        <input
          id="tip-prediction"
          className="input"
          value={form.prediction}
          onChange={(event) => setForm({ ...form, prediction: event.target.value })}
          placeholder='e.g. "Argentina to win" or "Over 2.5 goals"'
          required
        />
      </div>

      <div className="field">
        <label htmlFor="tip-short-reason" className="field-label">Short reason (one line)</label>
        <input
          id="tip-short-reason"
          className="input"
          value={form.shortReason}
          onChange={(event) => setForm({ ...form, shortReason: event.target.value })}
          maxLength={140}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="tip-analysis" className="field-label">Full analysis (optional)</label>
        <textarea
          id="tip-analysis"
          className="input"
          value={form.analysis}
          onChange={(event) => setForm({ ...form, analysis: event.target.value })}
          rows={4}
          placeholder="Longer reasoning shown on the tip's detail page."
        />
      </div>

      <div className="grid-filters" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem" }}>
        <div className="field">
          <label htmlFor="tip-odds" className="field-label">Odds</label>
          <input
            id="tip-odds"
            type="number"
            step="0.01"
            min="1.01"
            className="input"
            value={form.oddsValue}
            onChange={(event) => setForm({ ...form, oddsValue: Number(event.target.value) })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="tip-bookmaker" className="field-label">Bookmaker</label>
          <select
            id="tip-bookmaker"
            className="select"
            value={form.oddsBookmaker}
            onChange={(event) => setForm({ ...form, oddsBookmaker: event.target.value })}
            required
          >
            {bookmakers.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="tip-confidence" className="field-label">Confidence (1–5)</label>
          <select
            id="tip-confidence"
            className="select"
            value={form.confidence}
            onChange={(event) => setForm({ ...form, confidence: Number(event.target.value) as typeof form.confidence })}
          >
            {CONFIDENCES.map((c) => <option key={c} value={c}>{c} {"★".repeat(c)}</option>)}
          </select>
        </div>
      </div>

      {status ? (
        <div className={status.type === "success" ? "badge badge--pitch" : "badge badge--rose"}>
          {status.message}
        </div>
      ) : null}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Posting…" : "Post tip"}
      </button>
    </form>
  );
}
