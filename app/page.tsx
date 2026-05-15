import Link from "next/link";
import {
  getAllTips,
  getAllMatches,
  getTopTipsters,
  bookmakers,
} from "@/lib/data";
import TipCard from "@/components/TipCard";
import TipsterCard from "@/components/TipsterCard";

export default function Home() {
  const tips = getAllTips();
  const matches = getAllMatches();
  const topTipsters = getTopTipsters(3);

  // Featured tips: top 3 by confidence, then most recent
  const featured = [...tips]
    .sort((a, b) => b.confidence - a.confidence || b.postedAtISO.localeCompare(a.postedAtISO))
    .slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container pad-hero">
          <div className="hero-inner">
            <span className="hero-pill">★ World Cup 2026 — June 11 to July 19</span>
            <h1 className="hero-title">
              Expert tips for every World Cup 2026 match — with the best odds across 5 bookmakers.
            </h1>
            <p className="hero-lede">
              Six professional tipsters cover all 12 groups. Compare odds across Mozzart, Maxbet, Soccerbet, Meridian and Admiral on every tip. Find the value, follow the win-rate.
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
              Picks our tipsters rate 5★. Each one comes with a multi-bookmaker odds comparison and free analysis.
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
            <h2 className="title-page">Hottest tipsters right now</h2>
            <p className="text-muted max-prose">
              Three tipsters with the highest lifetime win rates. Each profile shows their full track record.
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
