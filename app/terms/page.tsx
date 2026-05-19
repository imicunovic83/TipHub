import type { Metadata } from "next";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The rules of using TipHub — what we promise to users and tipsters, what users and tipsters promise to us, and what is explicitly out of scope.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "19 May 2026";

export default function TermsPage() {
  return (
    <section className="pad-section">
      <div className="container stack">
        <SectionTitle
          eyebrow="Legal"
          title="Terms of service"
          description={`Last updated: ${LAST_UPDATED}. Working draft; will be reviewed by legal counsel before public launch.`}
        />

        <div className="surface">
          <h2 className="surface-title">What TipHub is — and isn't</h2>
          <p className="text-muted">
            TipHub is an informational community platform that publishes football tips, transparent
            tipster track records, and bookmaker odds comparisons. We are <strong>not</strong> a
            betting operator. We do not take wagers, hold balances, process payments, or guarantee
            the accuracy of odds shown. Any bet you place is between you and the bookmaker you
            choose to use.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">Eligibility</h2>
          <p className="text-muted">
            You must be at least 18 years old to use TipHub. By creating an account or interacting
            with the site you confirm that you meet this requirement. If your country or region
            prohibits betting-related content, do not use the service.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">Acceptable use</h2>
          <ul className="text-muted">
            <li>No scraping, automated submissions, or abusive request volume.</li>
            <li>No impersonating other people or known tipsters.</li>
            <li>No using TipHub as a funnel to paid Telegram channels or other off-platform tipster services.</li>
            <li>No content that promotes illegal gambling, fraud, match fixing, or harm.</li>
          </ul>
          <p className="text-muted">
            We reserve the right to remove content and disable accounts that violate these rules,
            without prior notice for serious violations.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">Tipster responsibilities</h2>
          <p className="text-muted">
            Approved tipsters agree that every tip they publish stays on the public record,
            including losses. You retain copyright in the analysis you write but grant TipHub a
            perpetual, royalty-free license to display it on the platform. You will not delete or
            edit a tip&apos;s outcome to misrepresent your track record.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">No financial advice</h2>
          <p className="text-muted">
            Tips and analyses on TipHub are opinions, not financial advice. Past results do not
            guarantee future returns. Bet only what you can afford to lose. See our{" "}
            <Link href="/responsible-gambling" className="text-link">Responsible gambling page</Link>{" "}
            for help.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">Liability</h2>
          <p className="text-muted">
            TipHub is provided &quot;as is&quot;. To the maximum extent permitted by law, we are not
            liable for any losses (financial or otherwise) arising from your use of information on
            the platform. Bookmaker odds shown may not reflect live prices — always verify on the
            bookmaker&apos;s own site before placing a bet.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">Governing law</h2>
          <p className="text-muted">
            These terms are governed by the laws of the Republic of Serbia. Disputes will be
            resolved in the courts of Belgrade. EU consumers retain the protections of their local
            law where mandatory.
          </p>
        </div>
      </div>
    </section>
  );
}
