import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import crypto from "node:crypto";

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

const email = "ilkeralptekinler@hotmail.com.tr";
const displayName = "Renk Analisti";
const slug = "renk-analisti";
const password = crypto.randomBytes(9).toString("base64url");

const { data: userData, error: userError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { display_name: displayName },
});

if (userError) {
  console.log("Kullanıcı hatası:", userError.message);
  process.exit(1);
}

const userId = userData.user.id;

await supabase
  .from("profiles")
  .update({ role: "instructor", status: "approved" })
  .eq("id", userId);

const { error: instError } = await supabase.from("instructors").insert({
  id: userId,
  slug,
  tagline: "Otomatik Renk Analizi",
  bio: "İsim ve doğum tarihine dayalı, kişiye özel renk profili analizleri hazırlıyor.",
  specialties: ["Renk Analizi"],
  can_generate_color_analysis: true,
});

if (instError) {
  console.log("Eğitmen satırı hatası:", instError.message);
  process.exit(1);
}

await supabase.from("taught_programs").insert({
  instructor_id: userId,
  title: "Renk Analizi",
  format: "Bire bir",
  session_count: 1,
});

console.log(`Oluşturuldu: ${displayName} (${email})`);
console.log(`Şifre: ${password}`);
