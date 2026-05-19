import { NextResponse } from "next/server";
import {
  createSupabaseUserClient,
  getAccessTokenFromRequest,
  getSupabaseUserFromToken,
} from "@/lib/supabase-server";

const MAX_NAME = 80;
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

  const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
  const favoriteTipster = typeof body.favorite_tipster === "string" ? body.favorite_tipster.trim() : "";

  if (fullName.length > MAX_NAME) {
    return NextResponse.json({ error: `Name must be ${MAX_NAME} characters or fewer.` }, { status: 400 });
  }
  if (favoriteTipster.length > MAX_FAV) {
    return NextResponse.json({ error: `Favorite tipster must be ${MAX_FAV} characters or fewer.` }, { status: 400 });
  }

  // User-scoped client — RLS only lets a user touch their own profiles row.
  const supabase = createSupabaseUserClient(token);
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      favorite_tipster: favoriteTipster || null,
    })
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
