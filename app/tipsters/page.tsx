import SectionTitle from "@/components/SectionTitle";
import TipsterCard from "@/components/TipsterCard";
import { getMergedTipsters } from "@/lib/merged-data";

export default async function TipstersPage() {
  const tipsters = await getMergedTipsters();

  return (
    <section className="pad-section">
      <div className="container">
        <div className="stack">
          <SectionTitle
            eyebrow="Team"
            title="Meet the tipsters"
            description="Professional and community tipsters specialising across the major football betting markets. Tap any profile to see their full lifetime stats and current World Cup 2026 tips."
          />
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
