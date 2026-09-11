-- Sükunet — Faz 1: kayıt olunca profil otomatik oluşsun, harici çalışma
-- kataloğu dolsun, günlük ritim satırları sunucu tarafında (Postgres'te)
-- Europe/Istanbul saatine göre üretilsin ve kilitlensin.

-- ─────────────────────────────────────────────────────────────────────────
-- auth.users'a yeni kayıt düşünce profiles satırı otomatik açılır.
-- ─────────────────────────────────────────────────────────────────────────
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- Harici çalışma kataloğu (Açık Kürsü / Rehber Galerisi'ndeki eğitmenlerin
-- verdiği programlarla Faz 2'de ilişkilendirilecek)
-- ─────────────────────────────────────────────────────────────────────────
insert into public.external_works (title, description, sort_order) values
  ('Renk Analizi', 'Kişisel renk paletini ve görsel kimliğini keşfet.', 1),
  ('Kalbin Rehberliği', 'Duygusal farkındalık ve kalp merkezli rehberlik çalışması.', 2),
  ('Human Design', 'Enerji tipini ve içsel otoriteni tanıyan bireysel okuma.', 3);

-- ─────────────────────────────────────────────────────────────────────────
-- Günlük ritim: "bugün"ü ve akşam sorusunun 21:00 kilidini Postgres,
-- Europe/Istanbul saat dilimine göre hesaplar — istemci saatine güvenilmez.
-- ─────────────────────────────────────────────────────────────────────────
create function public.get_or_create_today_rhythm(p_member_id uuid)
returns setof public.rhythm_entries
language plpgsql
security invoker
as $$
declare
  v_today date := (now() at time zone 'Europe/Istanbul')::date;
  v_unlock timestamptz := (v_today::timestamp at time zone 'Europe/Istanbul') + interval '21 hours';
begin
  if p_member_id <> auth.uid() then
    raise exception 'yalnızca kendi ritmini oluşturabilirsin';
  end if;

  insert into public.rhythm_entries (member_id, entry_date, item, unlock_at)
  values
    (p_member_id, v_today, 'morning_affirmation', null),
    (p_member_id, v_today, 'breath', null),
    (p_member_id, v_today, 'noon_affirmation', null),
    (p_member_id, v_today, 'evening_questions', v_unlock)
  on conflict (member_id, entry_date, item) do nothing;

  return query
    select *
    from public.rhythm_entries
    where member_id = p_member_id and entry_date = v_today
    order by case item
      when 'morning_affirmation' then 1
      when 'breath' then 2
      when 'noon_affirmation' then 3
      when 'evening_questions' then 4
    end;
end;
$$;

-- Tik atma/kaldırma — akşam sorusu 21:00'den önce sunucu tarafında reddedilir.
create function public.toggle_rhythm_item(p_entry_id uuid)
returns public.rhythm_entries
language plpgsql
security invoker
as $$
declare
  v_row public.rhythm_entries;
begin
  select * into v_row from public.rhythm_entries where id = p_entry_id;

  if v_row is null then
    raise exception 'kayıt bulunamadı';
  end if;

  if v_row.member_id <> auth.uid() then
    raise exception 'yetkisiz';
  end if;

  if v_row.unlock_at is not null and now() < v_row.unlock_at then
    raise exception 'bu pratik henüz açılmadı';
  end if;

  update public.rhythm_entries
  set completed_at = case when completed_at is null then now() else null end
  where id = p_entry_id
  returning * into v_row;

  return v_row;
end;
$$;
