import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const storageFile = path.join(process.cwd(), 'data', 'analytics.json');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    let existing = [] as any[];
    try {
      const raw = await fs.readFile(storageFile, 'utf8');
      existing = JSON.parse(raw);
    } catch (e) {
      existing = [];
    }

    existing.push({ ...body, ts: now });
    await fs.mkdir(path.dirname(storageFile), { recursive: true });
    await fs.writeFile(storageFile, JSON.stringify(existing, null, 2), 'utf8');
      // Optionally forward to Google Analytics Measurement Protocol
      try {
        const measurementId = process.env.GA_MEASUREMENT_ID;
        const apiSecret = process.env.GA_API_SECRET;
        if (measurementId && apiSecret) {
          const clientId = body.payload?.client_id ?? `anon-${Math.floor(Math.random()*1e9)}`;
          const gaBody = {
            client_id: clientId,
            events: [
              {
                name: body.name ?? 'event',
                params: { ...body.payload, variant: process.env.NEXT_PUBLIC_EXPERIMENT_VARIANT ?? 'A' },
              },
            ],
          };
          await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gaBody),
          });
        }
      } catch (e) {
        // swallow GA errors
        console.warn('GA forward failed', e);
      }

      return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }
}
