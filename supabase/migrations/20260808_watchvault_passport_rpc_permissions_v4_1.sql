revoke all on function public.accept_watch_transfer(uuid) from public;
revoke all on function public.accept_watch_transfer(uuid) from anon;
grant execute on function public.accept_watch_transfer(uuid) to authenticated;
