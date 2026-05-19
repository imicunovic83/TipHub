import { NextResponse } from "next/server";
import { confirmByToken } from "@/lib/newsletter";
import { sendNewsletterWelcome } from "@/lib/email";
import { absoluteUrl } from "@/lib/site";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(absoluteUrl("/newsletter/confirmed?status=invalid"));
  }

  try {
    const outcome = await confirmByToken(token);

    if (outcome.kind === "invalid_token") {
      return NextResponse.redirect(absoluteUrl("/newsletter/confirmed?status=invalid"));
    }

    if (outcome.kind === "confirmed") {
      // Fire-and-forget welcome email — confirmation success doesn't depend on
      // the welcome going out.
      sendNewsletterWelcome({
        to: outcome.subscriber.email,
        token: outcome.subscriber.token,
      }).catch((err) => console.error("[newsletter] welcome email failed:", err));
    }

    const status = outcome.kind === "already_confirmed" ? "already" : "ok";
    return NextResponse.redirect(absoluteUrl(`/newsletter/confirmed?status=${status}`));
  } catch (err) {
    console.error("[newsletter] confirm failed:", err);
    return NextResponse.redirect(absoluteUrl("/newsletter/confirmed?status=error"));
  }
}
