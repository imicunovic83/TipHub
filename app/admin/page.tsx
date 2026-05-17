import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SectionTitle from "@/components/SectionTitle";
import AdminDashboardClient from "@/components/AdminDashboardClient";
import { getSupabaseUserFromToken, ACCESS_TOKEN_COOKIE } from "@/lib/supabase-server";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    redirect("/login");
  }

  const user = await getSupabaseUserFromToken(token);
  if (!user || user.user_metadata?.role !== "admin") {
    redirect("/login");
  }

  return (
    <section className="pad-section">
      <div className="container">
        <SectionTitle
          eyebrow="Admin"
          title="Review tipster applications and competition results"
          description="Approve or reject new tipster candidates and resolve pending community competition submissions from the admin dashboard."
        />
        <div className="panel" style={{ marginTop: "2rem" }}>
          <AdminDashboardClient />
        </div>
      </div>
    </section>
  );
}
