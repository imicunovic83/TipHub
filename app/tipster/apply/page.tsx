import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SectionTitle from "@/components/SectionTitle";
import TipsterApplicationForm from "@/components/TipsterApplicationForm";
import { ACCESS_TOKEN_COOKIE, getSupabaseUserFromToken } from "@/lib/supabase-server";
import { getLatestApplicationForUser } from "@/lib/applications";

const STATUS_COPY: Record<
  "pending" | "approved" | "rejected",
  { badgeClass: string; label: string; description: string }
> = {
  pending: {
    badgeClass: "badge badge--orange",
    label: "Pending review",
    description:
      "We received your application. An admin will review it shortly — you'll get tipster access automatically once it's approved.",
  },
  approved: {
    badgeClass: "badge badge--pitch",
    label: "Approved",
    description:
      "Your application was approved. You can now post tips with your tipster profile.",
  },
  rejected: {
    badgeClass: "badge badge--rose",
    label: "Rejected",
    description:
      "Your application wasn't approved this time. You can submit a new application below with additional context.",
  },
};

export default async function TipsterApplicationPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    redirect("/login?next=/tipster/apply");
  }

  const user = await getSupabaseUserFromToken(token);
  if (!user) {
    redirect("/login?next=/tipster/apply");
  }

  const alreadyTipster = user.user_metadata?.role === "tipster" || user.user_metadata?.role === "admin";

  const existing = await getLatestApplicationForUser(user.id);

  return (
    <section className="pad-section">
      <div className="container" style={{ maxWidth: "720px" }}>
        <SectionTitle
          eyebrow="Apply as tipster"
          title="Join TipHub as a tipster"
          description="Share your predictions with the community, build a following, and compete on our leaderboard."
        />

        {alreadyTipster ? (
          <div className="panel" style={{ marginTop: "2rem" }}>
            <h3 className="title-section" style={{ marginTop: 0 }}>You're already a tipster</h3>
            <p>Your account already has tipster access. Head over to your profile to manage your tips.</p>
            <Link href="/profile" className="btn btn-primary">Go to profile</Link>
          </div>
        ) : existing && existing.status !== "rejected" ? (
          <div className="panel" style={{ marginTop: "2rem" }}>
            <div className="row" style={{ justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <h3 className="title-section" style={{ margin: 0 }}>Your application</h3>
              <span className={STATUS_COPY[existing.status].badgeClass}>{STATUS_COPY[existing.status].label}</span>
            </div>
            <p>{STATUS_COPY[existing.status].description}</p>
            <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.5rem 1rem", margin: "1rem 0 0" }}>
              <dt className="text-muted-sm">Specialty</dt>
              <dd style={{ margin: 0 }}>{existing.specialty}</dd>
              <dt className="text-muted-sm">Bio</dt>
              <dd style={{ margin: 0, whiteSpace: "pre-wrap" }}>{existing.bio}</dd>
              <dt className="text-muted-sm">Submitted</dt>
              <dd style={{ margin: 0 }}>{new Date(existing.submittedAt).toLocaleString()}</dd>
            </dl>
          </div>
        ) : (
          <>
            {existing?.status === "rejected" ? (
              <div className="panel" style={{ marginTop: "2rem" }}>
                <div className="row" style={{ justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  <h3 className="title-section" style={{ margin: 0 }}>Previous application</h3>
                  <span className={STATUS_COPY.rejected.badgeClass}>{STATUS_COPY.rejected.label}</span>
                </div>
                <p>{STATUS_COPY.rejected.description}</p>
                {existing.note ? (
                  <p className="text-muted-sm" style={{ marginTop: "0.5rem" }}>
                    <strong>Reviewer note:</strong> {existing.note}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="panel" style={{ marginTop: "2rem" }}>
              <TipsterApplicationForm />
            </div>
          </>
        )}

        <div className="panel" style={{ marginTop: "1rem" }}>
          <p>
            Signed in as <strong>{user.email}</strong>. Not you? <Link href="/login">Switch account.</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
