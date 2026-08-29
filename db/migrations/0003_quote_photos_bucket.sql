-- Storage bucket for job photos attached to quotes (SPEC §5).
-- Same shape as the logos bucket: public read because the photos appear on the
-- customer quote page, writes confined to a folder named after the user id.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quote-photos',
  'quote-photos',
  true,
  8388608, -- 8 MB, mirrors MAX_QUOTE_PHOTO_BYTES in lib/constants.ts
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;
--> statement-breakpoint

drop policy if exists "quote_photos_public_read" on storage.objects;
--> statement-breakpoint
create policy "quote_photos_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'quote-photos');
--> statement-breakpoint

drop policy if exists "quote_photos_insert_own_folder" on storage.objects;
--> statement-breakpoint
create policy "quote_photos_insert_own_folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'quote-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
--> statement-breakpoint

-- Upsert needs UPDATE alongside INSERT and SELECT, or replacing a photo fails
-- silently.
drop policy if exists "quote_photos_update_own_folder" on storage.objects;
--> statement-breakpoint
create policy "quote_photos_update_own_folder"
on storage.objects for update
to authenticated
using (
  bucket_id = 'quote-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'quote-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
--> statement-breakpoint

drop policy if exists "quote_photos_delete_own_folder" on storage.objects;
--> statement-breakpoint
create policy "quote_photos_delete_own_folder"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'quote-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
