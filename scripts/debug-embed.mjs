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

// anon key ile — sayfanın kendisiyle aynı yetkiyle sorguluyoruz
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const { data, error } = await supabase
  .from("instructors")
  .select(
    "id, slug, tagline, specialties, profile:profiles(display_name), diplomas(verified)",
  )
  .order("slug");

console.log("error:", JSON.stringify(error, null, 2));
console.log("data:", JSON.stringify(data, null, 2));
