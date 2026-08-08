-- Applied remotely to WatchVault Supabase on 2026-08-08.
-- Adds unique marketplace viewer tracking (without exposing viewer identities),
-- refines the 12-hour/pending offer guard, adds friend requests and listing edit history.

create table if not exists public.marketplace_listing_views(
  listing_id uuid references public.marketplace_listings(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete cascade,
  first_viewed_at timestamptz not null default now(),
  last_viewed_at timestamptz not null default now(),
  primary key(listing_id,viewer_id)
);

create table if not exists public.friend_requests(
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique(requester_id,addressee_id)
);

create table if not exists public.marketplace_listing_edit_history(
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  changes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Remote migration also installs RLS policies, the privacy-preserving unique-view RPC,
-- the revised marketplace_offer_guard trigger, and automatic listing edit history trigger.
