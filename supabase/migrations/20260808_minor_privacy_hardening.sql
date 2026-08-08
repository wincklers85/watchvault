-- Follow-up hardening for protected minor accounts.
create or replace function private.protect_profile_age_and_minor_privacy() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if auth.uid()=old.id and not private.is_admin() then
  if new.birth_date is distinct from old.birth_date or new.account_mode is distinct from old.account_mode then raise exception 'Birth date and account mode cannot be changed directly';end if;
  if old.account_mode='minor_basic' then new.profile_visibility:='private';new.public_collection:=false;end if;
 end if;return new;
end $$;
drop trigger if exists trg_protect_profile_age_and_minor_privacy on public.profiles;
create trigger trg_protect_profile_age_and_minor_privacy before update on public.profiles for each row execute function private.protect_profile_age_and_minor_privacy();

drop policy if exists minor_watch_insert_private on public.watches;
create policy minor_watch_insert_private on public.watches as restrictive for insert to authenticated with check(not private.is_minor(auth.uid()) or(owner_id=auth.uid() and visibility='private'));
drop policy if exists minor_watch_update_private on public.watches;
create policy minor_watch_update_private on public.watches as restrictive for update to authenticated using(true) with check(not private.is_minor(auth.uid()) or(owner_id=auth.uid() and visibility='private'));
drop policy if exists minor_collection_insert_private on public.collections;
create policy minor_collection_insert_private on public.collections as restrictive for insert to authenticated with check(not private.is_minor(auth.uid()) or(owner_id=auth.uid() and visibility='private'));
drop policy if exists minor_collection_update_private on public.collections;
create policy minor_collection_update_private on public.collections as restrictive for update to authenticated using(true) with check(not private.is_minor(auth.uid()) or(owner_id=auth.uid() and visibility='private'));

do $$ declare t text;begin foreach t in array array['knowledge_articles','knowledge_comments','knowledge_votes'] loop if to_regclass('public.'||t) is not null then execute format('drop policy if exists adult_update_%I on public.%I',t,t);execute format('create policy adult_update_%I on public.%I as restrictive for update to authenticated using (private.is_adult(auth.uid())) with check (private.is_adult(auth.uid()))',t,t);execute format('drop policy if exists adult_delete_%I on public.%I',t,t);execute format('create policy adult_delete_%I on public.%I as restrictive for delete to authenticated using (private.is_adult(auth.uid()))',t,t);end if;end loop;end $$;

revoke all on function public.invite_guardian_by_username(text) from public,anon;
revoke all on function public.respond_guardian_link(uuid,boolean) from public,anon;
revoke all on function public.revoke_guardian_link(uuid) from public,anon;
grant execute on function public.invite_guardian_by_username(text) to authenticated;
grant execute on function public.respond_guardian_link(uuid,boolean) to authenticated;
grant execute on function public.revoke_guardian_link(uuid) to authenticated;
revoke all on function public.validate_listing_responsibility() from public,anon,authenticated;
