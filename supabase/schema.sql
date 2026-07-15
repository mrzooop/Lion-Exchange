-- Lion Exchange — database schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- Safe to re-run: most statements use IF NOT EXISTS / ON CONFLICT guards.

-- ── Enums ──────────────────────────────────────────────────────────────
do $$ begin
  create type listing_category as enum ('food', 'groceries', 'household');
exception when duplicate_object then null; end $$;

do $$ begin
  create type listing_status as enum ('available', 'claimed', 'collected', 'expired');
exception when duplicate_object then null; end $$;

-- ── Tables ─────────────────────────────────────────────────────────────

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  category listing_category not null,
  is_free boolean not null default false,
  price numeric(10, 2),
  quantity integer not null default 1 check (quantity > 0),
  photo_url text,
  pickup_location text not null,
  expires_at timestamptz not null,
  status listing_status not null default 'available',
  claimed_by uuid references profiles (id) on delete set null,
  claimed_at timestamptz,
  collected_at timestamptz,
  created_at timestamptz not null default now(),
  constraint price_set_unless_free check (is_free or price is not null),
  constraint price_non_negative check (price is null or price >= 0)
);

create index if not exists listings_status_idx on listings (status);
create index if not exists listings_owner_idx on listings (owner_id);
create index if not exists listings_claimed_by_idx on listings (claimed_by);
create index if not exists listings_expires_at_idx on listings (expires_at);

-- ── New-user provisioning + email domain gate ────────────────────────────
-- Runs inside the same transaction Supabase Auth uses to create the
-- auth.users row, so raising an exception here rejects the signup
-- entirely — not just a client-side check that a direct API call could skip.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email !~* '^[^@]+@columbia\.edu$' then
    raise exception 'Only @columbia.edu email addresses may sign up';
  end if;

  insert into public.profiles (id, email)
  values (new.id, new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Row Level Security ────────────────────────────────────────────────

alter table profiles enable row level security;
alter table listings enable row level security;

drop policy if exists "profiles readable by authenticated users" on profiles;
create policy "profiles readable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

drop policy if exists "users update own profile" on profiles;
create policy "users update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

drop policy if exists "listings readable by authenticated users" on listings;
create policy "listings readable by authenticated users"
  on listings for select
  to authenticated
  using (true);

drop policy if exists "users create own listings" on listings;
create policy "users create own listings"
  on listings for insert
  to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "owners update own listings" on listings;
create policy "owners update own listings"
  on listings for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "owners delete own listings" on listings;
create policy "owners delete own listings"
  on listings for delete
  to authenticated
  using (auth.uid() = owner_id);

-- Claiming and marking-collected are NOT covered by the update policy above
-- (a claimer isn't the owner). Those go through the SECURITY DEFINER
-- functions below instead, so the row-level rules that matter — "only one
-- claimer wins", "only claimer/owner can collect" — live in one place and
-- can't be bypassed by an ordinary client-side update.

-- ── Expired-listing view ──────────────────────────────────────────────
-- Rather than a cron job rewriting rows, "expired" is computed at read
-- time: an available listing whose expires_at has passed reads as
-- expired. `security_invoker = true` makes the view respect the querying
-- user's own RLS policies instead of the view creator's.

create or replace view listings_view
  with (security_invoker = true) as
select
  l.*,
  case
    when l.status = 'available' and l.expires_at < now() then 'expired'::listing_status
    else l.status
  end as computed_status
from listings l;

-- ── Claim / collect RPCs (atomic, race-safe) ──────────────────────────

create or replace function claim_listing(p_listing_id uuid)
returns listings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing listings;
begin
  update listings
  set status = 'claimed',
      claimed_by = auth.uid(),
      claimed_at = now()
  where id = p_listing_id
    and status = 'available'
    and expires_at > now()
    and owner_id <> auth.uid()
  returning * into v_listing;

  if v_listing.id is null then
    raise exception 'Listing is no longer available to claim';
  end if;

  return v_listing;
end;
$$;

create or replace function mark_collected(p_listing_id uuid)
returns listings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing listings;
begin
  update listings
  set status = 'collected',
      collected_at = now()
  where id = p_listing_id
    and status = 'claimed'
    and (claimed_by = auth.uid() or owner_id = auth.uid())
  returning * into v_listing;

  if v_listing.id is null then
    raise exception 'Listing cannot be marked as collected';
  end if;

  return v_listing;
end;
$$;

grant execute on function claim_listing(uuid) to authenticated;
grant execute on function mark_collected(uuid) to authenticated;

-- ── Storage: listing photos ─────────────────────────────────────────────
-- One public bucket. Each upload is keyed "<user_id>/<filename>" so the
-- policies can check the folder name against auth.uid() without a DB lookup.

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

drop policy if exists "public read listing photos" on storage.objects;
create policy "public read listing photos"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

drop policy if exists "users upload own listing photos" on storage.objects;
create policy "users upload own listing photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users manage own listing photos" on storage.objects;
create policy "users manage own listing photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete own listing photos" on storage.objects;
create policy "users delete own listing photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
