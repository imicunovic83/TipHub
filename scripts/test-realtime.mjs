// Smoke test for the leaderboard Realtime channel.
// Subscribes with the anon key, inserts a submission via service role,
// then resolves it, verifying both events arrive within a deadline.
//
// Run with: node scripts/test-realtime.mjs

import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ANON || !SERVICE) {
  console.error("Missing env. Need NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(2);
}

const stamp = Date.now();
const userEmail = `realtime-${stamp}@example.com`;
let failures = 0;
let userId = null;
let submissionId = null;
const events = [];

function step(name, ok, detail = "") {
  if (!ok) failures += 1;
  console.log(`[${ok ? "PASS" : "FAIL"}] ${name}${detail ? "  —  " + detail : ""}`);
}

async function waitFor(predicate, ms = 10000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    if (predicate()) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

const anon = createClient(URL, ANON, { realtime: { params: { eventsPerSecond: 10 } } });
const service = createClient(URL, SERVICE);

const channel = anon
  .channel("competition-leaderboard-test")
  .on("postgres_changes", { event: "*", schema: "public", table: "competition_submissions" }, (payload) => {
    events.push({ event: payload.eventType, id: payload.new?.id ?? payload.old?.id, status: payload.new?.status });
  });

const subscribed = await new Promise((resolve) => {
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") resolve(true);
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") resolve(false);
  });
});
step("Subscribe with anon key", subscribed);

if (!subscribed) {
  await anon.removeAllChannels();
  process.exit(1);
}

// Give the realtime backend a beat to wire the subscription before
// firing the first INSERT. In practice users open the page minutes
// before any submission lands, so this delay is a test-only concern.
await new Promise((r) => setTimeout(r, 1500));

// Create a competition_user via service role
{
  const { data, error } = await service
    .from("competition_users")
    .insert({ name: `Realtime ${stamp}`, email: userEmail })
    .select()
    .single();
  step("Create competition_user", !error && data?.id, error?.message ?? `id=${data?.id}`);
  userId = data?.id ?? null;
}

// Insert a submission and expect an INSERT event
{
  const { data, error } = await service
    .from("competition_submissions")
    .insert({
      user_id: userId,
      match_id: "m-a1",
      market: "1X2",
      prediction: "Realtime test pick",
      odds: 2.0,
      stake: 10,
    })
    .select()
    .single();
  step("Insert submission via service role", !error && data?.id, error?.message ?? `id=${data?.id}`);
  submissionId = data?.id ?? null;

  const got = await waitFor(() => events.some((e) => e.event === "INSERT" && e.id === submissionId));
  step("Anon subscriber receives INSERT event", got, got ? "" : `events=${JSON.stringify(events)}`);
}

// Update the submission to "won" and expect an UPDATE event
{
  const { error } = await service
    .from("competition_submissions")
    .update({ status: "won", result_amount: 20 })
    .eq("id", submissionId);
  step("Update submission status to won", !error, error?.message ?? "");

  const got = await waitFor(() => events.some((e) => e.event === "UPDATE" && e.id === submissionId && e.status === "won"));
  step("Anon subscriber receives UPDATE event", got, got ? "" : `events=${JSON.stringify(events)}`);
}

// Cleanup
await service.from("competition_submissions").delete().eq("id", submissionId);
await service.from("competition_users").delete().eq("id", userId);
await anon.removeAllChannels();

if (failures) {
  console.log(`\n${failures} check(s) failed.`);
  process.exit(1);
} else {
  console.log("\nAll realtime checks passed.");
  process.exit(0);
}
