# Supabase RLS Setup for TipHub

This project now expects a Supabase `profiles` table with Row Level Security enabled.

## Recommended table schema

Run this SQL in Supabase SQL editor:

```sql
create table profiles (
  id uuid primary key references auth.users(id),
  full_name text,
  favorite_tipster text,
  email text,
  created_at timestamp with time zone default now()
);
```

## Enable RLS

In Supabase Table Editor for `profiles`, turn on `Row Level Security`.

## Add policies

Use the following policies:

### SELECT own profile
```sql
create policy "Select own profile" on profiles
for select
using (auth.uid() = id);
```

### INSERT own profile
```sql
create policy "Insert own profile" on profiles
for insert
with check (auth.uid() = id);
```

### UPDATE own profile
```sql
create policy "Update own profile" on profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);
```

## How this project uses it

- `components/RegisterForm.tsx` now creates a `profiles` row when a new Supabase user registers.
- `app/profile/page.tsx` fetches the current user's row from `profiles`.
- If RLS is configured correctly, the anon Supabase key can only read/insert the signed-in user's own profile row.

## Optional server-side admin key

If you want to use server-side service actions, set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
