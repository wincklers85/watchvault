create or replace function private.notify_marketplace_offer() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.notifications(user_id,actor_id,type,title,body,link)
  values(new.seller_id,new.buyer_id,'marketplace_offer',case when new.amount is null then 'Nuovo interesse per un annuncio' else 'Nuova offerta ricevuta' end,case when new.amount is null then coalesce(new.message,'Un utente è interessato al tuo orologio.') else 'Offerta: € '||trim(to_char(new.amount,'FM9999999990D00'))||coalesce(' — '||new.message,'') end,'/marketplace');
  return new;
end $$;
drop trigger if exists marketplace_offer_notify on public.marketplace_offers;
create trigger marketplace_offer_notify after insert on public.marketplace_offers for each row execute function private.notify_marketplace_offer();
