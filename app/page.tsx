import Link from "next/link";
import { getAllMatches, bookmakers } from "@/lib/data";
import { getMergedTips, getMergedTipsters } from "@/lib/merged-data";
import TipCard from "@/components/TipCard";
import TipsterCard from "@/components/TipsterCard";

export default async function Home() {
  const [tips, tipsters] = await Promise.all([getMergedTips(), getMergedTipsters()]);
  const matches = getAllMatches();

  // Featured tips: top 3 by confidence, then most recent.
  const featured = [...tips]
    .sort((a, b) => b.confidence - a.confidence || b.postedAtISO.localeCompare(a.postedAtISO))
    .slice(0, 3);

  // Top tipsters by lifetime win rate, demoting demo entries so real
  // tipsters surface first once they exist.
  const topTipsters = [...tipsters]
    .sort((a, b) => {
      if (!!a.isDemo !== !!b.isDemo) return a.isDemo ? 1 : -1;
      return b.winRate - a.winRate;
    })
    .slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container pad-hero">
          <div className="hero-inner">
            <span className="hero-pill">★ World Cup 2026 — June 11 to July 19</span>
            <h1 className="hero-title">
              Honest football tips — with odds compared across 5 bookmakers.
            </h1>
            <p className="hero-lede">
              Every tip our community posts stays on public record — wins, misses and ROI alike.
              No VIP groups, no deleted losses, no paywalls. Compare prices across Mozzart, Maxbet,
              Soccerbet, Meridian and Admiral on every pick, and follow the tipsters who actually deliver.
            </p>
            <div className="hero-actions">
              <Link href="/tips" className="btn btn-gold">Browse tips →</Link>
              <Link href="/tipsters" className="btn btn-ghost">Meet the tipsters</Link>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-value">{tips.length}</div>
                <div className="hero-stat-label">Active tips</div>
              </div>
              <div>
                <div className="hero-stat-value">{matches.length}</div>
                <div className="hero-stat-label">Group matches</div>
              </div>
              <div>
                <div className="hero-stat-value">{bookmakers.length}</div>
                <div className="hero-stat-label">Bookmakers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pad-section">
        <div className="container stack">
          <div className="section-head">
            <span className="eyebrow">Featured</span>
            <h2 className="title-page">Highest-confidence tips this week</h2>
            <p className="text-muted max-prose">
              Picks our tipsters rate 5★. Each one comes with a multi-bookmaker odds comparison
              and full analysis — free, no signup required.
            </p>
          </div>

          <div className="grid-cards">
            {featured.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>

          <div>
            <Link href="/tips" className="btn btn-primary">See all tips →</Link>
          </div>
        </div>
      </section>

      <section className="pad-section" style={{ background: "var(--white)", borderTop: "1px solid var(--border)" }}>
        <div className="container stack">
          <div className="section-head">
            <span className="eyebrow">Top performers</span>
            <h2 className="title-page">Tipsters with the strongest record</h2>
            <p className="text-muted max-prose">
              Highest lifetime win rates across our community. Every profile shows the full track
              record — what they got right, and what they didn&apos;t.
            </p>
          </div>

          <div className="grid-cards">
            {topTipsters.map((t) => (
              <TipsterCard key={t.id} tipster={t} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
