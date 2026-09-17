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

// anon key + gerçek oturum ile — RLS gerçekten devrede.
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
  email: "onay-bekleyen@sukunet.dev",
  password: "sukunet-test-1234",
});
if (signInError) {
  console.log("signIn error:", signInError.message);
  process.exit(1);
}
const userId = signIn.user.id;
console.log("signed in as:", userId);

// 1x1 piksel şeffaf PNG (test dosyası)
const pngBytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

const path = `${userId}/avatar-${Date.now()}.png`;
const { error: uploadError } = await supabase.storage
  .from("avatars")
  .upload(path, pngBytes, { contentType: "image/png" });
console.log("kendi klasörüne yükleme:", uploadError ? uploadError.message : "BAŞARILI");

const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
console.log("public url:", pub.publicUrl);

const { error: profileError } = await supabase
  .from("profiles")
  .update({ avatar_url: pub.publicUrl })
  .eq("id", userId);
console.log("profiles.avatar_url güncelleme:", profileError ? profileError.message : "BAŞARILI");

// güvenlik testi: başka birinin klasörüne yazmaya çalışınca RLS engellemeli
const { error: forbiddenError } = await supabase.storage
  .from("avatars")
  .upload("baska-birinin-id/hack.png", pngBytes, { contentType: "image/png" });
console.log(
  "başka klasöre yazma denemesi:",
  forbiddenError ? `ENGELLENDİ (${forbiddenError.message})` : "!! ENGELLENMEDİ, GÜVENLİK SORUNU !!",
);
