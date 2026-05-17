import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getSupabaseServerClient();

    await supabase.from("analytics_events").insert({
      name: typeof body.name === "string" ? body.name : "event",
      variant: typeof body.variant === "string" ? body.variant : null,
      payload: body.payload ?? null,
    });

    // Optional GA Measurement Protocol forward
    const measurementId = process.env.GA_MEASUREMENT_ID;
    const apiSecret = process.env.GA_API_SECRET;
    if (measurementId && apiSecret) {
      try {
        const clientId = body.payload?.client_id ?? `anon-${Math.floor(Math.random() * 1e9)}`;
        const gaBody = {
          client_id: clientId,
          events: [
            {
              name: body.name ?? "event",
              params: { ...body.payload, variant: process.env.NEXT_PUBLIC_EXPERIMENT_VARIANT ?? "A" },
            },
          ],
        };
        await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gaBody),
        });
      } catch (gaError) {
        console.warn("GA forward failed", gaError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics POST failed:", error);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
