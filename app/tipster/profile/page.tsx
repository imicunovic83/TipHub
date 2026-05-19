import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SectionTitle from "@/components/SectionTitle";
import TipsterProfileEditor from "@/components/TipsterProfileEditor";
import { ACCESS_TOKEN_COOKIE, getSupabaseUserFromToken } from "@/lib/supabase-server";
import { getTipsterProfileByUserId } from "@/lib/tipster-profiles";

export const metadata: Metadata = {
  title: "Edit your tipster profile",
  robots: { index: false, follow: false },
};

export default async function TipsterProfileEditPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) redirect("/login?next=/tipster/profile");

  const user = await getSupabaseUserFromToken(token);
  if (!user) redirect("/login?next=/tipster/profile");

  const role = user.user_metadata?.role;
  if (role !== "tipster" && role !== "admin") {
    redirect("/tipster/apply");
  }

  const profile = await getTipsterProfileByUserId(user.id);
  if (!profile) redirect("/tipster/apply");

  return (
    <section className="pad-section">
      <div className="container" style={{ maxWidth: 720 }}>
        <nav className="back-nav">
          <Link href="/tipster/dashboard">← Back to dashboard</Link>
        </nav>

        <SectionTitle
          eyebrow="Tipster"
          title="Edit your profile"
          description="Update what people see on your public profile page and tipster cards. Your stats and tip history aren't editable — those reflect what actually happened."
        />

        <div className="surface" style={{ marginTop: "1.5rem" }}>
          <TipsterProfileEditor
            initial={{
              name: profile.name,
              specialty: profile.specialty,
              shortBio: profile.shortBio,
              longBio: profile.longBio,
              slug: profile.slug,
            }}
          />
        </div>
      </div>
    </section>
  );
}
