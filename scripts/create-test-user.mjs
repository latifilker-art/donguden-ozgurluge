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

const email = "test-akis@sukunet.dev";
const password = "sukunet-test-1234";

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true, // test amaçlı — e-posta linkine tıklamadan doğrulanmış say
  user_metadata: { display_name: "Test Akış" },
});

console.log("error:", error);
console.log("user id:", data?.user?.id);
