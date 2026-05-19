import type { Metadata } from "next";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "Newsletter confirmation",
  robots: { index: false, follow: false },
};

type Status = "ok" | "already" | "invalid" | "error";

const MESSAGES: Record<Status, { eyebrow: string; title: string; body: string }> = {
  ok: {
    eyebrow: "Success",
    title: "You're confirmed",
    body: "Thanks for confirming. We've sent a quick welcome email. The first weekly digest will land in your inbox on Sunday.",
  },
  already: {
    eyebrow: "Already subscribed",
    title: "You're all set",
    body: "Looks like you'd already confirmed this email. Nothing more to do — sit back and wait for the next digest.",
  },
  invalid: {
    eyebrow: "Link expired",
    title: "We couldn't confirm that link",
    body: "That confirmation link is no longer valid. If you signed up recently, try subscribing again from the footer and we'll send a fresh link.",
  },
  error: {
    eyebrow: "Something went wrong",
    title: "Confirmation didn't go through",
    body: "We hit an unexpected error confirming your subscription. Please try the link again, or contact hello@tiphub.rs if it keeps failing.",
  },
};

export default async function NewsletterConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const key = (["ok", "already", "invalid", "error"] as Status[]).includes(status as Status)
    ? (status as Status)
    : "ok";
  const msg = MESSAGES[key];

  return (
    <section className="pad-section">
      <div className="container stack">
        <SectionTitle eyebrow={msg.eyebrow} title={msg.title} description={msg.body} />
        <div className="row" style={{ gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/blog" className="btn btn-primary">Read the blog →</Link>
          <Link href="/tips" className="btn btn-ghost">Browse tips</Link>
        </div>
      </div>
    </section>
  );
}
