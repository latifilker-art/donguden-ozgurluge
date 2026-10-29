"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function logMemberAccess(
  memberId: string,
  formData: FormData,
): Promise<void> {
  const supabase = await createClient();
  const reason = String(formData.get("reason") ?? "").trim();
  const scope = String(formData.get("scope") ?? "").trim();

  if (!reason || !scope) {
    return;
  }

  const { error } = await supabase.rpc("log_admin_access", {
    p_member_id: memberId,
    p_reason: reason,
    p_scope: scope,
  });

  if (error) {
    console.error("logMemberAccess failed:", error.message);
    return;
  }

  redirect(`/admin/destek/${memberId}?viewed=1`);
}

export async function uploadWorkPdf(
  memberId: string,
  formData: FormData,
): Promise<void> {
  const supabase = await createClient();
  const file = formData.get("pdf");
  const workTitle = String(formData.get("workTitle") ?? "Kalbin Rehberliği");
  if (!(file instanceof File) || file.size === 0) return;

  const path = `${memberId}/${Date.now()}-${workTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
  const { error: upErr } = await supabase.storage
    .from("work-results")
    .upload(path, file, { contentType: "application/pdf" });
  if (upErr) {
    console.error("uploadWorkPdf upload failed:", upErr.message);
    return;
  }
  const { error } = await supabase.rpc("admin_set_work_file", {
    p_member_id: memberId,
    p_work_title: workTitle,
    p_path: path,
  });
  if (error) console.error("admin_set_work_file failed:", error.message);

  revalidatePath(`/admin/destek/${memberId}`);
  revalidatePath("/profilim");
}
