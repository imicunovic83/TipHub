"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import type { MatchOption, BookmakerOption } from "@/components/NewTipForm";

type Status = "pending" | "won" | "lost";

export interface OwnTip {
  id: string;
  matchId: string;
  matchLabel: string;
  market: string;
  prediction: string;
  shortReason: string;
  analysis: string | null;
  oddsValue: number;
  oddsBookmaker: string;
  confidence: 1 | 2 | 3 | 4 | 5;
  status: Status;
  postedAt: string;
  resolvedAt: string | null;
}

const STATUS_BADGE: Record<Status, string> = {
  pending: "badge badge--orange",
  won: "badge badge--pitch",
  lost: "badge badge--rose",
};

const MARKETS = ["1X2", "Over/Under 2.5", "BTTS", "Asian Handicap", "Correct Score"] as const;
const CONFIDENCES = [1, 2, 3, 4, 5] as const;

async function getToken() {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function OwnTipsList({
  initialTips,
  matches,
  bookmakers,
}: {
  initialTips: OwnTip[];
  matches: MatchOption[];
  bookmakers: BookmakerOption[];
}) {
  const router = useRouter();
  const [tips, setTips] = useState<OwnTip[]>(initialTips);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(tip: OwnTip) {
    if (!confirm(`Delete tip "${tip.prediction}"?`)) return;
    setBusyId(tip.id);
    setError(null);
    const token = await getToken();
    if (!token) {
      setError("Session expired. Please log in again.");
      setBusyId(null);
      return;
    }
    const res = await fetch(`/api/tipster/tips/${tip.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Delete failed.");
      setBusyId(null);
      return;
    }
    setTips((prev) => prev.filter((t) => t.id !== tip.id));
    setBusyId(null);
    router.refresh();
  }

  async function handleSaveEdit(updated: OwnTip) {
    setBusyId(updated.id);
    setError(null);
    const token = await getToken();
    if (!token) {
      setError("Session expired. Please log in again.");
      setBusyId(null);
      return;
    }
    const res = await fetch(`/api/tipster/tips/${updated.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        matchId: updated.matchId,
        market: updated.market,
        prediction: updated.prediction,
        shortReason: updated.shortReason,
        analysis: updated.analysis ?? "",
        oddsValue: updated.oddsValue,
        oddsBookmaker: updated.oddsBookmaker,
        confidence: updated.confidence,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error || "Update failed.");
      setBusyId(null);
      return;
    }
    const matchLabel = matches.find((m) => m.id === updated.matchId)?.label ?? updated.matchId;
    setTips((prev) => prev.map((t) => (t.id === updated.id ? { ...updated, matchLabel } : t)));
    setEditingId(null);
    setBusyId(null);
    router.refresh();
  }

  if (tips.length === 0) {
    return <p className="text-muted-sm">You haven&apos;t posted any tips yet. The form above is where to start.</p>;
  }

  return (
    <div className="stack" style={{ gap: "0.75rem" }}>
      {error ? <div className="badge badge--rose">{error}</div> : null}
      {tips.map((tip) =>
        editingId === tip.id ? (
          <EditTipPanel
            key={tip.id}
            initial={tip}
            matches={matches}
            bookmakers={bookmakers}
            busy={busyId === tip.id}
            onCancel={() => setEditingId(null)}
            onSave={handleSaveEdit}
          />
        ) : (
          <div key={tip.id} className="panel">
            <div className="row" style={{ justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="row" style={{ gap: "0.5rem", alignItems: "center" }}>
                  <span className={STATUS_BADGE[tip.status]}>{tip.status}</span>
                  <span className="text-muted-sm">{tip.market}</span>
                  <span className="text-muted-sm">·</span>
                  <span className="text-muted-sm">{tip.matchLabel}</span>
                </div>
                <p style={{ margin: "0.5rem 0 0", fontWeight: 700 }}>{tip.prediction}</p>
                <p className="text-muted-sm" style={{ margin: "0.25rem 0 0" }}>{tip.shortReason}</p>
              </div>
              <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", color: "var(--pitch-700)" }}>
                  {tip.oddsValue.toFixed(2)}
                </div>
                <div className="text-muted-sm">@ {tip.oddsBookmaker}</div>
                <div className="text-muted-sm" style={{ marginTop: "0.25rem" }}>
                  {"★".repeat(tip.confidence)}{"☆".repeat(5 - tip.confidence)}
                </div>
              </div>
            </div>

            <div className="row" style={{ marginTop: "0.75rem", justifyContent: "space-between", gap: "0.5rem" }}>
              <p className="text-muted-sm" style={{ margin: 0, fontSize: "0.75rem" }}>
                posted {new Date(tip.postedAt).toLocaleString()}
                {tip.resolvedAt ? ` · resolved ${new Date(tip.resolvedAt).toLocaleString()}` : null}
              </p>
              {tip.status === "pending" ? (
                <div className="row" style={{ gap: "0.5rem" }}>
                  <button type="button" className="btn btn-link" disabled={busyId === tip.id} onClick={() => setEditingId(tip.id)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-link" style={{ color: "var(--rose-600)" }} disabled={busyId === tip.id} onClick={() => handleDelete(tip)}>
                    {busyId === tip.id ? "Working…" : "Delete"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )
      )}
    </div>
  );
}

function EditTipPanel({
  initial,
  matches,
  bookmakers,
  busy,
  onCancel,
  onSave,
}: {
  initial: OwnTip;
  matches: MatchOption[];
  bookmakers: BookmakerOption[];
  busy: boolean;
  onCancel: () => void;
  onSave: (updated: OwnTip) => void;
}) {
  const [form, setForm] = useState<OwnTip>(initial);

  return (
    <div className="panel" style={{ borderColor: "var(--pitch-300)" }}>
      <h4 className="title-section" style={{ margin: 0 }}>Edit tip</h4>
      <div className="stack" style={{ gap: "1rem", marginTop: "1rem" }}>
        <div className="grid-filters" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
          <div className="field">
            <label className="field-label">Match</label>
            <select className="select" value={form.matchId} onChange={(e) => setForm({ ...form, matchId: e.target.value })}>
              {matches.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Market</label>
            <select className="select" value={form.market} onChange={(e) => setForm({ ...form, market: e.target.value })}>
              {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label className="field-label">Prediction</label>
          <input className="input" value={form.prediction} onChange={(e) => setForm({ ...form, prediction: e.target.value })} />
        </div>

        <div className="field">
          <label className="field-label">Short reason</label>
          <input className="input" maxLength={140} value={form.shortReason} onChange={(e) => setForm({ ...form, shortReason: e.target.value })} />
        </div>

        <div className="field">
          <label className="field-label">Full analysis (optional)</label>
          <textarea className="input" rows={4} value={form.analysis ?? ""} onChange={(e) => setForm({ ...form, analysis: e.target.value })} />
        </div>

        <div className="grid-filters" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem" }}>
          <div className="field">
            <label className="field-label">Odds</label>
            <input type="number" step="0.01" min="1.01" className="input" value={form.oddsValue} onChange={(e) => setForm({ ...form, oddsValue: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label className="field-label">Bookmaker</label>
            <select className="select" value={form.oddsBookmaker} onChange={(e) => setForm({ ...form, oddsBookmaker: e.target.value })}>
              {bookmakers.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Confidence</label>
            <select className="select" value={form.confidence} onChange={(e) => setForm({ ...form, confidence: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}>
              {CONFIDENCES.map((c) => <option key={c} value={c}>{c} {"★".repeat(c)}</option>)}
            </select>
          </div>
        </div>

        <div className="row" style={{ gap: "0.5rem" }}>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => onSave(form)}>
            {busy ? "Saving…" : "Save"}
          </button>
          <button type="button" className="btn btn-link" disabled={busy} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
