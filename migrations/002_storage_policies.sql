-- Storage policies pro bucket 'projects' — workshop MVP, permissive
-- Bucket vytvoř přes Supabase dashboard (Storage → New bucket → 'projects', Public)

create policy "projects_storage_select"
  on storage.objects for select
  using (bucket_id = 'projects');

create policy "projects_storage_insert"
  on storage.objects for insert
  with check (bucket_id = 'projects');

create policy "projects_storage_update"
  on storage.objects for update
  using (bucket_id = 'projects')
  with check (bucket_id = 'projects');

create policy "projects_storage_delete"
  on storage.objects for delete
  using (bucket_id = 'projects');
