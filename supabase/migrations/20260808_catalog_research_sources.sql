create table if not exists public.watch_model_sources (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.watch_models(id) on delete cascade,
  title text not null,
  url text not null,
  source_type text not null default 'web',
  language text,
  checked_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(model_id,url)
);
alter table public.watch_model_sources enable row level security;
drop policy if exists watch_model_sources_read on public.watch_model_sources;
create policy watch_model_sources_read on public.watch_model_sources for select using (true);
drop policy if exists watch_model_sources_admin_insert on public.watch_model_sources;
create policy watch_model_sources_admin_insert on public.watch_model_sources for insert with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','superuser')));
drop policy if exists watch_model_sources_admin_update on public.watch_model_sources;
create policy watch_model_sources_admin_update on public.watch_model_sources for update using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','superuser')));

create or replace function public.catalog_promote_candidate_researched(
  p_candidate uuid,
  p_description text default null,
  p_history text default null,
  p_uniqueness text default null,
  p_sources jsonb default '[]'::jsonb
) returns uuid language plpgsql security definer set search_path=public as $$
declare me_role text; c public.catalog_model_candidates; b_id uuid; m_id uuid; s jsonb;
begin
 select role into me_role from public.profiles where id=auth.uid();
 if me_role not in ('admin','superuser') then raise exception 'Not allowed'; end if;
 select * into c from public.catalog_model_candidates where id=p_candidate for update;
 if not found then raise exception 'Candidate not found'; end if;
 select id into b_id from public.brands where lower(name)=lower(c.brand) limit 1;
 if b_id is null then
   insert into public.brands(name,slug) values(c.brand,lower(trim(both '-' from regexp_replace(c.brand,'[^a-zA-Z0-9]+','-','g')))) returning id into b_id;
 end if;
 insert into public.watch_models(brand_id,model,slug,reference,description,historical_summary,uniqueness_notes,source_notes,created_by,is_verified,catalog_status,approved_by,approved_at,community_count)
 values(b_id,c.model,lower(trim(both '-' from regexp_replace(c.brand||'-'||c.model||'-'||coalesce(c.reference,''),'[^a-zA-Z0-9]+','-','g'))),c.reference,p_description,p_history,p_uniqueness,'Ricerca automatica da fonti pubbliche; revisione editoriale richiesta.',auth.uid(),true,'published',auth.uid(),now(),c.observation_count)
 returning id into m_id;
 for s in select * from jsonb_array_elements(coalesce(p_sources,'[]'::jsonb)) loop
   if coalesce(s->>'url','')<>'' then
     insert into public.watch_model_sources(model_id,title,url,source_type,language,created_by)
     values(m_id,coalesce(s->>'title',s->>'url'),s->>'url',coalesce(s->>'source_type','web'),s->>'language',auth.uid())
     on conflict(model_id,url) do nothing;
   end if;
 end loop;
 update public.catalog_model_candidates set status='promoted',updated_at=now() where id=p_candidate;
 return m_id;
end $$;
revoke all on function public.catalog_promote_candidate_researched(uuid,text,text,text,jsonb) from public;
grant execute on function public.catalog_promote_candidate_researched(uuid,text,text,text,jsonb) to authenticated;
