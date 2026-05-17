import Link from "next/link";
import { getAllTipsters } from "@/lib/data";
import SectionTitle from "@/components/SectionTitle";
import TipsterCard from "@/components/TipsterCard";

export default function TipstersPage() {
  const tipsters = getAllTipsters();

  return (
    <section className="pad-section">
      <div className="container">
        <div className="stack">
          <SectionTitle
            eyebrow="Team"
            title="Meet the tipsters"
            description="Six professional tipsters specialising across the major football betting markets. Tap any profile to see their full lifetime stats and current World Cup 2026 tips."
          />
          <div className="grid-cards">
            {tipsters.map((t) => (
              <TipsterCard key={t.id} tipster={t} />
            ))}
          </div>
          <div className="panel" style={{ marginTop: "1.5rem" }}>
            <p>
              Want to join the team? <Link href="/tipster/apply">Apply to become a tipster.</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
