-- Sükunet — Faz 8 düzeltmesi: avatar yükleme upsert:true ile 'new row
-- violates row-level security policy' hatası veriyordu. Sebep: upsert modu
-- Postgres'te INSERT ... ON CONFLICT DO UPDATE'e denk düşüyor ve bu, hem
-- INSERT hem UPDATE politikasının WITH CHECK'ini gerektiriyor — UPDATE
-- politikasında WITH CHECK açıkça yazılmamıştı (sadece USING vardı).
drop policy if exists "kullanıcı kendi avatarını günceller" on storage.objects;

create policy "kullanıcı kendi avatarını günceller"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
