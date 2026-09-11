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

const { data: profiles } = await supabase
  .from("profiles")
  .select("id, display_name, role, created_at")
  .eq("display_name", "Test Akış");
console.log("profiles:", profiles);

const { data: works } = await supabase
  .from("external_works")
  .select("id, title, sort_order")
  .order("sort_order");
console.log("external_works:", works);
