import type { Metadata } from "next";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import TipsterCard from "@/components/TipsterCard";
import { getMergedTipsters } from "@/lib/merged-data";

export const metadata: Metadata = {
  title: "Meet the tipsters",
  description:
    "Browse every tipster on TipHub with full lifetime win rate, ROI and tip history. Track records are public and tamper-proof — no VIP groups, no deleted losses.",
  alternates: { canonical: "/tipsters" },
};

export default async function TipstersPage() {
  const tipsters = await getMergedTipsters();
  const showingSampleData = tipsters.some((t) => t.isDemo);

  return (
    <section className="pad-section">
      <div className="container">
        <div className="stack">
          <SectionTitle
            eyebrow="Team"
            title="Meet the tipsters"
            description="Professional and community tipsters specialising across the major football betting markets. Tap any profile to see their full lifetime stats and current World Cup 2026 tips."
          />
          {showingSampleData ? (
            <div className="demo-banner" role="note">
              <strong>Sample profiles</strong> are shown to demonstrate how tipster pages work.
              They&apos;ll be replaced automatically as real tipsters join.
              <Link href="/tipster/apply" className="text-link" style={{ marginLeft: "0.4rem" }}>Apply to become a tipster →</Link>
            </div>
          ) : null}
          <div className="grid-cards">
            {tipsters.map((t) => (
              <TipsterCard key={t.id} tipster={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
