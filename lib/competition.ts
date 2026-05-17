import { getSupabaseServerClient } from "@/lib/supabase-server";

export type UserLevel = "Rookie" | "Tactician" | "Pro" | "Expert" | "Legend";
export type SubmissionStatus = "pending" | "won" | "lost";

export interface CompetitionUser {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

export interface CompetitionSubmission {
  id: string;
  userId: string;
  matchId: string;
  market: string;
  prediction: string;
  odds: number;
  stake: number;
  status: SubmissionStatus;
  resultAmount: number;
  createdAt: string;
}

export interface CompetitionStats {
  resolvedTips: number;
  pendingTips: number;
  wins: number;
  losses: number;
  winRate: number;
  roi: number;
  totalStake: number;
  totalReturn: number;
  score: number;
}

export interface CompetitionLeaderboardEntry extends CompetitionUser {
  level: UserLevel;
  stats: CompetitionStats;
}

type UserRow = { id: string; name: string; email: string; joined_at: string };
type SubmissionRow = {
  id: string;
  user_id: string;
  match_id: string;
  market: string;
  prediction: string;
  odds: number | string;
  stake: number | string;
  status: SubmissionStatus;
  result_amount: number | string;
  created_at: string;
};

function rowToUser(row: UserRow): CompetitionUser {
  return { id: row.id, name: row.name, email: row.email, joinedAt: row.joined_at };
}

function rowToSubmission(row: SubmissionRow): CompetitionSubmission {
  return {
    id: row.id,
    userId: row.user_id,
    matchId: row.match_id,
    market: row.market,
    prediction: row.prediction,
    odds: Number(row.odds),
    stake: Number(row.stake),
    status: row.status,
    resultAmount: Number(row.result_amount),
    createdAt: row.created_at,
  };
}

export function computeCompetitionStats(submissions: CompetitionSubmission[]): CompetitionStats {
  const pendingTips = submissions.filter((s) => s.status === "pending").length;
  const resolved = submissions.filter((s) => s.status !== "pending");
  const wins = resolved.filter((s) => s.status === "won").length;
  const losses = resolved.filter((s) => s.status === "lost").length;
  const totalStake = resolved.reduce((sum, s) => sum + s.stake, 0);
  const totalReturn = resolved.reduce((sum, s) => sum + (s.status === "won" ? s.resultAmount : 0), 0);
  const resolvedTips = resolved.length;
  const winRate = resolvedTips ? Math.round((wins / resolvedTips) * 100) : 0;
  const roi = resolvedTips && totalStake ? Number((((totalReturn - totalStake) / totalStake) * 100).toFixed(1)) : 0;
  const score = Number((roi * 1.2 + winRate * 0.5 + Math.min(resolvedTips, 100) * 0.2).toFixed(1));

  return { resolvedTips, pendingTips, wins, losses, winRate, roi, totalStake, totalReturn, score };
}

export function getUserLevel(stats: CompetitionStats): UserLevel {
  if (stats.resolvedTips < 5) return "Rookie";
  if (stats.score >= 85 && stats.resolvedTips >= 35) return "Legend";
  if (stats.score >= 70 && stats.resolvedTips >= 25) return "Expert";
  if (stats.score >= 55 && stats.resolvedTips >= 15) return "Pro";
  if (stats.score >= 35 && stats.resolvedTips >= 5) return "Tactician";
  return "Rookie";
}

export function getLevelBadgeClass(level: UserLevel) {
  switch (level) {
    case "Legend": return "badge badge--gold";
    case "Expert": return "badge badge--pitch";
    case "Pro": return "badge badge--violet";
    case "Tactician": return "badge badge--blue";
    default: return "badge badge--orange";
  }
}

export async function buildLeaderboard(): Promise<CompetitionLeaderboardEntry[]> {
  const supabase = getSupabaseServerClient();
  const [usersRes, subsRes] = await Promise.all([
    supabase.from("competition_users").select(),
    supabase.from("competition_submissions").select(),
  ]);
  if (usersRes.error) throw new Error(`Load users failed: ${usersRes.error.message}`);
  if (subsRes.error) throw new Error(`Load submissions failed: ${subsRes.error.message}`);

  const users = (usersRes.data as UserRow[]).map(rowToUser);
  const submissions = (subsRes.data as SubmissionRow[]).map(rowToSubmission);

  return users
    .map((user) => {
      const userSubs = submissions.filter((s) => s.userId === user.id);
      const stats = computeCompetitionStats(userSubs);
      return { ...user, stats, level: getUserLevel(stats) };
    })
    .sort((a, b) => {
      if (b.stats.score !== a.stats.score) return b.stats.score - a.stats.score;
      if (b.stats.resolvedTips !== a.stats.resolvedTips) return b.stats.resolvedTips - a.stats.resolvedTips;
      return a.name.localeCompare(b.name);
    });
}

export async function getAllSubmissions(): Promise<CompetitionSubmission[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("competition_submissions")
    .select()
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Load submissions failed: ${error.message}`);
  return (data as SubmissionRow[]).map(rowToSubmission);
}

export async function getPendingSubmissions(): Promise<CompetitionSubmission[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("competition_submissions")
    .select()
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Load pending submissions failed: ${error.message}`);
  return (data as SubmissionRow[]).map(rowToSubmission);
}

export async function createOrFindCompetitionUser(name: string, email: string): Promise<CompetitionUser> {
  const supabase = getSupabaseServerClient();
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  const { data: existing, error: findErr } = await supabase
    .from("competition_users")
    .select()
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (findErr) throw new Error(`Lookup user failed: ${findErr.message}`);

  if (existing) {
    if ((existing as UserRow).name !== trimmedName) {
      const { data: updated, error: updErr } = await supabase
        .from("competition_users")
        .update({ name: trimmedName })
        .eq("id", (existing as UserRow).id)
        .select()
        .single();
      if (updErr) throw new Error(`Update user name failed: ${updErr.message}`);
      return rowToUser(updated as UserRow);
    }
    return rowToUser(existing as UserRow);
  }

  const { data: inserted, error: insErr } = await supabase
    .from("competition_users")
    .insert({ name: trimmedName, email: normalizedEmail })
    .select()
    .single();
  if (insErr || !inserted) throw new Error(`Create user failed: ${insErr?.message ?? "no row"}`);
  return rowToUser(inserted as UserRow);
}

export async function addCompetitionSubmission(input: {
  userId: string;
  matchId: string;
  market: string;
  prediction: string;
  odds: number;
  stake: number;
}): Promise<CompetitionSubmission> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("competition_submissions")
    .insert({
      user_id: input.userId,
      match_id: input.matchId.trim(),
      market: input.market.trim(),
      prediction: input.prediction.trim(),
      odds: input.odds,
      stake: input.stake,
    })
    .select()
    .single();
  if (error || !data) throw new Error(`Insert submission failed: ${error?.message ?? "no row"}`);
  return rowToSubmission(data as SubmissionRow);
}

export async function resolveCompetitionSubmission(
  submissionId: string,
  status: "won" | "lost",
): Promise<CompetitionSubmission | undefined> {
  const supabase = getSupabaseServerClient();
  const { data: current, error: loadErr } = await supabase
    .from("competition_submissions")
    .select()
    .eq("id", submissionId)
    .maybeSingle();
  if (loadErr) throw new Error(`Load submission failed: ${loadErr.message}`);
  if (!current) return undefined;
  if ((current as SubmissionRow).status !== "pending") {
    throw new Error("Submission already resolved.");
  }

  const sub = rowToSubmission(current as SubmissionRow);
  const resultAmount = status === "won" ? Number((sub.stake * sub.odds).toFixed(2)) : 0;

  const { data: updated, error: updErr } = await supabase
    .from("competition_submissions")
    .update({ status, result_amount: resultAmount })
    .eq("id", submissionId)
    .select()
    .maybeSingle();
  if (updErr) throw new Error(`Resolve submission failed: ${updErr.message}`);
  return updated ? rowToSubmission(updated as SubmissionRow) : undefined;
}
