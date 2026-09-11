-- Sükunet — Faz 4 düzeltmesi: kontenjan sayısı herkese görünür olmalı ama
-- kimin katıldığı gizli kalmalı. event_participants RLS'i haklı olarak
-- "üye sadece kendi satırını görür" diyor — bu yüzden toplam sayıyı ayrı,
-- kimlik sızdırmayan bir fonksiyonla veriyoruz.
create function public.event_joined_counts()
returns table (event_id uuid, joined_count bigint)
language sql
security definer
set search_path = public
stable
as $$
  select event_id, count(*) as joined_count
  from public.event_participants
  where status = 'joined'
  group by event_id;
$$;
