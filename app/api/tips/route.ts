import { NextResponse } from "next/server";
import { bestOddsForTip, getMatchById, getTeamByCode } from "@/lib/data";
import { getMergedTips, getMergedTipsters } from "@/lib/merged-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const market = searchParams.get("market");
  const tipster = searchParams.get("tipster");

  const [allTips, allTipsters] = await Promise.all([getMergedTips(), getMergedTipsters()]);
  const tipsterNameBySlug = new Map(allTipsters.map((t) => [t.slug, t.name]));

  let tips = allTips;

  if (q) {
    const needle = q.toLowerCase();
    tips = tips.filter((t) => {
      const match = getMatchById(t.matchId);
      const home = match ? getTeamByCode(match.homeCode) : undefined;
      const away = match ? getTeamByCode(match.awayCode) : undefined;
      const tipsterName = tipsterNameBySlug.get(t.tipsterSlug);
      // Bookmaker is treated as a "best odds" filter — searching "Maxbet"
      // should only surface tips where Maxbet has the highest odds, not
      // every tip (since every tip carries all five operators).
      const best = bestOddsForTip(t);
      const bestBookmaker = best.bookmaker.name;

      const haystack = [
        home?.name,
        away?.name,
        tipsterName,
        t.prediction,
        t.market,
        t.shortReason,
        bestBookmaker,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }

  if (market) {
    tips = tips.filter((t) => t.market === market);
  }

  if (tipster) {
    tips = tips.filter((t) => t.tipsterSlug === tipster);
  }

  return NextResponse.json({
    count: tips.length,
    tips,
  });
}
