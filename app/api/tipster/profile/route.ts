import { NextResponse } from "next/server";
import {
  getAccessTokenFromRequest,
  getSupabaseUserFromToken,
} from "@/lib/supabase-server";
import {
  getTipsterProfileByUserId,
  updateTipsterProfile,
} from "@/lib/tipster-profiles";

const MAX_NAME = 80;
const MAX_SPECIALTY = 100;
const MAX_SHORT_BIO = 200;
const MAX_LONG_BIO = 2000;

export async function POST(request: Request) {
  const token = getAccessTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getSupabaseUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = user.user_metadata?.role;
  if (role !== "tipster" && role !== "admin") {
    return NextResponse.json({ error: "Tipster role required." }, { status: 403 });
  }

  const existing = await getTipsterProfileByUserId(user.id);
  if (!existing) {
    return NextResponse.json(
      { error: "No tipster profile to edit. Apply first." },
      { status: 404 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const specialty = typeof body.specialty === "string" ? body.specialty.trim() : "";
  const shortBio = typeof body.shortBio === "string" ? body.shortBio.trim() : "";
  const longBio = typeof body.longBio === "string" ? body.longBio.trim() : "";

  if (!name || !specialty || !shortBio || !longBio) {
    return NextResponse.json(
      { error: "Name, specialty, short bio and long bio are all required." },
      { status: 400 },
    );
  }
  if (name.length > MAX_NAME) {
    return NextResponse.json({ error: `Name must be ${MAX_NAME} characters or fewer.` }, { status: 400 });
  }
  if (specialty.length > MAX_SPECIALTY) {
    return NextResponse.json({ error: `Specialty must be ${MAX_SPECIALTY} characters or fewer.` }, { status: 400 });
  }
  if (shortBio.length > MAX_SHORT_BIO) {
    return NextResponse.json({ error: `Short bio must be ${MAX_SHORT_BIO} characters or fewer.` }, { status: 400 });
  }
  if (longBio.length > MAX_LONG_BIO) {
    return NextResponse.json({ error: `Long bio must be ${MAX_LONG_BIO} characters or fewer.` }, { status: 400 });
  }

  try {
    const updated = await updateTipsterProfile({
      userId: user.id,
      name,
      specialty,
      shortBio,
      longBio,
    });
    return NextResponse.json({ success: true, profile: updated });
  } catch (err) {
    console.error("[tipster/profile] update failed:", err);
    return NextResponse.json(
      { error: "Could not save profile. Please try again." },
      { status: 500 },
    );
  }
}
