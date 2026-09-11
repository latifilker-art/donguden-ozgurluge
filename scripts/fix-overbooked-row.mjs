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

const { data: ev } = await supabase
  .from("events")
  .select("id")
  .eq("title", "Human Design'a Giriş")
  .single();

const { data: testAkis } = await supabase
  .from("profiles")
  .select("id")
  .eq("display_name", "Test Akış")
  .single();

const { data, error } = await supabase
  .from("event_participants")
  .update({ status: "waitlisted" })
  .eq("event_id", ev.id)
  .eq("member_id", testAkis.id)
  .select();

console.log("error:", error);
console.log("updated:", data);
