import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SectionTitle from "@/components/SectionTitle";
import NewTipForm from "@/components/NewTipForm";
import OwnTipsList, { type OwnTip } from "@/components/OwnTipsList";
import { ACCESS_TOKEN_COOKIE, getSupabaseUserFromToken } from "@/lib/supabase-server";
import { computeTipsterStats, getTipsForTipster } from "@/lib/tipster-tips";
import { bookmakers, getAllMatches, getMatchById, getTeamByCode } from "@/lib/data";
import { getTipsterProfileByUserId } from "@/lib/tipster-profiles";

function formatMatchLabel(matchId: string) {
  const match = getMatchById(matchId);
  if (!match) return matchId;
  const home = getTeamByCode(match.homeCode);
  const away = getTeamByCode(match.awayCode);
  return `${match.group} · ${home?.name ?? match.homeCode} vs ${away?.name ?? match.awayCode}`;
}

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

  const [tips, profile] = await Promise.all([
    getTipsForTipster(user.id),
    getTipsterProfileByUserId(user.id),
  ]);
  const stats = computeTipsterStats(tips);

  const matches = getAllMatches().map((m) => ({ id: m.id, label: formatMatchLabel(m.id) }));
  const bookmakerOptions = bookmakers.map((b) => ({ slug: b.slug, name: b.name }));

  const displayName =
    profile?.name ||
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : (user.email ?? "Tipster"));

  const initialTips: OwnTip[] = tips.map((tip) => ({
    id: tip.id,
    matchId: tip.matchId,
    matchLabel: formatMatchLabel(tip.matchId),
    market: tip.market,
    prediction: tip.prediction,
    shortReason: tip.shortReason,
    analysis: tip.analysis,
    oddsValue: tip.oddsValue,
    oddsBookmaker: tip.oddsBookmaker,
    confidence: tip.confidence,
    status: tip.status,
    postedAt: tip.postedAt,
    resolvedAt: tip.resolvedAt,
  }));

  return (
    <section className="pad-section">
      <div className="container" style={{ maxWidth: "960px" }}>
        <SectionTitle
          eyebrow="Tipster dashboard"
          title={`Welcome back, ${displayName}`}
          description="Post a new tip, edit pending picks, and watch your record build up as the admin resolves matches."
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
          {profile ? (
            <div className="row" style={{ marginTop: "1rem", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <p className="text-muted-sm" style={{ margin: 0 }}>
                Your public profile lives at{" "}
                <Link href={`/tipsters/${profile.slug}`}>/tipsters/{profile.slug}</Link>.
              </p>
              <Link href="/tipster/profile" className="btn btn-ghost">Edit profile</Link>
            </div>
          ) : null}
        </div>

        <div className="panel" style={{ marginTop: "1rem" }}>
          <h3 className="title-section" style={{ marginTop: 0 }}>Post a new tip</h3>
          <NewTipForm matches={matches} bookmakers={bookmakerOptions} />
        </div>

        <div className="panel" style={{ marginTop: "1rem" }}>
          <h3 className="title-section" style={{ marginTop: 0 }}>Your tips</h3>
          <OwnTipsList initialTips={initialTips} matches={matches} bookmakers={bookmakerOptions} />
        </div>

        <div className="panel" style={{ marginTop: "1rem" }}>
          <p>
            Signed in as <strong>{user.email}</strong> ({role}). <Link href="/profile" className="text-link">Profile</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
