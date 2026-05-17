import { getAllMatches } from "@/lib/data";
import SectionTitle from "@/components/SectionTitle";
import CompetitionDashboardClient from "@/components/CompetitionDashboardClient";

export default function CompetitionPage() {
  const matches = getAllMatches();

  return (
    <section className="pad-section">
      <div className="container">
        <SectionTitle
          eyebrow="Community"
          title="Tipster challenge"
          description="Submit your own picks on scheduled matches, track your performance and unlock higher tipster levels as you win more bets."
        />
        <CompetitionDashboardClient matches={matches} />
      </div>
    </section>
  );
}
