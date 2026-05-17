import { getSupabaseServerClient } from "@/lib/supabase-server";

export type TipMarket = "1X2" | "Over/Under 2.5" | "BTTS" | "Asian Handicap" | "Correct Score";
export type TipStatus = "pending" | "won" | "lost";

export interface UserTip {
  id: string;
  tipsterUserId: string;
  tipsterName: string;
  matchId: string;
  market: TipMarket;
  prediction: string;
  shortReason: string;
  analysis: string | null;
  oddsValue: number;
  oddsBookmaker: string;
  confidence: 1 | 2 | 3 | 4 | 5;
  status: TipStatus;
  isPremium: boolean;
  postedAt: string;
  resolvedAt: string | null;
}

export interface TipsterStats {
  total: number;
  pending: number;
  wins: number;
  losses: number;
  winRate: number;
  roi: number;
  totalStaked: number;
  totalReturn: number;
}

type Row = {
  id: string;
  tipster_user_id: string;
  tipster_name: string;
  match_id: string;
  market: TipMarket;
  prediction: string;
  short_reason: string;
  analysis: string | null;
  odds_value: number | string;
  odds_bookmaker: string;
  confidence: number;
  status: TipStatus;
  is_premium: boolean;
  posted_at: string;
  resolved_at: string | null;
};

function rowToTip(row: Row): UserTip {
  return {
    id: row.id,
    tipsterUserId: row.tipster_user_id,
    tipsterName: row.tipster_name,
    matchId: row.match_id,
    market: row.market,
    prediction: row.prediction,
    shortReason: row.short_reason,
    analysis: row.analysis,
    oddsValue: Number(row.odds_value),
    oddsBookmaker: row.odds_bookmaker,
    confidence: row.confidence as 1 | 2 | 3 | 4 | 5,
    status: row.status,
    isPremium: row.is_premium,
    postedAt: row.posted_at,
    resolvedAt: row.resolved_at,
  };
}

export async function getAllUserTips(): Promise<UserTip[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tips")
    .select()
    .order("posted_at", { ascending: false });
  if (error) throw new Error(`Load all tips failed: ${error.message}`);
  return (data as Row[]).map(rowToTip);
}

export async function getUserTipById(id: string): Promise<UserTip | undefined> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tips")
    .select()
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Load tip failed: ${error.message}`);
  return data ? rowToTip(data as Row) : undefined;
}

export async function updateOwnTip(
  tipId: string,
  ownerUserId: string,
  patch: {
    matchId?: string;
    market?: TipMarket;
    prediction?: string;
    shortReason?: string;
    analysis?: string | null;
    oddsValue?: number;
    oddsBookmaker?: string;
    confidence?: 1 | 2 | 3 | 4 | 5;
  },
): Promise<UserTip | undefined> {
  const supabase = getSupabaseServerClient();
  const update: Record<string, unknown> = {};
  if (patch.matchId !== undefined) update.match_id = patch.matchId;
  if (patch.market !== undefined) update.market = patch.market;
  if (patch.prediction !== undefined) update.prediction = patch.prediction.trim();
  if (patch.shortReason !== undefined) update.short_reason = patch.shortReason.trim();
  if (patch.analysis !== undefined) update.analysis = patch.analysis ? patch.analysis.trim() : null;
  if (patch.oddsValue !== undefined) update.odds_value = patch.oddsValue;
  if (patch.oddsBookmaker !== undefined) update.odds_bookmaker = patch.oddsBookmaker.trim();
  if (patch.confidence !== undefined) update.confidence = patch.confidence;

  const { data, error } = await supabase
    .from("tips")
    .update(update)
    .eq("id", tipId)
    .eq("tipster_user_id", ownerUserId)
    .eq("status", "pending")
    .select()
    .maybeSingle();
  if (error) throw new Error(`Update tip failed: ${error.message}`);
  return data ? rowToTip(data as Row) : undefined;
}

export async function deleteOwnTip(tipId: string, ownerUserId: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tips")
    .delete()
    .eq("id", tipId)
    .eq("tipster_user_id", ownerUserId)
    .eq("status", "pending")
    .select("id");
  if (error) throw new Error(`Delete tip failed: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

export async function getTipsForTipster(userId: string): Promise<UserTip[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tips")
    .select()
    .eq("tipster_user_id", userId)
    .order("posted_at", { ascending: false });
  if (error) throw new Error(`Load own tips failed: ${error.message}`);
  return (data as Row[]).map(rowToTip);
}

export async function getPendingTips(): Promise<UserTip[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tips")
    .select()
    .eq("status", "pending")
    .order("posted_at", { ascending: false });
  if (error) throw new Error(`Load pending tips failed: ${error.message}`);
  return (data as Row[]).map(rowToTip);
}

export async function createTip(input: {
  tipsterUserId: string;
  tipsterName: string;
  matchId: string;
  market: TipMarket;
  prediction: string;
  shortReason: string;
  analysis?: string;
  oddsValue: number;
  oddsBookmaker: string;
  confidence: 1 | 2 | 3 | 4 | 5;
}): Promise<UserTip> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tips")
    .insert({
      tipster_user_id: input.tipsterUserId,
      tipster_name: input.tipsterName,
      match_id: input.matchId,
      market: input.market,
      prediction: input.prediction.trim(),
      short_reason: input.shortReason.trim(),
      analysis: input.analysis?.trim() || null,
      odds_value: input.oddsValue,
      odds_bookmaker: input.oddsBookmaker.trim(),
      confidence: input.confidence,
    })
    .select()
    .single();
  if (error || !data) throw new Error(`Create tip failed: ${error?.message ?? "no row"}`);
  return rowToTip(data as Row);
}

export async function resolveTip(tipId: string, status: "won" | "lost"): Promise<UserTip | undefined> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tips")
    .update({ status, resolved_at: new Date().toISOString() })
    .eq("id", tipId)
    .eq("status", "pending")
    .select()
    .maybeSingle();
  if (error) throw new Error(`Resolve tip failed: ${error.message}`);
  return data ? rowToTip(data as Row) : undefined;
}

export function computeTipsterStats(tips: UserTip[]): TipsterStats {
  const total = tips.length;
  const pending = tips.filter((t) => t.status === "pending").length;
  const resolved = tips.filter((t) => t.status !== "pending");
  const wins = resolved.filter((t) => t.status === "won").length;
  const losses = resolved.filter((t) => t.status === "lost").length;
  const winRate = resolved.length ? Math.round((wins / resolved.length) * 100) : 0;
  // Flat-stake ROI: assume 1u per tip; return for win = oddsValue, loss = 0
  const totalStaked = resolved.length;
  const totalReturn = resolved.reduce((sum, t) => sum + (t.status === "won" ? t.oddsValue : 0), 0);
  const roi = totalStaked ? Number((((totalReturn - totalStaked) / totalStaked) * 100).toFixed(1)) : 0;
  return { total, pending, wins, losses, winRate, roi, totalStaked, totalReturn: Number(totalReturn.toFixed(2)) };
}
