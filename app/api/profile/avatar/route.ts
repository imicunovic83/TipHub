import { NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  getSupabaseServerClient,
  getSupabaseUserFromToken,
} from "@/lib/supabase-server";

// Allowed avatar URL hosts. Limits to assets we generate / control so the
// avatar field can't be turned into an image-hosting leak.
const ALLOWED_HOSTS = new Set<string>([
  "api.dicebear.com",
  "www.gravatar.com",
  "unavatar.io",
  "ui-avatars.com",
]);

function isAllowedAvatarUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return ALLOWED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const token = getAccessTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getSupabaseUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { url?: string | null };
  try {
    body = (await request.json()) as { url?: string | null };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // null/empty -> clear the override and fall back to Gravatar/initials chain.
  const next = typeof body.url === "string" && body.url.trim() ? body.url.trim() : null;
  if (next !== null && !isAllowedAvatarUrl(next)) {
    return NextResponse.json(
      { error: "Avatar URL must come from an allowed host (DiceBear, Gravatar, Unavatar, ui-avatars)." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServerClient();

  // 1. Update profiles.avatar_url
  const updateProfile = await supabase
    .from("profiles")
    .update({ avatar_url: next })
    .eq("id", user.id)
    .select()
    .maybeSingle();
  if (updateProfile.error) {
    console.error("[profile/avatar] profile update failed:", updateProfile.error);
    return NextResponse.json(
      { error: "Could not save avatar. Please try again." },
      { status: 500 },
    );
  }

  // 2. Mirror into user_metadata so client-side AuthControls picks it up
  //    without an extra fetch. Existing metadata keys are preserved.
  const nextMeta = { ...(user.user_metadata ?? {}), avatar_url: next };
  const updateUser = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: nextMeta,
  });
  if (updateUser.error) {
    console.error("[profile/avatar] user metadata update failed:", updateUser.error);
    // Profile row is already updated — surface a soft warning but don't fail
    // the request. The avatar will still appear on the next session refresh.
    return NextResponse.json({
      success: true,
      avatar_url: next,
      warning: "Saved to profile, but header may show the old avatar until you refresh.",
    });
  }

  return NextResponse.json({ success: true, avatar_url: next });
}
