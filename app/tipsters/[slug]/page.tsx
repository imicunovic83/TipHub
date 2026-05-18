import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMergedTipsByTipster, getMergedTipsterBySlug } from "@/lib/merged-data";
import TipCard from "@/components/TipCard";
import Avatar from "@/components/Avatar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tipster = await getMergedTipsterBySlug(slug);
  if (!tipster) {
    return { title: "Tipster not found", robots: { index: false, follow: false } };
  }
  const title = `${tipster.name} — ${tipster.specialty}`;
  const description = `${tipster.shortBio} Win rate ${tipster.winRate}%, ROI ${tipster.roi > 0 ? "+" : ""}${tipster.roi}% over ${tipster.totalTips} lifetime tips.`;
  return {
    title,
    description,
    alternates: { canonical: `/tipsters/${tipster.slug}` },
    openGraph: { type: "profile", title, description, url: `/tipsters/${tipster.slug}` },
    twitter: { card: "summary_large_image", title, description },
    robots: tipster.isDemo
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

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

        {tipster.isDemo ? (
          <div className="demo-banner demo-banner--inline" role="note">
            This is a <strong>sample profile</strong> used to demonstrate how tipster pages
            work — the stats and tips below are illustrative, not from a real registered user.
          </div>
        ) : null}

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
