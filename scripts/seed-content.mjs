// Frekans ses örnekleri (sinüs tonları) ve örnek fotoğraflar üretir ve yükler.
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

function makeWav(freq, seconds = 60, rate = 16000) {
  const n = seconds * rate;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const fade = Math.min(1, t / 3, (seconds - t) / 3);
    const breathe = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.1 * t);
    const v =
      (Math.sin(2 * Math.PI * freq * t) * 0.7 + Math.sin(2 * Math.PI * freq * 2 * t) * 0.15) *
      fade * breathe * 0.5;
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  return buf;
}

const CHAKRA_TRACKS = [
  ["kok", "Kök Çakra Dengeleme", 396, "Güven ve topraklanma için 396 Hz"],
  ["sakral", "Sakral Çakra Dengeleme", 417, "Yaratıcılık ve duygusal akış için 417 Hz"],
  ["solar", "Solar Pleksus Dengeleme", 528, "Öz güven ve dönüşüm için 528 Hz"],
  ["kalp", "Kalp Çakrası Dengeleme", 639, "Sevgi ve uyum için 639 Hz"],
  ["bogaz", "Boğaz Çakrası Dengeleme", 741, "İfade ve arınma için 741 Hz"],
  ["ucuncu-goz", "Üçüncü Göz Dengeleme", 852, "Sezgi ve farkındalık için 852 Hz"],
  ["tepe", "Tepe Çakrası Dengeleme", 963, "Bilinç ve bütünlük için 963 Hz"],
];

const AFFIRM_TRACKS = [
  ["Huzur Olumlaması", 432, "“Huzurluyum, her şey olması gerektiği gibi akıyor.” — 432 Hz"],
  ["Bolluk Olumlaması", 528, "“Bolluğa açığım, hak ettiğimi kabul ediyorum.” — 528 Hz"],
  ["Öz Değer Olumlaması", 639, "“Olduğum gibi değerliyim.” — 639 Hz"],
  ["Güven Olumlaması", 396, "“Güvendeyim, köklerim sağlam.” — 396 Hz"],
  ["Şükran Olumlaması", 741, "“Sahip olduklarım için minnettarım.” — 741 Hz"],
];

async function upload(path, body, contentType, bucket) {
  const { error } = await supabase.storage.from(bucket).upload(path, body, { contentType, upsert: true });
  if (error) throw new Error(`${path}: ${error.message}`);
}

const { count } = await supabase.from("audio_tracks").select("*", { count: "exact", head: true }).like("title", "% Dengeleme");
if (!count) {
  await supabase.from("audio_tracks").delete().eq("title", "Test Çakra Sesi");
  let order = 0;
  for (const [chakra, title, hz, desc] of CHAKRA_TRACKS) {
    const path = `cakra_dengeleme/seed-${hz}.wav`;
    await upload(path, makeWav(hz), "audio/wav", "audio-library");
    await supabase.from("audio_tracks").insert({ category: "cakra_dengeleme", chakra, title, description: desc, storage_path: path, sort_order: order++ });
    console.log("ses:", title);
  }
  for (const [title, hz, desc] of AFFIRM_TRACKS) {
    const path = `olumlama/seed-${hz}-${order}.wav`;
    await upload(path, makeWav(hz), "audio/wav", "audio-library");
    await supabase.from("audio_tracks").insert({ category: "olumlama", title, description: desc, storage_path: path, sort_order: order++ });
    console.log("ses:", title);
  }
}

// Örnek fotoğraflar (SVG)
const PHOTOS = [
  ["Şirince Sonbahar Kampı", "#3f6f5e", "#d7b56e"],
  ["Sabah Nefes Buluşması", "#6a8fb0", "#f2e8d1"],
  ["Online Çakra Atölyesi", "#7a5aa0", "#e8c3d0"],
  ["Gün Batımı Meditasyonu", "#c0603f", "#f0c27a"],
  ["Doğa Yürüyüşü", "#4f8a5b", "#cfe3c6"],
  ["Kalbin Rehberliği Çemberi", "#b8566b", "#f6d6dc"],
  ["Renk Analizi Atölyesi", "#3f7fb5", "#d6b429"],
  ["Kapanış Buluşması", "#8a6a3a", "#f2e8d1"],
];
const { count: pc } = await supabase.from("photos").select("*", { count: "exact", head: true }).like("image_path", "%seed-photo%");
if (!pc) {
  const { data: admin } = await supabase.from("profiles").select("id").eq("role", "admin").limit(1).single();
  for (const [i, [caption, c1, c2]] of PHOTOS.entries()) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><circle cx="${200 + i * 60}" cy="170" r="70" fill="#fff" fill-opacity=".35"/><path d="M0 450 Q200 ${340 + (i % 3) * 30} 400 430 T800 400 V600 H0Z" fill="#000" fill-opacity=".18"/><path d="M0 500 Q250 430 480 490 T800 470 V600 H0Z" fill="#000" fill-opacity=".25"/><text x="40" y="560" font-family="Georgia,serif" font-size="30" fill="#fff" fill-opacity=".9">${caption}</text></svg>`;
    const path = `seed-photo-${i}.svg`;
    await upload(path, Buffer.from(svg), "image/svg+xml", "event-photos");
    const { data } = supabase.storage.from("event-photos").getPublicUrl(path);
    await supabase.from("photos").insert({ image_path: data.publicUrl, caption, uploaded_by: admin.id });
    console.log("foto:", caption);
  }
}
console.log("tamam");
