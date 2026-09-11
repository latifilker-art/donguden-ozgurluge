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

const { data, error } = await supabase.auth.admin.createUser({
  email: "admin@sukunet.dev",
  password: "sukunet-test-1234",
  email_confirm: true,
  user_metadata: { display_name: "Sükunet Admin" },
});

if (error) {
  console.log("error:", error.message);
  process.exit(1);
}

await supabase.from("profiles").update({ role: "admin" }).eq("id", data.user.id);
console.log("admin oluşturuldu:", data.user.id);
