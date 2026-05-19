# Supabase schema for TipHub

This is the full database setup TipHub expects. Run the SQL in the
Supabase SQL editor on a fresh project (or via `supabase migration`).

## 1. `profiles` — per-user app data, RLS by `auth.uid()`

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  favorite_tipster text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Select own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "Insert own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "Update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
```

### Migration: adding `avatar_url` to an existing project

If your project predates the avatar picker (column was added 2026-05-19),
run this once in the SQL Editor:

```sql
alter table public.profiles add column if not exists avatar_url text;
```

## 2. Auto-create profile row on signup

Email confirmation is on by default in Supabase, which means `signUp`
returns no session — a client-side `profiles.insert(...)` would be
blocked by RLS. Use a trigger:

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, favorite_tipster, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'favorite_tipster',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

## 3. App tables — server-only access via service role

All three tables enable RLS with **no policies**, so anon and
authenticated direct REST access is denied. The app accesses them
only through Next API routes using `SUPABASE_SERVICE_ROLE_KEY`.

```sql
create extension if not exists pgcrypto;

-- Tipster applications submitted via /api/auth/apply
create table public.tipster_applications (
  id text primary key default ('a-' || encode(gen_random_bytes(8), 'hex')),
  user_id uuid not null references auth.users(id) on delete cascade,
  specialty text not null,
  bio text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_id uuid references auth.users(id) on delete set null,
  note text
);
alter table public.tipster_applications enable row level security;
create index on public.tipster_applications (status);
create index on public.tipster_applications (user_id);

-- Community competition: free-form name/email entries, not tied to auth
create table public.competition_users (
  id text primary key default ('u-' || encode(gen_random_bytes(6), 'hex')),
  name text not null,
  email text not null unique,
  joined_at timestamptz not null default now()
);
alter table public.competition_users enable row level security;

create table public.competition_submissions (
  id text primary key default ('s-' || encode(gen_random_bytes(6), 'hex')),
  user_id text not null references public.competition_users(id) on delete cascade,
  match_id text not null,
  market text not null,
  prediction text not null,
  odds numeric not null check (odds > 1),
  stake numeric not null check (stake > 0),
  status text not null default 'pending' check (status in ('pending','won','lost')),
  result_amount numeric not null default 0,
  created_at timestamptz not null default now()
);
alter table public.competition_submissions enable row level security;
create index on public.competition_submissions (user_id);
create index on public.competition_submissions (status);

-- Analytics events, written by /api/analytics
create table public.analytics_events (
  id bigserial primary key,
  name text not null,
  variant text,
  payload jsonb,
  ts timestamptz not null default now()
);
alter table public.analytics_events enable row level security;
create index on public.analytics_events (ts desc);
create index on public.analytics_events (name);
```

## 3b. `newsletter_subscribers` — double-opt-in mailing list

Server-only access via the service role. Email is unique
(case-insensitive). One opaque `token` covers both confirm and
unsubscribe — the action is determined by the URL path. Regenerated
whenever a row resubscribes after unsubscribing.

```sql
create extension if not exists citext;

create table public.newsletter_subscribers (
  id text primary key default ('n-' || encode(gen_random_bytes(8), 'hex')),
  email citext not null unique,
  status text not null default 'pending' check (status in ('pending','confirmed','unsubscribed')),
  token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);
alter table public.newsletter_subscribers enable row level security;
create index on public.newsletter_subscribers (status);
create index on public.newsletter_subscribers (token);
```

## 3a. Realtime leaderboard

The community competition leaderboard (`/competition`) subscribes to
postgres changes on `competition_submissions` so rankings update live
when admins resolve a tip or new tips come in. Realtime broadcasts go
through RLS, so the table needs a read policy *and* must be added to
the `supabase_realtime` publication:

```sql
create policy "Anon read competition submissions for realtime"
  on public.competition_submissions for select to anon
  using (true);

create policy "Authenticated read competition submissions for realtime"
  on public.competition_submissions for select to authenticated
  using (true);

alter publication supabase_realtime add table public.competition_submissions;
```

The exposed columns contain no PII (opaque `user_id`, `match_id`,
`market`, `prediction`, `odds`, `stake`, `status`). Email + display
name live in `competition_users`, which keeps its server-only access.

## 4. Auth URL configuration

Supabase only honors `redirectTo` values that match the project's
**Redirect URLs** allowlist (Authentication → URL Configuration in the
dashboard). The default Site URL alone is not enough.

Add at minimum:

```
http://localhost:3000/reset-password
http://localhost:3000/auth/callback
https://<your-production-domain>/reset-password
https://<your-production-domain>/auth/callback
```

Without `/reset-password` in this list, the password-reset email link
falls back to the Site URL — the user lands on `/` with the recovery
token in the URL hash but no form to use it.

## 5. Granting admin role

After registering normally, find your user under Supabase
Authentication → Users and set its `user_metadata` to:

```json
{ "role": "admin" }
```

The admin dashboard (`/admin`) checks `user_metadata.role === "admin"`
on every request. When that user later approves a tipster
application, the admin route uses the service role to set the
applicant's `user_metadata.role = "tipster"`.

## 6. Optional — Google OAuth

To enable the "Continue with Google" buttons in Login/Register,
enable the **Google** provider under Authentication → Providers and
re-add the OAuth buttons in `components/LoginForm.tsx` and
`components/RegisterForm.tsx`. The `/auth/callback` page is already
scaffolded.
