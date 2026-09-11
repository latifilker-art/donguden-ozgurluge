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
  .select("id, title")
  .eq("title", "Nefesle Sıfırlan")
  .single();

const { data: participants, error } = await supabase
  .from("event_participants")
  .select("member_id, status, profiles(display_name)")
  .eq("event_id", ev.id);

console.log("error:", error);
console.log("participants:", participants);
