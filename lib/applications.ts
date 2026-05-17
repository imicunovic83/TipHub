import { getSupabaseServerClient } from "@/lib/supabase-server";

export type TipsterApplicationStatus = "pending" | "approved" | "rejected";

export interface TipsterApplication {
  id: string;
  userId: string;
  specialty: string;
  bio: string;
  status: TipsterApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  note?: string;
}

type Row = {
  id: string;
  user_id: string;
  specialty: string;
  bio: string;
  status: TipsterApplicationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_id: string | null;
  note: string | null;
};

function rowToApplication(row: Row): TipsterApplication {
  return {
    id: row.id,
    userId: row.user_id,
    specialty: row.specialty,
    bio: row.bio,
    status: row.status,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewerId: row.reviewer_id ?? undefined,
    note: row.note ?? undefined,
  };
}

export async function createTipsterApplication(
  userId: string,
  specialty: string,
  bio: string,
): Promise<TipsterApplication> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tipster_applications")
    .insert({ user_id: userId, specialty: specialty.trim(), bio: bio.trim() })
    .select()
    .single();
  if (error || !data) throw new Error(`Failed to create application: ${error?.message ?? "no row"}`);
  return rowToApplication(data as Row);
}

export async function getPendingApplications(): Promise<TipsterApplication[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tipster_applications")
    .select()
    .eq("status", "pending")
    .order("submitted_at", { ascending: false });
  if (error) throw new Error(`Failed to load pending applications: ${error.message}`);
  return (data as Row[]).map(rowToApplication);
}

export async function getLatestApplicationForUser(userId: string): Promise<TipsterApplication | undefined> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tipster_applications")
    .select()
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Failed to load application: ${error.message}`);
  return data ? rowToApplication(data as Row) : undefined;
}

export async function userHasOpenApplication(userId: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  const { count, error } = await supabase
    .from("tipster_applications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["pending", "approved"]);
  if (error) throw new Error(`Failed to check application status: ${error.message}`);
  return (count ?? 0) > 0;
}

async function reviewApplication(
  applicationId: string,
  status: "approved" | "rejected",
  reviewerId: string | undefined,
  note: string | undefined,
): Promise<TipsterApplication | undefined> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tipster_applications")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewer_id: reviewerId ?? null,
      note: note ?? null,
    })
    .eq("id", applicationId)
    .select()
    .maybeSingle();
  if (error) throw new Error(`Failed to update application: ${error.message}`);
  return data ? rowToApplication(data as Row) : undefined;
}

export function approveTipsterApplication(applicationId: string, reviewerId?: string, note?: string) {
  return reviewApplication(applicationId, "approved", reviewerId, note);
}

export function rejectTipsterApplication(applicationId: string, reviewerId?: string, note?: string) {
  return reviewApplication(applicationId, "rejected", reviewerId, note);
}
