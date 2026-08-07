alter table public.watches add column if not exists battery_status text check (battery_status in ('ok','low','replace','not_applicable')) default 'not_applicable';
alter table public.watches add column if not exists battery_checked_at date;
alter table public.watches add column if not exists accuracy_seconds_day numeric(8,2);
alter table public.watches add column if not exists last_water_test_at date;

create table if not exists public.marketplace_offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(14,2), currency text not null default 'EUR', message text,
  status text not null default 'pending' check(status in ('pending','accepted','rejected','withdrawn')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.marketplace_offers enable row level security;
create policy marketplace_offers_parties_read on public.marketplace_offers for select to authenticated using (buyer_id=(select auth.uid()) or seller_id=(select auth.uid()) or private.is_admin());
create policy marketplace_offers_buyer_insert on public.marketplace_offers for insert to authenticated with check (buyer_id=(select auth.uid()) and buyer_id<>seller_id);
create policy marketplace_offers_parties_update on public.marketplace_offers for update to authenticated using (buyer_id=(select auth.uid()) or seller_id=(select auth.uid()) or private.is_admin()) with check (buyer_id=(select auth.uid()) or seller_id=(select auth.uid()) or private.is_admin());
grant select,insert,update on public.marketplace_offers to authenticated;
create index if not exists idx_marketplace_offers_listing on public.marketplace_offers(listing_id,created_at desc);
