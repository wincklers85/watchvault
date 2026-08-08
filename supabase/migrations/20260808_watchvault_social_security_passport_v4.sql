alter table public.comments add column if not exists edited_at timestamptz;
alter table public.comments add column if not exists deleted_at timestamptz;
alter table public.profiles add column if not exists collector_verified boolean not null default false;
alter table public.profiles add column if not exists seller_verified boolean not null default false;
alter table public.profiles add column if not exists public_collection boolean not null default true;
alter table public.marketplace_listings add column if not exists reserved_at timestamptz;
alter table public.marketplace_listings add column if not exists reserved_for uuid references auth.users(id) on delete set null;

create table if not exists public.watch_passport_events (
  id uuid primary key default gen_random_uuid(), watch_id uuid not null references public.watches(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade, event_type text not null, title text not null,
  description text, event_date date not null default current_date, amount numeric, currency text not null default 'EUR',
  is_public boolean not null default false, document_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists watch_passport_events_watch_idx on public.watch_passport_events(watch_id,event_date desc);
alter table public.watch_passport_events enable row level security;
drop policy if exists passport_owner_all on public.watch_passport_events;
create policy passport_owner_all on public.watch_passport_events for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());
drop policy if exists passport_public_read on public.watch_passport_events;
create policy passport_public_read on public.watch_passport_events for select using (is_public=true);

create table if not exists public.watch_transfers (
  id uuid primary key default gen_random_uuid(), watch_id uuid not null references public.watches(id) on delete cascade,
  from_user_id uuid not null references auth.users(id) on delete cascade, to_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending', message text, created_at timestamptz not null default now(), responded_at timestamptz
);
create index if not exists watch_transfers_users_idx on public.watch_transfers(from_user_id,to_user_id,status);
alter table public.watch_transfers enable row level security;
drop policy if exists transfers_participants_read on public.watch_transfers;
create policy transfers_participants_read on public.watch_transfers for select using (auth.uid() in (from_user_id,to_user_id));
drop policy if exists transfers_sender_insert on public.watch_transfers;
create policy transfers_sender_insert on public.watch_transfers for insert with check (from_user_id=auth.uid());
drop policy if exists transfers_participants_update on public.watch_transfers;
create policy transfers_participants_update on public.watch_transfers for update using (auth.uid() in (from_user_id,to_user_id));

create or replace function public.accept_watch_transfer(p_transfer uuid)
returns void language plpgsql security definer set search_path=public as $$
declare t public.watch_transfers%rowtype;
begin
  select * into t from public.watch_transfers where id=p_transfer for update;
  if t.id is null then raise exception 'Trasferimento non trovato'; end if;
  if t.to_user_id<>auth.uid() then raise exception 'Non autorizzato'; end if;
  if t.status<>'pending' then raise exception 'Trasferimento già gestito'; end if;
  update public.watches set owner_id=t.to_user_id,updated_at=now() where id=t.watch_id and owner_id=t.from_user_id;
  update public.watch_transfers set status='accepted',responded_at=now() where id=t.id;
  insert into public.watch_passport_events(watch_id,owner_id,event_type,title,description,event_date,is_public)
  values(t.watch_id,t.to_user_id,'transfer','Trasferimento proprietà','Orologio trasferito tramite WatchVault',current_date,true);
end $$;
grant execute on function public.accept_watch_transfer(uuid) to authenticated;
