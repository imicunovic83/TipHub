import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { bookmakers, getAllGroups, getAllMarkets } from "@/lib/data";
import { getMergedTips, getMergedTipsters } from "@/lib/merged-data";
import SectionTitle from "@/components/SectionTitle";
import TipsCatalogClient from "@/components/TipsCatalogClient";

export const metadata: Metadata = {
  title: "All tips — World Cup 2026 catalog",
  description:
    "Every active tip across the FIFA World Cup 2026 group stage. Filter by tipster, market, odds range, kickoff date or best-odds bookmaker. Free, no signup required.",
  alternates: { canonical: "/tips" },
};

export default async function TipsPage() {
  const [tips, mergedTipsters] = await Promise.all([getMergedTips(), getMergedTipsters()]);
  const groups = getAllGroups();
  const markets = getAllMarkets();
  const showingSampleData = tips.some((t) => t.isDemo);
  const tipsters = mergedTipsters.map((t) => ({
    slug: t.slug,
    name: t.name,
    winRate: t.winRate,
  }));

  return (
    <section className="pad-section">
      <div className="container">
        <div className="stack">
          <SectionTitle
            eyebrow="Catalog"
            title="All tips"
            description="Browse tips across all 12 World Cup 2026 groups. Filter by tipster, market, odds range, date, or which bookmaker offers the best price."
          />
          {showingSampleData ? (
            <div className="demo-banner" role="note">
              <strong>Sample tips</strong> are shown to demonstrate the catalog. They&apos;ll be
              replaced automatically as real tipsters publish their own picks.
              <Link href="/tipster/apply" className="text-link" style={{ marginLeft: "0.4rem" }}>Apply to become a tipster →</Link>
            </div>
          ) : null}
          <Suspense fallback={<div>Loading tips…</div>}>
            <TipsCatalogClient
              tips={tips}
              groups={groups}
              markets={markets}
              tipsters={tipsters}
              bookmakers={bookmakers}
            />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
