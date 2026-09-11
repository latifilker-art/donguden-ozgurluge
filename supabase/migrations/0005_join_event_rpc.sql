-- Sükunet — Faz 4: kontenjan/bekleme listesi kararını sunucuda (Postgres'te)
-- ver, ki iki üye aynı anda son yere tıklarsa ikisi de "joined" olmasın.
create function public.join_event(p_event_id uuid)
returns public.participation_status
language plpgsql
security invoker
as $$
declare
  v_capacity int;
  v_joined_count int;
  v_existing public.participation_status;
  v_status public.participation_status;
begin
  select status into v_existing
  from public.event_participants
  where event_id = p_event_id and member_id = auth.uid();

  if v_existing is not null then
    return v_existing; -- zaten katılmış ya da bekleme listesinde
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
