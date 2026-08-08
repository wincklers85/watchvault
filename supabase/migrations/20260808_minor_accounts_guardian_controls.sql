-- WatchVault protected minor accounts and responsible-adult links.
-- Applied to project wrzazkgwsldtvsgztgbl on 2026-08-08.

alter table public.profiles add column if not exists birth_date date;
alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists account_mode text not null default 'adult';
alter table public.profiles drop constraint if exists profiles_gender_check;
alter table public.profiles add constraint profiles_gender_check check (gender is null or gender in ('male','female','prefer_not_say'));
alter table public.profiles drop constraint if exists profiles_account_mode_check;
alter table public.profiles add constraint profiles_account_mode_check check (account_mode in ('adult','minor_basic'));

create or replace function private.is_minor(target_user uuid default auth.uid()) returns boolean language sql stable security definer set search_path=public as $$
 select coalesce((select p.account_mode='minor_basic' or (p.birth_date is not null and p.birth_date > (current_date-interval '18 years')::date) from public.profiles p where p.id=target_user),false)
$$;
create or replace function private.is_adult(target_user uuid default auth.uid()) returns boolean language sql stable security definer set search_path=public as $$ select target_user is not null and not private.is_minor(target_user) $$;

create table if not exists public.minor_guardians(
 id uuid primary key default gen_random_uuid(),
 minor_id uuid not null references public.profiles(id) on delete cascade,
 guardian_id uuid not null references public.profiles(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','accepted','declined','revoked')),
 responsibility_accepted_at timestamptz,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(minor_id,guardian_id),check(minor_id<>guardian_id)
);
alter table public.minor_guardians enable row level security;

create or replace function private.is_active_guardian(target_minor uuid,target_guardian uuid default auth.uid()) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.minor_guardians g where g.minor_id=target_minor and g.guardian_id=target_guardian and g.status='accepted')
$$;

create or replace function public.invite_guardian_by_username(p_username text) returns public.minor_guardians language plpgsql security definer set search_path=public as $$
declare v_minor uuid:=auth.uid();v_guardian uuid;v_row public.minor_guardians;
begin
 if v_minor is null or not private.is_minor(v_minor) then raise exception 'Only minor accounts can appoint a responsible adult';end if;
 select id into v_guardian from public.profiles where lower(username)=lower(trim(p_username)) limit 1;
 if v_guardian is null then raise exception 'Adult profile not found';end if;
 if not private.is_adult(v_guardian) then raise exception 'The responsible profile must belong to an adult';end if;
 insert into public.minor_guardians(minor_id,guardian_id,status,responsibility_accepted_at,updated_at) values(v_minor,v_guardian,'pending',null,now())
 on conflict(minor_id,guardian_id) do update set status='pending',responsibility_accepted_at=null,updated_at=now() returning * into v_row;
 return v_row;
end $$;
grant execute on function public.invite_guardian_by_username(text) to authenticated;

create or replace function public.respond_guardian_link(p_link_id uuid,p_accept boolean) returns public.minor_guardians language plpgsql security definer set search_path=public as $$
declare v_row public.minor_guardians;
begin
 if auth.uid() is null or not private.is_adult(auth.uid()) then raise exception 'An adult account is required';end if;
 update public.minor_guardians set status=case when p_accept then 'accepted' else 'declined' end,responsibility_accepted_at=case when p_accept then now() else null end,updated_at=now()
 where id=p_link_id and guardian_id=auth.uid() and status='pending' returning * into v_row;
 if v_row.id is null then raise exception 'Guardian request not found';end if;return v_row;
end $$;
grant execute on function public.respond_guardian_link(uuid,boolean) to authenticated;

create or replace function public.revoke_guardian_link(p_link_id uuid) returns void language plpgsql security definer set search_path=public as $$
begin update public.minor_guardians set status='revoked',updated_at=now() where id=p_link_id and (minor_id=auth.uid() or guardian_id=auth.uid());end $$;
grant execute on function public.revoke_guardian_link(uuid) to authenticated;

drop policy if exists minor_guardians_read on public.minor_guardians;
create policy minor_guardians_read on public.minor_guardians for select to authenticated using(minor_id=auth.uid() or guardian_id=auth.uid() or private.is_admin());

create or replace function private.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare v_birth date;v_mode text:='adult';
begin
 begin v_birth:=nullif(new.raw_user_meta_data->>'birth_date','')::date;exception when others then v_birth:=null;end;
 if v_birth is not null and v_birth>(current_date-interval '18 years')::date then v_mode:='minor_basic';end if;
 insert into public.profiles(id,username,full_name,birth_date,gender,account_mode,profile_visibility,public_collection)
 values(new.id,lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username',split_part(new.email,'@',1),'user_'||substr(new.id::text,1,8)),'[^a-zA-Z0-9_]+','','g')),new.raw_user_meta_data->>'full_name',v_birth,case when new.raw_user_meta_data->>'gender' in ('male','female','prefer_not_say') then new.raw_user_meta_data->>'gender' else null end,v_mode,case when v_mode='minor_basic' then 'private' else 'public' end,case when v_mode='minor_basic' then false else true end)
 on conflict(id) do nothing;
 insert into public.collections(owner_id,name,visibility,is_default) values(new.id,'La mia collezione',case when v_mode='minor_basic' then 'private' else 'public' end,true) on conflict do nothing;
 return new;
end $$;

-- Guardians can inspect the linked collection and operational history, but private documents remain owner-only.
drop policy if exists watches_guardian_read on public.watches;
create policy watches_guardian_read on public.watches for select to authenticated using(private.is_active_guardian(owner_id,auth.uid()));
drop policy if exists collections_guardian_read on public.collections;
create policy collections_guardian_read on public.collections for select to authenticated using(private.is_active_guardian(owner_id,auth.uid()));
drop policy if exists watch_images_guardian_read on public.watch_images;
create policy watch_images_guardian_read on public.watch_images for select to authenticated using(exists(select 1 from public.watches w where w.id=watch_images.watch_id and private.is_active_guardian(w.owner_id,auth.uid())));
drop policy if exists watch_service_guardian_read on public.watch_service_history;
create policy watch_service_guardian_read on public.watch_service_history for select to authenticated using(exists(select 1 from public.watches w where w.id=watch_service_history.watch_id and private.is_active_guardian(w.owner_id,auth.uid())));
drop policy if exists watch_reminders_guardian_read on public.watch_reminders;
create policy watch_reminders_guardian_read on public.watch_reminders for select to authenticated using(exists(select 1 from public.watches w where w.id=watch_reminders.watch_id and private.is_active_guardian(w.owner_id,auth.uid())));
drop policy if exists passport_guardian_read on public.watch_passport_events;
create policy passport_guardian_read on public.watch_passport_events for select to authenticated using(exists(select 1 from public.watches w where w.id=watch_passport_events.watch_id and private.is_active_guardian(w.owner_id,auth.uid())));

-- Social participation and messaging are adult-only. Restrictive policies combine with existing ownership policies.
do $$ declare t text;begin foreach t in array array['posts','comments','post_reactions','likes','follows','friend_requests','saved_posts','conversations','conversation_members','messages'] loop if to_regclass('public.'||t) is not null then execute format('drop policy if exists adult_only_%I on public.%I',t,t);execute format('create policy adult_only_%I on public.%I as restrictive for all to authenticated using (private.is_adult(auth.uid())) with check (private.is_adult(auth.uid()))',t,t);end if;end loop;end $$;

-- Knowledge can be read by minors, but contributions are adult-only.
do $$ declare t text;begin foreach t in array array['knowledge_articles','knowledge_comments','knowledge_votes'] loop if to_regclass('public.'||t) is not null then execute format('drop policy if exists adult_write_%I on public.%I',t,t);execute format('create policy adult_write_%I on public.%I as restrictive for insert to authenticated with check (private.is_adult(auth.uid()))',t,t);end if;end loop;end $$;

-- Marketplace is adult-only. Anonymous reads are disabled so signing out cannot bypass the protected mode.
do $$ declare t text;begin foreach t in array array['marketplace_listings','marketplace_offers','marketplace_comments','marketplace_favorites','marketplace_listing_likes','marketplace_listing_views','marketplace_images','marketplace_offer_events','marketplace_listing_edit_history'] loop if to_regclass('public.'||t) is not null then execute format('drop policy if exists adult_only_%I on public.%I',t,t);execute format('create policy adult_only_%I on public.%I as restrictive for all to authenticated using (private.is_adult(auth.uid())) with check (private.is_adult(auth.uid()))',t,t);execute format('drop policy if exists no_anon_%I on public.%I',t,t);execute format('create policy no_anon_%I on public.%I as restrictive for select to anon using (false)',t,t);end if;end loop;end $$;
do $$ declare t text;begin foreach t in array array['posts','comments'] loop execute format('drop policy if exists no_anon_%I on public.%I',t,t);execute format('create policy no_anon_%I on public.%I as restrictive for select to anon using (false)',t,t);end loop;end $$;

-- An accepted responsible adult can list a linked minor's watch while remaining the seller of record.
create or replace function public.validate_listing_responsibility() returns trigger language plpgsql security definer set search_path=public as $$
declare v_owner uuid;
begin
 if not private.is_adult(new.seller_id) then raise exception 'Marketplace requires an adult account';end if;
 if new.watch_id is not null then select owner_id into v_owner from public.watches where id=new.watch_id;if v_owner is null then raise exception 'Watch not found';end if;if v_owner<>new.seller_id and not private.is_active_guardian(v_owner,new.seller_id) then raise exception 'Seller is not authorized to represent this watch owner';end if;end if;return new;
end $$;
drop trigger if exists trg_validate_listing_responsibility on public.marketplace_listings;
create trigger trg_validate_listing_responsibility before insert or update of seller_id,watch_id on public.marketplace_listings for each row execute function public.validate_listing_responsibility();

drop policy if exists listings_owner on public.marketplace_listings;
create policy listings_owner on public.marketplace_listings for all to authenticated using((seller_id=auth.uid() and private.is_adult(auth.uid())) or private.is_admin()) with check((seller_id=auth.uid() and private.is_adult(auth.uid())) or private.is_admin());
