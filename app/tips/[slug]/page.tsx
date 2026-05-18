import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bestOddsForTip, getMatchById, getTeamByCode } from "@/lib/data";
import { getMergedTipBySlug, getMergedTipsterBySlug } from "@/lib/merged-data";
import { Badge } from "@/components/Badge";
import ConfidenceStars from "@/components/ConfidenceStars";
import Countdown from "@/components/Countdown";
import BookmakerOddsTable from "@/components/BookmakerOddsTable";
import Flag from "@/components/Flag";
import Avatar from "@/components/Avatar";
import ShareButton from "@/components/ShareButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tip = await getMergedTipBySlug(slug);
  if (!tip) {
    return { title: "Tip not found", robots: { index: false, follow: false } };
  }
  const match = getMatchById(tip.matchId);
  const home = match ? getTeamByCode(match.homeCode) : undefined;
  const away = match ? getTeamByCode(match.awayCode) : undefined;
  const tipster = await getMergedTipsterBySlug(tip.tipsterSlug);
  const best = bestOddsForTip(tip);

  const fixture = home && away ? `${home.name} vs ${away.name}` : tip.market;
  const tipsterName = tipster?.name ?? "TipHub tipster";
  const title = `${tip.prediction} — ${fixture}`;
  const description = `${tipsterName}'s ${tip.market} pick for ${fixture}: ${tip.prediction} @ ${best.value.toFixed(2)} (best ${best.bookmaker.name}). ${tip.shortReason}`;

  return {
    title,
    description,
    alternates: { canonical: `/tips/${tip.slug}` },
    openGraph: { type: "article", title, description, url: `/tips/${tip.slug}` },
    twitter: { card: "summary_large_image", title, description },
    robots: tip.isDemo
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function TipDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tip = await getMergedTipBySlug(slug);
  if (!tip) notFound();

  const match = getMatchById(tip.matchId);
  const tipster = await getMergedTipsterBySlug(tip.tipsterSlug);
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

        {tip.isDemo ? (
          <div className="demo-banner demo-banner--inline" role="note">
            This is a <strong>sample tip</strong> used to demonstrate how the catalog works —
            it is not a live pick from a registered tipster.
          </div>
        ) : null}

        <div className="row" style={{ gap: "0.5rem", marginBottom: "0.75rem" }}>
          <span className="group-chip">{match.group}</span>
          <Badge variant="pitch">{tip.market}</Badge>
          {tip.isPremium ? <Badge variant="gold">Premium</Badge> : null}
          <Countdown kickoffISO={match.kickoffISO} />
        </div>

        <div className="row-between" style={{ alignItems: "flex-start", gap: "1rem" }}>
          <h1 className="title-display" style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
            <Flag code={home.flag} alt={home.name} width={32} />
            <span className="team-code">{home.code}</span>
            {home.name}
            <span className="tip-match-vs">vs</span>
            {away.name}
            <span className="team-code">{away.code}</span>
            <Flag code={away.flag} alt={away.name} width={32} />
          </h1>
          <ShareButton path={`/tips/${tip.slug}`} />
        </div>
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
                {tip.isDemo
                  ? "Sample odds shown for demonstration only — they do not reflect live prices at the named bookmakers."
                  : "Odds shown were posted by the tipster at the time of writing. Live prices on each bookmaker site may differ — click through to verify before placing a bet."}
              </p>
            </div>
          </div>

          <aside className="tip-detail-side">
            <div className="surface">
              <h2 className="surface-title">Tipster</h2>
              <div className="tipster-row">
                <Avatar seed={tipster.slug} gender={tipster.gender} alt={tipster.name} />
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
