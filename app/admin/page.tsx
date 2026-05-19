import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SectionTitle from "@/components/SectionTitle";
import AdminDashboardClient from "@/components/AdminDashboardClient";
import { getSupabaseUserFromToken, ACCESS_TOKEN_COOKIE } from "@/lib/supabase-server";
import { getAnalyticsSummary } from "@/lib/analytics-admin";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

  let analytics: Awaited<ReturnType<typeof getAnalyticsSummary>> | null = null;
  let analyticsError: string | null = null;
  try {
    analytics = await getAnalyticsSummary();
  } catch (err) {
    analyticsError = err instanceof Error ? err.message : String(err);
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

        <div className="surface" style={{ marginTop: "2rem" }}>
          <h2 className="surface-title">
            Analytics (last 7 days
            {analytics ? `, ${formatDate(analytics.rangeStartISO)} – ${formatDate(analytics.rangeEndISO)}` : ""})
          </h2>

          {analyticsError ? (
            <p className="text-muted-sm" style={{ margin: 0 }}>
              Couldn&apos;t load analytics events: {analyticsError}
            </p>
          ) : analytics ? (
            <div className="stack">
              <div className="analytics-grid">
                <div className="analytics-card">
                  <p className="analytics-card-label">Total events</p>
                  <p className="analytics-card-value">{analytics.totalEvents}</p>
                </div>
                <div className="analytics-card">
                  <p className="analytics-card-label">Unique event names</p>
                  <p className="analytics-card-value">{analytics.uniqueEventNames}</p>
                </div>
                <div className="analytics-card">
                  <p className="analytics-card-label">Variants seen</p>
                  <p className="analytics-card-value">{analytics.byVariant.length}</p>
                </div>
              </div>

              <div className="row" style={{ gap: "1.5rem", flexWrap: "wrap", alignItems: "flex-start" }}>
                <div style={{ flex: "1 1 280px" }}>
                  <h3 className="title-section" style={{ margin: "0 0 0.5rem" }}>Top events</h3>
                  {analytics.byName.length === 0 ? (
                    <p className="text-muted-sm">No events recorded in this window.</p>
                  ) : (
                    <table className="analytics-table">
                      <thead>
                        <tr><th>Name</th><th style={{ textAlign: "right" }}>Count</th></tr>
                      </thead>
                      <tbody>
                        {analytics.byName.map((row) => (
                          <tr key={row.name}>
                            <td>{row.name}</td>
                            <td className="num">{row.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div style={{ flex: "1 1 220px" }}>
                  <h3 className="title-section" style={{ margin: "0 0 0.5rem" }}>By variant</h3>
                  {analytics.byVariant.length === 0 ? (
                    <p className="text-muted-sm">—</p>
                  ) : (
                    <table className="analytics-table">
                      <thead>
                        <tr><th>Variant</th><th style={{ textAlign: "right" }}>Count</th></tr>
                      </thead>
                      <tbody>
                        {analytics.byVariant.map((row) => (
                          <tr key={row.variant}>
                            <td>{row.variant}</td>
                            <td className="num">{row.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div>
                <h3 className="title-section" style={{ margin: "0 0 0.5rem" }}>Recent events</h3>
                {analytics.recent.length === 0 ? (
                  <p className="text-muted-sm">—</p>
                ) : (
                  <table className="analytics-table">
                    <thead>
                      <tr><th>When</th><th>Name</th><th>Variant</th></tr>
                    </thead>
                    <tbody>
                      {analytics.recent.map((row) => (
                        <tr key={row.id}>
                          <td>{formatTime(row.ts)}</td>
                          <td>{row.name}</td>
                          <td>{row.variant}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
