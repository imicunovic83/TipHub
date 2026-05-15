import {
  bookmakers,
  getAllGroups,
  getAllMarkets,
  getAllTips,
  getAllTipsters,
} from "@/lib/data";
import SectionTitle from "@/components/SectionTitle";
import TipsCatalogClient from "@/components/TipsCatalogClient";

export default function TipsPage() {
  const tips = getAllTips();
  const groups = getAllGroups();
  const markets = getAllMarkets();
  const tipsters = getAllTipsters().map((t) => ({
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
          <TipsCatalogClient
            tips={tips}
            groups={groups}
            markets={markets}
            tipsters={tipsters}
            bookmakers={bookmakers}
          />
        </div>
      </div>
    </section>
  );
}
