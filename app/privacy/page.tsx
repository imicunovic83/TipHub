import type { Metadata } from "next";
import SectionTitle from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How TipHub handles your personal data — account information, newsletter email, analytics events, and your rights as a user.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "19 May 2026";

export default function PrivacyPage() {
  return (
    <section className="pad-section">
      <div className="container stack">
        <SectionTitle
          eyebrow="Legal"
          title="Privacy policy"
          description={`Last updated: ${LAST_UPDATED}. This page describes how TipHub collects, uses, and protects your personal data. It is a working draft and will be reviewed by legal counsel before public launch.`}
        />

        <div className="surface">
          <h2 className="surface-title">Who we are</h2>
          <p className="text-muted">
            TipHub is a community tipster platform operated by an independent team based in Serbia.
            Public contact details (data-protection email, postal address) will be published here
            ahead of the public launch — this page is a working draft for the private beta.
            TipHub does not act as a betting operator and does not take wagers.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">What data we collect</h2>
          <ul className="text-muted">
            <li><strong>Account data:</strong> email address and (optionally) full name when you create an account.</li>
            <li><strong>Tipster profile data:</strong> name, specialty, biography, and the tips you publish — public by design.</li>
            <li><strong>Newsletter signup:</strong> email address only, kept until you unsubscribe.</li>
            <li><strong>Usage analytics:</strong> anonymous event counts (page views, clicks) without IP addresses or device fingerprints.</li>
            <li><strong>Cookies:</strong> a session cookie for authentication, plus a preference cookie for theme. No third-party tracking cookies.</li>
          </ul>
        </div>

        <div className="surface">
          <h2 className="surface-title">How we use it</h2>
          <p className="text-muted">
            We use this data only to operate the service — keeping you logged in, displaying your
            tipster profile, sending the newsletter you signed up for, and understanding which pages
            are popular so we can improve the site. We do not sell your data and we do not share it
            with advertisers.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">Who has access</h2>
          <p className="text-muted">
            Personal data lives in our Supabase database (hosted in the EU). Newsletter delivery is
            handled by Resend (US-based, GDPR-compliant). We do not send your data to any other
            third party.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">Your rights</h2>
          <p className="text-muted">
            Under GDPR you have the right to access, correct, export, or delete your personal data,
            and to object to specific processing. A data-protection contact address will be added
            here before the public launch; during the private beta, the fastest path is to delete
            your account from the profile page (account deletion cascades to all related rows in
            our database). You can unsubscribe from the newsletter at any time using the link at
            the bottom of every email — no account required.
          </p>
        </div>

        <div className="surface">
          <h2 className="surface-title">Changes to this policy</h2>
          <p className="text-muted">
            We will update this page whenever our practices change. Material changes will be
            announced in the newsletter and on the blog.
          </p>
        </div>
      </div>
    </section>
  );
}
