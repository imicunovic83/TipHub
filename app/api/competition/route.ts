import { NextResponse } from "next/server";
import {
  addCompetitionSubmission,
  buildLeaderboard,
  createOrFindCompetitionUser,
  getAllSubmissions,
} from "@/lib/competition";

export async function GET() {
  const [leaderboard, submissions] = await Promise.all([buildLeaderboard(), getAllSubmissions()]);
  return NextResponse.json({ leaderboard, submissions });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, matchId, market, prediction, odds, stake } = body as {
    name?: string;
    email?: string;
    matchId?: string;
    market?: string;
    prediction?: string;
    odds?: number;
    stake?: number;
  };

  if (!name?.trim() || !email?.trim() || !matchId?.trim() || !market?.trim() || !prediction?.trim()) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }
  if (typeof odds !== "number" || odds <= 1) {
    return NextResponse.json({ error: "Odds must be a number greater than 1." }, { status: 400 });
  }
  if (typeof stake !== "number" || stake <= 0) {
    return NextResponse.json({ error: "Stake must be a positive number." }, { status: 400 });
  }

  const user = await createOrFindCompetitionUser(name, email);
  const submission = await addCompetitionSubmission({
    userId: user.id,
    matchId,
    market,
    prediction,
    odds,
    stake,
  });

  const leaderboard = await buildLeaderboard();
  return NextResponse.json({ submission, leaderboard });
}
