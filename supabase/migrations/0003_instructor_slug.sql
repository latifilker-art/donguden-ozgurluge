-- Sükunet — Faz 2: eğitmen profili URL'i için okunabilir slug.
alter table public.instructors
  add column slug text unique;
