import Link from "next/link";
import type { Tipster } from "@/lib/data";
import Avatar from "@/components/Avatar";

export default function TipsterCard({ tipster }: { tipster: Tipster }) {
  return (
    <Link href={`/tipsters/${tipster.slug}`} className="card-link">
      {tipster.isHot ? <span className="tipster-hot-badge">★ Hot</span> : null}
      {tipster.isDemo ? <span className="sample-badge" title="Sample profile — shown until real tipsters fill in">Sample</span> : null}

      <div className="tipster-row">
        <Avatar seed={tipster.slug} gender={tipster.gender} alt={tipster.name} />
        <div>
          <h3 className="tipster-card-name">{tipster.name}</h3>
          <p className="tipster-card-role">{tipster.specialty}</p>
        </div>
      </div>

      <p className="tipster-card-bio">{tipster.shortBio}</p>

      <dl className="tipster-stats">
        <div className="tipster-stat">
          <dt className="tipster-stat-label">Win rate</dt>
          <dd className={
            tipster.winRate >= 60
              ? "tipster-stat-value tipster-stat-value--good"
              : tipster.winRate < 35
                ? "tipster-stat-value tipster-stat-value--bad"
                : "tipster-stat-value"
          }>
            {tipster.winRate}%
          </dd>
        </div>
        <div className="tipster-stat">
          <dt className="tipster-stat-label">ROI</dt>
          <dd className={
            tipster.roi >= 0
              ? "tipster-stat-value tipster-stat-value--good"
              : "tipster-stat-value tipster-stat-value--bad"
          }>
            {tipster.roi > 0 ? "+" : ""}{tipster.roi}%
          </dd>
        </div>
        <div className="tipster-stat">
          <dt className="tipster-stat-label">Tips</dt>
          <dd className="tipster-stat-value">{tipster.totalTips}</dd>
        </div>
      </dl>

      <div className="card-footer">
        <span>Joined {tipster.joinedYear}</span>
        <span className="tipster-card-cta">View Profile →</span>
      </div>
    </Link>
  );
}
