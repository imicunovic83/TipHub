import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import LogoutButton from "@/components/LogoutButton";
import AvatarPicker from "@/components/AvatarPicker";
import AccountEditForm from "@/components/AccountEditForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";
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

  const currentAvatar = profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null;
  const initialFavoriteTipster = profile?.favorite_tipster ?? "";

  return (
    <section className="pad-section">
      <div className="container" style={{ maxWidth: 720 }}>
        <SectionTitle eyebrow="Profile" title="Your account" description="Manage your account details and preferences." />

        <div className="panel" style={{ marginTop: "1.5rem" }}>
          <div className="stack">
            <div className="row" style={{ gap: 16, alignItems: "center" }}>
              {currentAvatar ? (
                <img src={currentAvatar} alt="avatar" style={{ width: 72, height: 72, borderRadius: 999 }} />
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
              <h4 className="title-section">Account details</h4>
              {profile ? (
                <dl className="profile-detail-list">
                  <div className="profile-detail-row">
                    <dt>Full name</dt>
                    <dd>{profile.full_name?.trim() || <span className="text-muted-sm">Not set</span>}</dd>
                  </div>
                  <div className="profile-detail-row">
                    <dt>Email</dt>
                    <dd>{profile.email ?? user.email}</dd>
                  </div>
                  <div className="profile-detail-row">
                    <dt>Favorite tipster</dt>
                    <dd>{profile.favorite_tipster?.trim() || <span className="text-muted-sm">None yet</span>}</dd>
                  </div>
                  <div className="profile-detail-row">
                    <dt>Member since</dt>
                    <dd>
                      {profile.created_at
                        ? new Date(profile.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "—"}
                    </dd>
                  </div>
                  <div className="profile-detail-row">
                    <dt>Role</dt>
                    <dd>{user.user_metadata?.role ?? "member"}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-muted-sm">Your Supabase profile row is not yet created.</p>
              )}
            </div>

            {(user.user_metadata?.role === "tipster" || user.user_metadata?.role === "admin") ? (
              <div>
                <h4 className="title-section">Tipster tools</h4>
                <div className="row" style={{ gap: "0.75rem", flexWrap: "wrap" }}>
                  <Link href="/tipster/dashboard" className="btn btn-primary">Open dashboard</Link>
                  <Link href="/tipster/profile" className="btn btn-ghost">Edit public profile</Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="surface" style={{ marginTop: "1.5rem" }}>
          <h4 className="surface-title">Avatar</h4>
          <AvatarPicker initialAvatarUrl={currentAvatar} email={user.email ?? ""} />
        </div>

        <div className="surface" style={{ marginTop: "1.5rem" }}>
          <h4 className="surface-title">Account details</h4>
          <AccountEditForm initial={{ favoriteTipster: initialFavoriteTipster }} />
        </div>

        <div className="surface" style={{ marginTop: "1.5rem" }}>
          <h4 className="surface-title">Change password</h4>
          <p className="text-muted-sm" style={{ margin: "0 0 0.75rem" }}>
            Updates your sign-in password. You stay signed in on this device after the change.
          </p>
          <ChangePasswordForm />
        </div>

        <div className="surface" style={{ marginTop: "1.5rem" }}>
          <h4 className="surface-title">Sign out</h4>
          <p className="text-muted-sm" style={{ margin: "0 0 0.75rem" }}>
            Ends this session on this device. You can sign back in from the login page anytime.
          </p>
          <LogoutButton />
        </div>
      </div>
    </section>
  );
}
