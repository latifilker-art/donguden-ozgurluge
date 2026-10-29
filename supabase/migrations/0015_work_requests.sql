create table public.work_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  work_title text not null,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.work_requests enable row level security;

create policy "calisma talebi okuma"
  on public.work_requests for select
  using (auth.uid() = member_id or public.current_role() = 'admin');

create policy "uye calisma talebi olusturur"
  on public.work_requests for insert
  with check (auth.uid() = member_id and status = 'pending');

create policy "admin calisma talebini gunceller"
  on public.work_requests for update
  using (public.current_role() = 'admin');
