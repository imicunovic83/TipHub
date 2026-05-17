import { promises as fs } from "fs";
import path from "path";

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

export interface CompetitionStorage {
  users: CompetitionUser[];
  submissions: CompetitionSubmission[];
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

const storageDir = path.join(process.cwd(), "data");
const storageFile = path.join(storageDir, "competition.json");

const LEVEL_ORDER: UserLevel[] = ["Legend", "Expert", "Pro", "Tactician", "Rookie"];

export async function readCompetitionStorage(): Promise<CompetitionStorage> {
  try {
    const raw = await fs.readFile(storageFile, "utf8");
    return JSON.parse(raw) as CompetitionStorage;
  } catch (error) {
    await fs.mkdir(storageDir, { recursive: true });
    const initial: CompetitionStorage = { users: [], submissions: [] };
    await fs.writeFile(storageFile, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

export async function writeCompetitionStorage(data: CompetitionStorage) {
  await fs.mkdir(storageDir, { recursive: true });
  await fs.writeFile(storageFile, JSON.stringify(data, null, 2), "utf8");
}

export function computeCompetitionStats(submissions: CompetitionSubmission[]): CompetitionStats {
  const pendingTips = submissions.filter((submission) => submission.status === "pending").length;
  const resolved = submissions.filter((submission) => submission.status !== "pending");
  const wins = resolved.filter((submission) => submission.status === "won").length;
  const losses = resolved.filter((submission) => submission.status === "lost").length;
  const totalStake = resolved.reduce((sum, submission) => sum + submission.stake, 0);
  const totalReturn = resolved.reduce(
    (sum, submission) => sum + (submission.status === "won" ? submission.resultAmount : 0),
    0,
  );
  const resolvedTips = resolved.length;
  const winRate = resolvedTips ? Math.round((wins / resolvedTips) * 100) : 0;
  const roi = resolvedTips && totalStake ? Number((((totalReturn - totalStake) / totalStake) * 100).toFixed(1)) : 0;
  const score = Number((roi * 1.2 + winRate * 0.5 + Math.min(resolvedTips, 100) * 0.2).toFixed(1));

  return {
    resolvedTips,
    pendingTips,
    wins,
    losses,
    winRate,
    roi,
    totalStake,
    totalReturn,
    score,
  };
}

export function getUserLevel(stats: CompetitionStats): UserLevel {
  if (stats.resolvedTips < 5) {
    return "Rookie";
  }

  if (stats.score >= 85 && stats.resolvedTips >= 35) {
    return "Legend";
  }

  if (stats.score >= 70 && stats.resolvedTips >= 25) {
    return "Expert";
  }

  if (stats.score >= 55 && stats.resolvedTips >= 15) {
    return "Pro";
  }

  if (stats.score >= 35 && stats.resolvedTips >= 5) {
    return "Tactician";
  }

  return "Rookie";
}

export function getLevelBadgeClass(level: UserLevel) {
  switch (level) {
    case "Legend":
      return "badge badge--gold";
    case "Expert":
      return "badge badge--pitch";
    case "Pro":
      return "badge badge--violet";
    case "Tactician":
      return "badge badge--blue";
    default:
      return "badge badge--orange";
  }
}

export function buildLeaderboard(storage: CompetitionStorage): CompetitionLeaderboardEntry[] {
  return storage.users
    .map((user) => {
      const userSubmissions = storage.submissions.filter((submission) => submission.userId === user.id);
      const stats = computeCompetitionStats(userSubmissions);
      return {
        ...user,
        stats,
        level: getUserLevel(stats),
      };
    })
    .sort((a, b) => {
      if (b.stats.score !== a.stats.score) return b.stats.score - a.stats.score;
      if (b.stats.resolvedTips !== a.stats.resolvedTips) return b.stats.resolvedTips - a.stats.resolvedTips;
      return a.name.localeCompare(b.name);
    });
}

export function createOrFindUser(storage: CompetitionStorage, name: string, email: string): CompetitionUser {
  const normalizedEmail = email.trim().toLowerCase();
  let user = storage.users.find((item) => item.email.toLowerCase() === normalizedEmail);
  if (!user) {
    user = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      email: normalizedEmail,
      joinedAt: new Date().toISOString(),
    };
    storage.users.push(user);
  } else if (user.name !== name.trim()) {
    user.name = name.trim();
  }
  return user;
}

export function addSubmission(storage: CompetitionStorage, submission: CompetitionSubmission): CompetitionSubmission {
  storage.submissions.push(submission);
  return submission;
}
