import Link from "next/link";
import { notFound } from "next/navigation";
import { getMergedTipsByTipster, getMergedTipsterBySlug } from "@/lib/merged-data";
import TipCard from "@/components/TipCard";
import Avatar from "@/components/Avatar";

export default async function TipsterProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tipster = await getMergedTipsterBySlug(slug);
  if (!tipster) notFound();

  const tipsterTips = await getMergedTipsByTipster(tipster.slug);

  return (
    <section className="pad-section">
      <div className="container">
        <nav className="back-nav">
          <Link href="/tipsters">← Back to all tipsters</Link>
        </nav>

        <div className="profile-hero">
          <Avatar seed={tipster.slug} gender={tipster.gender} alt={tipster.name} size={80} />
          <div className="profile-body">
            <span className="eyebrow">{tipster.specialty}</span>
            <h1 className="title-display">{tipster.name}</h1>
            <p className="text-muted-sm max-prose">{tipster.longBio}</p>
            <div className="profile-stats">
              <div>
                <div className="profile-stat-value">{tipster.winRate}%</div>
                <div className="profile-stat-label">Win rate</div>
              </div>
              <div>
                <div className="profile-stat-value">+{tipster.roi}%</div>
                <div className="profile-stat-label">ROI</div>
              </div>
              <div>
                <div className="profile-stat-value">{tipster.totalTips}</div>
                <div className="profile-stat-label">Lifetime tips</div>
              </div>
              <div>
                <div className="profile-stat-value">{tipster.bestStreak}</div>
                <div className="profile-stat-label">Best streak</div>
              </div>
              <div>
                <div className="profile-stat-value">{tipster.joinedYear}</div>
                <div className="profile-stat-label">Joined</div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="title-section">Active tips ({tipsterTips.length})</h2>

        {tipsterTips.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No active tips right now</p>
            <p className="empty-state-body">{tipster.name.split(" ")[0]} hasn't posted any tips for the World Cup yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid-cards">
            {tipsterTips.map((tip) => (
              <TipCard key={tip.id} tip={tip} tipsterName={tipster.name} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
