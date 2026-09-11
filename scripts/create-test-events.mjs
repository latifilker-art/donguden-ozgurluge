import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

// 1) Kontenjan sayılarını gerçekçi göstermek için 5 dolgu üye
const fillerIds = [];
for (let i = 1; i <= 5; i++) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: `dolgu-uye${i}@sukunet.dev`,
    password: "sukunet-test-1234",
    email_confirm: true,
    user_metadata: { display_name: `Dolgu Üye ${i}` },
  });
  if (error) {
    console.log(`dolgu-uye${i}: hata —`, error.message);
    continue;
  }
  fillerIds.push(data.user.id);
}
console.log("dolgu üye sayısı:", fillerIds.length);

// 2) Eğitmenleri slug'a göre bul
const { data: instructors } = await supabase
  .from("instructors")
  .select("id, slug");
const bySlug = Object.fromEntries((instructors ?? []).map((i) => [i.slug, i.id]));
const denizId = bySlug["deniz-yalcin"];
const selinId = bySlug["selin-aksoy"];
const egeId = bySlug["ege-turan"];

if (!denizId || !selinId || !egeId) {
  console.log("Eğitmenler bulunamadı — önce create-test-instructors.mjs çalıştırılmalı.");
  process.exit(1);
}

// 3) Etkinlikler
const events = [
  {
    type: "online",
    title: "Nefesle Sıfırlan",
    host_instructor_id: denizId,
    starts_at: "2026-09-21T07:00:00Z", // 10:00 İstanbul
    ends_at: "2026-09-21T08:30:00Z",
    location: "Zoom üzerinden",
    capacity: 8,
    description: "90 dakikalık canlı nefes çalışması.",
    joinedCount: 5,
  },
  {
    type: "online",
    title: "Human Design'a Giriş",
    host_instructor_id: denizId,
    starts_at: "2026-09-28T16:00:00Z", // 19:00 İstanbul
    ends_at: "2026-09-28T18:00:00Z",
    location: "Zoom üzerinden",
    capacity: 4,
    description: "Human Design sistemine giriş semineri.",
    joinedCount: 4, // bilerek dolu — bekleme listesi durumunu test etmek için
  },
  {
    type: "online",
    title: "Renk Analizi Atölyesi",
    host_instructor_id: selinId,
    starts_at: "2026-10-04T18:00:00Z", // 21:00 İstanbul
    ends_at: "2026-10-04T19:00:00Z",
    location: "Zoom üzerinden",
    capacity: 10,
    description: "Kendi renk paletini keşfettiğin canlı atölye.",
    joinedCount: 2,
  },
  {
    type: "camp",
    title: "Sonbahar Sükunet Kampı",
    host_instructor_id: egeId,
    starts_at: "2026-10-03T00:00:00Z",
    ends_at: "2026-10-05T00:00:00Z",
    location: "Şirince, İzmir",
    capacity: 6,
    description: "3 gün 2 gece; nefes, meditasyon ve doğa yürüyüşü.",
    joinedCount: 4,
  },
  {
    type: "camp",
    title: "Kalbin Rehberliği Retreat",
    host_instructor_id: egeId,
    starts_at: "2026-10-17T00:00:00Z",
    ends_at: "2026-10-18T00:00:00Z",
    location: "Kapadokya, Nevşehir",
    capacity: 5,
    description: "Duygusal farkındalık ve kalp merkezli rehberlik hafta sonu.",
    joinedCount: 4,
  },
];

for (const ev of events) {
  const { joinedCount, ...eventRow } = ev;
  const { data: inserted, error } = await supabase
    .from("events")
    .insert({ ...eventRow, created_by: denizId })
    .select("id")
    .single();

  if (error) {
    console.log(`${ev.title}: etkinlik hatası —`, error.message);
    continue;
  }

  const participantRows = fillerIds
    .slice(0, joinedCount)
    .map((memberId) => ({
      event_id: inserted.id,
      member_id: memberId,
      status: "joined",
    }));

  if (participantRows.length > 0) {
    await supabase.from("event_participants").insert(participantRows);
  }

  console.log(`${ev.title}: oluşturuldu (${joinedCount}/${ev.capacity} katıldı)`);
}
