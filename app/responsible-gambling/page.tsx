import type { Metadata } from "next";
import SectionTitle from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "Responsible gambling",
  description:
    "Tools, warning signs, and help resources for gambling-related harm. TipHub takes responsible-gambling seriously: free advice, no upsells, transparent track records.",
  alternates: { canonical: "/responsible-gambling" },
};

export default function ResponsibleGamblingPage() {
  return (
    <section className="pad-section">
      <div className="container stack">
        <SectionTitle
          eyebrow="Player safety"
          title="Responsible gambling"
          description="Betting can be entertainment when kept in proportion. When it stops being entertainment, it becomes a problem. This page exists so you have the tools and contacts to recognise that line — and step back if you cross it."
        />

        <div className="surface">
          <h2 className="surface-title">The TipHub stance</h2>
          <p className="text-muted">
            We publish football analysis and tipster track records. We do not take bets, we do not
            push you toward any specific bookmaker, and we do not earn affiliate commission per
            placed bet on TipHub today. Our community guidelines explicitly ban deleted-loss
            highlight reels and fake-streak marketing — the kind of content that makes betting look
            easier than it is.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">Set your own rules — before you start</h2>
          <ul className="text-muted">
            <li><strong>Budget:</strong> decide how much you can afford to lose this month, in advance. Treat it like a cinema ticket — once it&apos;s gone, it&apos;s gone.</li>
            <li><strong>Time:</strong> set a maximum time you&apos;ll spend per day on betting-related screens. Honour it.</li>
            <li><strong>Sober:</strong> never place a bet while drunk, tired, or emotional after a loss.</li>
            <li><strong>No chasing:</strong> if you lose your weekly budget by Wednesday, the week is over. Do not double up to "win it back".</li>
          </ul>
        </div>

        <div className="surface">
          <h2 className="surface-title">Warning signs</h2>
          <p className="text-muted">If you recognise any of these in yourself, take a break and talk to someone:</p>
          <ul className="text-muted">
            <li>Betting more than you planned, more often than you planned.</li>
            <li>Hiding the amount you bet from family or friends.</li>
            <li>Borrowing money — from a credit card, a friend, or anywhere — to keep betting.</li>
            <li>Feeling restless or irritable when you try to stop.</li>
            <li>Betting to escape stress, sadness, or boredom rather than for entertainment.</li>
            <li>Losing interest in things you used to enjoy.</li>
          </ul>
        </div>

        <div className="surface">
          <h2 className="surface-title">Bookmaker self-exclusion</h2>
          <p className="text-muted">
            Every licensed Serbian bookmaker offers deposit limits, loss limits, time-out periods,
            and full self-exclusion. Each bookmaker handles this in its own account settings. If you
            need to step back, do it today — not after &quot;just one more&quot; bet.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">Where to get help</h2>
          <ul className="text-muted">
            <li>
              <strong>Klub anonimnih kockara Beograd</strong> &mdash; weekly meetings, free,
              anonymous. Phone: <a href="tel:+381616777777" className="text-link">+381 61 677 7777</a>.
            </li>
            <li>
              <strong>Centar za pomoć kod patološkog kockanja</strong> &mdash; counselling
              and family support across Serbia.
            </li>
            <li>
              <strong>Begin Again (English-language)</strong> &mdash; international Gamblers
              Anonymous resources at <a href="https://www.gamblersanonymous.org" className="text-link" target="_blank" rel="noreferrer noopener">gamblersanonymous.org</a>.
            </li>
            <li>
              <strong>GamCare (English-language)</strong> &mdash; free, confidential support and
              live chat at <a href="https://www.gamcare.org.uk" className="text-link" target="_blank" rel="noreferrer noopener">gamcare.org.uk</a>.
            </li>
          </ul>
          <p className="text-muted">
            Talking to someone is the single hardest step and the single most useful one. There is
            no shame in asking for help.
          </p>
        </div>
      </div>
    </section>
  );
}
