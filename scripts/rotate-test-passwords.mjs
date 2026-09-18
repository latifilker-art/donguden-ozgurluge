import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

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

function randomPassword() {
  return randomBytes(12).toString("base64url"); // ~16 karakter, URL-güvenli
}

// Tüm kayıtlı test/demo hesapları — bkz. memory + scripts/create-*.mjs geçmişi.
const EMAILS = [
  "admin@sukunet.dev",
  "test-akis@sukunet.dev",
  "deniz.yalcin@sukunet.dev",
  "selin.aksoy@sukunet.dev",
  "ege.turan@sukunet.dev",
  "dolgu-uye1@sukunet.dev",
  "dolgu-uye2@sukunet.dev",
  "dolgu-uye3@sukunet.dev",
  "dolgu-uye4@sukunet.dev",
  "dolgu-uye5@sukunet.dev",
  "waitlist-test@sukunet.dev",
  "onay-bekleyen@sukunet.dev",
  "elif.test.sukunet@gmail.com",
];

const { data: list, error: listError } = await supabase.auth.admin.listUsers({ perPage: 200 });
if (listError) {
  console.error("listUsers error:", listError.message);
  process.exit(1);
}

const results = [];
for (const email of EMAILS) {
  const user = list.users.find((u) => u.email === email);
  if (!user) {
    console.log(`${email}: bulunamadı, atlanıyor`);
    continue;
  }
  const newPassword = randomPassword();
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });
  if (error) {
    console.log(`${email}: HATA — ${error.message}`);
    continue;
  }
  results.push({ email, newPassword });
  console.log(`${email}: şifre değiştirildi`);
}

// Git deposunun tamamen dışına yazıyoruz — yanlışlıkla commit edilme riski olmasın.
const outPath =
  "C:\\Users\\pc\\AppData\\Local\\Temp\\claude\\C--Users-pc-OneDrive-Masa-st--cloude-dosyaiar\\f74c7f08-6da0-4e64-8889-921f7d60d5bd\\scratchpad\\test-credentials.txt";
const body = results.map((r) => `${r.email}\t${r.newPassword}`).join("\n") + "\n";
writeFileSync(outPath, body, "utf8");
console.log(`\n${results.length} hesabın yeni şifresi şuraya yazıldı: ${outPath}`);
