-- Sükunet — başlangıç şeması ve RLS politikaları (Faz 0)
-- Bu dosya bir Supabase projesine henüz uygulanmadı; kullanıcı Supabase CLI ile
-- bağlandığında `supabase db push` ile çalıştırılacak.

-- ─────────────────────────────────────────────────────────────────────────
-- Roller
-- ─────────────────────────────────────────────────────────────────────────
create type public.member_role as enum ('member', 'instructor', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.member_role not null default 'member',
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- profiles üzerindeki RLS politikaları rolü sorgularken kendi tablosuna
-- tekrar bakmasın diye SECURITY DEFINER bir yardımcı fonksiyon kullanılıyor.
create function public.current_role()
returns public.member_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

alter table public.profiles enable row level security;

create policy "herkes profilleri okuyabilir"
  on public.profiles for select
  using (true);

create policy "üye kendi profilini günceller"
  on public.profiles for update
  using (auth.uid() = id);

create policy "admin her profili günceller"
  on public.profiles for update
  using (public.current_role() = 'admin');

-- ─────────────────────────────────────────────────────────────────────────
-- Sessiz Profil — günlük ritim
-- ─────────────────────────────────────────────────────────────────────────
create type public.rhythm_item as enum (
  'morning_affirmation',
  'breath',
  'noon_affirmation',
  'evening_questions'
);

create table public.rhythm_entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  entry_date date not null default current_date,
  item public.rhythm_item not null,
  unlock_at timestamptz, -- evening_questions için o günün 21:00'i; diğerlerinde null
  completed_at timestamptz,
  unique (member_id, entry_date, item)
);

alter table public.rhythm_entries enable row level security;

create policy "üye sadece kendi ritmini görür"
  on public.rhythm_entries for select
  using (auth.uid() = member_id or public.current_role() = 'admin');

create policy "üye sadece kendi ritmini değiştirir"
  on public.rhythm_entries for all
  using (auth.uid() = member_id)
  with check (auth.uid() = member_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Harici çalışmalar (Renk Analizi, Kalbin Rehberliği, Human Design…)
-- ─────────────────────────────────────────────────────────────────────────
create table public.external_works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  sort_order int not null default 0
);

alter table public.external_works enable row level security;

create policy "herkes katalogu okuyabilir"
  on public.external_works for select
  using (true);

create type public.work_status as enum ('not_started', 'in_progress', 'completed');

create table public.member_work_progress (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  work_id uuid not null references public.external_works (id) on delete cascade,
  status public.work_status not null default 'not_started',
  result_file_path text, -- Supabase Storage: private bucket 'work-results'
  updated_at timestamptz not null default now(),
  unique (member_id, work_id)
);

alter table public.member_work_progress enable row level security;

create policy "üye sadece kendi ilerlemesini görür"
  on public.member_work_progress for select
  using (auth.uid() = member_id or public.current_role() = 'admin');

create policy "üye sadece kendi ilerlemesini değiştirir"
  on public.member_work_progress for all
  using (auth.uid() = member_id)
  with check (auth.uid() = member_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Eğitmenler — herkese açık
-- ─────────────────────────────────────────────────────────────────────────
create table public.instructors (
  id uuid primary key references public.profiles (id) on delete cascade,
  tagline text,
  bio text,
  specialties text[] not null default '{}'
);

alter table public.instructors enable row level security;

create policy "herkes eğitmenleri okuyabilir"
  on public.instructors for select
  using (true);

create policy "eğitmen kendi profilini düzenler"
  on public.instructors for all
  using (auth.uid() = id or public.current_role() = 'admin')
  with check (auth.uid() = id or public.current_role() = 'admin');

create table public.diplomas (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.instructors (id) on delete cascade,
  name text not null,
  issuer text not null,
  year int,
  file_path text, -- Supabase Storage: public bucket 'diplomas'
  verified boolean not null default false
);

alter table public.diplomas enable row level security;

create policy "herkes diplomaları okuyabilir"
  on public.diplomas for select
  using (true);

create policy "eğitmen kendi diplomasını ekler"
  on public.diplomas for insert
  with check (auth.uid() = instructor_id);

create policy "sadece admin doğrular"
  on public.diplomas for update
  using (public.current_role() = 'admin');

create table public.taught_programs (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.instructors (id) on delete cascade,
  title text not null,
  format text not null, -- 'Bire bir' | 'Canlı grup' vb.
  session_count int
);

alter table public.taught_programs enable row level security;

create policy "herkes verilen çalışmaları okuyabilir"
  on public.taught_programs for select
  using (true);

create policy "eğitmen kendi çalışmasını yönetir"
  on public.taught_programs for all
  using (auth.uid() = instructor_id or public.current_role() = 'admin')
  with check (auth.uid() = instructor_id or public.current_role() = 'admin');

-- ─────────────────────────────────────────────────────────────────────────
-- Randevular (Bekleme Odası)
-- ─────────────────────────────────────────────────────────────────────────
create type public.appointment_status as enum ('pending', 'approved', 'declined');

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  instructor_id uuid not null references public.instructors (id) on delete cascade,
  session_type text not null,
  requested_at timestamptz not null,
  note text,
  status public.appointment_status not null default 'pending',
  response_note text,
  created_at timestamptz not null default now()
);

alter table public.appointments enable row level security;

create policy "üye ve eğitmen kendi randevusunu görür"
  on public.appointments for select
  using (
    auth.uid() = member_id
    or auth.uid() = instructor_id
    or public.current_role() = 'admin'
  );

create policy "üye randevu talep eder"
  on public.appointments for insert
  with check (auth.uid() = member_id);

create policy "üye kendi talebini iptal eder"
  on public.appointments for update
  using (auth.uid() = member_id)
  with check (status = 'pending');

create policy "eğitmen kendine gelen talebi yanıtlar"
  on public.appointments for update
  using (auth.uid() = instructor_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Erişim günlüğü — ürünün mahremiyet vaadinin teknik karşılığı.
-- Sadece bir SECURITY DEFINER fonksiyon üzerinden yazılır; admin doğrudan
-- insert edemez, böylece "her erişim loglanır" kuralı uygulama koduna değil
-- veritabanına bağlı kalır.
-- ─────────────────────────────────────────────────────────────────────────
create table public.access_log (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  admin_id uuid not null references public.profiles (id),
  reason text not null,
  scope text not null,
  accessed_at timestamptz not null default now()
);

alter table public.access_log enable row level security;

create policy "üye sadece kendi log kayıtlarını okur"
  on public.access_log for select
  using (auth.uid() = member_id or public.current_role() = 'admin');

-- insert için hiçbir policy tanımlanmadı: satır ancak aşağıdaki fonksiyon
-- üzerinden, service-role bağlamında yazılabilir.
create function public.log_admin_access(
  p_member_id uuid,
  p_reason text,
  p_scope text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_role() <> 'admin' then
    raise exception 'sadece admin erişim kaydı oluşturabilir';
  end if;
  insert into public.access_log (member_id, admin_id, reason, scope)
  values (p_member_id, auth.uid(), p_reason, p_scope);
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Etkinlikler (Buluşma Takvimi)
-- ─────────────────────────────────────────────────────────────────────────
create type public.event_type as enum ('online', 'camp');
create type public.participation_status as enum ('joined', 'waitlisted', 'cancelled');

create table public.events (
  id uuid primary key default gen_random_uuid(),
  type public.event_type not null,
  title text not null,
  host_instructor_id uuid references public.instructors (id),
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text not null, -- 'Zoom üzerinden' ya da gerçek adres
  capacity int not null,
  description text,
  created_by uuid not null references public.profiles (id)
);

alter table public.events enable row level security;

create policy "herkes etkinlikleri okuyabilir"
  on public.events for select
  using (true);

create policy "admin etkinlik yönetir"
  on public.events for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

create table public.event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  status public.participation_status not null default 'joined',
  joined_at timestamptz not null default now(),
  unique (event_id, member_id)
);

alter table public.event_participants enable row level security;

create policy "üye kendi katılımını görür, admin hepsini görür"
  on public.event_participants for select
  using (auth.uid() = member_id or public.current_role() = 'admin');

create policy "üye etkinliğe katılır ya da vazgeçer"
  on public.event_participants for all
  using (auth.uid() = member_id)
  with check (auth.uid() = member_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Üyelik / ödeme
-- ─────────────────────────────────────────────────────────────────────────
create type public.subscription_status as enum ('active', 'past_due', 'cancelled');

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null unique references public.profiles (id) on delete cascade,
  plan text not null default 'premium',
  status public.subscription_status not null default 'active',
  iyzico_reference text,
  current_period_end timestamptz
);

alter table public.subscriptions enable row level security;

create policy "üye sadece kendi üyeliğini görür"
  on public.subscriptions for select
  using (auth.uid() = member_id or public.current_role() = 'admin');
