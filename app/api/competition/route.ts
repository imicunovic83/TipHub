import { NextResponse } from "next/server";
import { addSubmission, buildLeaderboard, createOrFindUser, readCompetitionStorage, writeCompetitionStorage } from "@/lib/competition";

export async function GET() {
  const storage = await readCompetitionStorage();
  const leaderboard = buildLeaderboard(storage);
  return NextResponse.json({ leaderboard, submissions: storage.submissions });
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

  const storage = await readCompetitionStorage();
  const user = createOrFindUser(storage, name, email);
  const submission = {
    id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    userId: user.id,
    matchId: matchId.trim(),
    market: market.trim(),
    prediction: prediction.trim(),
    odds,
    stake,
    status: "pending" as const,
    resultAmount: 0,
    createdAt: new Date().toISOString(),
  };

  addSubmission(storage, submission);
  await writeCompetitionStorage(storage);

  const leaderboard = buildLeaderboard(storage);
  return NextResponse.json({ submission, leaderboard });
}
