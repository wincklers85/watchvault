-- Applied remotely to WatchVault Supabase on 2026-08-08.
-- Marketplace lifecycle: sold visibility window, withdrawal, edits and view counter.
alter table public.marketplace_listings add column if not exists sold_at timestamptz;
alter table public.marketplace_listings add column if not exists hide_after timestamptz;
alter table public.marketplace_listings add column if not exists edited_at timestamptz;
alter table public.marketplace_listings add column if not exists view_count bigint not null default 0;
alter table public.marketplace_listings add column if not exists withdrawn_at timestamptz;

-- Offer workflow: accept / reject / counter with 12-hour anti-spam guard.
alter table public.marketplace_offers add column if not exists counter_amount numeric(14,2);
alter table public.marketplace_offers add column if not exists responded_at timestamptz;
alter table public.marketplace_offers add column if not exists response_message text;
alter table public.marketplace_offers add column if not exists updated_at timestamptz not null default now();

create table if not exists public.marketplace_listing_likes(listing_id uuid references public.marketplace_listings(id) on delete cascade,user_id uuid references public.profiles(id) on delete cascade,created_at timestamptz not null default now(),primary key(listing_id,user_id));
create table if not exists public.marketplace_comments(id uuid primary key default gen_random_uuid(),listing_id uuid not null references public.marketplace_listings(id) on delete cascade,author_id uuid not null references public.profiles(id) on delete cascade,body text not null,status text not null default 'pending',created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.marketplace_offer_events(id uuid primary key default gen_random_uuid(),offer_id uuid not null references public.marketplace_offers(id) on delete cascade,actor_id uuid not null references public.profiles(id) on delete cascade,event_type text not null,amount numeric(14,2),message text,created_at timestamptz not null default now());
create table if not exists public.post_reactions(post_id uuid references public.posts(id) on delete cascade,user_id uuid references public.profiles(id) on delete cascade,sticker text not null,created_at timestamptz not null default now(),primary key(post_id,user_id,sticker));
alter table public.posts add column if not exists edited_at timestamptz;

-- RLS, grants, increment_marketplace_view() and marketplace_offer_guard() are installed in the remote migration with the same logical scope.
