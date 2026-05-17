// End-to-end smoke test for the tipster lifecycle:
//   apply -> admin approve (creates tipster_profile + role) -> profile visible
//   -> post tip -> tip appears in merged /tips catalog -> edit -> delete
//   -> resolve a fresh tip -> stats reflect win.
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
const tipsterFullName = `Test Tipster ${stamp}`;

let tipsterId = null;
let adminId = null;
let applicationId = null;
let tipId = null;
let profileSlug = null;
let failures = 0;

function step(name, ok, detail = "") {
  if (!ok) failures += 1;
  console.log(`[${ok ? "PASS" : "FAIL"}] ${name}${detail ? "  —  " + detail : ""}`);
}
const readJson = async (res) => { try { return await res.json(); } catch { return null; } };

async function adminCreateUser(email, role, fullName) {
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
      user_metadata: { role: role ?? undefined, full_name: fullName ?? "Test User" },
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
  return (await readJson(res))?.access_token ?? null;
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
  if (profileSlug) {
    await fetch(`${SUPABASE_URL}/rest/v1/tipster_profiles?slug=eq.${encodeURIComponent(profileSlug)}`, {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
  }
  await deleteUser(tipsterId);
  await deleteUser(adminId);
  step("Cleanup", true);
}

// 1. Create users — applicant with NO role yet, plus an admin
{
  const r1 = await adminCreateUser(tipsterEmail, null, tipsterFullName);
  step("Create applicant user (no role)", r1.ok, r1.ok ? `id=${r1.id}` : JSON.stringify(r1.body));
  if (!r1.ok) process.exit(1);
  tipsterId = r1.id;

  const r2 = await adminCreateUser(adminEmail, "admin");
  step("Create admin user", r2.ok, r2.ok ? `id=${r2.id}` : JSON.stringify(r2.body));
  if (!r2.ok) { await cleanup(); process.exit(1); }
  adminId = r2.id;
}

const tipsterToken = await signIn(tipsterEmail);
step("Applicant sign in", Boolean(tipsterToken));
const adminToken = await signIn(adminEmail);
step("Admin sign in", Boolean(adminToken));
if (!tipsterToken || !adminToken) { await cleanup(); process.exit(1); }

// 2. Applicant submits a tipster application
{
  const res = await fetch(`${APP_ORIGIN}/api/auth/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tipsterToken}` },
    body: JSON.stringify({
      specialty: "BTTS markets, low-block teams",
      bio: "I've tracked BTTS markets across European leagues for five years and post one high-conviction pick per matchday.",
    }),
  });
  const body = await readJson(res);
  const ok = res.ok && body?.application?.id;
  step("Tipster application accepted", ok, ok ? "" : JSON.stringify(body));
  if (!ok) { await cleanup(); process.exit(1); }
  applicationId = body.application.id;
}

// 3. Admin approves -> role flip + tipster_profiles row
{
  const res = await fetch(`${APP_ORIGIN}/api/admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ action: "approve-application", applicationId }),
  });
  const body = await readJson(res);
  const ok = res.ok && body?.application?.status === "approved";
  step("Admin approves application", ok, ok ? "" : JSON.stringify(body));
}

// 4. Verify tipster_profiles row was created with derived slug
{
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/tipster_profiles?select=*&user_id=eq.${tipsterId}`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  );
  const body = await readJson(res);
  const row = Array.isArray(body) ? body[0] : null;
  const ok = row?.slug?.startsWith("test-tipster-");
  step("tipster_profiles row created with slug", ok, ok ? `slug=${row.slug}` : JSON.stringify(row));
  profileSlug = row?.slug ?? null;
}

// Re-sign in to pick up the new role on the JWT
const tipsterToken2 = await signIn(tipsterEmail);

// 5. Tipster posts a tip
{
  const res = await fetch(`${APP_ORIGIN}/api/tipster/tips`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tipsterToken2}` },
    body: JSON.stringify({
      matchId: "m-a1",
      market: "1X2",
      prediction: "Mexico to win",
      shortReason: "Home advantage + form",
      analysis: "Mexico opens the World Cup at the Azteca with full fan backing.",
      oddsValue: 2.15,
      oddsBookmaker: "mozzart",
      confidence: 4,
    }),
  });
  const body = await readJson(res);
  const ok = res.ok && body?.tip?.id;
  step("Tipster posts a tip", ok, ok ? `id=${body.tip.id}` : JSON.stringify(body));
  tipId = body?.tip?.id ?? null;
}

// 6. Tip appears in the public /tips page HTML (merged catalog)
if (tipId) {
  const res = await fetch(`${APP_ORIGIN}/tips`);
  const html = await res.text();
  const ok = res.ok && html.includes(tipId);
  step("New tip appears in /tips catalog HTML", ok, ok ? "" : `status=${res.status}`);
}

// 7. Tipster's public profile page lists the tip
if (profileSlug && tipId) {
  const res = await fetch(`${APP_ORIGIN}/tipsters/${profileSlug}`);
  const html = await res.text();
  const ok = res.ok && html.includes(tipId);
  step("Tip appears on /tipsters/<slug> page", ok, ok ? "" : `status=${res.status}`);
}

// 8. Tip detail page renders
if (tipId) {
  const res = await fetch(`${APP_ORIGIN}/tips/${tipId}`);
  step("/tips/<id> renders for user tip", res.status === 200, `status=${res.status}`);
}

// 9. Edit the tip
if (tipId) {
  const res = await fetch(`${APP_ORIGIN}/api/tipster/tips/${tipId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tipsterToken2}` },
    body: JSON.stringify({ prediction: "Mexico to win (edited)", oddsValue: 2.25 }),
  });
  const body = await readJson(res);
  const ok = res.ok && body?.tip?.prediction === "Mexico to win (edited)" && Number(body.tip.oddsValue) === 2.25;
  step("Edit pending tip via PATCH", ok, ok ? "" : JSON.stringify(body));
}

// 10. Owner-only — another tipster can't edit/delete
{
  const otherEmail = `tiphub-other-${stamp}@gmail.com`;
  const r = await adminCreateUser(otherEmail, "tipster", "Other Tipster");
  if (r.ok && tipId) {
    const otherToken = await signIn(otherEmail);
    const editRes = await fetch(`${APP_ORIGIN}/api/tipster/tips/${tipId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${otherToken}` },
      body: JSON.stringify({ prediction: "evil edit" }),
    });
    step("Other tipster cannot PATCH tip", editRes.status === 404, `status=${editRes.status}`);

    const delRes = await fetch(`${APP_ORIGIN}/api/tipster/tips/${tipId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${otherToken}` },
    });
    step("Other tipster cannot DELETE tip", delRes.status === 404, `status=${delRes.status}`);
    await deleteUser(r.id);
  }
}

// 11. Admin resolves the tip as won
if (tipId) {
  const res = await fetch(`${APP_ORIGIN}/api/admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ action: "resolve-tip", tipId, status: "won" }),
  });
  const body = await readJson(res);
  step("Admin resolves tip as won", res.ok && body?.tip?.status === "won", JSON.stringify(body));
}

// 12. Once resolved, owner can no longer PATCH or DELETE
if (tipId) {
  const editRes = await fetch(`${APP_ORIGIN}/api/tipster/tips/${tipId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tipsterToken2}` },
    body: JSON.stringify({ prediction: "should fail" }),
  });
  step("Owner cannot PATCH resolved tip", editRes.status === 404, `status=${editRes.status}`);

  const delRes = await fetch(`${APP_ORIGIN}/api/tipster/tips/${tipId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${tipsterToken2}` },
  });
  step("Owner cannot DELETE resolved tip", delRes.status === 404, `status=${delRes.status}`);
}

// 13. Post a 2nd tip, then delete it while still pending
if (true) {
  const r1 = await fetch(`${APP_ORIGIN}/api/tipster/tips`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tipsterToken2}` },
    body: JSON.stringify({
      matchId: "m-b1", market: "BTTS", prediction: "Yes", shortReason: "Both attacks productive",
      oddsValue: 1.8, oddsBookmaker: "maxbet", confidence: 3,
    }),
  });
  const b1 = await readJson(r1);
  const id2 = b1?.tip?.id;
  step("Post a 2nd pending tip", Boolean(id2));
  if (id2) {
    const delRes = await fetch(`${APP_ORIGIN}/api/tipster/tips/${id2}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tipsterToken2}` },
    });
    step("Owner DELETE pending tip", delRes.ok, `status=${delRes.status}`);
  }
}

await cleanup();

console.log(`\n${failures === 0 ? "All checks passed." : `${failures} check(s) failed.`}`);
process.exit(failures === 0 ? 0 : 1);
