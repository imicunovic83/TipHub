import { NextResponse } from "next/server";
import { createTip, type TipMarket } from "@/lib/tipster-tips";
import { getMatchById, bookmakers } from "@/lib/data";
import { getAccessTokenFromRequest, getSupabaseUserFromToken } from "@/lib/supabase-server";
import { deriveBookmakerOdds, isValidPrediction } from "@/lib/competition-markets";

const ALLOWED_MARKETS: TipMarket[] = ["1X2", "Over/Under 2.5", "BTTS", "Asian Handicap", "Correct Score"];

export async function POST(request: Request) {
  const token = getAccessTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getSupabaseUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = user.user_metadata?.role;
  if (role !== "tipster" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden — tipster role required." }, { status: 403 });
  }

  const body = await request.json();
  const matchId = String(body.matchId ?? "").trim();
  const market = String(body.market ?? "").trim() as TipMarket;
  const prediction = String(body.prediction ?? "").trim();
  const shortReason = String(body.shortReason ?? "").trim();
  const analysis = typeof body.analysis === "string" ? body.analysis.trim() : "";
  const oddsBookmaker = String(body.oddsBookmaker ?? "").trim();
  const confidence = Number(body.confidence);

  if (!matchId || !getMatchById(matchId)) {
    return NextResponse.json({ error: "Pick a valid match." }, { status: 400 });
  }
  if (!ALLOWED_MARKETS.includes(market)) {
    return NextResponse.json({ error: "Pick a valid market." }, { status: 400 });
  }
  if (!prediction) return NextResponse.json({ error: "Prediction is required." }, { status: 400 });
  if (!isValidPrediction(market, prediction)) {
    return NextResponse.json(
      { error: "Pick one of the offered predictions for that market." },
      { status: 400 },
    );
  }
  if (!shortReason) return NextResponse.json({ error: "A short reason is required." }, { status: 400 });
  if (!oddsBookmaker || !bookmakers.some((b) => b.slug === oddsBookmaker)) {
    return NextResponse.json({ error: "Pick a known bookmaker." }, { status: 400 });
  }
  if (![1, 2, 3, 4, 5].includes(confidence)) {
    return NextResponse.json({ error: "Confidence must be between 1 and 5." }, { status: 400 });
  }

  // Odds are derived server-side from (match, market, prediction, bookmaker) —
  // tipster never gets to choose the number, so they can't claim a phantom
  // 50.0 price that no book actually offered.
  const oddsValue = deriveBookmakerOdds(matchId, market, prediction, oddsBookmaker);

  const tipsterName =
    typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : (user.email ?? "Tipster");

  const tip = await createTip({
    tipsterUserId: user.id,
    tipsterName,
    matchId,
    market,
    prediction,
    shortReason,
    analysis: analysis || undefined,
    oddsValue,
    oddsBookmaker,
    confidence: confidence as 1 | 2 | 3 | 4 | 5,
  });

  return NextResponse.json({ success: true, tip });
}
