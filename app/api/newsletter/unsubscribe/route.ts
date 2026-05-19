import { NextResponse } from "next/server";
import { unsubscribeByToken } from "@/lib/newsletter";
import { absoluteUrl } from "@/lib/site";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(absoluteUrl("/newsletter/unsubscribed?status=invalid"));
  }

  try {
    const outcome = await unsubscribeByToken(token);

    if (outcome.kind === "invalid_token") {
      return NextResponse.redirect(absoluteUrl("/newsletter/unsubscribed?status=invalid"));
    }

    const status = outcome.kind === "already_unsubscribed" ? "already" : "ok";
    return NextResponse.redirect(absoluteUrl(`/newsletter/unsubscribed?status=${status}`));
  } catch (err) {
    console.error("[newsletter] unsubscribe failed:", err);
    return NextResponse.redirect(absoluteUrl("/newsletter/unsubscribed?status=error"));
  }
}
