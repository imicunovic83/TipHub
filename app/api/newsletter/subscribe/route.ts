import { NextResponse } from "next/server";
import { isValidEmail, subscribeEmail } from "@/lib/newsletter";
import { sendNewsletterConfirmation } from "@/lib/email";

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    const outcome = await subscribeEmail(email);

    if (outcome.kind === "already_confirmed") {
      return NextResponse.json({
        success: true,
        status: "already_confirmed",
        message: "You're already subscribed. Thanks for being with us.",
      });
    }

    await sendNewsletterConfirmation({
      to: outcome.subscriber.email,
      token: outcome.subscriber.token,
    });

    return NextResponse.json({
      success: true,
      status: outcome.kind,
      message: "Check your inbox for the confirmation link.",
    });
  } catch (err) {
    console.error("[newsletter] subscribe failed:", err);
    return NextResponse.json(
      { error: "Could not record your subscription. Please try again later." },
      { status: 500 },
    );
  }
}
