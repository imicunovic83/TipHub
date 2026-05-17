import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SectionTitle from "@/components/SectionTitle";
import { createSupabaseUserClient, getSupabaseUserFromToken, ACCESS_TOKEN_COOKIE } from "@/lib/supabase-server";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    redirect("/login");
  }

  const user = await getSupabaseUserFromToken(token);
  if (!user) {
    redirect("/login");
  }

  const supabase = createSupabaseUserClient(token);
  const { data: profile, error } = await supabase.from("profiles").select("*").single();

  if (error && !profile) {
    console.error("Failed to load profile:", error.message);
  }

  return (
    <section className="pad-section">
      <div className="container" style={{ maxWidth: 720 }}>
        <SectionTitle eyebrow="Profile" title="Your account" description="Manage your account details and preferences." />

        <div className="panel" style={{ marginTop: "1.5rem" }}>
          <div className="stack">
            <div className="row" style={{ gap: 16, alignItems: "center" }}>
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="avatar" style={{ width: 72, height: 72, borderRadius: 999 }} />
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: 999, background: "var(--pitch-100)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                  {String(user.email)[0]}
                </div>
              )}
              <div>
                <h3 style={{ margin: 0 }}>{profile?.full_name ?? user.user_metadata?.full_name ?? user.email}</h3>
                <p className="text-muted-sm" style={{ margin: 0 }}>{user.email}</p>
              </div>
            </div>

            <div>
              <h4 className="title-section">Profile data</h4>
              {profile ? (
                <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(profile, null, 2)}</pre>
              ) : (
                <p className="text-muted-sm">Your Supabase profile row is not yet created.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
