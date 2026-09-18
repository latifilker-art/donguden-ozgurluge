"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveManualWorkResult(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: instructor } = await supabase
    .from("instructors")
    .select("can_write_manual_results")
    .eq("id", user.id)
    .single();
  if (!instructor?.can_write_manual_results) return;

  const memberId = String(formData.get("memberId") ?? "");
  const workTitle = String(formData.get("workTitle") ?? "");
  const resultText = String(formData.get("resultText") ?? "").trim();
  if (!memberId || !workTitle || !resultText) return;

  const { error } = await supabase.rpc("save_manual_work_result", {
    p_member_id: memberId,
    p_work_title: workTitle,
    p_result_text: resultText,
  });

  if (error) {
    console.error("saveManualWorkResult failed:", error.message);
    redirect("/panel/manuel-sonuc?error=1");
  }

  revalidatePath("/panel/manuel-sonuc");
  redirect("/panel/manuel-sonuc?success=1");
}
