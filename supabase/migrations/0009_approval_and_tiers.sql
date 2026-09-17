-- Sükunet — Faz 7: üye onay sistemi + 3 kademeli üyelik.

-- ─────────────────────────────────────────────────────────────────────────
-- Onay durumu — yeni kayıtlar 'pending' başlar, admin onaylamadan siteyi
-- kullanamaz. Bu migration'dan önce oluşmuş hesaplar (test hesapları dahil)
-- geriye dönük 'approved' sayılır, aksi halde hepsi kilitlenir.
-- ─────────────────────────────────────────────────────────────────────────
create type public.approval_status as enum ('pending', 'approved', 'rejected');

alter table public.profiles
  add column status public.approval_status not null default 'pending';

update public.profiles set status = 'approved';

-- ─────────────────────────────────────────────────────────────────────────
-- Üyelik kademeleri — serbest metin yerine sabit 3 seviye.
-- ─────────────────────────────────────────────────────────────────────────
create type public.membership_tier as enum ('temel', 'premium', 'vip');

-- Postgres eski text varsayılanını yeni enum'a otomatik çeviremiyor —
-- önce varsayılanı kaldırıp tipi değiştiriyoruz, sonra yeni varsayılanı
-- (doğru tipte) tekrar ekliyoruz.
alter table public.subscriptions alter column plan drop default;

alter table public.subscriptions
  alter column plan type public.membership_tier using (
    case plan
      when 'premium' then 'premium'::public.membership_tier
      when 'vip' then 'vip'::public.membership_tier
      else 'temel'::public.membership_tier
    end
  );

alter table public.subscriptions
  alter column plan set default 'temel'::public.membership_tier;

-- ─────────────────────────────────────────────────────────────────────────
-- Profil zenginleştirme (üye ve eğitmen detay sayfaları için).
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles add column bio text;
alter table public.instructors add column years_experience int;
alter table public.instructors add column website_url text;
