alter table public.watches add column if not exists qr_token uuid not null default gen_random_uuid();
alter table public.watches add column if not exists is_numbered boolean not null default false;
alter table public.watches add column if not exists edition_number integer;
alter table public.watches add column if not exists edition_total integer;
create unique index if not exists watches_qr_token_key on public.watches(qr_token);

create or replace function public.get_watch_by_qr(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.watches%rowtype;
  logged_in boolean := auth.uid() is not null;
  result jsonb;
begin
  select * into w from public.watches where qr_token = p_token limit 1;
  if not found then return null; end if;

  result := jsonb_build_object(
    'id', w.id,
    'brand', w.brand,
    'model', w.model,
    'reference', w.reference,
    'production_year', w.production_year,
    'movement_type', w.movement_type,
    'movement', w.movement,
    'caliber', w.caliber,
    'material', w.material,
    'diameter_mm', w.diameter_mm,
    'water_resistance_m', w.water_resistance_m,
    'bracelet_type', w.bracelet_type,
    'dial_color', w.dial_color,
    'condition', w.condition,
    'public_story', w.public_story,
    'cover_image_url', w.cover_image_url,
    'is_numbered', w.is_numbered,
    'edition_number', w.edition_number,
    'edition_total', w.edition_total,
    'authenticated', logged_in
  );

  if logged_in then
    result := result || jsonb_build_object(
      'serial_number', w.serial_number,
      'complications', w.complications,
      'box_included', w.box_included,
      'papers_included', w.papers_included,
      'status', w.status,
      'estimated_value', w.estimated_value,
      'currency', w.currency
    );
  end if;

  return result;
end;
$$;

grant execute on function public.get_watch_by_qr(uuid) to anon, authenticated;
