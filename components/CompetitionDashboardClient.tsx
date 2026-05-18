"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Match } from "@/lib/data";
import type { CompetitionLeaderboardEntry } from "@/lib/competition";
import { getSupabaseClient } from "@/lib/supabase";

const MARKET_OPTIONS = [
  "1X2",
  "Over/Under 2.5",
  "BTTS",
  "Asian Handicap",
  "Correct Score",
];

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
  const [form, setForm] = useState({
    name: "",
    email: "",
    matchId: matches[0]?.id ?? "",
    market: MARKET_OPTIONS[0],
    prediction: "",
    odds: 1.8,
    stake: 10,
  });

  useEffect(() => {
    fetchLeaderboard();

    const supabase = getSupabaseClient();
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
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          matchId: form.matchId,
          market: form.market,
          prediction: form.prediction,
          odds: Number(form.odds),
          stake: Number(form.stake),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setStatus({ type: "error", message: result.error || "Unable to submit tip." });
      } else {
        setStatus({ type: "success", message: "Tip successfully submitted. Your level is updated as results arrive." });
        setLeaderboard(result.leaderboard ?? []);
        setSubmissions((prev) => prev + 1);
        setForm((prev) => ({ ...prev, prediction: "", odds: 1.8, stake: 10 }));
      }
    } catch (error) {
      setStatus({ type: "error", message: "Network error while submitting tip." });
    } finally {
      setLoading(false);
    }
  }

  const topFive = useMemo(() => leaderboard.slice(0, 5), [leaderboard]);

  return (
    <div className="competition-grid">
      <div className="panel">
        <div className="stack">
          <p>
            Join the TipHub community challenge. Submit your own prediction on a scheduled match, and follow the leaderboard as your win rate and ROI earn you a new tipster level.
          </p>
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
        <form className="stack" onSubmit={handleSubmit}>
          <div className="grid-filters" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
            <div className="field">
              <label htmlFor="competitor-name" className="field-label">Name</label>
              <input
                id="competitor-name"
                className="input"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Your name"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="competitor-email" className="field-label">Email</label>
              <input
                id="competitor-email"
                className="input"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="your@email.com"
                type="email"
                required
              />
            </div>
          </div>

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
                onChange={(event) => setForm({ ...form, market: event.target.value })}
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
            <input
              id="competitor-prediction"
              className="input"
              value={form.prediction}
              onChange={(event) => setForm({ ...form, prediction: event.target.value })}
              placeholder="Enter your pick"
              required
            />
          </div>

          <div className="grid-filters" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
            <div className="field">
              <label htmlFor="competitor-odds" className="field-label">Odds</label>
              <input
                id="competitor-odds"
                className="input"
                type="number"
                min="1.01"
                step="0.01"
                value={form.odds}
                onChange={(event) => setForm({ ...form, odds: Number(event.target.value) })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="competitor-stake" className="field-label">Stake</label>
              <input
                id="competitor-stake"
                className="input"
                type="number"
                min="1"
                step="1"
                value={form.stake}
                onChange={(event) => setForm({ ...form, stake: Number(event.target.value) })}
                required
              />
            </div>
          </div>

          {status ? (
            <div className={status.type === "success" ? "badge badge--pitch" : "badge badge--rose"}>
              {status.message}
            </div>
          ) : null}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Submitting…" : "Submit tip"}
          </button>
        </form>
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
