"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function verifyDiploma(diplomaId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("diplomas")
    .update({ verified: true })
    .eq("id", diplomaId);

  if (error) {
    console.error("verifyDiploma failed:", error.message);
    return;
  }

  revalidatePath("/admin/diplomalar");
  revalidatePath("/egitmenler");
}
