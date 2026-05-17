// End-to-end smoke test for the auth + profiles + cookie flow.
//
// Uses the Supabase admin API to provision a test user, then exercises
// the same RLS-gated INSERT/SELECT and /api/auth/session cookie handoff
// that components/RegisterForm.tsx hits in the browser.
//
// Run with: node scripts/test-register.mjs

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_ORIGIN = process.env.APP_ORIGIN ?? "http://localhost:3000";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing env. Need NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(2);
}

const stamp = Date.now();
const testEmail = `tiphub-smoketest-${stamp}@gmail.com`;
const testPassword = "TestPass1234!";
const testFullName = `Test User ${stamp}`;

let userId = null;
let accessToken = null;
let failures = 0;

function step(name, ok, detail = "") {
  if (!ok) failures += 1;
  console.log(`[${ok ? "PASS" : "FAIL"}] ${name}${detail ? "  —  " + detail : ""}`);
}

async function readJson(res) {
  try { return await res.json(); } catch { return null; }
}

async function cleanup() {
  if (!userId) return;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  step("Cleanup — delete test user", res.ok, res.ok ? "" : `status=${res.status}`);
}

// 1. Admin createUser — bypasses public signup email validation
{
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: testFullName, favorite_tipster: "marko" },
    }),
  });
  const body = await readJson(res);
  const ok = res.ok && body?.id;
  step("Admin createUser", ok, ok ? `user=${body.id}` : `status=${res.status} body=${JSON.stringify(body)}`);
  if (!ok) process.exit(1);
  userId = body.id;
}

// 2. Sign in to get an access_token (the JWT the browser would have right after signUp)
{
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  const body = await readJson(res);
  const ok = res.ok && body?.access_token;
  step("Sign in (anon key + password)", ok, ok ? "" : `status=${res.status} body=${JSON.stringify(body)}`);
  if (!ok) {
    await cleanup();
    process.exit(1);
  }
  accessToken = body.access_token;
}

// 3. Trigger on auth.users insert should have already populated the profile row
{
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${userId}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  const body = await readJson(res);
  const row = Array.isArray(body) ? body[0] : null;
  const ok = res.ok && row?.id === userId
    && row.full_name === testFullName
    && row.favorite_tipster === "marko"
    && row.email === testEmail;
  step("on_auth_user_created trigger created profile row", ok,
    ok ? "" : `row=${JSON.stringify(row)}`);
}

// 3b. Negative — try to insert a *different* user's id with our JWT; must be blocked by RLS
{
  const fakeId = "00000000-0000-0000-0000-000000000000";
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: fakeId, full_name: "evil", email: "evil@example.com" }),
  });
  // Postgrest returns 401 for RLS-blocked inserts when the row violates check policy
  const ok = res.status === 401 || res.status === 403 || res.status === 409;
  step("RLS rejects insert with someone else's id", ok, `status=${res.status}`);
}

// 4. SELECT own profile — exercises "Select own profile" RLS
{
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` },
  });
  const body = await readJson(res);
  const ok = res.ok && Array.isArray(body) && body.length === 1 && body[0].id === userId;
  step("Profile select via RLS returns only self", ok,
    ok ? `rows=${body.length}` : `status=${res.status} body=${JSON.stringify(body)}`);
}

// 5. /api/auth/session — verifies the cookie sync endpoint sets httpOnly cookies
{
  const res = await fetch(`${APP_ORIGIN}/api/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken, refresh_token: "fake-refresh-token-for-test" }),
  });
  const setCookie = res.headers.get("set-cookie") ?? "";
  const ok = res.ok && setCookie.includes("supabase-access-token");
  step("/api/auth/session sets supabase-access-token cookie", ok,
    ok ? "" : `status=${res.status} set-cookie="${setCookie}"`);
}

// 6. Cleanup
await cleanup();

console.log(`\n${failures === 0 ? "All checks passed." : `${failures} check(s) failed.`}`);
process.exit(failures === 0 ? 0 : 1);
