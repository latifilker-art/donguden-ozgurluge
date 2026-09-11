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

const { data: inst } = await supabase
  .from("instructors")
  .select("id")
  .eq("slug", "selin-aksoy")
  .single();

const { error } = await supabase.from("diplomas").insert({
  instructor_id: inst.id,
  name: "İleri Renk Teorisi Sertifikası",
  issuer: "Görsel Sanatlar Akademisi",
  year: 2024,
  verified: false,
});

console.log("error:", error);
console.log("eklendi");
