-- Sükunet — Faz 3: randevu iptali.
-- 0001'deki "üye kendi talebini iptal eder" UPDATE politikası mantık hatası
-- içeriyordu (with check status='pending' iptali değil, pending'de kalmayı
-- zorunlu kılıyordu). Cancelled durumu eklemek yerine, bekleyen bir talebi
-- doğrudan silmeye izin veriyoruz — "Talebi İptal Et" tam olarak bunu yapar.
drop policy if exists "üye kendi talebini iptal eder" on public.appointments;

create policy "üye kendi bekleyen talebini siler"
  on public.appointments for delete
  using (auth.uid() = member_id and status = 'pending');
