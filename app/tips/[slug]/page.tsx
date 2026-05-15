import Link from "next/link";
import { notFound } from "next/navigation";
import {
  bestOddsForTip,
  getMatchById,
  getTeamByCode,
  getTipBySlug,
  getTipsterBySlug,
} from "@/lib/data";
import { Badge } from "@/components/Badge";
import ConfidenceStars from "@/components/ConfidenceStars";
import Countdown from "@/components/Countdown";
import BookmakerOddsTable from "@/components/BookmakerOddsTable";
import Flag from "@/components/Flag";

export default async function TipDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tip = getTipBySlug(slug);
  if (!tip) notFound();

  const match = getMatchById(tip.matchId);
  const tipster = getTipsterBySlug(tip.tipsterSlug);
  if (!match || !tipster) notFound();

  const home = getTeamByCode(match.homeCode);
  const away = getTeamByCode(match.awayCode);
  if (!home || !away) notFound();

  const best = bestOddsForTip(tip);

  const kickoff = new Date(match.kickoffISO);
  const dateString = kickoff.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeString = kickoff.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <section className="pad-section">
      <div className="container">
        <nav className="back-nav">
          <Link href="/tips">← Back to all tips</Link>
        </nav>

        <div className="row" style={{ gap: "0.5rem", marginBottom: "0.75rem" }}>
          <span className="group-chip">{match.group}</span>
          <Badge variant="pitch">{tip.market}</Badge>
          {tip.isPremium ? <Badge variant="gold">Premium</Badge> : null}
          <Countdown kickoffISO={match.kickoffISO} />
        </div>

        <h1 className="title-display" style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
          <Flag code={home.flag} alt={home.name} width={32} />
          {home.name}
          <span className="tip-match-vs">vs</span>
          {away.name}
          <Flag code={away.flag} alt={away.name} width={32} />
        </h1>
        <p className="text-muted max-prose" style={{ marginTop: "0.5rem" }}>
          {dateString} · {timeString} · {match.stadium}, {match.city}
        </p>

        <div className="tip-detail">
          <div className="tip-detail-main">
            <div className="surface">
              <h2 className="surface-title">The tip</h2>
              <div className="tip-prediction">
                <div>
                  <div className="tip-prediction-label">{tip.market}</div>
                  <div className="tip-prediction-value">{tip.prediction}</div>
                </div>
                <div className="tip-prediction-odds">{best.value.toFixed(2)}</div>
              </div>
              <div className="tip-meta-row" style={{ marginTop: "0.875rem" }}>
                <span className="tip-best-bookmaker">
                  Best @ <strong>{best.bookmaker.name}</strong>
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                  Confidence <ConfidenceStars value={tip.confidence} />
                </span>
              </div>
            </div>

            <div className="surface">
              <h2 className="surface-title">Analysis</h2>
              <p className="text-muted">{tip.analysis}</p>
            </div>

            <div className="surface">
              <h2 className="surface-title">Bookmaker odds comparison</h2>
              <BookmakerOddsTable tip={tip} />
              <p className="disclaimer">
                Sample odds shown for demonstration only — they do not reflect live prices at the named bookmakers.
              </p>
            </div>
          </div>

          <aside className="tip-detail-side">
            <div className="surface">
              <h2 className="surface-title">Tipster</h2>
              <div className="tipster-row">
                <span className="avatar">{tipster.initials}</span>
                <div>
                  <h3 className="tipster-card-name">{tipster.name}</h3>
                  <p className="tipster-card-role">{tipster.specialty}</p>
                </div>
              </div>
              <dl className="tipster-stats">
                <div className="tipster-stat">
                  <dt className="tipster-stat-label">Win rate</dt>
                  <dd className="tipster-stat-value tipster-stat-value--good">{tipster.winRate}%</dd>
                </div>
                <div className="tipster-stat">
                  <dt className="tipster-stat-label">ROI</dt>
                  <dd className="tipster-stat-value tipster-stat-value--good">+{tipster.roi}%</dd>
                </div>
                <div className="tipster-stat">
                  <dt className="tipster-stat-label">Tips</dt>
                  <dd className="tipster-stat-value">{tipster.totalTips}</dd>
                </div>
              </dl>
              <div style={{ marginTop: "0.75rem" }}>
                <Link href={`/tipsters/${tipster.slug}`} className="tipster-card-cta">
                  View {tipster.name.split(" ")[0]}'s profile →
                </Link>
              </div>
            </div>

            <div className="surface">
              <h2 className="surface-title">Match info</h2>
              <p className="text-muted-sm" style={{ margin: 0 }}>
                <strong>Group:</strong> {match.group}<br />
                <strong>Matchday:</strong> {match.matchday}<br />
                <strong>Venue:</strong> {match.stadium}<br />
                <strong>City:</strong> {match.city}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
