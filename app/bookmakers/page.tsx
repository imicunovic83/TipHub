import Link from "next/link";
import { getBookmakerStats, getAllTips } from "@/lib/data";
import SectionTitle from "@/components/SectionTitle";
import BookmakerLogo from "@/components/BookmakerLogo";
import TipCard from "@/components/TipCard";

export default function BookmakersPage() {
  const stats = getBookmakerStats();
  const totalTips = getAllTips().length;

  // Rank by bestCount descending so the most-generous bookmaker appears first.
  const ranked = [...stats].sort((a, b) => b.bestCount - a.bestCount);
  const maxBestCount = Math.max(...ranked.map((s) => s.bestCount), 1);

  // The single best tip across the entire site (highest odds anywhere).
  const headline = ranked[0];

  return (
    <section className="pad-section">
      <div className="container stack">
        <SectionTitle
          eyebrow="Comparison"
          title="Bookmaker leaderboard"
          description={`Across all ${totalTips} active tips, here is who offers the most "best" odds, and where each operator's standout selections live.`}
        />

        <div className="surface">
          <h2 className="surface-title">Best-odds count</h2>
          <p className="text-muted-sm" style={{ margin: "0 0 1rem" }}>
            Number of tips where each bookmaker offers the highest price. Higher
            is better for you — fewer markets where you would need to switch
            elsewhere for a better payout.
          </p>

          <div className="bookmaker-bar-list">
            {ranked.map((s) => {
              const widthPct = (s.bestCount / maxBestCount) * 100;
              return (
                <div key={s.bookmaker.slug} className="bookmaker-bar-row">
                  <div className="bookmaker-bar-label">
                    <BookmakerLogo bookmaker={s.bookmaker} size={32} />
                    <strong>{s.bookmaker.name}</strong>
                  </div>
                  <div className="bookmaker-bar-track">
                    <div
                      className="bookmaker-bar-fill"
                      style={{
                        width: `${widthPct}%`,
                        background: s.bookmaker.brandColor,
                      }}
                    />
                  </div>
                  <div className="bookmaker-bar-meta">
                    <span className="bookmaker-bar-count">{s.bestCount}</span>
                    <span className="bookmaker-bar-pct">{s.bestPct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid-cards">
          {ranked.map((s) => (
            <div key={s.bookmaker.slug} className="surface stack-md">
              <div className="row" style={{ alignItems: "center" }}>
                <BookmakerLogo bookmaker={s.bookmaker} size={48} />
                <div>
                  <h3 className="surface-title" style={{ margin: 0 }}>{s.bookmaker.name}</h3>
                  <p className="text-muted-sm" style={{ margin: 0 }}>{s.bookmaker.country}</p>
                </div>
              </div>

              <dl className="tipster-stats">
                <div className="tipster-stat">
                  <dt className="tipster-stat-label">Best in</dt>
                  <dd className="tipster-stat-value tipster-stat-value--good">{s.bestCount}</dd>
                </div>
                <div className="tipster-stat">
                  <dt className="tipster-stat-label">Avg best</dt>
                  <dd className="tipster-stat-value">{s.avgBestOdds.toFixed(2)}</dd>
                </div>
                <div className="tipster-stat">
                  <dt className="tipster-stat-label">Avg odds</dt>
                  <dd className="tipster-stat-value">{s.avgOdds.toFixed(2)}</dd>
                </div>
              </dl>

              {s.topTips.length > 0 ? (
                <div>
                  <h4 className="surface-title" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Top picks where {s.bookmaker.name} wins
                  </h4>
                  <ul className="bookmaker-toplist">
                    {s.topTips.slice(0, 3).map((tip) => {
                      const offer = tip.odds.find((o) => o.bookmaker === s.bookmaker.slug);
                      return (
                        <li key={tip.id}>
                          <Link href={`/tips/${tip.slug}`} className="bookmaker-toplist-item">
                            <span className="bookmaker-toplist-prediction">{tip.prediction}</span>
                            <span className="bookmaker-toplist-odds">{offer?.value.toFixed(2)}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <p className="text-muted-sm" style={{ margin: 0 }}>
                  Currently no tips where this bookmaker is the standout. Check back when more tips are posted.
                </p>
              )}
            </div>
          ))}
        </div>

        {headline && headline.topTips.length > 0 ? (
          <div>
            <h2 className="title-section">Highest-odds tip on the entire board</h2>
            <p className="text-muted" style={{ marginTop: 0 }}>
              {headline.bookmaker.name} offers the longest single price across every active tip:
            </p>
            <div className="grid-cards">
              <TipCard tip={headline.topTips[0]} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
