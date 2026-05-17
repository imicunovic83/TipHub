// End-to-end smoke test for the tipster dashboard flow:
//   create user -> promote to tipster -> sign in -> POST /api/tipster/tips
//   -> verify row -> admin resolve via /api/admin -> verify status -> cleanup
//
// Run with: node scripts/test-tipster.mjs

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_ORIGIN = process.env.APP_ORIGIN ?? "http://localhost:3000";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing env. Need NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(2);
}

const stamp = Date.now();
const tipsterEmail = `tiphub-tipster-${stamp}@gmail.com`;
const adminEmail = `tiphub-admin-${stamp}@gmail.com`;
const password = "TestPass1234!";

let tipsterId = null;
let adminId = null;
let tipId = null;
let failures = 0;

function step(name, ok, detail = "") {
  if (!ok) failures += 1;
  console.log(`[${ok ? "PASS" : "FAIL"}] ${name}${detail ? "  —  " + detail : ""}`);
}

const readJson = async (res) => { try { return await res.json(); } catch { return null; } };

async function adminCreateUser(email, role) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: role ? { role, full_name: `Test ${role}` } : { full_name: "Test user" },
    }),
  });
  const body = await readJson(res);
  return { ok: res.ok && body?.id, id: body?.id, body, status: res.status };
}

async function signIn(email) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await readJson(res);
  return body?.access_token ?? null;
}

async function deleteUser(id) {
  if (!id) return;
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
}

async function cleanup() {
  await deleteUser(tipsterId);
  await deleteUser(adminId);
  step("Cleanup test users", true);
}

// 1. Provision a tipster and an admin
{
  const r1 = await adminCreateUser(tipsterEmail, "tipster");
  step("Create tipster user (role=tipster)", r1.ok, r1.ok ? `id=${r1.id}` : JSON.stringify(r1.body));
  if (!r1.ok) process.exit(1);
  tipsterId = r1.id;

  const r2 = await adminCreateUser(adminEmail, "admin");
  step("Create admin user (role=admin)", r2.ok, r2.ok ? `id=${r2.id}` : JSON.stringify(r2.body));
  if (!r2.ok) { await cleanup(); process.exit(1); }
  adminId = r2.id;
}

const tipsterToken = await signIn(tipsterEmail);
step("Tipster sign in", Boolean(tipsterToken));
const adminToken = await signIn(adminEmail);
step("Admin sign in", Boolean(adminToken));
if (!tipsterToken || !adminToken) { await cleanup(); process.exit(1); }

// 2. POST a tip
{
  const res = await fetch(`${APP_ORIGIN}/api/tipster/tips`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tipsterToken}` },
    body: JSON.stringify({
      matchId: "m-a1",
      market: "1X2",
      prediction: "Mexico to win",
      shortReason: "Home advantage + form",
      analysis: "Mexico opens at the Estadio Azteca. Strong recent form…",
      oddsValue: 2.15,
      oddsBookmaker: "mozzart",
      confidence: 4,
    }),
  });
  const body = await readJson(res);
  const ok = res.ok && body?.tip?.id;
  step("POST /api/tipster/tips creates a pending tip", ok, ok ? `id=${body.tip.id}` : `status=${res.status} body=${JSON.stringify(body)}`);
  if (!ok) { await cleanup(); process.exit(1); }
  tipId = body.tip.id;
}

// 3. Verify the tip appears in admin GET /api/admin
{
  const res = await fetch(`${APP_ORIGIN}/api/admin`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const body = await readJson(res);
  const present = (body?.pendingTips ?? []).some((t) => t.id === tipId);
  step("Tip appears in admin pendingTips", present, present ? "" : `count=${body?.pendingTips?.length}`);
}

// 4. Negative — non-tipster user can't POST tips
{
  const userOnlyEmail = `tiphub-user-${stamp}@gmail.com`;
  const r = await adminCreateUser(userOnlyEmail, null);
  if (r.ok) {
    const userToken = await signIn(userOnlyEmail);
    const res = await fetch(`${APP_ORIGIN}/api/tipster/tips`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        matchId: "m-a1", market: "1X2", prediction: "x", shortReason: "y",
        oddsValue: 2, oddsBookmaker: "mozzart", confidence: 3,
      }),
    });
    step("Non-tipster gets 403", res.status === 403, `status=${res.status}`);
    await deleteUser(r.id);
  } else {
    step("Non-tipster gets 403", false, "could not create test user");
  }
}

// 5. Admin resolves the tip as 'won'
{
  const res = await fetch(`${APP_ORIGIN}/api/admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ action: "resolve-tip", tipId, status: "won" }),
  });
  const body = await readJson(res);
  const ok = res.ok && body?.tip?.status === "won";
  step("Admin resolves tip as won", ok, ok ? "" : `status=${res.status} body=${JSON.stringify(body)}`);
}

// 6. Verify in DB via service role
{
  const res = await fetch(`${SUPABASE_URL}/rest/v1/tips?select=*&id=eq.${tipId}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  const body = await readJson(res);
  const row = Array.isArray(body) ? body[0] : null;
  const ok = row?.status === "won" && row?.resolved_at;
  step("DB row reflects resolution", ok, ok ? "" : `row=${JSON.stringify(row)}`);
}

await cleanup();

console.log(`\n${failures === 0 ? "All checks passed." : `${failures} check(s) failed.`}`);
process.exit(failures === 0 ? 0 : 1);
