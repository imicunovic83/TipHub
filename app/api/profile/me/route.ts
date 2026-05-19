import { NextResponse } from "next/server";
import {
  createSupabaseUserClient,
  getAccessTokenFromRequest,
  getSupabaseUserFromToken,
} from "@/lib/supabase-server";

const MAX_FAV = 80;

export async function POST(request: Request) {
  const token = getAccessTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getSupabaseUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const favoriteTipster = typeof body.favorite_tipster === "string" ? body.favorite_tipster.trim() : "";

  if (favoriteTipster.length > MAX_FAV) {
    return NextResponse.json({ error: `Favorite tipster must be ${MAX_FAV} characters or fewer.` }, { status: 400 });
  }

  // User-scoped client — RLS only lets a user touch their own profiles row.
  // Full name is intentionally NOT editable here (account-identity field;
  // change requires manual support review during beta).
  const supabase = createSupabaseUserClient(token);
  const { data, error } = await supabase
    .from("profiles")
    .update({ favorite_tipster: favoriteTipster || null })
    .eq("id", user.id)
    .select()
    .single();

  if (error || !data) {
    console.error("[profile/me] update failed:", error);
    return NextResponse.json(
      { error: "Could not save profile. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, profile: data });
}
