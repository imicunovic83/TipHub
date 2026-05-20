import { NextResponse } from "next/server";
import {
  addCompetitionSubmission,
  buildLeaderboard,
  findOrCreateCompetitionUserForAuth,
  getAllSubmissions,
} from "@/lib/competition";
import {
  getAccessTokenFromRequest,
  getSupabaseUserFromToken,
} from "@/lib/supabase-server";
import { deriveCompetitionOdds, isValidPrediction } from "@/lib/competition-markets";

export async function GET() {
  const [leaderboard, submissions] = await Promise.all([buildLeaderboard(), getAllSubmissions()]);
  return NextResponse.json({ leaderboard, submissions });
}

export async function POST(request: Request) {
  const token = getAccessTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Log in to submit a community pick." }, { status: 401 });
  }
  const user = await getSupabaseUserFromToken(token);
  if (!user || !user.email) {
    return NextResponse.json({ error: "Log in to submit a community pick." }, { status: 401 });
  }

  const body = await request.json();
  const { matchId, market, prediction, confidence } = body as {
    matchId?: string;
    market?: string;
    prediction?: string;
    confidence?: number;
  };

  if (!matchId?.trim() || !market?.trim() || !prediction?.trim()) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }
  // Prediction must be one of the fixed options for the chosen market — no
  // free-form values like "22".
  if (!isValidPrediction(market, prediction)) {
    return NextResponse.json(
      { error: "Pick one of the offered predictions for that market." },
      { status: 400 },
    );
  }
  // Confidence is a bounded 1-10 scale that doubles as the stake — replaces the
  // old free-form stake so the leaderboard can't be gamed with a huge wager.
  if (!Number.isInteger(confidence) || (confidence as number) < 1 || (confidence as number) > 10) {
    return NextResponse.json(
      { error: "Confidence must be a whole number from 1 to 10." },
      { status: 400 },
    );
  }
  const stake = confidence as number;

  // Odds are derived server-side from the selection — never trusted from the
  // client, so a competitor can't inflate their ROI by sending custom odds.
  const odds = deriveCompetitionOdds(matchId, market, prediction);

  const displayName =
    (typeof user.user_metadata?.nickname === "string" && user.user_metadata.nickname.trim()) ||
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
    user.email.split("@")[0];

  const competitionUser = await findOrCreateCompetitionUserForAuth({
    authUserId: user.id,
    name: displayName,
    email: user.email,
  });

  const submission = await addCompetitionSubmission({
    userId: competitionUser.id,
    matchId,
    market,
    prediction,
    odds,
    stake,
  });

  const leaderboard = await buildLeaderboard();
  return NextResponse.json({ submission, leaderboard });
}
