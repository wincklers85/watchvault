alter table public.watches add column if not exists movement text;
alter table public.watches add column if not exists caliber text;
alter table public.watches add column if not exists cover_image_url text;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('watch-photos','watch-photos',true,10485760,array['image/jpeg','image/png','image/webp','image/heic','image/heif']) on conflict(id) do update set public=true,file_size_limit=10485760;
create policy "watch photos public read" on storage.objects for select using(bucket_id='watch-photos');
create policy "watch photos authenticated upload" on storage.objects for insert to authenticated with check(bucket_id='watch-photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "watch photos owner update" on storage.objects for update to authenticated using(bucket_id='watch-photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "watch photos owner delete" on storage.objects for delete to authenticated using(bucket_id='watch-photos' and (storage.foldername(name))[1]=auth.uid()::text);
