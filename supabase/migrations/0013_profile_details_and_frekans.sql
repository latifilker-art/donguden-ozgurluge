-- Döngüden Özgürlüğe — üye profili genişletme, Frekans/Ses Kütüphanesi,
-- manuel çalışma sonuçları (Kalbin Rehberliği vb.), Dönüştürücü Sorular.

-- ─────────────────────────────────────────────────────────────────────────
-- Faz D — üye profili genişletme
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles
  add column phone text,
  add column birth_date date,
  add column address text,
  add column emergency_contact text;

-- ─────────────────────────────────────────────────────────────────────────
-- Faz E — Frekans Sayfası / Ses Kütüphanesi (yalnızca premium/vip)
-- ─────────────────────────────────────────────────────────────────────────
create type public.audio_category as enum ('cakra_dengeleme', 'olumlama');

create table public.audio_tracks (
  id uuid primary key default gen_random_uuid(),
  category public.audio_category not null,
  title text not null,
  description text,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.audio_tracks enable row level security;

create policy "premium/vip üye veya admin ses listesini okur"
  on public.audio_tracks for select
  using (
    public.current_role() = 'admin'
    or exists (
      select 1 from public.subscriptions
      where member_id = auth.uid()
        and plan in ('premium', 'vip')
        and status = 'active'
    )
  );

create policy "admin ses kaydı yönetir"
  on public.audio_tracks for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

insert into storage.buckets (id, name, public)
values ('audio-library', 'audio-library', false)
on conflict (id) do nothing;

create policy "admin ses dosyası yükler"
  on storage.objects for insert
  with check (bucket_id = 'audio-library' and public.current_role() = 'admin');

create policy "admin ses dosyası siler"
  on storage.objects for delete
  using (bucket_id = 'audio-library' and public.current_role() = 'admin');

create policy "premium/vip üye veya admin ses dosyasını okur"
  on storage.objects for select
  using (
    bucket_id = 'audio-library'
    and (
      public.current_role() = 'admin'
      or exists (
        select 1 from public.subscriptions
        where member_id = auth.uid()
          and plan in ('premium', 'vip')
          and status = 'active'
      )
    )
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Faz F — manuel çalışma sonuçları (Kalbin Rehberliği vb. — eğitmen yazıyla girer)
-- ─────────────────────────────────────────────────────────────────────────
alter table public.instructors
  add column can_write_manual_results boolean not null default false;

alter table public.member_work_progress
  add column result_text text;

create function public.save_manual_work_result(
  p_member_id uuid,
  p_work_title text,
  p_result_text text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_can_write boolean;
  v_work_id uuid;
begin
  select can_write_manual_results into v_can_write
  from public.instructors
  where id = auth.uid();

  if coalesce(v_can_write, false) is not true and public.current_role() <> 'admin' then
    raise exception 'bu işlemi yapma yetkin yok';
  end if;

  select id into v_work_id from public.external_works where title = p_work_title;
  if v_work_id is null then
    raise exception 'çalışma bulunamadı: %', p_work_title;
  end if;

  insert into public.member_work_progress (member_id, work_id, status, result_text)
  values (p_member_id, v_work_id, 'completed', p_result_text)
  on conflict (member_id, work_id)
  do update set status = 'completed', result_text = p_result_text, updated_at = now();
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Faz G — Dönüştürücü Sorular: cevap metni
-- ─────────────────────────────────────────────────────────────────────────
alter table public.rhythm_entries
  add column answer_text text;
