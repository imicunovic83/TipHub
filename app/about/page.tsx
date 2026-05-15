import SectionTitle from "@/components/SectionTitle";

export default function AboutPage() {
  return (
    <section className="pad-section">
      <div className="container stack">
        <SectionTitle
          eyebrow="About"
          title="About TipHub"
          description="A demo project showcasing component-driven UI for a betting-tip marketplace."
        />

        <div className="surface">
          <h2 className="surface-title">What this is</h2>
          <p className="text-muted">
            TipHub is a Next.js demo built around the FIFA World Cup 2026 group stage. It catalogues
            expert tips from six professional tipsters across all 12 groups, with a side-by-side
            comparison of odds at five real Serbian bookmakers (Mozzart Bet, Maxbet, Soccerbet,
            Meridianbet, and Admiral Bet).
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">About the odds</h2>
          <p className="text-muted">
            <strong>The odds shown across this site are sample values for demonstration only.</strong> They
            are <em>not</em> live prices at the named bookmakers. They are realistic — chosen to fall within
            plausible ranges based on each matchup&apos;s strength differential — so the bookmaker comparison
            feature can be exercised end to end. A live integration would require an authenticated odds API
            (e.g. The Odds API, Betfair Exchange API) and is intentionally out of scope for this demo.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">About the data</h2>
          <p className="text-muted">
            The 12 group draws and 72 group-stage fixtures reflect the official FIFA Final Draw of
            5 December 2025, plus the four UEFA play-off winners confirmed in March 2026 (Bosnia &amp;
            Herzegovina, Sweden, Türkiye, Czechia). Tipster profiles, win rates, ROI figures and
            individual tips are illustrative.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">Responsible play</h2>
          <p className="text-muted">
            Sports betting is for entertainment. Set a budget, stick to it, and never chase losses. Help is
            available — speak to your local responsible-gambling line if you feel betting is becoming a
            problem. 18+ only.
          </p>
        </div>
      </div>
    </section>
  );
}
