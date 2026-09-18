-- Döngüden Özgürlüğe — Otomatik Renk Analizi.
-- Yalnızca can_generate_color_analysis=true olan eğitmen(ler) bir üye için
-- isim + doğum tarihine dayalı, AI ile üretilen kişiye özel bir renk
-- profili raporu oluşturabilir. save_color_analysis, log_admin_access ve
-- join_event ile aynı security definer kalıbını izler: çağıran taraf
-- doğrulanır, sonra hem color_analyses'a yazılır hem de üyenin kendi
-- member_work_progress satırı güncellenir (üye kendi satırını yazabilir
-- ama eğitmen normalde yazamaz — bu RPC o boşluğu denetimli şekilde kapatır).

alter table public.instructors
  add column can_generate_color_analysis boolean not null default false;

create table public.color_analyses (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  instructor_id uuid not null references public.instructors (id) on delete cascade,
  full_name text not null,
  birth_date date not null,
  computation jsonb not null,
  report jsonb not null,
  pdf_path text,
  created_at timestamptz not null default now()
);

alter table public.color_analyses enable row level security;

create policy "üye kendi analizini okur"
  on public.color_analyses for select
  using (
    auth.uid() = member_id
    or auth.uid() = instructor_id
    or public.current_role() = 'admin'
  );

-- Yazma yalnızca save_color_analysis RPC'si üzerinden yapılır (security
-- definer olduğu için bu RLS'i atlar); doğrudan insert/update için politika
-- yok, bu yüzden RLS her durumda kapalı kalır.

create function public.save_color_analysis(
  p_member_id uuid,
  p_full_name text,
  p_birth_date date,
  p_computation jsonb,
  p_report jsonb,
  p_pdf_path text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_can_generate boolean;
  v_work_id uuid;
  v_analysis_id uuid;
begin
  select can_generate_color_analysis into v_can_generate
  from public.instructors
  where id = auth.uid();

  if coalesce(v_can_generate, false) is not true and public.current_role() <> 'admin' then
    raise exception 'bu işlemi yapma yetkin yok';
  end if;

  insert into public.color_analyses
    (member_id, instructor_id, full_name, birth_date, computation, report, pdf_path)
  values
    (p_member_id, auth.uid(), p_full_name, p_birth_date, p_computation, p_report, p_pdf_path)
  returning id into v_analysis_id;

  select id into v_work_id from public.external_works where title = 'Renk Analizi';

  if v_work_id is not null then
    insert into public.member_work_progress (member_id, work_id, status, result_file_path)
    values (p_member_id, v_work_id, 'completed', p_pdf_path)
    on conflict (member_id, work_id)
    do update set status = 'completed', result_file_path = p_pdf_path, updated_at = now();
  end if;

  return v_analysis_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- work-results bucket'ı (0001'deki yorum bunu öngörmüştü, hiç oluşturulmamıştı)
-- Private — indirme imzalı URL ile yapılır.
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('work-results', 'work-results', false)
on conflict (id) do nothing;

create policy "renk analisti sonuç dosyası yükler"
  on storage.objects for insert
  with check (
    bucket_id = 'work-results'
    and exists (
      select 1 from public.instructors
      where id = auth.uid() and can_generate_color_analysis = true
    )
  );

create policy "üye kendi sonuç dosyasını okur"
  on storage.objects for select
  using (
    bucket_id = 'work-results'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.instructors
        where id = auth.uid() and can_generate_color_analysis = true
      )
      or public.current_role() = 'admin'
    )
  );
