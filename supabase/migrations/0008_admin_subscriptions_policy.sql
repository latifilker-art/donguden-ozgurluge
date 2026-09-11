-- Sükunet — Faz 5 (online ödeme yok): üyelik admin tarafından elle
-- yönetilir. 0001'de subscriptions için sadece SELECT politikası vardı,
-- admin'in yazabilmesi için ayrı bir politika gerekiyor.
create policy "admin üyelik yönetir"
  on public.subscriptions for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');
