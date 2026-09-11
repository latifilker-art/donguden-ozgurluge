-- Sükunet — Faz 4 düzeltmesi: join_event, security invoker olduğu için
-- kapasite sayımını RLS'in arkasından (sadece kendi satırını görerek)
-- yapıyordu — bu da dolu bir etkinlikte bile herkesi "joined" olarak
-- ekleyip kapasiteyi aşmasına yol açtı. Doğru toplam sayıyı görebilmesi
-- için security definer'a çeviriyoruz (insert hâlâ sadece auth.uid()
-- için yapılıyor, başka bir kullanıcı adına yazamaz).
drop function if exists public.join_event(uuid);

create function public.join_event(p_event_id uuid)
returns public.participation_status
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity int;
  v_joined_count int;
  v_existing public.participation_status;
  v_status public.participation_status;
begin
  if auth.uid() is null then
    raise exception 'giriş yapmalısın';
  end if;

  select status into v_existing
  from public.event_participants
  where event_id = p_event_id and member_id = auth.uid();

  if v_existing is not null then
    return v_existing;
  end if;

  select capacity into v_capacity from public.events where id = p_event_id;
  if v_capacity is null then
    raise exception 'etkinlik bulunamadı';
  end if;

  select count(*) into v_joined_count
  from public.event_participants
  where event_id = p_event_id and status = 'joined';

  v_status := case when v_joined_count < v_capacity then 'joined' else 'waitlisted' end;

  insert into public.event_participants (event_id, member_id, status)
  values (p_event_id, auth.uid(), v_status);

  return v_status;
end;
$$;
