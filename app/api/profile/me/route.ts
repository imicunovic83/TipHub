import { NextResponse } from "next/server";
import {
  createSupabaseUserClient,
  getAccessTokenFromRequest,
  getSupabaseServerClient,
  getSupabaseUserFromToken,
} from "@/lib/supabase-server";
import { getMergedTipsters } from "@/lib/merged-data";

const MAX_NICKNAME = 40;

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

  const nickname = typeof body.nickname === "string" ? body.nickname.trim() : "";
  const favoriteTipster =
    typeof body.favorite_tipster === "string" ? body.favorite_tipster.trim() : "";

  if (nickname.length > MAX_NICKNAME) {
    return NextResponse.json(
      { error: `Nickname must be ${MAX_NICKNAME} characters or fewer.` },
      { status: 400 },
    );
  }

  // favorite_tipster, when set, must be a real tipster slug — no free text.
  if (favoriteTipster) {
    const tipsters = await getMergedTipsters();
    const known = tipsters.some((t) => t.slug === favoriteTipster);
    if (!known) {
      return NextResponse.json(
        { error: "Pick a tipster from the list." },
        { status: 400 },
      );
    }
  }

  // User-scoped client — RLS only lets a user touch their own profiles row.
  // Full name + email stay non-editable here (account-identity fields).
  const supabase = createSupabaseUserClient(token);
  const { data, error } = await supabase
    .from("profiles")
    .update({
      nickname: nickname || null,
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

  // Mirror the nickname into user_metadata so the header (which reads the JWT
  // client-side) shows it without an extra profile fetch. Service role needed
  // for the admin update; non-fatal if it fails.
  const nextMeta = { ...(user.user_metadata ?? {}), nickname: nickname || null };
  const admin = getSupabaseServerClient();
  const metaUpd = await admin.auth.admin.updateUserById(user.id, { user_metadata: nextMeta });
  if (metaUpd.error) {
    console.error("[profile/me] user_metadata mirror failed:", metaUpd.error);
    return NextResponse.json({
      success: true,
      profile: data,
      warning: "Saved, but the header may show your old name until you refresh.",
    });
  }

  return NextResponse.json({ success: true, profile: data });
}
