"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setMemberLevel(memberId: string, formData: FormData): Promise<void> {
  const supabase = await createClient();
  const v = String(formData.get("level") ?? "");
  const level = v === "baslangic" || v === "temel" || v === "ileri" ? v : null;

  const { error } = await supabase
    .from("profiles")
    .update({ level_override: level })
    .eq("id", memberId);
  if (error) console.error("setMemberLevel failed:", error.message);

  revalidatePath("/admin/uyelikler");
  revalidatePath("/profilim");
}
