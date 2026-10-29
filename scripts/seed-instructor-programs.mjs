import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const PLAN = {
  "deniz.yalcin@sukunet.dev": ["Nefes Çalışmaları", "Human Design", "Theta Healing", "Reiki"],
  "selin.aksoy@sukunet.dev": ["Renk Analizi", "Yaşam Koçluğu", "Bolluk Bereket Ritüeli"],
  "ege.turan@sukunet.dev": ["Kalbin Rehberliği", "İlişkilerde Kendimi Seçiyorum", "İlişkiler Koçluğu", "Aile Danışmanlığı", "Somatik Egzersizler", "Su Terapileri", "Kadim Öğretiler"],
};
const { data: users } = await s.auth.admin.listUsers();
for (const [email, titles] of Object.entries(PLAN)) {
  const u = users.users.find((x) => x.email === email);
  if (!u) continue;
  const { data: have } = await s.from("taught_programs").select("title").eq("instructor_id", u.id);
  const owned = new Set((have ?? []).map((h) => h.title));
  const rows = titles.filter((t) => !owned.has(t)).map((title) => ({ instructor_id: u.id, title, format: "Bire bir" }));
  if (rows.length) await s.from("taught_programs").insert(rows);
  console.log(email, "+", rows.length);
}
