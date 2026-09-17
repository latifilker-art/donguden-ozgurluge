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

const { data: profiles, error: e1 } = await supabase
  .from("profiles")
  .select("display_name, status, role")
  .order("display_name");
console.log("profiles status/role:", e1 ?? profiles);

const { data: subs, error: e2 } = await supabase
  .from("subscriptions")
  .select("member_id, plan, status");
console.log("subscriptions:", e2 ?? subs);

const { data: buckets, error: e3 } = await supabase.storage.listBuckets();
console.log("storage buckets:", e3 ?? buckets?.map((b) => b.id));
