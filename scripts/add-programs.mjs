import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const PROGRAMS = [
  ["Nefes Çalışmaları", "Bilinçli nefes teknikleriyle sinir sistemini dengele, stresi bırak."],
  ["Theta Healing", "Theta beyin dalgalarında inanç kalıplarını dönüştüren derin şifa çalışması."],
  ["Kadim Öğretiler", "Binlerce yıllık bilgeliğin günümüz hayatına uyarlanmış rehberliği."],
  ["Reiki", "Enerji merkezlerini dengeleyen, evrensel yaşam enerjisiyle şifa seansı."],
  ["Bolluk Bereket Ritüeli", "Bolluğa açılmak ve engelleyici inançları bırakmak için niyet ritüeli."],
  ["İlişkilerde Kendimi Seçiyorum", "Sağlıklı sınırlar, öz değer ve ilişkilerde kendini merkeze alma çalışması."],
  ["Somatik Egzersizler", "Bedende biriken stresi ve travmayı hareketle serbest bırakan pratikler."],
  ["Su Terapileri", "Suyun iyileştirici gücüyle gevşeme, arınma ve duygusal akış çalışmaları."],
  ["Aile Danışmanlığı", "Aile içi dinamikleri anlamaya ve iletişimi güçlendirmeye yönelik danışmanlık."],
  ["Yaşam Koçluğu", "Hedeflerini netleştirip hayatında somut adımlar atman için birebir koçluk."],
  ["İlişkiler Koçluğu", "Partner, aile ve sosyal ilişkilerde bağı derinleştiren koçluk süreci."],
];

const { data: existing } = await supabase.from("external_works").select("title, sort_order");
const have = new Set((existing ?? []).map((w) => w.title));
let order = Math.max(0, ...(existing ?? []).map((w) => w.sort_order)) + 1;
const rows = PROGRAMS.filter(([t]) => !have.has(t)).map(([title, description]) => ({
  title,
  description,
  sort_order: order++,
}));
if (rows.length) {
  const { error } = await supabase.from("external_works").insert(rows);
  console.log(error ? error.message : `${rows.length} program eklendi`);
} else console.log("hepsi zaten var");
