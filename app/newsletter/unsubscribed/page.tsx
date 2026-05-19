import type { Metadata } from "next";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "Unsubscribed",
  robots: { index: false, follow: false },
};

type Status = "ok" | "already" | "invalid" | "error";

const MESSAGES: Record<Status, { eyebrow: string; title: string; body: string }> = {
  ok: {
    eyebrow: "Unsubscribed",
    title: "You're off the list",
    body: "We won't send you any more newsletter emails. If you change your mind, you can resubscribe from the footer at any time.",
  },
  already: {
    eyebrow: "Already off",
    title: "Already unsubscribed",
    body: "This address is already removed from the newsletter list. No further action needed.",
  },
  invalid: {
    eyebrow: "Link expired",
    title: "We couldn't process that link",
    body: "The unsubscribe link is invalid or already used. If you're still getting emails, email hello@tiphub.rs and we'll remove you manually.",
  },
  error: {
    eyebrow: "Something went wrong",
    title: "Unsubscribe failed",
    body: "We hit an unexpected error. Please try the link again, or contact hello@tiphub.rs.",
  },
};

export default async function NewsletterUnsubscribedPage({
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
        <div>
          <Link href="/" className="btn btn-primary">Back to home →</Link>
        </div>
      </div>
    </section>
  );
}
