import { NextResponse } from "next/server";
import {
  bookmakers,
  getAllTips,
  getMatchById,
  getTeamByCode,
  getTipsterBySlug,
} from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const market = searchParams.get("market");
  const tipster = searchParams.get("tipster");

  let tips = getAllTips();

  if (q) {
    const needle = q.toLowerCase();
    tips = tips.filter((t) => {
      const match = getMatchById(t.matchId);
      const home = match ? getTeamByCode(match.homeCode) : undefined;
      const away = match ? getTeamByCode(match.awayCode) : undefined;
      const tipsterObj = getTipsterBySlug(t.tipsterSlug);
      const haystack = [
        home?.name,
        away?.name,
        tipsterObj?.name,
        t.prediction,
        t.market,
        t.shortReason,
        ...t.odds.map((o) => bookmakers.find((b) => b.slug === o.bookmaker)?.name ?? ""),
      ].filter(Boolean).join(" ").toLowerCase();
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
