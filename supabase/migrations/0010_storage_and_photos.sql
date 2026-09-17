-- Sükunet — Faz 8/10: avatar yükleme + etkinlik fotoğrafları galerisi.

-- ─────────────────────────────────────────────────────────────────────────
-- Storage bucket'ları — ikisi de public (indirme herkese açık, yazma RLS
-- ile kısıtlı).
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', true)
on conflict (id) do nothing;

-- Avatarlar: her üye sadece kendi klasörüne (userId/...) yazabilir.
create policy "kullanıcı kendi avatarını yükler"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "kullanıcı kendi avatarını günceller"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "kullanıcı kendi avatarını siler"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Etkinlik fotoğrafları: sadece admin yükler/siler.
create policy "admin etkinlik fotoğrafı yükler"
  on storage.objects for insert
  with check (bucket_id = 'event-photos' and public.current_role() = 'admin');

create policy "admin etkinlik fotoğrafı siler"
  on storage.objects for delete
  using (bucket_id = 'event-photos' and public.current_role() = 'admin');

-- ─────────────────────────────────────────────────────────────────────────
-- Fotoğraf meta verisi
-- ─────────────────────────────────────────────────────────────────────────
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events (id) on delete set null,
  image_path text not null,
  caption text,
  uploaded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.photos enable row level security;

create policy "herkes fotoğrafları okuyabilir"
  on public.photos for select
  using (true);

create policy "admin fotoğraf yönetir"
  on public.photos for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');
