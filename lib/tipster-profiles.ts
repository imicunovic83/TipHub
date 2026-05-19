import { getSupabaseServerClient } from "@/lib/supabase-server";

export interface TipsterProfile {
  userId: string;
  slug: string;
  name: string;
  specialty: string;
  shortBio: string;
  longBio: string;
  joinedAt: string;
}

type Row = {
  user_id: string;
  slug: string;
  name: string;
  specialty: string;
  short_bio: string;
  long_bio: string;
  joined_at: string;
};

function rowToProfile(row: Row): TipsterProfile {
  return {
    userId: row.user_id,
    slug: row.slug,
    name: row.name,
    specialty: row.specialty,
    shortBio: row.short_bio,
    longBio: row.long_bio,
    joinedAt: row.joined_at,
  };
}

const ACCENT_MAP: Record<string, string> = {
  á: "a", à: "a", â: "a", ä: "a", ã: "a", å: "a",
  č: "c", ć: "c", ç: "c",
  đ: "d",
  é: "e", è: "e", ê: "e", ë: "e",
  í: "i", ì: "i", î: "i", ï: "i",
  ľ: "l", ĺ: "l",
  ň: "n", ń: "n", ñ: "n",
  ó: "o", ò: "o", ô: "o", ö: "o", õ: "o",
  ř: "r",
  ś: "s", š: "s", ş: "s",
  ť: "t",
  ú: "u", ù: "u", û: "u", ü: "u",
  ý: "y", ÿ: "y",
  ž: "z", ź: "z",
};

function slugify(input: string): string {
  const lowered = input.toLowerCase().trim();
  const stripped = Array.from(lowered, (ch) => ACCENT_MAP[ch] ?? ch).join("");
  return stripped
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getAllTipsterProfiles(): Promise<TipsterProfile[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tipster_profiles")
    .select()
    .order("joined_at", { ascending: false });
  if (error) throw new Error(`Load tipster profiles failed: ${error.message}`);
  return (data as Row[]).map(rowToProfile);
}

export async function getTipsterProfileBySlug(slug: string): Promise<TipsterProfile | undefined> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tipster_profiles")
    .select()
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Load tipster profile failed: ${error.message}`);
  return data ? rowToProfile(data as Row) : undefined;
}

export async function getTipsterProfileByUserId(userId: string): Promise<TipsterProfile | undefined> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tipster_profiles")
    .select()
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`Load tipster profile failed: ${error.message}`);
  return data ? rowToProfile(data as Row) : undefined;
}

/**
 * Insert (or no-op if already exists) a tipster profile. Generates a unique
 * slug by appending -2, -3, ... if the base slug is taken.
 */
export async function ensureTipsterProfile(input: {
  userId: string;
  name: string;
  specialty: string;
  bio: string;
}): Promise<TipsterProfile> {
  const supabase = getSupabaseServerClient();

  // If a profile already exists for this user, return it (idempotent).
  const existing = await getTipsterProfileByUserId(input.userId);
  if (existing) return existing;

  const baseSlug = slugify(input.name) || `tipster-${input.userId.slice(0, 6)}`;
  const shortBio = input.bio.length > 160 ? `${input.bio.slice(0, 157).trimEnd()}…` : input.bio;

  for (let suffix = 0; suffix < 50; suffix++) {
    const slug = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`;
    const { data, error } = await supabase
      .from("tipster_profiles")
      .insert({
        user_id: input.userId,
        slug,
        name: input.name,
        specialty: input.specialty,
        short_bio: shortBio,
        long_bio: input.bio,
      })
      .select()
      .single();
    if (!error && data) return rowToProfile(data as Row);
    // 23505 = unique_violation; retry with next suffix
    if (error && error.code !== "23505") {
      throw new Error(`Create tipster profile failed: ${error.message}`);
    }
  }
  throw new Error("Could not allocate a unique tipster slug after 50 attempts.");
}

export interface UpdateTipsterProfileInput {
  userId: string;
  name: string;
  specialty: string;
  shortBio: string;
  longBio: string;
}

export async function updateTipsterProfile(
  input: UpdateTipsterProfileInput,
): Promise<TipsterProfile> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tipster_profiles")
    .update({
      name: input.name.trim(),
      specialty: input.specialty.trim(),
      short_bio: input.shortBio.trim(),
      long_bio: input.longBio.trim(),
    })
    .eq("user_id", input.userId)
    .select()
    .single();
  if (error || !data) {
    throw new Error(`Update tipster profile failed: ${error?.message ?? "no row"}`);
  }
  return rowToProfile(data as Row);
}
