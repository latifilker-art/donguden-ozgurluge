-- 1) GİZLİLİK: hassas profil alanları ayrı ve korumalı tabloya taşınır
create table public.profile_private (
  id uuid primary key references public.profiles (id) on delete cascade,
  phone text,
  birth_date date,
  address text,
  emergency_contact text,
  bio text
);

insert into public.profile_private (id, phone, birth_date, address, emergency_contact, bio)
select id, phone, birth_date, address, emergency_contact, bio
from public.profiles
where phone is not null or birth_date is not null or address is not null
   or emergency_contact is not null or bio is not null;

-- Eski sütunlar silinmez (geri dönüş için), yalnızca boşaltılır.
update public.profiles
set phone = null, birth_date = null, address = null, emergency_contact = null, bio = null;

alter table public.profile_private enable row level security;

create policy "ozel bilgi sahibi veya admin okur"
  on public.profile_private for select
  using (auth.uid() = id or public.current_role() = 'admin');
create policy "ozel bilgi sahibi ekler"
  on public.profile_private for insert
  with check (auth.uid() = id);
create policy "ozel bilgi sahibi gunceller"
  on public.profile_private for update
  using (auth.uid() = id);

-- 2) KAPALI GRUP: içerik yalnızca giriş yapmış kullanıcılara okunur
drop policy "herkes profilleri okuyabilir" on public.profiles;
create policy "giris yapmis herkes profilleri okur"
  on public.profiles for select using (auth.uid() is not null);

drop policy "herkes katalogu okuyabilir" on public.external_works;
create policy "giris yapmis katalog okur"
  on public.external_works for select using (auth.uid() is not null);

drop policy "herkes eğitmenleri okuyabilir" on public.instructors;
create policy "giris yapmis egitmen okur"
  on public.instructors for select using (auth.uid() is not null);

drop policy "herkes diplomaları okuyabilir" on public.diplomas;
create policy "giris yapmis diploma okur"
  on public.diplomas for select using (auth.uid() is not null);

drop policy "herkes verilen çalışmaları okuyabilir" on public.taught_programs;
create policy "giris yapmis verilen calisma okur"
  on public.taught_programs for select using (auth.uid() is not null);

drop policy "herkes etkinlikleri okuyabilir" on public.events;
create policy "giris yapmis etkinlik okur"
  on public.events for select using (auth.uid() is not null);

drop policy "herkes fotoğrafları okuyabilir" on public.photos;
create policy "giris yapmis foto okur"
  on public.photos for select using (auth.uid() is not null);

-- 3) ÜYE SEVİYELERİ: başlangıç / temel / ileri
alter table public.profiles
  add column level_override text check (level_override in ('baslangic', 'temel', 'ileri'));

create function public.member_level(p_member uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select level_override from public.profiles where id = p_member),
    case
      when exists (
        select 1 from public.member_work_progress mp
        join public.external_works w on w.id = mp.work_id
        where mp.member_id = p_member and w.title = 'Kalbin Rehberliği' and mp.status = 'completed'
      ) or exists (
        select 1 from public.work_requests
        where member_id = p_member and work_title = 'Kalbin Rehberliği' and status = 'approved'
      ) then 'ileri'
      when exists (
        select 1 from public.work_requests
        where member_id = p_member and work_title <> 'Renk Analizi'
      ) or exists (
        select 1 from public.member_work_progress mp
        join public.external_works w on w.id = mp.work_id
        where mp.member_id = p_member and w.title <> 'Renk Analizi' and mp.status = 'completed'
      ) or exists (
        select 1 from public.appointments
        where member_id = p_member and status = 'approved'
      ) then 'temel'
      else 'baslangic'
    end
  );
$$;

-- 4) Fotoğraf yükleme: ileri seviye üyeler ve eğitmenler
create policy "ileri uye veya egitmen foto ekler"
  on public.photos for insert
  with check (
    uploaded_by = auth.uid()
    and (public.member_level(auth.uid()) = 'ileri' or public.current_role() = 'instructor')
  );
create policy "kendi fotografini siler"
  on public.photos for delete using (uploaded_by = auth.uid());

create policy "ileri uye veya egitmen foto dosyasi yukler"
  on storage.objects for insert
  with check (
    bucket_id = 'event-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and (public.member_level(auth.uid()) = 'ileri' or public.current_role() = 'instructor')
  );
create policy "kendi foto dosyasini siler"
  on storage.objects for delete
  using (bucket_id = 'event-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- 5) MESAJLAŞMA (üye-üye, üye-eğitmen, eğitmen-eğitmen)
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (sender_id <> recipient_id)
);
create index messages_recipient_idx on public.messages (recipient_id, created_at desc);
create index messages_pair_idx on public.messages (sender_id, recipient_id, created_at);

alter table public.messages enable row level security;

create policy "mesaj taraflari okur"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "mesaj gonderen ekler"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create function public.mark_thread_read(p_other uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.messages set read_at = now()
  where recipient_id = auth.uid() and sender_id = p_other and read_at is null;
$$;

-- 6) EĞİTMEN TALEPLERİ: eğitmen kendi verdiği çalışmaların taleplerini görür ve tamamlar
drop policy "calisma talebi okuma" on public.work_requests;
create policy "calisma talebi okuma"
  on public.work_requests for select
  using (
    auth.uid() = member_id
    or public.current_role() = 'admin'
    or exists (
      select 1 from public.taught_programs tp
      where tp.instructor_id = auth.uid() and tp.title = work_requests.work_title
    )
  );

create policy "egitmen sonuc dosyasi yukler"
  on storage.objects for insert
  with check (bucket_id = 'work-results' and public.current_role() = 'instructor');

create function public.instructor_fulfill_request(
  p_request_id uuid,
  p_text text,
  p_path text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req public.work_requests;
  v_work_id uuid;
begin
  select * into v_req from public.work_requests where id = p_request_id;
  if v_req is null or v_req.status <> 'pending' then
    raise exception 'talep bulunamadı veya zaten kapalı';
  end if;

  if public.current_role() <> 'admin' and not exists (
    select 1 from public.taught_programs
    where instructor_id = auth.uid() and title = v_req.work_title
  ) then
    raise exception 'bu çalışmayı vermiyorsun';
  end if;

  select id into v_work_id from public.external_works where title = v_req.work_title;
  if v_work_id is null then
    raise exception 'çalışma bulunamadı';
  end if;

  insert into public.member_work_progress (member_id, work_id, status, result_text, result_file_path)
  values (v_req.member_id, v_work_id, 'completed', nullif(p_text, ''), nullif(p_path, ''))
  on conflict (member_id, work_id) do update set
    status = 'completed',
    result_text = coalesce(nullif(p_text, ''), public.member_work_progress.result_text),
    result_file_path = coalesce(nullif(p_path, ''), public.member_work_progress.result_file_path),
    updated_at = now();

  update public.work_requests set status = 'approved' where id = p_request_id;
end;
$$;
