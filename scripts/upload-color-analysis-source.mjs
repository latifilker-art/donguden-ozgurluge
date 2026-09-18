import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const BUCKET = "color-analysis-source";
const DIR = "src/lib/color-analysis/source";
const FILES = ["kaynak-kitapcik.txt", "ornek-rapor-1.txt", "ornek-rapor-2.txt"];

const { error: bucketError } = await supabase.storage.createBucket(BUCKET, {
  public: false,
});
if (bucketError && !bucketError.message.includes("already exists")) {
  console.log("bucket error:", bucketError.message);
  process.exit(1);
}

for (const file of FILES) {
  const content = readFileSync(`${DIR}/${file}`, "utf8");
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(file, content, { contentType: "text/plain; charset=utf-8", upsert: true });
  console.log(file, error ? `HATA: ${error.message}` : "yüklendi");
}
