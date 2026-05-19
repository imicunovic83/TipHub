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
  const { matchId, market, prediction, odds, stake } = body as {
    matchId?: string;
    market?: string;
    prediction?: string;
    odds?: number;
    stake?: number;
  };

  if (!matchId?.trim() || !market?.trim() || !prediction?.trim()) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }
  if (typeof odds !== "number" || odds <= 1) {
    return NextResponse.json({ error: "Odds must be a number greater than 1." }, { status: 400 });
  }
  if (typeof stake !== "number" || stake <= 0) {
    return NextResponse.json({ error: "Stake must be a positive number." }, { status: 400 });
  }

  const displayName =
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
