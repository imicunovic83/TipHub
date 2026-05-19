# TipHub

Betting-tip marketplace for the 2026 World Cup — tips catalog, tipster
profiles, bookmaker odds comparison, a community competition with a
tipster-level leaderboard, and an apply-as-tipster flow that an admin
approves.

Built with **Next.js 16** (App Router, Turbopack), **React 19**, and
**Supabase** for auth and the `profiles` table.

---

## Features

- **Tips catalog** with confidence borders, consensus indicators, favorites
  (localStorage), share buttons, market/tipster filters, and a matchday
  timeline.
- **Bet slip simulator** — add tips, see combined odds and payout.
- **Tipster profiles** with stats and recent tips.
- **Bookmaker leaderboard** — counts best-odds wins per bookmaker.
- **Auth** — Supabase email/password and Google OAuth, with httpOnly
  cookie sync so server components can read the session.
- **Tipster application flow** — logged-in users apply, the admin
  dashboard approves or rejects (with optional reviewer note);
  approval flips the user's `user_metadata.role` to `tipster` via
  the service-role client.
- **Community competition** — submit your own picks, levels assigned
  from win rate, ROI and resolved count (Rookie → Legend).
- **Admin dashboard** at `/admin` (gated on `user_metadata.role === "admin"`).
- **Analytics** — best-effort event logging to a local JSON file, with
  optional forwarding to Google Analytics Measurement Protocol.

---

## Stack

- Next.js `16.2.6` (App Router) + React `19.2.4`
- TypeScript 5
- Tailwind CSS v4
- `@supabase/supabase-js` v2
- Supabase-backed storage for tipster applications, community
  competition (users, submissions, leaderboard), and analytics events
  — works on serverless platforms like Vercel.

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure Supabase

Create a Supabase project. In the SQL editor, create the `profiles`
table and the RLS policies described in [`SUPABASE_RLS.md`](./SUPABASE_RLS.md),
or run an equivalent migration.

Enable the `Google` provider under Authentication → Providers if you
want OAuth login.

### 3. Environment variables

Create `.env.local`:

```bash
# Required — Supabase project URL and anon key
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Required for admin actions (approve tipster -> flip role)
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Optional — A/B variant string attached to analytics events
NEXT_PUBLIC_EXPERIMENT_VARIANT=A

# Optional — forward events to Google Analytics 4
GA_MEASUREMENT_ID=G-XXXXXXX
GA_API_SECRET=<ga-api-secret>
```

The service-role key is sensitive. Never commit it.

### 4. Make yourself an admin

After registering through `/register`, open the Supabase dashboard,
find your user under Authentication → Users, and set
`user_metadata` to:

```json
{ "role": "admin" }
```

You can now reach `/admin`.

### 5. Run

```bash
npm run dev
```

Open <http://localhost:3000>.

---

## Project structure

```
app/
  admin/                  Admin dashboard (server-gated)
  api/
    admin/                Approve/reject applications, resolve submissions
    analytics/            Event sink (file + optional GA forward)
    auth/
      apply/              Tipster application POST
      logout/             Clears auth cookies
      session/            Syncs Supabase session into httpOnly cookies
    competition/          Community leaderboard + submissions
    tips/                 Tips search/filter
  auth/callback/          OAuth landing page (syncs cookies, redirects)
  competition/            Community competition page
  forgot/                 Password-reset request
  login/  register/       Auth pages
  profile/                Server-rendered profile (reads RLS-protected row)
  tips/                   Tips catalog + detail
  tipsters/               Tipster directory + detail
  tipster/apply/          "Become a tipster" page (server-protected)
components/                UI building blocks (forms, cards, dashboard, etc.)
lib/
  data.ts                 Seed data for tips/tipsters/bookmakers/matches
  supabase.ts             Browser Supabase client
  supabase-server.ts      Server clients (user-scoped + service-role) and cookie helpers
  applications.ts         Tipster-application storage (Supabase)
  competition.ts          Competition storage + leaderboard math (Supabase)
  analytics.ts            Client-side trackEvent helper
```

---

## Beta deploy on Vercel (before the real tiphub.rs launch)

A staging deploy on Vercel lets the community kick the tires before the
brand-domain launch. Once `NEXT_PUBLIC_SITE_URL` is set to anything
ending in `.vercel.app`, the app automatically:

- Switches `app/robots.ts` to a global `Disallow: /` (no Google indexing
  of the staging URL — avoids competing with the eventual tiphub.rs).
- Adds `noindex, nofollow` to the root metadata.
- Prefixes the document title with `[Beta]`.
- Shows a gold "BETA" banner above the header explaining this is a beta.

### One-time setup

1. **Create the project on Vercel** — `vercel link` from the repo root,
   pick the team/account, accept defaults. Vercel will give you a
   hostname like `tiphub-xxx.vercel.app`.

2. **Add environment variables** in Vercel Dashboard → Project →
   Settings → Environment Variables (set "Production", "Preview", and
   "Development" together unless noted):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   RESEND_API_KEY=re_...
   NEXT_PUBLIC_SITE_URL=https://tiphub-xxx.vercel.app
   ```
   (No `DATABASE_URL` needed in Vercel — the app uses the Supabase REST
   client, not psql.)

3. **Whitelist the Vercel hostname in Supabase Auth** —
   Dashboard → Authentication → URL Configuration → Redirect URLs:
   ```
   https://tiphub-xxx.vercel.app/reset-password
   https://tiphub-xxx.vercel.app/auth/callback
   ```
   Without this, password reset and OAuth callbacks fall back to the
   localhost URL and break for beta testers.

4. **Resend domain (optional but recommended for beta with real users)**
   — by default Resend's sandbox sender `onboarding@resend.dev` only
   delivers to addresses that own your Resend account. Beta testers
   signing up with their own emails will hit a 422 from Resend. Either:
   - Verify a domain you control on Resend (DNS records under
     Domains → Add Domain) and set `EMAIL_FROM=TipHub <noreply@<that-domain>>`
     in Vercel env. This unlocks delivery to any recipient.
   - Or note the limitation in the beta announcement and keep emails
     sandboxed.

5. **Deploy** — `git push` (Vercel auto-deploys on main) or
   `vercel deploy --prod`. Smoke-test:
   - Open the Vercel URL → BETA banner visible, `[Beta]` in tab title.
   - `curl https://tiphub-xxx.vercel.app/robots.txt` → returns
     `User-agent: * Disallow: /`.
   - Subscribe to the newsletter from the footer → check inbox (only
     works if step 4 done OR you used your Resend-account email).
   - Register a test account, apply as tipster, approve from admin.

### Flipping to production (tiphub.rs)

When ready for the real launch, change `NEXT_PUBLIC_SITE_URL` in Vercel
to `https://tiphub.rs`, add the same Supabase redirect URLs for the
new host, point the apex/A record at Vercel, and redeploy. The staging
host stops being indexed automatically (robots stays Disallow), so
swap to a custom Vercel domain only after the migration is settled.

---

## Build

```bash
npm run build
```

Produces a Turbopack-optimized build with dynamic routes for anything
that touches cookies (`/login`, `/profile`, `/admin`, `/tipster/apply`,
all `/api/*`) and static prerender for everything else.

---

## Notes

- Session cookies (`supabase-access-token`, `supabase-refresh-token`)
  are set httpOnly server-side from a small `/api/auth/session`
  endpoint, so server components can read the session via
  `getSupabaseUserFromToken(token)`.
- The `data/` directory is the durable store for applications,
  competition submissions, and analytics events when self-hosting on
  a long-lived filesystem. On serverless platforms (Vercel, etc.)
  this should be replaced with Supabase tables or another database.
- ESLint and TypeScript checks run on `npm run build`.

---

## License

[MIT](./LICENSE) © 2026 Ilija Micunovic
