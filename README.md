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
- File-based JSON storage under `data/` for competition submissions,
  tipster applications, and analytics events (suitable for prototyping
  and self-hosted deployments — not for serverless production).

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
  applications.ts         Tipster-application storage (data/applications.json)
  competition.ts          Competition storage + leaderboard math
  analytics.ts            Client-side trackEvent helper
data/                      Runtime JSON storage (gitignore in real deploys)
```

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

This project has no license file yet; treat it as "all rights reserved"
until one is added.
