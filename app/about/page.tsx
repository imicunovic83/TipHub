import type { Metadata } from "next";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "About TipHub",
  description:
    "A free, community-first tipster platform with transparent track records. Honest football tips, multi-bookmaker odds, no VIP groups, no paywalls — built in Belgrade.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <section className="pad-section">
      <div className="container stack">
        <SectionTitle
          eyebrow="About"
          title="Football tips, kept honest."
          description="TipHub is a community-first tipster platform. Every tip our tipsters publish — wins, misses, and ROI — stays on public record. No paywalls, no VIP groups, no hidden losses. Free forever."
        />

        <div className="surface">
          <h2 className="surface-title">Why TipHub exists</h2>
          <p className="text-muted">
            If you follow Serbian football tipping at all, you already know the pattern. Somebody
            posts a winning slip on Instagram. The slip gets cropped, framed, and sold as proof
            that a private Telegram channel is the way. You pay €20-50 a month for predictions
            you can never audit. When picks lose, the losses quietly vanish from the feed.
          </p>
          <p className="text-muted">
            TipHub is the opposite of that. Every single tip a tipster publishes stays on their
            profile — wins, misses, ROI, longest streak, full history from day one. If a tipster
            runs cold for three weeks, you see it. If they run hot, you see that too. The
            leaderboard is the leaderboard.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">What we promise</h2>
          <ul className="text-muted">
            <li>
              <strong>Free forever.</strong> No paywalls, no premium tiers, no upsell to a paid
              Telegram. Every tip on the site is free to read, free to follow, free to argue with.
            </li>
            <li>
              <strong>Best-odds first.</strong> Every tip shows the offered price across five
              Serbian bookmakers (Mozzart, Maxbet, Soccerbet, Meridian, Admiral) so you never bet
              1.90 when somebody else has 2.05 on the same selection.
            </li>
            <li>
              <strong>Honest accounting.</strong> Pending tips are pending. Lost tips stay lost.
              ROI is calculated from the full record, not a curated subset. Tipsters cannot
              delete a tip to bury an outcome.
            </li>
          </ul>
        </div>

        <div className="surface">
          <h2 className="surface-title">What we are not</h2>
          <p className="text-muted">
            <strong>TipHub is not a bookmaker.</strong> We do not take bets, hold balances, or
            process payments. We are independent and not affiliated with any of the five
            bookmakers whose odds we compare. We may receive affiliate commissions when you click
            through to a bookmaker, but the comparison itself is mechanical — best price wins,
            every time.
          </p>
          <p className="text-muted">
            <strong>TipHub is not a tipping service.</strong> Nobody at TipHub will DM you a
            &quot;lock of the day&quot; or invite you to a paid channel. If you see someone using
            our brand to sell picks, it isn&apos;t us.
          </p>
          <p className="text-muted">
            <strong>TipHub is not financial advice.</strong> Tips are opinions from individual
            tipsters with public track records, not investment recommendations. Past results
            don&apos;t guarantee future returns. Bet only what you can afford to lose.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">Who&apos;s behind this</h2>
          <p className="text-muted">
            TipHub is built and run from Belgrade by one independent engineer. There is no venture
            capital, no marketing budget, no &quot;team of analysts.&quot; The bet is that an open,
            honest tipster community can grow on the strength of its track records — which is the
            opposite of how the loudest tipping accounts on Instagram operate.
          </p>
          <p className="text-muted">
            If you&apos;d like to apply as a tipster, drop a line via the{" "}
            <Link href="/tipster/apply" className="text-link">apply page</Link> — it takes about
            ten minutes. We look for tipsters who show their reasoning, stick to a specialty, and
            are comfortable with public losses. We&apos;re explicitly not looking for VIP-channel
            funnels.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">About the data right now</h2>
          <p className="text-muted">
            Until enough real tipsters and resolved tips are on the site, we show a small set of
            <strong> sample tipsters and sample tips</strong> so the catalog, profile pages, and
            bookmaker comparison can be exercised end-to-end. Sample entries are clearly marked
            (a yellow &quot;Sample&quot; pill on cards and a banner on per-slug pages). Once a
            threshold of real activity is reached, the seed entries automatically drop out of list
            views — only their direct URLs stay reachable so existing shared links keep working.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">About the odds</h2>
          <p className="text-muted">
            Odds shown on the site are <strong>illustrative snapshot values</strong> based on
            plausible market prices for each matchup. They are not live prices at the named
            bookmakers — verify on the bookmaker&apos;s own site before placing a bet. Live odds
            ingestion via the bookmakers&apos; affiliate XML feeds is on the roadmap for once we
            join their partner programs.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">Responsible play</h2>
          <p className="text-muted">
            Betting is for entertainment. Set a budget, set a time limit, and never chase losses.
            If betting stops being entertainment, take a break — every licensed Serbian bookmaker
            offers deposit limits and full self-exclusion in account settings. For broader help
            resources, see our{" "}
            <Link href="/responsible-gambling" className="text-link">responsible-gambling page</Link>.
            <strong> 18+ only.</strong>
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">Get in touch</h2>
          <p className="text-muted">
            We&apos;re in private beta and the public contact channels aren&apos;t live yet. If
            you&apos;d like to become a tipster, use the{" "}
            <Link href="/tipster/apply" className="text-link">apply page</Link> — it takes about
            ten minutes. For everything else, hang tight: a contact form lands shortly after the
            public launch.
          </p>
        </div>
      </div>
    </section>
  );
}
