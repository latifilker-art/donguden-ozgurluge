-- Kapalı grup özellikleri: renk analizi talepleri, herkese açık frekans kütüphanesi,
-- admin'in üyeye çalışma dosyası (PDF) eklemesi.

-- 1) Renk analizi talepleri (üye ister, Renk Analisti onaylar)
create type public.request_status as enum ('pending', 'approved', 'rejected');

create table public.color_analysis_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  full_name text not null,
  birth_date date not null,
  status public.request_status not null default 'pending',
  analysis_id uuid references public.color_analyses (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.color_analysis_requests enable row level security;

create policy "talep okuma"
  on public.color_analysis_requests for select
  using (
    auth.uid() = member_id
    or public.current_role() = 'admin'
    or exists (select 1 from public.instructors where id = auth.uid() and can_generate_color_analysis)
  );

create policy "üye talep oluşturur"
  on public.color_analysis_requests for insert
  with check (auth.uid() = member_id and status = 'pending');

create policy "analist talebi günceller"
  on public.color_analysis_requests for update
  using (
    public.current_role() = 'admin'
    or exists (select 1 from public.instructors where id = auth.uid() and can_generate_color_analysis)
  );

-- 2) Frekans kütüphanesi: onaylı her üye dinleyebilir, çakra alanı eklendi
alter table public.audio_tracks add column chakra text;

drop policy "premium/vip üye veya admin ses listesini okur" on public.audio_tracks;
create policy "giriş yapmış herkes ses listesini okur"
  on public.audio_tracks for select
  using (auth.uid() is not null);

drop policy "premium/vip üye veya admin ses dosyasını okur" on storage.objects;
create policy "giriş yapmış herkes ses dosyasını okur"
  on storage.objects for select
  using (bucket_id = 'audio-library' and auth.uid() is not null);

-- 3) Admin üyenin çalışma sonucuna dosya (PDF) ekler
create policy "admin sonuç dosyası yükler"
  on storage.objects for insert
  with check (bucket_id = 'work-results' and public.current_role() = 'admin');

create function public.admin_set_work_file(
  p_member_id uuid,
  p_work_title text,
  p_path text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_work_id uuid;
begin
  if public.current_role() <> 'admin' then
    raise exception 'yalnızca admin';
  end if;
  select id into v_work_id from public.external_works where title = p_work_title;
  if v_work_id is null then
    raise exception 'çalışma bulunamadı';
  end if;
  insert into public.member_work_progress (member_id, work_id, status, result_file_path)
  values (p_member_id, v_work_id, 'completed', p_path)
  on conflict (member_id, work_id)
  do update set status = 'completed', result_file_path = p_path, updated_at = now();
end;
$$;
