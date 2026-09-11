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

const instructors = [
  {
    email: "deniz.yalcin@sukunet.dev",
    displayName: "Deniz Yalçın",
    slug: "deniz-yalcin",
    tagline: "Nefes Çalışmaları & Human Design Rehberi",
    bio: "6 yıldır nefes teknikleri ve Human Design okumaları üzerine bireysel çalışıyor. Kadıköy'de başladığı atölyeleri şimdi çevrimiçi bireysel seanslarla sürdürüyor.",
    specialties: ["Nefes Çalışmaları", "Human Design"],
    diplomas: [
      { name: "Nefes Terapisi Sertifikası", issuer: "Breathwork Akademisi", year: 2021, verified: true },
      { name: "Human Design Profesyonel Eğitimi", issuer: "Jovian Archive", year: 2022, verified: true },
    ],
    programs: [
      { title: "Human Design", format: "Bire bir", session_count: 5 },
      { title: "Nefes Çalışmaları", format: "Canlı grup", session_count: null },
    ],
  },
  {
    email: "selin.aksoy@sukunet.dev",
    displayName: "Selin Aksoy",
    slug: "selin-aksoy",
    tagline: "Renk Analizi & Görsel Kimlik Rehberi",
    bio: "4 yıldır bireysel renk analizi ve görsel kimlik danışmanlığı yapıyor.",
    specialties: ["Renk Analizi"],
    diplomas: [
      { name: "Renk Analizi Uzmanlığı", issuer: "İmaj Danışmanlığı Enstitüsü", year: 2020, verified: true },
    ],
    programs: [{ title: "Renk Analizi", format: "Bire bir", session_count: 1 }],
  },
  {
    email: "ege.turan@sukunet.dev",
    displayName: "Ege Turan",
    slug: "ege-turan",
    tagline: "Duygusal Farkındalık & Kalbin Rehberliği",
    bio: "5 yıldır duygusal farkındalık ve kalp merkezli rehberlik üzerine çalışıyor.",
    specialties: ["Kalbin Rehberliği"],
    diplomas: [], // bilerek diplomasız — "isteğe bağlı" durumunu test etmek için
    programs: [{ title: "Kalbin Rehberliği", format: "Grup + bireysel", session_count: 4 }],
  },
];

for (const inst of instructors) {
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: inst.email,
    password: "sukunet-test-1234",
    email_confirm: true,
    user_metadata: { display_name: inst.displayName },
  });

  if (userError) {
    console.log(`${inst.displayName}: kullanıcı hatası —`, userError.message);
    continue;
  }

  const userId = userData.user.id;

  await supabase.from("profiles").update({ role: "instructor" }).eq("id", userId);

  const { error: instError } = await supabase.from("instructors").insert({
    id: userId,
    slug: inst.slug,
    tagline: inst.tagline,
    bio: inst.bio,
    specialties: inst.specialties,
  });
  if (instError) {
    console.log(`${inst.displayName}: eğitmen satırı hatası —`, instError.message);
    continue;
  }

  if (inst.diplomas.length > 0) {
    await supabase.from("diplomas").insert(
      inst.diplomas.map((d) => ({ instructor_id: userId, ...d })),
    );
  }

  await supabase.from("taught_programs").insert(
    inst.programs.map((p) => ({ instructor_id: userId, ...p })),
  );

  console.log(`${inst.displayName}: oluşturuldu (${inst.slug})`);
}
