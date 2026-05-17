import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SectionTitle from "@/components/SectionTitle";
import NewTipForm from "@/components/NewTipForm";
import { ACCESS_TOKEN_COOKIE, getSupabaseUserFromToken } from "@/lib/supabase-server";
import { computeTipsterStats, getTipsForTipster } from "@/lib/tipster-tips";
import { bookmakers, getAllMatches, getMatchById, getTeamByCode } from "@/lib/data";

function formatMatchLabel(matchId: string) {
  const match = getMatchById(matchId);
  if (!match) return matchId;
  const home = getTeamByCode(match.homeCode);
  const away = getTeamByCode(match.awayCode);
  return `${match.group} · ${home?.name ?? match.homeCode} vs ${away?.name ?? match.awayCode}`;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "badge badge--orange",
  won: "badge badge--pitch",
  lost: "badge badge--rose",
};

export default async function TipsterDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) redirect("/login?next=/tipster/dashboard");

  const user = await getSupabaseUserFromToken(token);
  if (!user) redirect("/login?next=/tipster/dashboard");

  const role = user.user_metadata?.role;
  if (role !== "tipster" && role !== "admin") {
    redirect("/tipster/apply");
  }

  const tips = await getTipsForTipster(user.id);
  const stats = computeTipsterStats(tips);

  const matches = getAllMatches().map((m) => ({ id: m.id, label: formatMatchLabel(m.id) }));
  const bookmakerOptions = bookmakers.map((b) => ({ slug: b.slug, name: b.name }));

  const displayName =
    typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : (user.email ?? "Tipster");

  return (
    <section className="pad-section">
      <div className="container" style={{ maxWidth: "960px" }}>
        <SectionTitle
          eyebrow="Tipster dashboard"
          title={`Welcome back, ${displayName}`}
          description="Post a new tip, review your pending picks, and watch your record build up as the admin resolves matches."
        />

        <div className="panel" style={{ marginTop: "1.5rem" }}>
          <div className="competition-summary">
            <div className="competition-stat">
              <div className="competition-stat-name">Tips posted</div>
              <div className="competition-stat-value">{stats.total}</div>
            </div>
            <div className="competition-stat">
              <div className="competition-stat-name">Pending</div>
              <div className="competition-stat-value">{stats.pending}</div>
            </div>
            <div className="competition-stat">
              <div className="competition-stat-name">Win rate</div>
              <div className="competition-stat-value">{stats.winRate}%</div>
            </div>
            <div className="competition-stat">
              <div className="competition-stat-name">ROI (flat 1u)</div>
              <div className="competition-stat-value">{stats.roi}%</div>
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginTop: "1rem" }}>
          <h3 className="title-section" style={{ marginTop: 0 }}>Post a new tip</h3>
          <NewTipForm matches={matches} bookmakers={bookmakerOptions} />
        </div>

        <div className="panel" style={{ marginTop: "1rem" }}>
          <h3 className="title-section" style={{ marginTop: 0 }}>Your tips</h3>
          {tips.length === 0 ? (
            <p className="text-muted-sm">You haven&apos;t posted any tips yet. The form above is where to start.</p>
          ) : (
            <div className="stack" style={{ gap: "0.75rem" }}>
              {tips.map((tip) => (
                <div key={tip.id} className="panel">
                  <div className="row" style={{ justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="row" style={{ gap: "0.5rem", alignItems: "center" }}>
                        <span className={STATUS_BADGE[tip.status] ?? "badge"}>{tip.status}</span>
                        <span className="text-muted-sm">{tip.market}</span>
                        <span className="text-muted-sm">·</span>
                        <span className="text-muted-sm">{formatMatchLabel(tip.matchId)}</span>
                      </div>
                      <p style={{ margin: "0.5rem 0 0", fontWeight: 700 }}>{tip.prediction}</p>
                      <p className="text-muted-sm" style={{ margin: "0.25rem 0 0" }}>{tip.shortReason}</p>
                    </div>
                    <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", color: "var(--pitch-700)" }}>
                        {tip.oddsValue.toFixed(2)}
                      </div>
                      <div className="text-muted-sm">@ {tip.oddsBookmaker}</div>
                      <div className="text-muted-sm" style={{ marginTop: "0.25rem" }}>
                        {"★".repeat(tip.confidence)}{"☆".repeat(5 - tip.confidence)}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-sm" style={{ margin: "0.75rem 0 0", fontSize: "0.75rem" }}>
                    posted {new Date(tip.postedAt).toLocaleString()}
                    {tip.resolvedAt ? ` · resolved ${new Date(tip.resolvedAt).toLocaleString()}` : null}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel" style={{ marginTop: "1rem" }}>
          <p>
            Signed in as <strong>{user.email}</strong> ({role}). <Link href="/profile">Profile</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
