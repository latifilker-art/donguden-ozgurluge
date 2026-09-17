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

const pngBytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

async function signIn(email) {
  const c = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await c.auth.signInWithPassword({ email, password: "sukunet-test-1234" });
  return c;
}

// 1) admin olarak yükleme — başarılı olmalı
const admin = await signIn("admin@sukunet.dev");
const adminPath = `test-${Date.now()}.png`;
const { error: adminErr } = await admin.storage.from("event-photos").upload(adminPath, pngBytes, {
  contentType: "image/png",
});
console.log("admin yükleme:", adminErr ? adminErr.message : "BAŞARILI");

if (!adminErr) {
  const { data: pub } = admin.storage.from("event-photos").getPublicUrl(adminPath);
  const {
    data: { user: adminUser },
  } = await admin.auth.getUser();
  const { error: insertErr } = await admin.from("photos").insert({
    image_path: pub.publicUrl,
    caption: "Test fotoğrafı (script)",
    uploaded_by: adminUser.id,
  });
  console.log("photos tablosuna insert:", insertErr ? insertErr.message : "BAŞARILI");
}

// 2) sıradan üye olarak yükleme denemesi — RLS engellemeli
const member = await signIn("test-akis@sukunet.dev");
const memberPath = `hack-${Date.now()}.png`;
const { error: memberErr } = await member.storage.from("event-photos").upload(memberPath, pngBytes, {
  contentType: "image/png",
});
console.log(
  "sıradan üye yükleme denemesi:",
  memberErr ? `ENGELLENDİ (${memberErr.message})` : "!! ENGELLENMEDİ, GÜVENLİK SORUNU !!",
);

// 3) herkes okuyabiliyor mu (anon)
const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data: publicPhotos, error: readErr } = await anon.from("photos").select("id, caption");
console.log("anon okuma:", readErr ? readErr.message : `${publicPhotos.length} fotoğraf görünür`);
