import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) {
  throw new Error("Missing Supabase env vars. Source .env.local before running e2e tests.");
}

const service = createClient(SUPABASE_URL, SERVICE_KEY);

const PASSWORD = "TestPass1234!";
const stamp = Date.now();
const tipsterEmail = `e2e-tipster-${stamp}@gmail.com`;
const adminEmail = `e2e-admin-${stamp}@gmail.com`;
const tipsterName = `E2E Tipster ${stamp}`;

let tipsterId: string | undefined;
let adminId: string | undefined;
let profileSlug: string | undefined;

test.afterAll(async () => {
  if (profileSlug) {
    await service.from("tipster_profiles").delete().eq("slug", profileSlug);
  }
  if (tipsterId) await service.auth.admin.deleteUser(tipsterId);
  if (adminId) await service.auth.admin.deleteUser(adminId);
});

test("register → apply → admin approve → tipster dashboard", async ({ page, request }) => {
  // Pre-create both users via service role (email_confirm: true bypasses
  // the verification step the UI would otherwise gate on).
  const { data: tipsterUser, error: tipsterErr } = await service.auth.admin.createUser({
    email: tipsterEmail,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: tipsterName },
  });
  expect(tipsterErr).toBeNull();
  tipsterId = tipsterUser.user!.id;

  const { data: adminUser, error: adminErr } = await service.auth.admin.createUser({
    email: adminEmail,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { role: "admin", full_name: "E2E Admin" },
  });
  expect(adminErr).toBeNull();
  adminId = adminUser.user!.id;

  // ---- Step 1: tipster logs in via the browser ----
  await page.goto("/login");
  await page.getByLabel("Email address").fill(tipsterEmail);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL(/\/profile$/, { timeout: 15_000 });

  // ---- Step 2: submit a tipster application via the UI ----
  await page.goto("/tipster/apply");
  await page.getByLabel(/tipster specialty/i).fill("BTTS markets, low-block teams");
  await page
    .getByLabel(/tell us about yourself/i)
    .fill(
      "I've tracked BTTS markets across European leagues for five years and post one high-conviction pick per matchday.",
    );
  await page.getByRole("button", { name: /submit application/i }).click();
  // After success the form posts and router.refresh() re-renders the page
  // showing the "Pending review" panel instead of the form.
  await expect(page.getByText(/pending review/i)).toBeVisible({ timeout: 10_000 });

  // ---- Step 3: admin approves via the API (admin UI clicks would
  // duplicate coverage from test-tipster.mjs) ----
  const anon = createClient(SUPABASE_URL, ANON_KEY);
  const { data: adminSession, error: adminSignInErr } = await anon.auth.signInWithPassword({
    email: adminEmail,
    password: PASSWORD,
  });
  expect(adminSignInErr).toBeNull();
  const adminToken = adminSession.session!.access_token;

  const adminGet = await request.get("/api/admin", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  expect(adminGet.ok()).toBeTruthy();
  const adminBody = await adminGet.json();
  const application = adminBody.pendingApplications.find((a: { userId: string }) => a.userId === tipsterId);
  expect(application).toBeTruthy();

  const approve = await request.post("/api/admin", {
    headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
    data: { action: "approve-application", applicationId: application.id },
  });
  expect(approve.ok()).toBeTruthy();
  const approveBody = await approve.json();
  expect(approveBody.application.status).toBe("approved");

  // Capture slug for cleanup
  const { data: profileRow } = await service
    .from("tipster_profiles")
    .select("slug")
    .eq("user_id", tipsterId)
    .single();
  profileSlug = profileRow?.slug ?? undefined;
  expect(profileSlug).toBeTruthy();

  // ---- Step 4: tipster signs out, signs back in to refresh role JWT,
  // and lands on the tipster dashboard ----
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("Email address").fill(tipsterEmail);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL(/\/profile$/, { timeout: 15_000 });

  await page.goto("/tipster/dashboard");
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("heading", { name: /post a new tip/i })).toBeVisible();
});
