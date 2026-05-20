import { NextResponse } from "next/server";
import { createTipsterApplication, userHasOpenApplication } from "@/lib/applications";
import { getAccessTokenFromRequest, getSupabaseUserFromToken } from "@/lib/supabase-server";
import { isValidSpecialty } from "@/lib/tipster-specialties";

export async function POST(request: Request) {
  const token = getAccessTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getSupabaseUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.user_metadata?.role === "tipster" || user.user_metadata?.role === "admin") {
    return NextResponse.json({ error: "You are already a tipster." }, { status: 409 });
  }

  const body = await request.json();
  const specialty = body.specialty as string;
  const bio = body.bio as string;

  if (!specialty?.trim() || !bio?.trim()) {
    return NextResponse.json({ error: "Specialty and bio are required." }, { status: 400 });
  }
  if (!isValidSpecialty(specialty.trim())) {
    return NextResponse.json({ error: "Pick a specialty from the list." }, { status: 400 });
  }

  if (await userHasOpenApplication(user.id)) {
    return NextResponse.json(
      { error: "You already have a pending or approved application." },
      { status: 409 },
    );
  }

  const application = await createTipsterApplication(user.id, specialty, bio);
  return NextResponse.json({ success: true, application });
}
