import Link from "next/link";
import { headers } from "next/headers";
import { getMatchById, getTeamByCode, type Tip } from "@/lib/data";
import { getMergedTipsters } from "@/lib/merged-data";
import SectionTitle from "@/components/SectionTitle";
import TipCard from "@/components/TipCard";

interface SearchResponse {
  count: number;
  tips: Tip[];
}

async function fetchSearchResults(q: string): Promise<SearchResponse | null> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}/api/tips?q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const raw = sp.q ?? "";
  const trimmed = raw.trim();

  const [data, allTipsters] = await Promise.all([
    fetchSearchResults(trimmed),
    getMergedTipsters(),
  ]);
  const { count, tips } = data ?? { count: 0, tips: [] };
  const tipsterBySlug = new Map(allTipsters.map((t) => [t.slug, t]));

  // Build a small "see also" list of matching teams/tipsters so the search
  // surfaces information beyond just tips. This is the multi-field aspect.
  const q = trimmed.toLowerCase();
  const teamMatches = q
    ? tips
        .map((t) => getMatchById(t.matchId))
        .filter((m): m is NonNullable<typeof m> => Boolean(m))
        .flatMap((m) => [getTeamByCode(m.homeCode), getTeamByCode(m.awayCode)])
        .filter((team): team is NonNullable<typeof team> => Boolean(team))
        .filter((team) => team.name.toLowerCase().includes(q))
    : [];
  const uniqueTeams = Array.from(new Map(teamMatches.map((t) => [t.code, t])).values());

  const tipsterHits = q
    ? tips
        .map((t) => tipsterBySlug.get(t.tipsterSlug))
        .filter((t): t is NonNullable<typeof t> => Boolean(t))
        .filter((t) => t.name.toLowerCase().includes(q))
    : [];
  const uniqueTipsters = Array.from(new Map(tipsterHits.map((t) => [t.slug, t])).values());

  return (
    <section className="pad-section">
      <div className="container">
        <div className="stack">
          <SectionTitle
            eyebrow="Search"
            title="Search results"
            description={
              trimmed
                ? `Found ${count} ${count === 1 ? "tip" : "tips"} for "${trimmed}". Bookmaker queries only show tips where that bookmaker has the best odds; other terms match team names, tipsters, prediction text, and markets.`
                : "Type a team, tipster, market, or bookmaker name into the header search. For bookmakers, results are limited to tips where that bookmaker offers the best odds."
            }
          />

          {trimmed && (uniqueTeams.length > 0 || uniqueTipsters.length > 0) ? (
            <div className="surface">
              <h2 className="surface-title">Quick links</h2>
              <div className="row">
                {uniqueTeams.map((team) => (
                  <span key={team.code} className="badge badge--pitch">{team.flag} {team.name}</span>
                ))}
                {uniqueTipsters.map((t) => (
                  <Link key={t.slug} href={`/tipsters/${t.slug}`} className="badge badge--gold">
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {tips.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" aria-hidden="true">🔎</div>
              <p className="empty-state-title">{trimmed ? "No matches" : "Type something to search"}</p>
              <p className="empty-state-body">
                {trimmed
                  ? "Try a team name (e.g. Brazil), a tipster (e.g. Marko), a bookmaker (e.g. Mozzart), or a market (e.g. Over/Under)."
                  : "The search runs across teams, tipsters, bookmakers, and prediction text."}
              </p>
              <Link href="/tips" className="btn btn-primary">Browse all tips</Link>
            </div>
          ) : (
            <div className="grid-cards">
              {tips.map((tip) => (
                <TipCard
                  key={tip.id}
                  tip={tip}
                  tipsterName={tipsterBySlug.get(tip.tipsterSlug)?.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
