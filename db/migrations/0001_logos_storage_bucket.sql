-- Storage bucket for business logos (SPEC §5, supabase skill).
-- Logos are shown on the public customer quote page, so reads are public;
-- writes are restricted to the owner's own folder, keyed by auth.uid().

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'logos',
  'logos',
  true,
  2097152, -- 2 MB, mirrors MAX_LOGO_BYTES in lib/constants.ts
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;
--> statement-breakpoint

-- Anyone can read a logo: it is rendered on the public quote page, which has
-- no session. The object path is unguessable (uuid folder + random filename).
drop policy if exists "logos_public_read" on storage.objects;
--> statement-breakpoint
create policy "logos_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'logos');
--> statement-breakpoint

-- A user may only write inside a folder named after their own user id, so one
-- business can never overwrite another's logo.
drop policy if exists "logos_insert_own_folder" on storage.objects;
--> statement-breakpoint
create policy "logos_insert_own_folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'logos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
--> statement-breakpoint

-- Replacing a logo is an upsert, which needs UPDATE alongside INSERT/SELECT.
drop policy if exists "logos_update_own_folder" on storage.objects;
--> statement-breakpoint
create policy "logos_update_own_folder"
on storage.objects for update
to authenticated
using (
  bucket_id = 'logos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'logos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
--> statement-breakpoint

drop policy if exists "logos_delete_own_folder" on storage.objects;
--> statement-breakpoint
create policy "logos_delete_own_folder"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'logos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
