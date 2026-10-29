// Çakra/olumlama frekanslarını zengin, katmanlı, stereo meditasyon seslerine yükseltir.
// Her ses: kase vuruşları (inharmonik partiyeller) + sürekli pad + binaural fark + yankı.
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const RATE = 16000;
const SECONDS = 120;

function synth(freq, beat = 6) {
  const n = SECONDS * RATE;
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const TAU = Math.PI * 2;

  // Kase vuruşları: her ~14 sn bir, 6 partiyel, yavaş sönümlenme
  const partials = [
    [1, 1.0, 9], [2.0, 0.45, 6], [2.76, 0.3, 5], [4.1, 0.15, 4], [5.4, 0.08, 3], [0.5, 0.5, 11],
  ];
  const strikes = [];
  for (let t = 1; t < SECONDS - 6; t += 14) strikes.push(t);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    let bowl = 0;
    for (const s of strikes) {
      const dt = t - s;
      if (dt < 0 || dt > 30) continue;
      const attack = Math.min(1, dt / 0.015);
      for (const [mult, amp, decay] of partials) {
        bowl += Math.sin(TAU * freq * mult * dt) * amp * Math.exp(-dt / decay) * attack;
      }
    }
    // Sürekli pad: hafif detune edilmiş osilatörler, yavaş LFO
    const lfo = 0.65 + 0.35 * Math.sin(TAU * 0.07 * t);
    const lfo2 = 0.65 + 0.35 * Math.sin(TAU * 0.05 * t + 1.7);
    const padL =
      (Math.sin(TAU * (freq / 2) * t) * 0.5 + Math.sin(TAU * (freq * 1.003) * t) * 0.32 + Math.sin(TAU * freq * 1.5 * t) * 0.12) * lfo;
    const padR =
      (Math.sin(TAU * (freq / 2 + beat * 0.5) * t) * 0.5 + Math.sin(TAU * (freq * 0.997 + beat) * t) * 0.32 + Math.sin(TAU * freq * 1.5 * t) * 0.12) * lfo2;
    const fade = Math.min(1, t / 4, (SECONDS - t) / 6);
    L[i] = (bowl * 0.22 + padL * 0.3) * fade;
    R[i] = (bowl * 0.22 + padR * 0.3) * fade;
  }

  // Yankı: iki geri beslemeli gecikme hattı
  const delays = [
    [Math.floor(0.37 * RATE), 0.38],
    [Math.floor(0.61 * RATE), 0.3],
  ];
  for (const [d, g] of delays) {
    for (let i = d; i < n; i++) {
      L[i] += R[i - d] * g;
      R[i] += L[i - d] * g;
    }
  }

  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const norm = 0.8 / (peak || 1);

  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(L[i] * norm * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(R[i] * norm * 32767), 46 + i * 4);
  }
  return buf;
}

const { data: tracks } = await supabase.from("audio_tracks").select("id, title, description, storage_path");
for (const t of tracks ?? []) {
  const m = t.storage_path.match(/seed-(\d+)/);
  if (!m) continue;
  const hz = Number(m[1]);
  const { error } = await supabase.storage
    .from("audio-library")
    .upload(t.storage_path, synth(hz), { contentType: "audio/wav", upsert: true });
  console.log(t.title, hz, "Hz", error ? error.message : "güncellendi");
  if (!/kulaklık/i.test(t.description ?? "")) {
    await supabase
      .from("audio_tracks")
      .update({ description: `${t.description ?? ""} · 2 dk, kulaklıkla dinle` })
      .eq("id", t.id);
  }
}
