-- WatchVault v3: rende operative collezione, manutenzioni, community e marketplace

alter table public.watches add column if not exists movement text;
alter table public.watches add column if not exists caliber text;
alter table public.watches add column if not exists diameter_mm numeric;
alter table public.watches add column if not exists material text;
alter table public.watches add column if not exists dial text;
alter table public.watches add column if not exists water_resistance_m integer;
alter table public.watches add column if not exists cover_image_url text;

-- Permette la creazione del profilo personale se il trigger originale non era presente.
insert into public.profiles(id,username,full_name)
select id, coalesce(raw_user_meta_data->>'username', split_part(email,'@',1)), raw_user_meta_data->>'full_name'
from auth.users
on conflict (id) do nothing;

-- Storage immagini
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('watch-photos','watch-photos',true,10485760,array['image/jpeg','image/png','image/webp','image/heic','image/heif'])
on conflict (id) do update set public=true,file_size_limit=10485760;

drop policy if exists "watch photos authenticated upload" on storage.objects;
drop policy if exists "watch photos owner update" on storage.objects;
drop policy if exists "watch photos owner delete" on storage.objects;
create policy "watch photos authenticated upload" on storage.objects for insert to authenticated with check(bucket_id='watch-photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "watch photos owner update" on storage.objects for update to authenticated using(bucket_id='watch-photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "watch photos owner delete" on storage.objects for delete to authenticated using(bucket_id='watch-photos' and (storage.foldername(name))[1]=auth.uid()::text);

-- Le policy di base vengono rese idempotenti.
drop policy if exists "profiles public read" on public.profiles;
drop policy if exists "profiles own update" on public.profiles;
create policy "profiles public read" on public.profiles for select using (true);
create policy "profiles own update" on public.profiles for update using (auth.uid()=id) with check(auth.uid()=id);

drop policy if exists "watches visible read" on public.watches;
drop policy if exists "watches own all" on public.watches;
create policy "watches visible read" on public.watches for select using (visibility='public' or owner_id=auth.uid());
create policy "watches own all" on public.watches for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());

drop policy if exists "maintenance own all" on public.maintenance;
create policy "maintenance own all" on public.maintenance for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());

drop policy if exists "posts public read" on public.posts;
drop policy if exists "posts own insert" on public.posts;
drop policy if exists "posts own modify" on public.posts;
create policy "posts public read" on public.posts for select using (true);
create policy "posts own insert" on public.posts for insert with check (author_id=auth.uid());
create policy "posts own modify" on public.posts for update using (author_id=auth.uid()) with check (author_id=auth.uid());
create policy "posts own delete" on public.posts for delete using (author_id=auth.uid());

drop policy if exists "listings public read" on public.listings;
drop policy if exists "listings own" on public.listings;
create policy "listings public read" on public.listings for select using (true);
create policy "listings own" on public.listings for all using (seller_id=auth.uid()) with check (seller_id=auth.uid());

-- Assicura che il trigger utenti esista.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,username,full_name)
  values(new.id,coalesce(new.raw_user_meta_data->>'username',split_part(new.email,'@',1)),new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
