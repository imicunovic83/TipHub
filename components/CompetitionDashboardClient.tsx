"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Match } from "@/lib/data";
import type { CompetitionLeaderboardEntry } from "@/lib/competition";
import { getSupabaseClient } from "@/lib/supabase";
import { PREDICTION_OPTIONS, deriveCompetitionOdds } from "@/lib/competition-markets";

const MARKET_OPTIONS = Object.keys(PREDICTION_OPTIONS);

function formatMatchLabel(match: Match) {
  return `${match.group} · ${match.homeCode} vs ${match.awayCode}`;
}

function getLevelColor(level: string) {
  switch (level) {
    case "Legend":
      return "badge badge--gold";
    case "Expert":
      return "badge badge--pitch";
    case "Pro":
      return "badge badge--violet";
    case "Tactician":
      return "badge badge--blue";
    default:
      return "badge badge--orange";
  }
}

export default function CompetitionDashboardClient({ matches }: { matches: Match[] }) {
  const [leaderboard, setLeaderboard] = useState<CompetitionLeaderboardEntry[]>([]);
  const [submissions, setSubmissions] = useState<number>(0);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [authUser, setAuthUser] = useState<{ email: string; name: string; role: string } | null | undefined>(undefined);
  const [form, setForm] = useState({
    matchId: matches[0]?.id ?? "",
    market: MARKET_OPTIONS[0],
    prediction: PREDICTION_OPTIONS[MARKET_OPTIONS[0]][0],
    confidence: 5,
  });

  // Odds are derived from the selection, not entered — same value the server
  // will compute and store, shown read-only so the competitor sees it upfront.
  const derivedOdds = useMemo(
    () => deriveCompetitionOdds(form.matchId, form.market, form.prediction),
    [form.matchId, form.market, form.prediction],
  );

  useEffect(() => {
    fetchLeaderboard();

    const supabase = getSupabaseClient();

    // Resolve auth state once on mount so the form can short-circuit to a
    // "log in" CTA before we even try the API.
    const toAuthUser = (u: { email?: string; user_metadata?: Record<string, unknown> } | null | undefined) => {
      if (!u || !u.email) return null;
      const name =
        (typeof u.user_metadata?.full_name === "string" && (u.user_metadata.full_name as string).trim()) ||
        u.email.split("@")[0];
      const role = typeof u.user_metadata?.role === "string" ? (u.user_metadata.role as string) : "member";
      return { email: u.email, name, role };
    };

    supabase.auth.getUser()
      .then(({ data }) => setAuthUser(toAuthUser(data.user)))
      .catch(() => setAuthUser(null));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(toAuthUser(session?.user));
    });

    const channel = supabase
      .channel("competition-leaderboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "competition_submissions" },
        () => {
          fetchLeaderboard();
        },
      )
      .subscribe((channelStatus) => {
        setIsLive(channelStatus === "SUBSCRIBED");
      });

    return () => {
      sub.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchLeaderboard() {
    const response = await fetch("/api/competition");
    const data = await response.json();
    setLeaderboard(data.leaderboard ?? []);
    setSubmissions(data.submissions?.length ?? 0);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const response = await fetch("/api/competition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          matchId: form.matchId,
          market: form.market,
          prediction: form.prediction,
          confidence: Number(form.confidence),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setStatus({ type: "error", message: result.error || "Unable to submit tip." });
      } else {
        setStatus({ type: "success", message: "Tip successfully submitted. Your level is updated as results arrive." });
        setLeaderboard(result.leaderboard ?? []);
        setSubmissions((prev) => prev + 1);
        setForm((prev) => ({ ...prev, confidence: 5 }));
      }
    } catch (error) {
      setStatus({ type: "error", message: "Network error while submitting tip." });
    } finally {
      setLoading(false);
    }
  }

  const topFive = useMemo(() => leaderboard.slice(0, 5), [leaderboard]);

  // The current user's own leaderboard standing (matched by email). Used to
  // decide whether to surface the "you qualify — apply as tipster" nudge.
  const myEntry = useMemo(
    () => (authUser ? leaderboard.find((e) => e.email === authUser.email) : undefined),
    [authUser, leaderboard],
  );
  const QUALIFYING_LEVELS = ["Pro", "Expert", "Legend"];
  const isAlreadyTipster = authUser?.role === "tipster" || authUser?.role === "admin";
  const showTipsterNudge =
    !!myEntry && QUALIFYING_LEVELS.includes(myEntry.level) && !isAlreadyTipster;

  return (
    <div className="competition-grid">
      <div className="panel">
        <div className="stack">
          <p>
            Join the TipHub community challenge. Submit your own prediction on a scheduled match, and follow the leaderboard as your win rate and ROI earn you a new tipster level.
          </p>
          <p className="text-muted-sm" style={{ margin: 0 }}>
            <strong>Path to tipster:</strong> the community is the proving ground. Anyone can{" "}
            <Link href="/tipster/apply" className="text-link">apply to be a tipster</Link> directly,
            but a strong community track record (Pro level or above) is the cleanest way to show
            you&apos;re ready for a public profile in the main tips catalog.
          </p>

          {showTipsterNudge ? (
            <div className="surface" style={{ background: "var(--pitch-50, #ecfdf5)", border: "1px solid var(--pitch-200, #a7f3d0)" }}>
              <p style={{ margin: 0 }}>
                <strong>You&apos;re a {myEntry?.level}.</strong> Your community record qualifies you —
                ready to post on the main catalog with a public profile?
              </p>
              <div style={{ marginTop: "0.75rem" }}>
                <Link href="/tipster/apply" className="btn btn-primary">Apply as a tipster →</Link>
              </div>
            </div>
          ) : null}
          <div className="competition-summary">
            <div className="competition-stat">
              <div className="competition-stat-name">Active competitors</div>
              <div className="competition-stat-value">{leaderboard.length}</div>
            </div>
            <div className="competition-stat">
              <div className="competition-stat-name">Submitted tips</div>
              <div className="competition-stat-value">{submissions}</div>
            </div>
            <div className="competition-stat">
              <div className="competition-stat-name">Levels</div>
              <div className="competition-stat-value">5</div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3 className="title-section">Tipster levels</h3>
        <div className="badge-row" style={{ gap: "0.75rem", flexWrap: "wrap" }}>
          <span className="badge badge--orange">Rookie</span>
          <span className="badge badge--blue">Tactician</span>
          <span className="badge badge--violet">Pro</span>
          <span className="badge badge--pitch">Expert</span>
          <span className="badge badge--gold">Legend</span>
        </div>
        <p className="text-muted-sm" style={{ marginTop: "1rem" }}>
          Levels are assigned automatically based on how many tips you resolve, your win rate, and your ROI. The more accurate and consistent your picks, the higher your level.
        </p>
      </div>

      <div className="panel">
        <h3 className="title-section">Submit a community tip</h3>
        <p className="text-muted-sm" style={{ marginTop: 0 }}>
          Anyone with a TipHub account can submit a community pick — separate from
          the tipster track. Tipsters publish to the catalog and have a public profile;
          community submissions only count toward this leaderboard. If a public
          tipster profile is what you want, <Link href="/tipster/apply" className="text-link">apply here</Link> instead.
        </p>

        {authUser === undefined ? (
          <p className="text-muted-sm">Loading…</p>
        ) : authUser === null ? (
          <div className="surface" style={{ background: "var(--slate-100)", border: "1px dashed var(--border)" }}>
            <p style={{ margin: 0 }}>
              <strong>Log in to submit.</strong> Community submissions are tied to your account
              so the leaderboard isn&apos;t open to spoofed entries.
            </p>
            <div className="row" style={{ gap: "0.625rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
              <Link href="/login?next=/competition" className="btn btn-primary">Log in</Link>
              <Link href="/register" className="btn btn-ghost">Create account</Link>
            </div>
          </div>
        ) : (
          <form className="stack" onSubmit={handleSubmit}>
            <p className="text-muted-sm" style={{ margin: 0 }}>
              Submitting as <strong>{authUser.name}</strong> ({authUser.email}).
            </p>
          <div className="grid-filters" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
            <div className="field">
              <label htmlFor="competitor-match" className="field-label">Match</label>
              <select
                id="competitor-match"
                className="select"
                value={form.matchId}
                onChange={(event) => setForm({ ...form, matchId: event.target.value })}
              >
                {matches.map((match) => (
                  <option key={match.id} value={match.id}>
                    {formatMatchLabel(match)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="competitor-market" className="field-label">Market</label>
              <select
                id="competitor-market"
                className="select"
                value={form.market}
                onChange={(event) => {
                  const market = event.target.value;
                  // Reset prediction to a valid option for the new market.
                  setForm((prev) => ({
                    ...prev,
                    market,
                    prediction: PREDICTION_OPTIONS[market]?.[0] ?? "",
                  }));
                }}
              >
                {MARKET_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="competitor-prediction" className="field-label">Prediction</label>
            <select
              id="competitor-prediction"
              className="select"
              value={form.prediction}
              onChange={(event) => setForm({ ...form, prediction: event.target.value })}
              required
            >
              {(PREDICTION_OPTIONS[form.market] ?? []).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="grid-filters" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
            <div className="field">
              <label htmlFor="competitor-odds" className="field-label">Odds (fixed)</label>
              <input
                id="competitor-odds"
                className="input"
                type="text"
                value={derivedOdds.toFixed(2)}
                readOnly
                aria-readonly="true"
                title="Reference odds for this selection — set automatically, not editable"
              />
            </div>
            <div className="field">
              <label htmlFor="competitor-confidence" className="field-label">
                Confidence (1-10)
              </label>
              <select
                id="competitor-confidence"
                className="select"
                value={form.confidence}
                onChange={(event) => setForm({ ...form, confidence: Number(event.target.value) })}
                required
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}/10</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-muted-sm" style={{ margin: 0 }}>
            How strongly you back this pick — acts as your stake. Higher confidence on a winner
            earns more; on a miss it costs more, so be honest with yourself.
          </p>

          {status ? (
            <div className={status.type === "success" ? "badge badge--pitch" : "badge badge--rose"}>
              {status.message}
            </div>
          ) : null}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Submitting…" : "Submit tip"}
          </button>
          </form>
        )}
      </div>

      <div className="panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
          <h3 className="title-section" style={{ margin: 0 }}>Leaderboard</h3>
          <span
            className={isLive ? "badge badge--pitch" : "badge badge--orange"}
            title={isLive ? "Updates as submissions resolve in real time" : "Reconnecting…"}
          >
            {isLive ? "Live" : "Offline"}
          </span>
        </div>
        <table className="competition-leaderboard">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Level</th>
              <th>Resolved</th>
              <th>Win %</th>
              <th>ROI %</th>
            </tr>
          </thead>
          <tbody>
            {topFive.map((entry, index) => (
              <tr key={entry.id}>
                <td>{index + 1}</td>
                <td>{entry.name}</td>
                <td>
                  <span className={getLevelColor(entry.level)}>{entry.level}</span>
                </td>
                <td>{entry.stats.resolvedTips}</td>
                <td>{entry.stats.winRate}%</td>
                <td>{entry.stats.roi}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        {leaderboard.length === 0 ? (
          <p className="text-muted-sm" style={{ marginTop: "1rem" }}>
            No competitors yet. Be the first to submit a tip and start climbing the tipster ranks.
          </p>
        ) : null}
      </div>
    </div>
  );
}
